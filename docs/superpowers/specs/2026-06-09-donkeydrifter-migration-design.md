# DonkeyDrifter 迁移设计

日期：2026-06-09

## 1. 背景与目标

本项目基于上游 Donkeycar 派生，已在 Web UI、训练、连接、文档和工程配置等方面做出较多修改。下一阶段目标是将项目对外更名为 **DonkeyDrifter**，并采用以 **Apache License 2.0** 为主的开源授权表达。

迁移目标：

- 对外品牌统一为 `DonkeyDrifter`。
- PyPI 安装包名统一为 `donkeydrifter`。
- 新推荐 Python import 为 `donkeydrifter`。
- 保留旧 `donkeycar` import 兼容层。
- CLI 命令继续沿用 `donkey`。
- 根目录主许可证改为 Apache License 2.0。
- 保留上游 Donkeycar MIT License 与版权声明。
- 第一阶段不强制迁移用户已有车目录。
- 第一阶段不改 Web API 路径、WebSocket 协议和旧配置键。

最终推荐路线为：**渐进式品牌迁移 + 兼容层**。

## 2. 可行性结论

迁移在技术、发布和许可证层面均可行。

关键判断：

- Donkeycar 当前根目录许可证为 MIT License，版权声明为 `Copyright (c) 2017 Will Roscoe`。
- MIT License 允许复制、修改、再发布和再授权派生修改，但必须保留原版权声明和 MIT 授权文本。
- 因此 DonkeyDrifter 可以把新增和修改部分采用 Apache License 2.0，但不能误称所有上游代码已被原作者重新授权为 Apache License 2.0。
- 当前代码大量使用 `donkeycar` 包名和 `donkey` CLI。直接一次性全量改名风险较高。
- 采用 `donkeydrifter` 新入口包，并保留 `donkeycar` 兼容层，可以降低迁移风险。

推荐首个独立版本为 `0.1.0`，并在 release note 中说明基线：

```text
Derived from Donkeycar 5.2.0.
```

## 3. 法律与许可证设计

### 3.1 许可证结构

建议仓库根目录采用：

```text
LICENSE                         # Apache License 2.0，DonkeyDrifter 主许可证
NOTICE                          # 派生来源、版权、名称和非官方说明
LICENSES/
└── MIT-donkeycar.txt           # 上游 Donkeycar MIT License 原文
THIRD_PARTY_NOTICES.md          # 第三方和上游来源说明，推荐保留
```

### 3.2 授权边界

README、NOTICE 和发布包说明中应明确：

```text
DonkeyDrifter is derived from Donkeycar. Portions originating from Donkeycar remain licensed under the MIT License. New contributions and modifications made for DonkeyDrifter are licensed under the Apache License 2.0.
```

中文含义：

```text
DonkeyDrifter 派生自 Donkeycar。源自 Donkeycar 的代码继续遵循原 MIT License；DonkeyDrifter 项目中的新增代码、修改代码、文档和资源在可适用范围内采用 Apache License 2.0。
```

### 3.3 文件头策略

第一阶段不建议给所有历史文件批量添加大段许可证头，避免误标上游代码和制造无意义 diff。

推荐规则：

- 新增文件使用 SPDX：`SPDX-License-Identifier: Apache-2.0`。
- 明确继承自上游且未大改的文件不强行加头。
- 修改较多且同时包含上游代码和 DonkeyDrifter 修改的文件，可后续逐步标注：`SPDX-License-Identifier: MIT AND Apache-2.0`。
- 上游许可证和版权边界优先通过 `NOTICE`、`LICENSES/MIT-donkeycar.txt` 和 README 统一说明。

### 3.4 商标和品牌边界

README、PyPI description、NOTICE 中应说明：

```text
DonkeyDrifter is an independent project derived from Donkeycar. It is not affiliated with, sponsored by, or endorsed by the Donkeycar maintainers.
```

这样可以避免用户误以为 DonkeyDrifter 是 Donkeycar 官方项目。

## 4. 品牌与命名设计

统一命名如下：

