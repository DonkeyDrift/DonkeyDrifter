# Drive 页面 60FPS WebRTC 视频设计

## 背景

DonkeyDrifter Web UI 的 Drive 页面当前通过车端 `DriveApiBridge` 把 JPEG 帧以 base64 JSON 发送到 FastAPI，后端缓存最近一帧，再由 `/api/drive/video` 以 MJPEG 给浏览器 `<img>` 渲染。现有链路中车端约 20FPS、后端 MJPEG 最高约 25FPS，无法满足真实端到端 60FPS 的视频验收目标。

本设计将 Drive 页面视频链路升级为 WebRTC 点对点传输，后端仅负责信令协调，控制与状态继续复用现有 WebSocket 通道。设计目标是让视频流与控制流隔离，避免高频视频影响驾驶控制。

## 目标

- 在普通 PC/笔记本模拟车端与 Chrome/Edge 浏览器、同一局域网环境下，实现真实摄像头端到端 60FPS 视频链路。
- 视频验收分辨率为 320×240，优先低延迟和稳定性。
- 连续运行 2 分钟时，浏览器实测视频帧率平均不低于 58FPS。
- 浏览器展示帧间隔 P95 不高于 25ms。
- 视频断流后自动恢复时间不超过 3 秒。
- 视频运行时，控制 WebSocket 能稳定发送 60Hz 控制消息，且不被视频链路阻塞。
- 保留现有 MJPEG `/api/drive/video` 作为兼容降级路径。

## 非目标

- 本阶段不支持多个浏览器同时观看同一车端视频。
- 本阶段不把后端作为媒体中继或转码服务器。
- 本阶段不要求公网或复杂 NAT 穿透；优先同一局域网 host candidate。
- 本阶段不以树莓派、Jetson 或真实车硬件作为主验收环境；真实车适配作为后续验证项。
- 本阶段不通过前端补帧伪造 60FPS。若上游 `cam/image_array` 未提供真实新帧，系统必须暴露瓶颈。

## 前置检查清单

- [x] 数据模型已定义：WebRTC session、信令消息、视频统计、帧缓冲状态。
- [x] 接口/API 契约清晰：新增信令接口、统计接口和前端 Hook 边界。
- [x] 边界条件和异常流已识别：依赖缺失、信令超时、ICE 失败、source FPS 不足、浏览器不支持 WebRTC、断流恢复、MJPEG 降级。

## 总体架构

采用 **WebRTC 点对点视频 + FastAPI 信令 + 现有 WebSocket 控制通道**。

```text
┌────────────────────────────┐
│ 车端 / 模拟车端             │
│ DriveApiBridge              │
│ - cam/image_array           │
│ - DriveVideoFrameBuffer     │
│ - DriveWebRtcVideoTrack     │
└─────────────┬──────────────┘
              │ WebRTC P2P 视频
              ▼
┌────────────────────────────┐
│ 浏览器 Drive 页面           │
│ - RTCPeerConnection         │
│ - <video> 渲染              │
│ - requestVideoFrameCallback │
└────────────────────────────┘

┌────────────────────────────┐
│ FastAPI 后端                │
│ - WebRTC 信令               │
│ - session 状态              │
│ - stats 汇总                │
└────────────────────────────┘

控制与状态：浏览器 ⇄ FastAPI ⇄ 车端，沿用 /api/drive/ws。
```

后端不转发媒体帧，不承担视频编码和 60FPS 推流压力。视频数据只在车端和浏览器之间通过 WebRTC 传输。

## 车端设计

### DriveApiBridge

`DriveApiBridge` 继续兼容现有 Donkeycar Part 接口：

```python
run_threaded(img_arr=None, num_records=0, mode=None, recording=None)
```

返回值仍为：

```python
angle, throttle, mode, recording, buttons
```

新增视频配置：

