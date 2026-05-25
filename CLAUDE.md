# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

Donkeycar 是一个面向爱好者和学生的**模块化 Python 自驾车库**，支持真实硬件和模拟器环境。核心哲学是极简、可组合、易于扩展，被广泛用于高中/大学自动驾驶教学和 DIY Robocars 竞赛。

- 语言：Python 3.11.x（强制要求 `>=3.11.0,<3.12`）
- 入口 CLI：`donkey` 命令（定义于 `setup.cfg` 的 console_scripts）
- 主包路径：`donkeycar/`
- Web UI：`web_ui/`（FastAPI 后端 + React 前端，统一管理界面）

---

## 核心架构

### 1. Parts + Vehicle 运行时模型
Donkeycar 的运行时基于**部件（Part）管线**模式，这是理解整个代码库的关键：

- **`Vehicle` 类** (`donkeycar/vehicle.py`)：主循环容器，通过 `add(part, inputs, outputs, threaded, run_condition)` 方法注册部件，按顺序执行每个 part 的 `run()` 方法。
- **`Memory` 类** (`donkeycar/memory.py`)：全局键值存储，所有 parts 之间通过它解耦通信——part 从 memory 取 inputs，执行后将 outputs 写回 memory。
- **Part 约定**：一个合法的 Part 类只需实现 `run()` 方法（可选 `shutdown()`），无需继承任何基类。输入输出通过 `inputs` / `outputs` 字符串列表与 Memory 绑定。

### 2. 部件目录 (`donkeycar/parts/`)
按职责分类的可插拔组件，常见子模块：
- 传感器：`camera.py`, `gps.py`, `lidar.py`, `imu.py`, `oak_d.py`, `realsense*.py`
- 执行器：`actuator.py`（PWM 舵机/电调），`kinematics.py`（差速驱动）
- 控制器：`controller.py`（游戏手柄）, `web_controller/`（Tornado 旧版 Web 控制器）, `drive_api_bridge.py`（新版 WebSocket 桥接 Part）
- 自动驾驶：`keras.py`（TensorFlow 模型）, `pytorch/`（PyTorch 模型）, `path.py`（GPS 路径跟随）, `behavior.py`（行为克隆）, `line_follower.py`（CV 寻线）
- 数据存储：`tub_v2.py`（Tub 数据格式写入/读取）
- 模拟器：`simulation.py`, `dgym.py`, `gym/`（与 Donkey Simulator 对接）

### 3. 模板 (`donkeycar/templates/`)
预构建的车辆应用入口，用户通过 `donkey createcar --template=xxx` 生成自己的车目录。关键模板：
- `complete.py`：最全的默认模板（摄像头 + 手动控制 + 自动驾驶 + 数据录制）
- `basic.py`：最小可用模板
- `simulator.py`：模拟器专用模板
- `path_follow.py`：GPS 路径跟随模板
- `cv_control.py`：纯计算机视觉控制模板
- `train.py`：训练脚本模板

每个模板配套一个 `cfg_*.py` 默认配置文件。

### 4. 训练管道 (`donkeycar/pipeline/`)
- `training.py`：训练主逻辑
- `augmentations.py`：图像增强
- `sequence.py`：序列数据处理
- `database.py`：数据集管理（Tub 加载、元数据）

### 5. 管理命令 (`donkeycar/management/`)
- `base.py`：CLI 子命令解析入口，实现 `createcar`, `train`, `calibrate`, `drive`, `makemovie` 等命令
- `train_local.py` / `train_online.py`：本地 / 在线训练
- `ui/`：旧版 Web UI 后端（基于 Tornado，已被 `web_ui/` 取代）

### 6. Web UI (`web_ui/`)
统一管理界面，实现「数据编辑 → 模型训练 → 实车驾驶 → 参数校准」全流程闭环。