| 场景 | 名称 |
|---|---|
| 品牌名 | `DonkeyDrifter` |
| PyPI 项目名 | `donkeydrifter` |
| Python 新模块名 | `donkeydrifter` |
| Python 旧兼容模块名 | `donkeycar` |
| CLI 命令 | `donkey` |
| 仓库名 | `donkeydrifter` |
| 文档项目名 | `DonkeyDrifter` |
| Web UI 名称 | `DonkeyDrifter Web UI` |
| 上游项目引用 | `Donkeycar` |

应替换为 DonkeyDrifter 的位置：

- README 标题和当前项目描述。
- Web UI 标题、导航、页面文案和后端 OpenAPI 标题。
- `setup.cfg` 的包名、url、description、keywords、license 和 classifier。
- CLI banner 和 help 文案。
- CI badge、release badge 和仓库链接。
- 项目内 `AGENTS.md`、`CLAUDE.md` 的当前项目概述。

不应盲目替换的位置：

- 上游 MIT License 原文。
- `LICENSES/MIT-donkeycar.txt`。
- `NOTICE` 中的派生来源。
- 兼容模块 `donkeycar`。
- CLI 命令 `donkey`。
- 上游文档链接和历史兼容说明。

## 5. Python 包结构与兼容层设计

### 5.1 第一阶段推荐结构

第一阶段采用低风险路径：保留当前 `donkeycar/` 为实现包，新增 `donkeydrifter/` 作为公开入口和别名包。

```text
donkeycar/          # 仍是实际实现包
donkeydrifter/      # 新增公开入口包，转发到 donkeycar
```

新代码推荐：

```python
import donkeydrifter as dk
from donkeydrifter import Vehicle
```

旧代码继续支持：

```python
import donkeycar as dk
from donkeycar import Vehicle
```

### 5.2 子模块兼容

`donkeydrifter` 不能只在 `__init__.py` 中导出顶层对象，还必须支持子模块：

```python
from donkeydrifter.vehicle import Vehicle
from donkeydrifter.parts.tub_v2 import TubWriter
from donkeydrifter.management.base import execute_from_command_line
```

兼容层应通过 `sys.modules` alias 或等价机制，确保 `donkeydrifter.vehicle` 与 `donkeycar.vehicle` 指向同一个模块对象，避免类对象重复导致 `isinstance` 失败。

需要覆盖的一级模块至少包括：

```text
config
contrib
geom
la
memory
vehicle
management
parts
pipeline
templates
utils
```

### 5.3 版本文件

当前版本位于 `donkeycar/__init__.py`，导入会触发 banner 副作用。建议迁移到无副作用版本文件：

```text
donkeycar/_version.py
```

并由两个包导出同一版本：

```python
# donkeycar/__init__.py
from ._version import __version__

# donkeydrifter/__init__.py
from donkeycar._version import __version__
```

`setup.cfg` 使用：

```ini
version = attr: donkeycar._version.__version__
```

### 5.4 后续阶段

当测试稳定后，可逐步把内部 import 从 `donkeycar` 迁移到 `donkeydrifter`。再之后如有必要，可反转为：

```text
donkeydrifter/      # 主实现包
donkeycar/          # 兼容转发包
```

这不属于第一阶段目标。

## 6. CLI、模板与配置迁移设计

### 6.1 CLI 命令

用户已确定 CLI 继续沿用：

```bash
donkey
```

第一阶段保留 entry point：

```ini
[options.entry_points]
console_scripts =
    donkey = donkeycar.management.base:execute_from_command_line
```

不新增 `drifter` 或 `donkeydrifter` 命令，避免文档和用户习惯复杂化。

### 6.2 Banner 与 import 副作用

当前 `import donkeycar` 会打印 banner。迁移时应把 banner 从 `donkeycar/__init__.py` 移到 CLI 启动路径，例如 `donkeycar/management/base.py` 或专门的 banner 模块。

迁移后：

- `python -c "import donkeydrifter"` 不应打印 banner。
- `python -c "import donkeycar"` 不应打印 banner。
- `donkey --help` 或 CLI 启动时可显示 DonkeyDrifter 品牌。