```python
DRIVE_VIDEO_TRANSPORT = "webrtc"  # 可选："webrtc" / "mjpeg"
DRIVE_VIDEO_WIDTH = 320
DRIVE_VIDEO_HEIGHT = 240
DRIVE_VIDEO_FPS = 60
DRIVE_WEBRTC_ENABLED = True
DRIVE_WEBRTC_SINGLE_CLIENT = True
DRIVE_WEBRTC_RECONNECT_TIMEOUT_SEC = 3.0
```

`DriveApiBridge` 在 WebRTC 模式下负责：

- 继续维护控制 WebSocket 连接。
- 接收后端转发的 WebRTC 信令消息。
- 把 `cam/image_array` 交给帧缓冲。
- 管理当前单个 `RTCPeerConnection`。
- 在 shutdown 时关闭 WebRTC 连接和后台任务。

### DriveVideoFrameBuffer

`DriveVideoFrameBuffer` 是一个轻量帧缓冲，只保留最新帧。

职责：

- 接收 `cam/image_array`。
- 必要时缩放到 320×240。
- 记录 `frame_id`、`source_timestamp`、最近 source FPS。
- 用最新帧覆盖旧帧，不做无界队列。

策略：

- 低延迟优先，宁可丢旧帧，不堆积历史帧。
- 若 Vehicle 主循环低于 60Hz，则 source FPS 如实低于 60，不补帧。
- 缩放和颜色转换必须集中在该组件中，便于测试和优化。

### DriveWebRtcVideoTrack

`DriveWebRtcVideoTrack` 封装 `aiortc.VideoStreamTrack`。

职责：

- 按目标 60Hz 从 `DriveVideoFrameBuffer` 读取帧。
- 只在 `frame_id` 变化时输出真实新帧。
- 记录 sent FPS、stale frame、dropped frame 等统计。
- 输出符合 WebRTC 要求的 video frame。

若 `cam/image_array` 上游没有新帧，Track 不应重复旧帧来伪装真实 60FPS。

## 后端设计

新增 WebRTC 信令与统计接口，统一挂载在 `/api/drive/webrtc` 下。浏览器通过 HTTP 提交信令，后端通过现有 `/api/drive/ws?role=car` 向车端推送 `webrtc_signal` 消息；车端通过 HTTP 回传 answer 和 ICE candidate，后端再通过现有 `/api/drive/ws?role=client` 向浏览器推送 `webrtc_signal` 消息。

### `POST /api/drive/webrtc/session`

创建或重置单客户端视频会话。

请求：

```json
{
  "client_id": "browser-generated-id"
}
```

响应：

```json
{
  "success": true,
  "session_id": "drive-video-session-id",
  "single_client": true
}
```

规则：

- 若已有 session，新 session 显式替换旧 session。
- 若车端离线，返回明确错误。
- session 只代表信令状态，不承载媒体流。

### `POST /api/drive/webrtc/offer`

浏览器提交 offer，后端转交给当前车端。

请求：

```json
{
  "session_id": "drive-video-session-id",
  "sdp": "...",
  "type": "offer"
}
```

### `POST /api/drive/webrtc/answer`

车端提交 answer，后端缓存并通知浏览器。

请求：

```json
{
  "session_id": "drive-video-session-id",
  "sdp": "...",
  "type": "answer"
}
```

浏览器通过现有客户端 WebSocket 接收后端推送的 `webrtc_signal` answer 消息，不新增短轮询或 SSE 通道。

### `POST /api/drive/webrtc/ice`

双向交换 ICE candidate。

请求：

