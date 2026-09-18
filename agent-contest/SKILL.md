# 原型-PRD-GitHub 一体化工作流

## 元信息

- **name**: prototype-prd-pipeline
- **description**: 从参考截图绘制高保真 HTML 原型，同步编写 US/PRD，接入页面浮动需求说明，最终验证并推送 GitHub 的完整工作流。
- **trigger**: 当用户需要「根据截图画原型」「写 US/需求文档」「把 PRD 挂到页面上」「多页面同步改后提交 GitHub」等意图时触发。
- **tags**: [prototype, prd, us, github, workflow, tiktok, bc, 原型, 需求文档]
- **agent_created**: true

## 适用场景

1. 产品经理有参考图/参考页面，需要快速产出可评审的高保真原型 + 结构化 US。
2. 前端/全栈需要从原型阶段过渡到可运行 Demo，并同步沉淀 PRD。
3. 业务流程复杂（如 TikTok 商务中心账号分配、批量授权、账号包选择），需要把交互可视化并与研发对齐。
4. 多页面静态站点需要批量同步结构（顶栏、导航、版本号、PRD 入口）并推送 GitHub Pages。

## 前置依赖

- 已存在项目仓库（示例：`maiyaput`），包含 `index.html + pages/*.html + styles/main.css + scripts/main.js`。
- 项目已接入 GitHub remote，目标分支为 `main`。
- 本 Skill 不替代 `prototype-design`、`proto-to-prd`、`prototype-prd-integration` 等底层 Skill，而是把它们串联成可复用的 workflow。

## 执行流程

### 阶段 1：输入确认（5 分钟）

要求用户提供：

1. **参考材料**：截图、手绘稿、竞品链接或文字描述。
2. **需求范围**：新增/修改哪个页面，涉及哪些模块（列表、弹窗、抽屉、批量操作等）。
3. **术语表**：页面内专有名词（如「商务中心」「BC 用户」「TikTok 账号包」）及是否可能变更。
4. **现有约定**：主色、顶栏结构、导航方式、CSS/JS 版本号规则。

如果用户未说明，按项目 MEMORY.md 中的约定自动继承：

- 主色黑白灰，状态色仅用于数据展示；
- 危险操作用红色 `--color-error`；
- 顶栏三件套：时区切换器 / 文档下载 / 用户信息下拉菜单；
- 文案中文，字段名沿用现有页面措辞。

### 阶段 2：绘制高保真原型（30–90 分钟）

1. 调用 `prototype-design` Skill，按参考图输出 HTML 页面。
2. 约束 Agent 必须遵守：
   - 保持现有页面结构（左侧导航、顶栏三件套、内容区布局）；
   - 新增页面必须内联 `showPage`/`navUrl` 覆盖，不要只依赖 `main.js`；
   - 表格、弹窗、抽屉复用项目既有组件类名；
   - 危险操作（删除/退出登录）统一使用 `.link-danger` / `--color-error`。
3. 输出后，用 `agent-browser` 打开本地文件，检查首屏渲染、导航跳转、弹窗/抽屉是否正常打开。

### 阶段 3：编写用户故事（US）与需求说明（20–40 分钟）

1. 按模块拆分 US，建议每个关键交互模块一个 US：
   - 列表类：US-001 商务中心列表展示与单选
   - 弹窗类：US-003 单个 BC 用户分配 TikTok 账号
   - 抽屉类：US-004 BC 用户已分配 TikTok 账号抽屉
   - 批量类：US-005 批量分配 TikTok 账号、US-009 批量删除
2. 每个 US 必须包含以下字段（US = 用户故事，字段即标识）：

   | 缩写 | 字段含义 | 中文说明 |
   | --- | --- | --- |
   | `id` | Identifier | US 编号，US-XXX 格式 |
   | `title` | Title | 一句话标题 |
   | `priority` | Priority | 优先级，P0 / P1 / P2 |
   | `desc` | Description | 描述（作为… 我想要… 以便…） |
   | `filter` | Filter | 筛选项与交互控件 |
   | `fields` | Fields | 表格/表单字段 |
   | `source` | Source | 数据来源与官方 API 链接 |
   | `flow` | Flow | 完整操作流程 |
   | `ac` | Acceptance Criteria | 验收标准数组 |
3. 如涉及 TikTok Business API，附上官方文档链接（如 get-business-centers、get-assets、assign-an-asset、unassign-an-asset）。

### 阶段 4：将 PRD 接入页面（15–30 分钟）

1. 在每个关键模块旁挂载 `📋 US-XXX 说明` 悬浮按钮。
2. 页面右下角保留全局「需求说明」入口，点击后从右侧滑出 PRD 面板。
3. 面板内展示全部 US，点击单个 US 可查看详情与界面截图。
4. 调用 `prototype-prd-integration` Skill 完成接入，或手动按以下结构写入页面内联脚本：

```javascript
window.prdStories = [
  {
    id: 'US-001',
    title: '商务中心列表展示与单选',
    priority: 'P0',
    shot: '../assets/prd/us-001-main.png',
    desc: '...',
    filter: '...',
    fields: '...',
    source: '...',
    flow: '...',
    ac: ['...']
  }
  // ...
];
```

### 阶段 5：自动化验证与截图更新（20–40 分钟）

1. **导航矩阵**：从每个海外页面跳转到新增/修改页面，确认 URL 正确。
2. **关键路径**：
   - 列表筛选、分页、排序；
   - 弹窗打开/关闭、表单校验、提交；
   - 抽屉打开、批量勾选、批量删除、二次确认；
   - PRD 面板展开、US 详情切换、截图显示。