### 6.3 模板

新生成车项目模板应推荐：

```python
import donkeydrifter as dk
```

旧车目录中的：

```python
import donkeycar as dk
```

继续可用，不自动修改用户已有车目录。

第一阶段不移动 `donkeycar/templates/` 目录，以减少包数据和模板查找风险。

### 6.4 配置键

第一阶段不重命名旧配置项和环境变量，例如 `DONKEY_*`。配置键属于用户契约，贸然改名会破坏旧车目录和脚本。

后续新增配置可采用新命名；如需替换旧配置，应先添加别名和弃用说明。

## 7. Web UI 与文档迁移设计

### 7.1 Web UI

Web UI 对外名称统一为：

```text
DonkeyDrifter Web UI
```

应更新：

- 浏览器标题。
- 首页标题。
- 顶部导航和侧边栏。
- loading、footer、toast 和错误消息中的项目名。
- `web_ui/frontend/package.json` 的 `name`，建议为 `donkeydrifter-web-ui`。
- 后端 FastAPI title，建议为 `DonkeyDrifter Web API`。

不改 API 路径和 WebSocket 协议：

```text
/api/config
/api/tub
/api/trainer
/api/drive
/api/arena
/api/connector
/api/drive/ws
/api/drive/video
```

### 7.2 README

README 顶部推荐结构：

```markdown
# DonkeyDrifter

DonkeyDrifter is a Python autonomous driving and drifting robotics platform derived from Donkeycar.

> Independent fork notice:
> DonkeyDrifter is derived from Donkeycar and is not affiliated with, sponsored by, or endorsed by the Donkeycar maintainers.

## Quick Start
## Compatibility with Donkeycar
## Web UI
## Documentation
## Development
## License
## Acknowledgements
```

Quick Start 使用：

```bash
pip install donkeydrifter
donkey createcar --path ~/mycar --template complete
cd ~/mycar
python manage.py drive
```

并明确说明 CLI 命令继续沿用 `donkey`。

### 7.3 兼容性文档

建议新增：

```text
docs/guide/donkeycar-compatibility.md
docs/guide/license-and-attribution.md
```

说明：

- 新代码推荐 `import donkeydrifter as dk`。
- 旧代码 `import donkeycar as dk` 继续可用。
- CLI 命令仍是 `donkey`。
- DonkeyDrifter 派生自 Donkeycar，但不是官方项目。
- Apache 2.0 与上游 MIT 的边界。

### 7.4 Agent 文档

同步更新 `AGENTS.md` 与项目内 `CLAUDE.md`：

- 当前项目名改为 DonkeyDrifter。
- 主发行包为 `donkeydrifter`。
- 兼容包为 `donkeycar`。
- CLI 为 `donkey`。
- 授权结构为 Apache 2.0 + 上游 MIT 保留。

## 8. CI、构建与发布策略

### 8.1 包元数据

`setup.cfg` 建议迁移为：

```ini
[metadata]
name = donkeydrifter
version = attr: donkeycar._version.__version__
author = DonkeyDrifter contributors
url = https://gitee.com/ffedu/donkeydrifter
description = Autonomous driving and drifting robotics platform derived from Donkeycar.
license = Apache-2.0
classifiers =
    Development Status :: 4 - Beta
    Intended Audience :: Developers
    Topic :: Scientific/Engineering :: Artificial Intelligence
    Programming Language :: Python :: 3.11
    License :: OSI Approved :: Apache Software License
```

上游作者信息保留在 `NOTICE` 和 README Acknowledgements 中。

### 8.2 版本策略

DonkeyDrifter 首个独立版本建议为：

```text
0.1.0
```

理由：

- 避免与上游 Donkeycar 5.2.0 混淆。
- 表达 DonkeyDrifter 是新的独立派生项目。
- 允许后续按语义化版本演进。

Release note 中写明：

```text
Derived from Donkeycar 5.2.0.
```

### 8.3 构建与 Makefile