```json
{
  "session_id": "drive-video-session-id",
  "source": "client",
  "candidate": {
    "candidate": "...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

### `GET /api/drive/webrtc/stats`

返回视频链路统计。

响应示例：

```json
{
  "active": true,
  "webrtc_available": true,
  "source_fps": 60.0,
  "sent_fps": 59.8,
  "browser_fps": 59.3,
  "browser_p95_frame_interval_ms": 22.4,
  "disconnect_count": 0,
  "transport": "webrtc",
  "degraded": false
}
```

## 前端设计

### `useDriveWebRtcVideo`

新增 React Hook 管理 WebRTC 视频生命周期。

职责：

- 检测浏览器是否支持 `RTCPeerConnection`。
- 创建 WebRTC session。
- 创建 `RTCPeerConnection` 并生成 offer。
- 处理 answer 和 ICE candidate。
- 暴露连接状态、错误、stats、降级状态。
- 检测 500ms–1000ms 无新展示帧的 unstable 状态。
- 在 3 秒恢复窗口内重建 PeerConnection。

建议状态：

```ts
type DriveVideoState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'unstable'
  | 'reconnecting'
  | 'degraded'
  | 'error';
```

### `WebRtcVideoStream`

新增视频组件，替代或扩展当前 `VideoStream`。

职责：

- 使用 `<video autoplay playsInline muted>` 渲染远端 track。
- 显示 WebRTC/MJPEG 当前传输模式。
- 显示 browser FPS、P95 帧间隔、source FPS、sent FPS。
- 显示 “稳定 60FPS / 不稳定 / 已降级” 状态。
- 当 WebRTC 不可用或重连失败时切换到 MJPEG 降级。

### `VideoStream` 兼容层

`VideoStream` 可作为兼容入口保留：

- 默认选择 WebRTC。
- 失败时降级 MJPEG。
- 降级时明确显示“已降级，非 60FPS 验收路径”。

## 数据流

1. Vehicle 主循环调用 `DriveApiBridge.run_threaded(...)`。
2. `DriveApiBridge` 将 `cam/image_array` 写入 `DriveVideoFrameBuffer`。
3. `DriveVideoFrameBuffer` 缩放到 320×240，记录 `frame_id` 和 source FPS。
4. 浏览器进入 Drive 页面并创建 WebRTC session。
5. 浏览器通过 FastAPI 信令与车端建立 `RTCPeerConnection`。
6. `DriveWebRtcVideoTrack` 按 60Hz 读取新帧并发送。
7. 浏览器 `<video>` 展示远端 video track。
8. 前端用 `requestVideoFrameCallback` 统计 browser FPS 和 P95 帧间隔。
9. 前端周期性上报或展示统计，后端 stats 汇总 source/sent/browser 三类 FPS。

## 稳定性策略

- **低延迟优先**：只保留最新帧，不追赶历史帧。
- **链路隔离**：视频 WebRTC 与控制 WebSocket 完全分离。
- **单客户端锁**：一次只允许一个 Drive 页面建立视频 session。
- **断流恢复**：前端检测无新帧后进入 unstable，3 秒内自动重建 PeerConnection。
- **显式降级**：WebRTC 不可用或重建失败时降级 MJPEG，并声明不参与 60FPS 验收。
- **真实统计**：区分 source FPS、sent FPS、browser FPS，避免用单一 FPS 掩盖瓶颈。
- **控制保障**：视频运行时控制通道按 60Hz 发送，测试中必须证明控制消息没有因视频链路而阻塞或明显抖动。

## 错误处理

### WebRTC 不可用

- 浏览器不支持 `RTCPeerConnection`：直接降级 MJPEG。
- 车端缺少 `aiortc` 或媒体依赖：车端日志输出明确错误，后端 stats 返回 `webrtc_available=false`。

### 信令失败

- session 创建失败：前端显示“视频会话创建失败”，控制通道继续可用。
- offer/answer 超时：前端关闭当前 PeerConnection，并在恢复窗口内重建。
- ICE 失败：同一局域网下优先 host candidate；失败时显示网络诊断提示。

### 帧率不达标

- source FPS < 58：提示“车端帧源不足”。
- source FPS ≥ 58 但 browser FPS < 58：提示“传输或浏览器解码不足”。
- P95 帧间隔 > 25ms：提示“帧间隔抖动过大”。

## 依赖策略

本设计允许新增默认 Python 依赖，也允许依赖外部程序。但第一版方案 A 优先使用 `aiortc` 内嵌 WebRTC Track，不把 FFmpeg/GStreamer 作为必需路径。

实现时需要评估：

- `aiortc`、`av` 等依赖在当前 Python 3.11 环境下的安装稳定性。
- Windows、Linux、WSL 和真实车端系统的安装差异。
- 若默认依赖安装风险过高，可在实现计划中把依赖拆成 `webrtc` extra，但这需要再次确认安装策略。

## 测试计划

### 后端单元测试

- 创建 WebRTC session 时会替换旧单客户端 session。
- 车端离线时 session 创建返回明确错误。
- offer/answer/ICE 根据 session id 正确路由，并通过现有客户端/车端 WebSocket 推送 `webrtc_signal`。
- stats 返回 source FPS、sent FPS、browser FPS、P95 帧间隔和 degraded 状态。

### 车端单元测试

- `DriveVideoFrameBuffer` 只保留最新帧，不堆积旧帧。
- 输入帧会被缩放到 320×240。
- source FPS 统计能反映新帧进入速率。
- source FPS 不足时不会伪造 sent FPS。
- shutdown 能关闭 WebRTC peer 和后台任务。

### 前端单元测试

- `useDriveWebRtcVideo` 正确处理 connecting、connected、unstable、reconnecting、degraded、error 状态。
- WebRTC 不支持时自动降级 MJPEG。
- 3 秒恢复窗口内会重建 PeerConnection。
- FPS 平均值与 P95 帧间隔统计正确。
- 降级状态会显示“非 60FPS 验收路径”。

### 集成与手工验收

验收环境：普通 PC/笔记本模拟车端 + Chrome/Edge + 同一局域网。

步骤：

1. 模拟车端以 320×240@60 生成真实递增 `cam/image_array`。
2. 启动 Web UI 后端与前端。
3. 打开 Drive 页面，确认视频传输模式为 WebRTC。
4. 连续运行 2 分钟。
5. 记录 browser FPS 平均值、P95 帧间隔、source FPS、sent FPS。
6. 人为断开并恢复视频连接，确认 3 秒内自动恢复。
7. 视频运行期间持续发送 60Hz 控制消息，确认控制 WebSocket 不被阻塞。

通过标准：

- browser FPS 平均值 ≥ 58。
- browser P95 帧间隔 ≤ 25ms。
- source FPS 与 sent FPS 能解释 browser FPS 结果。
- 断流恢复 ≤ 3 秒。
- 控制 WebSocket 在视频运行时稳定发送 60Hz 控制消息。

## 风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| Vehicle 主循环低于 60Hz | 无法产生真实 60FPS | source FPS 单独统计并在 UI 暴露 |
| Python 帧转换成本过高 | sent FPS 下降 | 集中优化 frame buffer 与 VideoTrack，必要时后续引入 FFmpeg/GStreamer |
| `aiortc` 安装复杂 | 默认安装失败 | 实现前验证依赖；若风险过高，再拆分 extra |
| 浏览器解码或渲染不足 | browser FPS 不达标 | 用 browser FPS 与 WebRTC stats 定位瓶颈 |
| ICE 连接失败 | 视频不可用 | 同局域网优先 host candidate，失败后明确诊断并降级 MJPEG |
| 视频重连影响控制 | 驾驶控制不稳定 | 控制 WebSocket 与视频连接完全隔离，并用 60Hz 控制发送测试验证 |

## 后续扩展

- 多观看端支持：单控制端、多只读观看端。
- FFmpeg/GStreamer 编码路径和硬件加速。
- STUN/TURN 配置，支持跨网段或公网访问。
- 真实车端树莓派/Jetson 性能验证。
- WebRTC DataChannel 承载部分低延迟统计，但不替代现有控制通道。
