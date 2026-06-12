# Drive 页面打开时立即同步已录制条数

## 目标

Drive 页面打开（浏览器 WebSocket 客户端接入）时，已录制条数应立即与车端同步，而不是等待车端每秒一次的状态上报。

## 背景

当前数据流：

1. 车端 `DriveApiBridge.run_threaded` 每秒调用一次 `_send_car_state(num_records)`，通过 WebSocket 上报 `num_records`。
2. 后端 `web_ui/backend/routers/drive.py` 将车端状态缓存在 `drive_state.num_records`。
3. 前端 `useDriveWebsocket` 收到 `car_state` 消息后更新 `carState.numRecords`。
4. `DrivePage` 渲染 `已录制条数 {carState.numRecords}`。

问题：浏览器打开 Drive 页面时，WebSocket 刚建立，后端会立即推送一次缓存的 `car_state`，但如果车端尚未上报过（或缓存为旧值），前端会先看到 `0`，最多等待 1 秒才刷新为真实值。

## 方案选择

采用 **方案 A：后端在客户端连接时触发车端立即上报**。

- 前端无需改动。
- 复用现有 WebSocket 状态流。
- 改动集中在后端路由和车端桥接部件。

## 消息协议

新增一条后端 → 车端的消息类型：

```json
{ "type": "request_car_state" }
```

车端收到后，立即用最近一次 `run_threaded` 拿到的 `num_records` 回复现有的状态消息：

```json
{ "num_records": 42, "drive_mode": "user", "recording": true }
```

后端收到该车端消息后，会复用现有的字段提取与广播逻辑，向所有客户端发送 `car_state`，前端自动刷新。

## 后端改动

文件：`web_ui/backend/routers/drive.py`

在 `drive_ws` 的浏览器客户端分支里，完成初始状态推送后，如果车端在线，就发送请求：

```python
if drive_state.car_online():
    await drive_state.send_to_car({"type": "request_car_state"})
```

车端返回的状态消息会进入已有循环，其中对 `num_records`、`drive_mode`、`recording` 的提取和广播已经存在，无需额外修改。

## 车端改动

文件：`donkeycar/parts/drive_api_bridge.py`

1. 在 `DriveApiBridge.__init__` 中新增：

```python
self.last_num_records: int = 0
```

2. 在 `run_threaded` 中更新：

```python
self.last_num_records = int(num_records or 0)
```

3. 在 `_handle_message` 中处理新消息类型：

```python
if msg.get("type") == "request_car_state":
    self._send_car_state(self.last_num_records)
    return
```

## 前端行为

保持不变。WebSocket 建立后先收到后端缓存的 `car_state`，车端响应后再收到新的 `car_state`，`numRecords` 随之刷新。

## 边界情况

- **车端离线**：仅推送后端缓存值，不发送请求。
- **车端刚连接但尚未跑过 `run_threaded`**：`last_num_records` 为 0，行为与当前一致。
- **多客户端同时打开**：每个连接都会触发一次请求，车端多次回复，后端广播给所有客户端，状态保持一致。
- **车端未升级但后端已升级**：车端不认识 `request_car_state`，会静默忽略；前端行为与当前一致。

## 测试

- Web UI 后端测试：验证客户端连接且车端在线时，后端向车端发送了 `request_car_state`。
- 车端桥接测试：验证收到 `request_car_state` 后调用 `_send_car_state` 并包含正确的 `num_records`。

## 相关文件

- `web_ui/backend/routers/drive.py`
- `donkeycar/parts/drive_api_bridge.py`
- `web_ui/frontend/src/hooks/useDriveWebsocket.ts`（只读，确认协议兼容）
- `web_ui/frontend/src/pages/DrivePage.tsx`（只读，无需改动）