3. 使用 `agent-browser`：
   - `open file:///...` → `eval` 查状态 → `screenshot`（指定选择器或 `--full`）。
   - 含 `alert()` 的流程需先打桩：`window.alert = function(){ window.__lastAlert = arguments[0]; };`
4. 界面变化后，同步更新 `assets/prd/` 下的 US 截图，避免 PRD 配图与代码脱节。

### 阶段 6：多页面批量同步（10–20 分钟）

1. 如改动涉及顶栏、导航、版本号等公共结构，用 Python 脚本按注释锚点+`<div>` 配对定位整块替换，避免只改一个页面。
2. 替换后逐页 `grep` 校验：
   - `top-header-right` 三件套是否一致；
   - CSS/JS 引用版本号是否统一（如 `?v=YYYYMMDD`）；
   - 新增导航项是否在全部页面同步。
3. 用 `node --check` 校验各页面内联脚本语法。

### 阶段 7：提交并推送 GitHub（10 分钟）

1. 提交信息规范：`feat(scope): 简短描述`，多个主题分开提交。
2. 排除无关改动：PRD 截图如与本次无关则单独提交，output/ 中间产物按项目既有惯例处理。
3. Push 后验证：
   - `git ls-remote origin main` 确认远程 HEAD 正确；
   - 如该仓库出现 `fetch` 不更新远程跟踪引用，手动修复：
     ```bash
     mkdir -p .git/refs/remotes/origin
     printf '<完整sha>\n' > .git/refs/remotes/origin/main
     ```
4. GitHub Pages 缓存：修改 CSS 后必须同步更新所有页面的 `?v=YYYYMMDD` 版本号，否则 10 分钟内普通窗口仍渲染旧样式。

## 关键提示词模板

### 模板 A：根据参考图绘制原型

```text
请根据上传的参考图，为【页面名】绘制高保真 HTML 原型。

约束：
1. 保持项目现有风格：黑白灰主色、顶栏三件套、左侧导航结构。
2. 页面需内联 showPage/navUrl 覆盖，保证从其他海外页面跳转路径正确。
3. 表格/弹窗/抽屉复用既有 CSS 类名。
4. 危险操作使用红色样式。
5. 完成后告诉我涉及的模块清单，用于下一步编写 US。
```

### 模板 B：补充用户故事

```text
请为刚才绘制的【页面名】补充用户故事（US）。

要求：
1. 关键模块（列表、弹窗、抽屉、批量操作）各一个 US。
2. 每个 US 包含「描述（desc）、筛选项（filter）、字段（fields）、数据来源（source）、操作流程（flow）、验收标准（ac）」六段内容。
3. source 中如涉及 TikTok Business API，请附上官方文档链接。
4. 输出为 JavaScript 数组格式，方便直接嵌入页面。
```

### 模板 C：批量同步多页面

```text
请将【具体改动，如顶栏三件套】按注释锚点整块同步到项目内所有 HTML 页面（index.html + pages/*.html）。

要求：
1. 使用 Python 脚本按注释锚点 + <div class="top-header-right"> 整块替换。
2. 替换后逐页 grep 校验，确保每个页面结构一致。
3. 同步更新 CSS/JS 引用的版本号 ?v=YYYYMMDD。
4. 用 node --check 校验各页面内联脚本语法。
```

## 验收清单

- [ ] 页面在 1280px 视口下无横向滚动，关键列完整显示。
- [ ] 从其他页面跳转到本页的导航路径正确。
- [ ] 每个关键模块都有 US 悬浮按钮，点击可展开 PRD 面板。
- [ ] US 截图存在且与当前界面一致（`assets/prd/` 下对应文件 HTTP 200）。
- [ ] 弹窗/抽屉层级正确，不遮挡底部操作按钮。
- [ ] 批量操作路径完整：勾选 → 计数更新 → 按钮可用 → 二次确认 → 成功提示 → 列表刷新。
- [ ] CSS/JS 版本号已统一更新。
- [ ] `node --check` 校验所有内联脚本通过。
- [ ] `git status` 干净，`git ls-remote origin main` 与本地 HEAD 一致。

## 高频踩坑与解法

| 现象 | 根因 | 解法 |
| --- | --- | --- |
| 表格空白、按钮点不动 | `var` 声明提升，初始化调用写在赋值之前 | 把初始化调用移到脚本末尾或 DOMContentLoaded 内 |
| 批量删除后计数条不复位 | 先改数据后读旧 DOM，把已删账号又塞回选中态 | 读 DOM 的同步函数必须在 DOM 重绘之后调用 |
| agent-browser eval 超时 | 流程中含 `alert()` 阻塞 JS 线程 | 先打桩 `window.alert = function(){...}` |
| 线上样式仍旧 | GitHub Pages `Cache-Control: max-age=600` | 修改 CSS 后同步更新所有页面 `?v=YYYYMMDD` |
| `git status` 一直 ahead N | 该仓库 `fetch` 不更新远程跟踪引用 | 手动写入 `.git/refs/remotes/origin/main` |
| 多页面批量替换后个别页遗漏 | 手工逐个修改 | 用 Python 脚本按注释锚点整块替换 + grep 校验 |

## 输出物

1. 新增/修改的 HTML/CSS/JS 代码。
2. `assets/prd/` 下的 US 截图。
3. 格式化需求说明文档（HTML/Word，可选）。
4. 已提交并推送的 Git commit。
