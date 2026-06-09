# DonkeyDrifter v0.1.0 发布说明草案

## 概览

DonkeyDrifter v0.1.0 是 DonkeyDrifter 作为独立派生项目的首个发布版本。

本版本派生自 Donkeycar 5.2.0，保留 Donkeycar 的模块化 Vehicle + Part 架构、Tub 数据工作流、训练工具、模拟器支持和 Web UI 工作流，同时建立 DonkeyDrifter 独立品牌、包名和授权结构。

## 重要变更

- 项目品牌更名为 DonkeyDrifter。
- Python 发布包名改为 `donkeydrifter`。
- 新推荐导入路径为：

  ```python
  import donkeydrifter as dk
  ```

- 旧导入路径继续兼容：

  ```python
  import donkeycar as dk
  ```

- CLI 命令继续沿用：

  ```bash
  donkey
  ```

- 新车模板默认使用 `donkeydrifter` 导入。
- Web UI 品牌更新为 DonkeyDrifter。
- 构建产物发布为：

  ```text
  donkeydrifter-0.1.0-py3-none-any.whl
  donkeydrifter-0.1.0.tar.gz
  ```

## 许可证与归属

DonkeyDrifter 以 Apache License 2.0 作为主许可证。

DonkeyDrifter 派生自 Donkeycar。源自 Donkeycar 的部分继续保留 MIT License。详情见：

- `LICENSE`
- `NOTICE`
- `THIRD_PARTY_NOTICES.md`
- `LICENSES/MIT-donkeycar.txt`

DonkeyDrifter 是独立派生项目，不代表 Donkeycar 官方维护团队，也不构成官方背书。

## 兼容性

- `import donkeydrifter`：推荐用于新代码。
- `import donkeycar`：继续作为兼容入口可用。
- `donkey` CLI：继续保留。
- 旧车目录无需立即迁移。
- 第一阶段不重命名 `/api/*` Web UI 路径。
- 第一阶段不重命名旧 `DONKEY_*` 配置项。

## Web UI

- 后端 API 标题更新为 `DonkeyDrifter Web API`。
- 前端页面标题和主导航更新为 `DonkeyDrifter Web UI`。
- 前端构建产物已更新并保留在仓库中。

## 构建与发布验证

已完成以下验证：

```text
donkeycar/tests: 219 passed, 13 skipped
tests: 17 passed
web_ui/backend/tests: 34 passed
web_ui/frontend: npm run check / lint / build 通过
python -m build --sdist --wheel 通过
twine check dist/* 通过
```

生成产物：

```text
dist/donkeydrifter-0.1.0-py3-none-any.whl
dist/donkeydrifter-0.1.0.tar.gz
```

构建产物包含：

```text
LICENSE
NOTICE
LICENSES/MIT-donkeycar.txt
```

## 已知提示

- 测试过程中存在若干第三方库 warning，包括 `torchvision` 参数弃用提示、`pytorch_lightning` DataLoader worker 提示和 `albumentations` 版本查询超时提示。
- `pytest` 报告 `reruns` 配置未知 warning，属于现有测试配置问题。
- `pip install -e ".[torch]"` 会将 `fastai` 限制为 `<2.8`，以匹配 `torch==2.1.*`。
- 如果同一环境中安装了 `python-fasthtml`，可能出现 `fastcore` 版本约束冲突，建议使用独立环境。

## 发布步骤草案

```bash
python -m build --sdist --wheel
python -m twine check dist/*
git tag v0.1.0
git push origin v0.1.0
# 如需发布 PyPI：
python -m twine upload dist/*
```
