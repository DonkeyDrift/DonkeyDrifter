# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

DonkeyDrifter 是一个基于 Donkeycar 派生的模块化 Python 自驾与漂移机器人平台，面向真实硬件、模拟器和教学实验场景。核心运行模型仍是把摄像头、控制器、执行器、训练/推理、数据记录等能力拆成可组合的 Part，并由 Vehicle 主循环串联。

- 当前版本：`0.1.0`，定义在 `donkeycar/_version.py`
- Python 版本：`>=3.11.0,<3.12`
- 主发行包：`donkeydrifter`
- 推荐导入：`import donkeydrifter as dk`
- 兼容导入：`import donkeycar as dk`
- Python 实现包：当前仍在 `donkeycar/`，`donkeydrifter/` 提供公开兼容入口
- CLI 入口：`donkey = donkeycar.management.base:execute_from_command_line`
- 旧版车辆模板：`donkeycar/templates/`，新模板应优先使用 `donkeydrifter` 导入
- 统一 Web UI：`web_ui/`，后端 FastAPI，前端 React/Vite
- 许可证：DonkeyDrifter 新增/修改部分采用 Apache License 2.0；源自上游 Donkeycar 的部分继续保留 MIT License，详见 `LICENSE`、`NOTICE`、`THIRD_PARTY_NOTICES.md` 与 `LICENSES/MIT-donkeycar.txt`
- 上游来源：https://github.com/autorope/donkeycar

DonkeyDrifter 是独立派生项目，不代表 Donkeycar 官方维护团队，也不构成官方背书。

## 迁移兼容约定

1. 新代码和新模板优先使用 `donkeydrifter`。
2. 旧代码中的 `donkeycar` import 必须继续兼容。
3. CLI 命令继续沿用 `donkey`。
4. 第一阶段不重命名旧 `DONKEY_*` 配置键。
5. 第一阶段不重命名 Web UI 的 `/api/*` 路径和驾驶 WebSocket 协议。
6. 不要盲目全局替换 Donkeycar 字样；上游来源、兼容说明和许可证文本中的 Donkeycar 名称应保留。

## 常用命令

### Python 包

```bash
pip install -e .[dev]
pip install -e .[pc,dev]
pip install -e .[torch]
pip install -e .[pi]
pip install -e .[nano]

pytest
make tests
pytest donkeycar/tests/test_vehicle.py -q
pytest donkeycar/tests/test_vehicle.py::test_name -v
pytest tests/test_restore_logic.py -q
pytest tests/test_restore_logic.py::test_name -v

mypy donkeycar/
python -m build --sdist --wheel
```

仓库根目录没有 `setup.py`，打包应使用 `python -m build --sdist --wheel`。

### 测试位置

- `donkeycar/tests/`：核心包单元测试。
- `tests/`：仓库根目录的迁移、恢复逻辑、模型命名和在线训练工作区测试。
- `web_ui/backend/tests/`：FastAPI 后端路由/服务契约测试。
- 前端目前主要依赖类型检查、ESLint、构建和手工运行页面验证。

### Web UI 后端

```bash
cd web_ui/backend
pip install -r requirements.txt
python main.py
python -m pytest tests -q
python -m pytest tests/test_connector.py -q
python -m pytest tests/test_arena.py::test_predict_returns_user_and_pilot_values -q
```

FastAPI 应用定义在 `web_ui/backend/main.py`。

### Web UI 前端

```bash
cd web_ui/frontend
npm install
npm run dev
npm run build
npm run lint
npm run check
npm run preview
```

前端开发时 `/api` 由 Vite 代理到后端；也可通过 `VITE_API_BASE_URL` 覆盖 API base URL。

### 一键安装前后端依赖

```bash
pip install -e ".[pc,dev]"
donkey installweb --path ./web_ui
# 或者: make installweb

donkey web
# 一体化启动并自动安装缺失依赖：
donkey web --install-deps
```

`donkey` 是 DonkeyDrifter 继续沿用的 CLI 命令，用于兼容 Donkeycar 生态和已有脚本。

### 运行时 CLI

```bash
donkey createcar --path ~/mycar --template complete
python manage.py drive
python manage.py train --tub ./data/* --model ./models/mypilot.h5
donkey calibrate --channel 0
```

这些命令通常在用户通过模板生成的车目录中执行。

## 核心架构

### Vehicle + Memory + Part

`donkeycar/vehicle.py` 的 `Vehicle` 是运行时主循环容器。`Vehicle.add(part, inputs, outputs, threaded, run_condition)` 将 Part 注册进循环；主循环按顺序从 `Memory` 读取 inputs，调用 Part 的 `run()`，再把结果写回 outputs。

`donkeycar/memory.py` 的 `Memory` 是简单键值存储。Part 之间不直接互相依赖，而是通过字符串 key 交换数据。新增数据通道时，要在模板或车辆组装代码中显式声明对应 inputs/outputs。

Part 不需要继承基类；通常只要实现 `run()`，线程型 Part 还会实现 `update()`，可选实现 `shutdown()`。

### 主要目录职责

- `donkeydrifter/`：DonkeyDrifter 推荐 import 入口，转发到当前实现包。
- `donkeycar/`：当前实现包和旧 import 兼容命名空间。
- `donkeycar/parts/`：可插拔硬件和算法组件。
- `donkeycar/templates/`：`donkey createcar` 使用的车辆应用模板和默认配置。
- `donkeycar/management/`：CLI 子命令入口和管理逻辑。
- `donkeycar/pipeline/`：训练管道、图像增强、序列数据处理和 Tub 数据集管理。
- `web_ui/`：新版统一管理界面。
- `docs/`：项目内设计、计划、验证和用户指南。

## 重要约定

1. 配置通过 `dk.load_config()` 加载用户车目录中的 `config.py` 和 `myconfig.py`。
2. 录制数据统一使用 Tub v2 格式，相关逻辑集中在 `donkeycar/parts/tub_v2.py`。
3. `Vehicle.add(..., threaded=True)` 会调用 Part 的 `update()` 后台线程；并发写 Memory 时要避免多个 Part 写同一 key。
4. TensorFlow 固定在 2.15.x，PyTorch 固定在 2.1.x，依赖大版本升级会影响模型兼容性。
5. CLI 模板文件既是用户生成车应用的来源，也是配置契约的一部分；修改模板时通常要同步对应 `cfg_*.py` 和相关测试。
6. Web UI 前后端 API 前缀约定为 `/api`；前端 URL 拼接和错误消息应复用 `services/api.ts` 中已有工具。
7. 涉及硬件、路径、进程或网络行为时要避免只适配当前开发机。
8. 新功能或已有功能变更通常需要同步用户文档。
