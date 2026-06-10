# Drive WebRTC TURN 配置设计

## 背景

Drive 页面 WebRTC 视频链路在 WSL + Windows 浏览器 + Unity 模拟器场景下已经完成 offer、answer 与浏览器 ICE 的信令交换，但 ICE 连接长期停留在 `checking` 或 `new`，`sent_fps` 与 `browser_fps` 为 0。MJPEG fallback 已可用，说明视频源、控制链路和后端状态同步正常；剩余问题集中在 WebRTC P2P 的 ICE/NAT 连通性。

当前运行拓扑常见为：

```text
Windows 主机：浏览器 + Unity 模拟器
WSL：FastAPI 后端 + Python DriveApiBridge / aiortc
```

HTTP/WebSocket 可以通过 localhost/WSL 转发正常工作，但 WebRTC 媒体面需要 UDP candidate 互通，容易受 WSL2 NAT、VPN、虚拟网卡和 Windows 防火墙影响。为真正解决 NAT/ICE 不通问题，需要支持 TURN relay。

## 目标

- 支持通过统一 JSON 配置为前端浏览器和车端 aiortc 注入 ICE servers。
- 支持 Windows 原生 coturn 或等价 TURN 服务部署。
- 不改变现有 MJPEG fallback 行为。
- 配置为空时保持当前 host candidate 行为。
- WebRTC 成功后，`ice_connection_state` 应进入 `connected` 或 `completed`，`sent_fps` 与 `browser_fps` 开始增长。

## 非目标

- 本阶段不自动安装 coturn。
- 本阶段不在项目中托管 TURN 服务进程。
- 本阶段不实现 TURN 管理 UI。
- 本阶段不引入 TURN 长期凭证动态签发。
- 本阶段不移除 MJPEG fallback。

## 配置方案

采用统一 JSON 配置，格式与浏览器 `RTCPeerConnection` 原生 `iceServers` 一致。

### 前端配置

```bash
export VITE_DRIVE_WEBRTC_ICE_SERVERS='[{"urls":["turn:192.168.3.96:3478?transport=udp"],"username":"donkey","credential":"donkey-turn-secret"}]'
```

### 车端配置

车端优先从配置对象读取：

```python
DRIVE_WEBRTC_ICE_SERVERS = [
    {
        "urls": ["turn:192.168.3.96:3478?transport=udp"],
        "username": "donkey",
        "credential": "donkey-turn-secret",
    }
]
```

同时支持环境变量覆盖：

```bash
export DRIVE_WEBRTC_ICE_SERVERS='[{"urls":["turn:192.168.3.96:3478?transport=udp"],"username":"donkey","credential":"donkey-turn-secret"}]'
```

环境变量优先级高于 cfg。

### 空配置行为

若未设置或 JSON 解析失败：

- 前端使用 `iceServers: []`。
- 车端使用默认 `RTCPeerConnection()`。
- 保持当前 host candidate 行为。
- 记录警告但不中断 Drive 控制和 MJPEG fallback。

## 前端设计

新增或扩展工具函数：

```ts
getDriveWebRtcIceServers(): RTCIceServer[]
```

职责：

- 读取 `import.meta.env.VITE_DRIVE_WEBRTC_ICE_SERVERS`。
- 解析 JSON 数组。
- 校验顶层必须为数组。
- 解析失败返回空数组。

`useDriveWebRtcVideo` 创建 peer 时改为：

```ts
new RTCPeerConnection({ iceServers: getDriveWebRtcIceServers() })
```

为了测试，保留现有 `peerConnectionFactory` 注入能力。

## 车端设计

`DriveApiBridge` 新增参数：

```python
webrtc_ice_servers: Optional[list[dict]] = None
```

解析优先级：

1. `DRIVE_WEBRTC_ICE_SERVERS` 环境变量。
2. 构造参数 `webrtc_ice_servers`。
3. 空列表。

新增解析函数：

```python
parse_webrtc_ice_servers(value) -> list[dict]
```

支持：

- Python list[dict]
- JSON string
- 空值

车端 aiortc 创建 peer 时：