当前 `make package` 使用 `python setup.py sdist`，但仓库没有 `setup.py`。应改为：

```make
package:
	python -m build --sdist --wheel
```

标准发布检查：

```bash
python -m build --sdist --wheel
twine check dist/*
```

### 8.4 CI

CI 保留 Python 3.11 和现有 pytest 流程，并增加：

```bash
python -c "import donkeydrifter; from donkeydrifter import Vehicle"
python -c "import donkeycar; from donkeycar import Vehicle"
python -m build --sdist --wheel
```

前端如纳入 CI，执行：

```bash
cd web_ui/frontend
npm run check
npm run lint
npm run build
```

后端执行：

```bash
cd web_ui/backend
python -m pytest tests -q
```

## 9. 测试与验证策略

### 9.1 新增测试重点

建议新增 `donkeycar/tests/test_donkeydrifter_imports.py`，覆盖：

- `from donkeydrifter import Vehicle`。
- `from donkeycar import Vehicle`。
- `from donkeydrifter.vehicle import Vehicle` 与 `from donkeycar.vehicle import Vehicle` 指向同一对象。
- `from donkeydrifter.parts.tub_v2 import TubWriter` 与旧路径指向同一对象。
- `import donkeydrifter` 无 stdout 副作用。
- `import donkeycar` 无 stdout 副作用。
- 两个包的 `__version__` 一致。

### 9.2 Metadata 与 CLI 测试

使用 `importlib.metadata` 检查：

- distribution 名称为 `donkeydrifter`。
- License 为 `Apache-2.0`。
- console script 仍包含 `donkey`。

命令验证：

```bash
donkey --help
donkey createcar --path /tmp/dd-car --template basic
python /tmp/dd-car/manage.py --help
```

### 9.3 License 文件测试

检查：

- `LICENSE` 存在且包含 Apache License 2.0。
- `NOTICE` 存在。
- `LICENSES/MIT-donkeycar.txt` 存在且包含 `MIT License` 与 `Copyright (c) 2017 Will Roscoe`。

### 9.4 Web UI 测试

后端：

```bash
cd web_ui/backend
python -m pytest tests -q
```

前端：

```bash
cd web_ui/frontend
npm run check
npm run lint
npm run build
```

人工检查 Web UI 首页、导航、浏览器标题和主要页面是否显示 DonkeyDrifter。

### 9.5 构建验证

执行：

```bash
python -m build --sdist --wheel
twine check dist/*
```

检查 wheel / sdist 是否包含：

- `donkeycar/`。
- `donkeydrifter/`。
- `LICENSE`。
- `NOTICE`。
- `LICENSES/MIT-donkeycar.txt`。
- 模板文件。
- Web controller 静态资源。

## 10. 分阶段路线图

### 阶段 0：准备与冻结基线

- 建立迁移分支。
- 记录派生基线：Donkeycar 5.2.0。
- 确认当前测试基线。
- 隔离未完成业务修改。

### 阶段 1：许可证与元数据

- 根目录 `LICENSE` 改为 Apache 2.0。
- 新增 `LICENSES/MIT-donkeycar.txt`。
- 新增 `NOTICE` 与 `THIRD_PARTY_NOTICES.md`。
- 修改 `setup.cfg` 的 name、license、description、url 和 classifier。
- 更新 README License 章节。

### 阶段 2：包名与 import 兼容层

- 新增 `donkeydrifter/`。
- 实现子模块 alias。
- 抽出 `_version.py`。
- 移除 import banner 副作用。
- 增加 import 兼容测试。

### 阶段 3：CLI 与模板

- 保留 `donkey` console script。
- CLI 文案和 banner 改为 DonkeyDrifter。
- 新模板改为 `import donkeydrifter as dk`。
- 保留旧配置键和旧车目录兼容。

### 阶段 4：README、docs 与 Web UI

- README 首屏改为 DonkeyDrifter。
- 增加兼容性、许可证和致谢章节。
- 新增 docs 兼容和授权文档。
- Web UI 前后端品牌文案改为 DonkeyDrifter。
- 更新 `AGENTS.md` 和项目内 `CLAUDE.md`。

