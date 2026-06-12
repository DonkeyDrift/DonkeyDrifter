# Drive 页面打开时立即同步已录制条数 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drive 页面打开（浏览器 WebSocket 客户端接入）时，立即触发车端上报一次最新已录制条数，避免前端最多等待 1 秒才刷新。

**Architecture:** 后端在浏览器客户端 WebSocket 连接成功后，若车端在线则下发 `{ type: "request_car_state" }`；车端 `DriveApiBridge` 收到后使用最近一次 `run_threaded` 缓存的 `num_records` 立即回复状态消息；后端复用现有广播逻辑将车端状态推送给所有客户端，前端无需改动。

**Tech Stack:** Python 3.11, FastAPI, WebSocket, pytest

---

## File Structure

- `web_ui/backend/routers/drive.py`
  - 负责：WebSocket 客户端连接时的初始状态推送，以及向车端转发状态同步请求。
- `donkeycar/parts/drive_api_bridge.py`
  - 负责：车端桥接部件，缓存最新 `num_records`，处理后端发来的 `request_car_state` 并立即回复。
- `web_ui/backend/tests/test_drive.py`
  - 负责：验证客户端连接且车端在线时，后端向车端发送了 `request_car_state`。
- `donkeycar/tests/test_drive_api_bridge.py`
  - 负责：验证车端收到 `request_car_state` 后调用 `_send_car_state` 并携带正确的 `num_records`。

---

### Task 1: 后端在客户端 WebSocket 连接时请求车端最新状态

**Files:**
- Modify: `web_ui/backend/routers/drive.py:577-604`
- Test: `web_ui/backend/tests/test_drive.py`

- [ ] **Step 1: 编写失败测试**

在 `web_ui/backend/tests/test_drive.py` 末尾新增：

```python
def test_client_connect_requests_car_state_when_online(monkeypatch):
    client, drive = make_online_client()
    sent_to_car = []

    async def fake_send_to_car(payload):
        sent_to_car.append(payload)
        return True

    monkeypatch.setattr(drive.drive_state, "send_to_car", fake_send_to_car)

    with client.websocket_connect("/api/drive/ws?role=client&client_id=browser-1") as ws:
        pass

    assert {"type": "request_car_state"} in sent_to_car
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd web_ui/backend && python -m pytest tests/test_drive.py::test_client_connect_requests_car_state_when_online -v
```

Expected: FAIL with assertion error (request_car_state not sent)

- [ ] **Step 3: 实现后端改动**

在 `web_ui/backend/routers/drive.py` 的客户端分支中，完成初始状态推送后添加请求：

```python
# 位于客户端分支，初始状态推送之后
if drive_state.car_online():
    try:
        await drive_state.send_to_car({"type": "request_car_state"})
    except Exception:
        logger.debug("请求车端状态失败")
```

具体位置在：

```python
await websocket.send_text(json.dumps({
    "type": "car_state",
    "drive_mode": drive_state.drive_mode,
    "recording": drive_state.recording,
    "num_records": drive_state.num_records,
}))
```

之后、`try` 块结束之前。

- [ ] **Step 4: 运行测试确认通过**

```bash
cd web_ui/backend && python -m pytest tests/test_drive.py::test_client_connect_requests_car_state_when_online -v
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add web_ui/backend/routers/drive.py web_ui/backend/tests/test_drive.py
git commit -m "feat(drive): request car state on client websocket connect"
```

---

### Task 2: 车端 DriveApiBridge 处理 request_car_state 并缓存 last_num_records

**Files:**
- Modify: `donkeycar/parts/drive_api_bridge.py:302-321`, `donkeycar/parts/drive_api_bridge.py:402-419`, `donkeycar/parts/drive_api_bridge.py:674-720`
- Test: `donkeycar/tests/test_drive_api_bridge.py`

- [ ] **Step 1: 编写失败测试**

在 `donkeycar/tests/test_drive_api_bridge.py` 末尾新增两个测试：