```python
from aiortc import RTCConfiguration, RTCIceServer

configuration = RTCConfiguration(
    iceServers=[RTCIceServer(**server) for server in parsed_servers]
)
peer = RTCPeerConnection(configuration=configuration)
```

若 aiortc 版本不支持 `urls` 列表形式，需要兼容转换为 aiortc 接受的格式。

## Windows 原生 TURN 部署说明

推荐使用 Windows 原生 coturn 或等价 TURN 服务，监听 Windows 主机局域网 IP，例如：

```text
192.168.3.96
```

### TURN 配置示例

```text
listening-port=3478
listening-ip=0.0.0.0
relay-ip=0.0.0.0
external-ip=192.168.3.96
min-port=49160
max-port=49200
fingerprint
lt-cred-mech
user=donkey:donkey-turn-secret
realm=donkeydrifter.local
no-tls
no-dtls
```

### 防火墙

需要允许：

| 方向 | 端口 | 协议 | 用途 |
|---|---:|---|---|
| 入站 | 3478 | UDP/TCP | TURN 控制 |
| 入站 | 49160-49200 | UDP | TURN relay 媒体 |

### ICE server 示例

```json
[
  {
    "urls": ["turn:192.168.3.96:3478?transport=udp"],
    "username": "donkey",
    "credential": "donkey-turn-secret"
  }
]
```

## 错误处理

- JSON 非法：返回空数组，并在控制台或日志中警告。
- TURN 不可达：WebRTC 仍会进入 `checking`/`failed`，前端保持 MJPEG fallback。
- TURN 鉴权失败：浏览器和 aiortc ICE state 会失败；诊断通过现有 `/api/drive/webrtc/stats` 查看。
- 配置为空：继续使用 host candidates，适合同机或局域网直连场景。

## 测试计划

### 前端测试

- 未设置 `VITE_DRIVE_WEBRTC_ICE_SERVERS` 时返回空数组。
- 有效 JSON 返回 ICE server 数组。
- 无效 JSON 返回空数组。
- `useDriveWebRtcVideo` 默认创建 `RTCPeerConnection({ iceServers })`。
- 强制 MJPEG 模式不创建 WebRTC peer。

### 车端测试

- `parse_webrtc_ice_servers(None)` 返回空数组。
- `parse_webrtc_ice_servers(list)` 原样返回。
- `parse_webrtc_ice_servers(json_string)` 返回数组。
- 非法 JSON 返回空数组。
- `DriveApiBridge` 构造时能从环境变量读取 TURN 配置。
- `_accept_webrtc_offer` 创建 `RTCPeerConnection` 时传入 `RTCConfiguration`。

### 手工验收

1. 启动 Windows TURN 服务。
2. 设置：
   ```bash
   export VITE_DRIVE_WEBRTC_ICE_SERVERS='[...]'
   export DRIVE_WEBRTC_ICE_SERVERS='[...]'
   ```
3. 重启 Web UI 前端、后端和车端。
4. 打开 Drive 页面。
5. 观察 `/api/drive/webrtc/stats`：
   - `ice_connection_state` 为 `connected` 或 `completed`。
   - `peer_connection_state` 为 `connected`。
   - `sent_fps > 0`。
   - `browser_fps > 0`。

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| TURN 端口被 Windows 防火墙阻止 | 文档明确放行 3478 和 relay 端口范围 |
| JSON 配置转义困难 | 文档给出单行 shell 示例和 Python cfg 示例 |
| aiortc 版本对 `RTCIceServer` 参数支持差异 | 实现阶段用单元测试锁定转换函数 |
| TURN relay 增加延迟 | 只在 host candidate 不通时使用；保留 MJPEG fallback |
| 凭证写入环境变量有泄露风险 | 本地开发使用固定账号；未来可扩展临时凭证 |

## 成功标准

- 前端与车端均能读取同一 TURN JSON 配置。
- 配置错误不会破坏控制链路和 MJPEG fallback。
- TURN 可用时，WSL/Windows 场景下 WebRTC ICE 从 `checking` 进入 `connected/completed`。
- `sent_fps` 与 `browser_fps` 从 0 增长。