### 阶段 5：CI、构建与回归

- Makefile 改用 `python -m build --sdist --wheel`。
- CI 增加 import 和构建验证。
- 跑 Python、Web UI 后端和前端检查。
- 检查构建产物内容。

### 阶段 6：发布 v0.1.0

- 更新版本为 `0.1.0`。
- 生成 release note。
- 打标签 `v0.1.0`。
- 手动或自动发布 PyPI 包 `donkeydrifter`。

## 11. 风险与缓解

| 风险 | 等级 | 缓解 |
|---|---:|---|
| 误称全部代码为 Apache 2.0 | 高 | README、NOTICE、LICENSES 明确双层授权 |
| 漏保留上游 MIT 原文 | 高 | `LICENSES/MIT-donkeycar.txt` 加测试 |
| 商标或官方身份混淆 | 中 | README、NOTICE、PyPI description 加独立派生说明 |
| import alias 不完整 | 高 | 覆盖顶层包和常见子模块测试 |
| 类对象重复导致 `isinstance` 失败 | 高 | `sys.modules` alias 指向同一模块对象 |
| import banner 副作用 | 中 | banner 移到 CLI 层并添加 stdout 测试 |
| 模板生成后不可运行 | 高 | `donkey createcar` 集成验证 |
| 构建产物遗漏许可证或兼容包 | 高 | 构建后检查 wheel / sdist 内容 |
| 文档全局替换误伤上游来源 | 中 | 按语义分类替换，不做盲目全局替换 |
| 版本号与上游混淆 | 中 | DonkeyDrifter 首版使用 `0.1.0` |

## 12. 非目标范围

第一阶段不做：

- 不移除 `donkeycar` 包。
- 不更改 CLI 命令 `donkey`。
- 不强制修改用户已有车目录。
- 不重命名所有旧配置项。
- 不改 `/api/*` 路径。
- 不改 WebSocket 协议。
- 不单独发布 npm 包。
- 不自动上传 PyPI。
- 不承诺兼容所有第三方 Donkeycar 插件。
- 不重写上游文档站。

## 13. 验收标准

迁移完成后应满足：

1. `pip install -e .` 安装的项目名为 `donkeydrifter`。
2. `python -c "import donkeydrifter; from donkeydrifter import Vehicle"` 成功。
3. `python -c "import donkeycar; from donkeycar import Vehicle"` 成功。
4. `from donkeydrifter.parts...` 子模块导入成功。
5. `donkey` 命令仍可用。
6. `donkey createcar` 生成的新模板使用 `donkeydrifter`。
7. 旧车目录中的 `import donkeycar` 继续可用。
8. `import donkeydrifter` 和 `import donkeycar` 无 banner 输出副作用。
9. README 首屏显示 DonkeyDrifter。
10. README 明确说明项目派生自 Donkeycar 且不是官方项目。
11. 根目录 `LICENSE` 为 Apache License 2.0。
12. `LICENSES/MIT-donkeycar.txt` 保留上游 MIT License。
13. `NOTICE` 说明派生来源、版权边界和非官方身份。
14. Web UI 标题和主导航显示 DonkeyDrifter。
15. `python -m build --sdist --wheel` 成功。
16. `twine check dist/*` 成功。
17. Python 核心测试、Web UI 后端测试、前端 check/lint/build 通过。
18. 构建产物包含 Apache 2.0、上游 MIT 和 NOTICE 文件。

## 14. 最终建议

按以下优先级推进：

1. 许可证与 NOTICE。
2. 包名 metadata。
3. `donkeydrifter` alias 包。
4. 版本文件无副作用化。
5. CLI banner 移出 import。
6. import、CLI、模板测试。
7. README 迁移。
8. Web UI 文案迁移。
9. CI 与构建验证。
10. 发布 DonkeyDrifter v0.1.0。

该方案在法律稳妥性、品牌独立性、用户兼容性和工程可验证性之间取得平衡，适合作为 DonkeyDrifter 的第一阶段迁移方案。