**后端** (`web_ui/backend/`)：FastAPI + Uvicorn，端口 8000
| 路由 | 前缀 | 职责 |
|------|------|------|
| `routers/config.py` | `/api/config` | 配置加载/保存 |
| `routers/tub.py` | `/api/tub` | Tub 数据浏览/编辑 |
| `routers/trainer.py` | `/api/trainer` | 训练任务、模型管理 |
| `routers/drive.py` | `/api/drive` | 驾驶控制（WebSocket + MJPEG + 参数 + 校准） |

`drive.py` 的 WebSocket 通道通过 `role=car|client` 区分车端和浏览器连接，车端推送图像帧和状态，浏览器发送控制指令，服务端做双向代理和状态缓存。

**前端** (`web_ui/frontend/`)：React 18 + TypeScript + TailwindCSS + Zustand
- 开发服务器：Vite，端口 5188，`/api` 代理到 `localhost:8000`
- 路由（HashRouter）：`/` Tub 管理、`/trainer` 训练、`/drive` 驾驶、`/calibrate` 校准
- 状态管理：`store/useStore.ts`（Tub/训练）、`store/useDriveStore.ts`（驾驶参数，带 persist）
- UI 风格：深色主题 zinc 色系，cyan 强调色

**车端桥接** (`donkeycar/parts/drive_api_bridge.py`)：
替代原有 `LocalWebController`（Tornado 独立端口 8887），作为标准 Part 通过 WebSocket 连接 FastAPI 服务端，接口完全兼容。迁移指南见 `docs/plan/drive-api-bridge-migration.md`。

---

## 常用开发命令

### Python 部分
```bash
# 安装依赖
pip install -e .[pc]        # PC 环境 + TensorFlow
pip install -e .[pi]        # 树莓派环境
pip install -e .[torch]     # PyTorch 后端
pip install -e .[dev]       # 开发依赖（pytest + mypy）

# 测试
pytest                                    # 全部测试
pytest tests/test_restore_logic.py        # 单文件
pytest tests/test_restore_logic.py::test_name -v  # 单用例

# 构建
make package                              # 构建源码包

# 类型检查
mypy donkeycar/
```

### Web UI 部分
```bash
# 后端
cd web_ui/backend
pip install -r requirements.txt           # 首次安装
python main.py                            # 启动（0.0.0.0:8000）

# 前端
cd web_ui/frontend
npm install                               # 首次安装
npm run dev                               # 开发服务器（localhost:5188）
npm run build                             # 生产构建
npm run lint                              # ESLint 检查
```

### 运行时 CLI
```bash
donkey createcar --path ~/mycar --template complete   # 创建车应用
python manage.py drive                                 # 启动驾驶
python manage.py train --tub ./data/* --model ./models/mypilot.h5  # 训练
donkey calibrate --channel 0                           # 校准
```

---

## 重要约定与边界

1. **配置系统**：用户目录下的 `config.py`（默认）与 `myconfig.py`（覆盖层）通过 `dk.load_config()` 加载，所有可调参数都走配置，不要硬编码。
2. **数据格式**：录制数据统一为 **Tub 格式**（`tub_v2.py`），目录内含 `manifest.json` + `records_*.json` + 图像文件，不要自行造格式。
3. **线程模型**：`Vehicle.add(part, threaded=True)` 会让该 part 在独立线程运行，IO 密集型部件（摄像头、Web UI）应当启用线程，注意 Memory 的并发写入只在 inputs/outputs 无重叠时安全。
4. **无依赖注入框架**：部件之间只通过 Memory 按字符串 key 通信，新增 key 时要在模板中显式声明 inputs/outputs，不要引入全局状态。
5. **版本兼容**：TensorFlow 固定为 2.15.x，PyTorch 固定为 2.1.x，不要随意升级大版本，否则会破坏模型兼容性。
6. **Web UI 通信协议**：驾驶控制走 `/api/drive/ws` WebSocket（50Hz 控制节流），摄像头走 `/api/drive/video` MJPEG 流（20fps），两者独立通道。
7. **前后端 API 前缀**：前端 axios 实例 baseURL 为 `/api`，Vite 代理到后端；新增后端路由必须在 `main.py` 中 `include_router` 注册，新增前端 API 必须在 `services/api.ts` 中封装。