```python
def test_drive_api_bridge_caches_last_num_records():
    bridge = DriveApiBridge(auto_start=False)

    bridge.run_threaded(img_arr=None, num_records=42, mode="user", recording=False)

    assert bridge.last_num_records == 42


def test_drive_api_bridge_handles_request_car_state(monkeypatch):
    sent = []
    bridge = DriveApiBridge(auto_start=False)
    bridge.last_num_records = 123
    monkeypatch.setattr(bridge, "_send_json", sent.append)

    bridge._handle_message({"type": "request_car_state"})

    assert sent == [{
        "num_records": 123,
        "drive_mode": bridge.mode,
        "recording": bridge.recording,
    }]
```

- [ ] **Step 2: 运行测试确认失败**

```bash
pytest donkeycar/tests/test_drive_api_bridge.py::test_drive_api_bridge_caches_last_num_records donkeycar/tests/test_drive_api_bridge.py::test_drive_api_bridge_handles_request_car_state -v
```

Expected: FAIL with AttributeError (last_num_records / request_car_state not handled)

- [ ] **Step 3: 实现车端改动**

1. 在 `DriveApiBridge.__init__` 中新增字段（约在 `self.last_car_state = 0.0` 之后）：

```python
self.last_num_records: int = 0
```

2. 在 `_handle_message` 中处理新消息类型（在 `reconnect_simulator` 处理之后、控制字段处理之前）：

```python
if msg.get("type") == "request_car_state":
    self._send_car_state(self.last_num_records)
    return
```

3. 在 `run_threaded` 中更新缓存。找到所有传入 `num_records` 的位置，在发送前更新：

在 `webrtc` 分支：

```python
if now - self.last_car_state >= 1.0:
    self.last_car_state = now
    self.last_num_records = int(num_records or 0)
    self._send_car_state(self.last_num_records)
```

在非 `webrtc` 分支：

```python
if now - self.last_car_state >= 1.0:
    self.last_car_state = now
    self.last_num_records = int(num_records or 0)
    self._send_car_state(self.last_num_records)
```

并在 `_send_frame` 调用处也更新缓存（可选，因为帧消息携带的 num_records 也是当前值）：

```python
self.last_num_records = int(num_records or 0)
self._send_json({
    "type": "frame",
    ...
    "num_records": self.last_num_records,
    ...
})
```

- [ ] **Step 4: 运行测试确认通过**

```bash
pytest donkeycar/tests/test_drive_api_bridge.py::test_drive_api_bridge_caches_last_num_records donkeycar/tests/test_drive_api_bridge.py::test_drive_api_bridge_handles_request_car_state -v
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add donkeycar/parts/drive_api_bridge.py donkeycar/tests/test_drive_api_bridge.py
git commit -m "feat(drive): handle request_car_state and cache last_num_records"
```

---

### Task 3: 运行所有相关测试并验证

**Files:**
- `web_ui/backend/tests/test_drive.py`
- `donkeycar/tests/test_drive_api_bridge.py`

- [ ] **Step 1: 运行 Web UI 后端测试**

```bash
cd web_ui/backend && python -m pytest tests/test_drive.py -q
```

Expected: all tests pass

- [ ] **Step 2: 运行车端桥接测试**

```bash
pytest donkeycar/tests/test_drive_api_bridge.py -q
```

Expected: all tests pass

- [ ] **Step 3: 提交（如需要）**

如果仅有测试运行无文件变更，无需提交。

---

## Self-Review Checklist

1. **Spec coverage:**
   - 后端在客户端连接时触发请求 → Task 1
   - 车端处理 `request_car_state` → Task 2
   - 车端缓存 `last_num_records` → Task 2
   - 前端无需改动 → 未列入任务，已在 Goal/Architecture 中说明
   - 测试覆盖 → Task 1、Task 2、Task 3

2. **Placeholder scan:** 无 TBD/TODO/"implement later" 等占位符。

3. **Type consistency:**
   - 消息类型固定为 `"request_car_state"`
   - `last_num_records` 为 `int`
   - `_send_car_state` 接收 `num_records` 参数，类型一致
