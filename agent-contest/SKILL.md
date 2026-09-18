# 原型-PRD-GitHub 一体化工作流

## 元信息

- **name**: prototype-prd-pipeline
- **description**: 从参考截图绘制高保真 HTML 原型，同步编写 US/PRD，接入页面浮动需求说明，最终验证并推送 GitHub 的完整工作流。适用于任意页面，不绑定特定业务场景。
- **trigger**: 当用户需要「根据截图画原型」「写 US/需求文档」「把 PRD 挂到页面上」「多页面同步改后提交 GitHub」等意图时触发。
- **tags**: [prototype, prd, us, github, workflow, 原型, 需求文档]
- **agent_created**: true

## 适用场景

1. 产品经理有参考图/参考页面，需要快速产出可评审的高保真原型 + 结构化 US。
2. 前端/全栈需要从原型阶段过渡到可运行 Demo，并同步沉淀 PRD。
3. 业务流程复杂（多层级列表、弹窗、抽屉、批量操作、跨页面联动），需要把交互可视化并与研发对齐。
4. 多页面静态站点需要批量同步结构（顶栏、导航、版本号、PRD 入口）并推送 GitHub Pages。

> 本 Skill 与具体业务无关。下文出现的「商务中心」「TikTok 账号包」等仅为来源项目的举例，实际使用时替换为目标页面即可。

## 前置依赖

- 已存在项目仓库，包含入口页 + 子页面 + 全局样式 + 公共脚本（典型结构：`index.html + pages/*.html + styles/main.css + scripts/main.js`）。
- 项目已接入 GitHub remote，目标分支为 `main`。
- **首次使用本 Skill**：若项目尚未接入 GitHub remote（或未确认过推送意向），不要自行假设仓库地址；需在完成原型与需求文档后（阶段 7 之前）先询问用户是否需要推送到 GitHub，如需要，再向用户询问 GitHub 仓库地址与目标分支，然后配置 remote 再执行阶段 7。后续使用时直接沿用已配置的 remote，无需重复询问。
- 本 Skill 不替代 `prototype-design`、`proto-to-prd`、`prototype-prd-integration` 等底层 Skill，而是把它们串联成可复用的 workflow。

## 执行流程

### 阶段 1：输入确认（5 分钟）

要求用户提供：

1. **参考材料**：截图、手绘稿、竞品链接或文字描述。
2. **目标页面**：要绘制/修改的是哪个页面（页面名 + 路由），涉及哪些模块（列表、弹窗、抽屉、批量操作等）。
3. **术语表**：页面内专有名词及其是否可能变更。
4. **现有约定**：主色、顶栏结构、导航方式、CSS/JS 版本号规则。

如果用户未说明，按项目既有约定自动继承（优先读项目 MEMORY.md / 设计规范）：

- 主色与状态色使用规则；
- 危险操作（删除/退出登录）的统一样式；
- 顶栏与导航结构（组成项与顺序）；
- 文案语言，字段名沿用现有页面措辞。

### 阶段 2：绘制高保真原型（30–90 分钟）

1. 调用 `prototype-design` Skill，按参考图输出 HTML 页面。
2. 约束 Agent 必须遵守：
   - 保持现有页面结构（导航、顶栏、内容区布局）与既有组件类名；
   - 新增页面若项目采用前端路由覆盖机制（如 `showPage`/`navUrl`），必须内联声明，不要只依赖公共脚本；
   - 表格、弹窗、抽屉复用项目既有组件类名；
   - 危险操作（删除/退出登录）统一使用项目既有的危险样式类。
3. 输出后，用 `agent-browser` 打开本地文件，检查首屏渲染、导航跳转、弹窗/抽屉是否正常打开。

### 阶段 3：编写用户故事（US）与需求说明（20–40 分钟）

1. 按模块拆分 US，建议每个关键交互模块一个 US，常见分类：
   - 列表类：主表展示、筛选、分页、单选/多选；
   - 弹窗类：单个对象的关联/分配操作；
   - 抽屉类：详情查看与已关联项管理；
   - 批量类：批量分配、批量删除、批量解绑。
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
3. `source` 字段注明数据来源；若依赖第三方开放平台 API，附对应官方文档链接。

### 阶段 4：将 PRD 接入页面（15–30 分钟）

1. 在每个关键模块旁挂载 `📋 US-XXX 说明` 悬浮按钮。
2. 页面右下角保留全局「需求说明」入口，点击后从右侧滑出 PRD 面板。
3. 面板内展示全部 US，点击单个 US 可查看详情与界面截图。
4. 调用 `prototype-prd-integration` Skill 完成接入，或手动按以下结构写入页面内联脚本：

```javascript
window.prdStories = [
  {
    id: 'US-001',
    title: '<模块名> 列表展示与单选',
    priority: 'P0',
    shot: '<截图相对路径，如 ../assets/prd/us-001-main.png>',
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

1. **导航矩阵**：从每个相关页面跳转到新增/修改页面，确认路由与 URL 正确。
2. **关键路径**：
   - 列表筛选、分页、排序；
   - 弹窗打开/关闭、表单校验、提交；
   - 抽屉打开、批量勾选、批量删除、二次确认；
   - PRD 面板展开、US 详情切换、截图显示。
3. 使用 `agent-browser`：
   - `open file:///...` → `eval` 查状态 → `screenshot`（指定选择器或 `--full`）。
   - 含 `alert()` 的流程需先打桩：`window.alert = function(){ window.__lastAlert = arguments[0]; };`
4. 界面变化后，同步更新项目截图目录下的 US 截图，避免 PRD 配图与代码脱节。

### 阶段 6：多页面批量同步（10–20 分钟）

1. 如改动涉及顶栏、导航、版本号等公共结构，用 Python 脚本按注释锚点+`<div>` 配对定位整块替换，避免只改一个页面。
2. 替换后逐页 `grep` 校验：
   - 顶栏结构（项目公共容器类名，如 `top-header-right`）是否一致；
   - CSS/JS 引用版本号是否统一（如 `?v=YYYYMMDD`）；
   - 新增导航项是否在全部页面同步。
3. 用 `node --check` 校验各页面内联脚本语法。

### 阶段 7：提交并推送 GitHub（10 分钟）

**首次使用检查**：进入本阶段前，先执行 `git remote -v`。若无 remote（即首次使用本 Skill），必须先向用户确认两件事，得到明确答复后再继续：

1. **是否需要推送到 GitHub？** —— 用户可选择仅本地保存，此时跳过 push，只做本地 commit。
2. **如需推送，GitHub 仓库地址是什么？** —— 由用户提供完整地址（如 `https://github.com/<用户名>/<仓库名>.git`）与目标分支，执行 `git remote add origin <地址>` 配置后再提交推送。

禁止自行猜测或硬编码仓库地址。配置成功后本次及后续使用均沿用该 remote，不再重复询问。

1. 提交信息规范：`feat(scope): 简短描述`，多个主题分开提交。
2. 排除无关改动：需求文档截图如与本次无关则单独提交，中间产物按项目既有惯例处理（如加 .gitignore）。
3. **PRD 文档与原型代码必须同步提交**：页面 `window.PRD_PAGE_URL` 指向的 HTML 必须和 `pages/*.html` 一并 git add，否则「复制链接」按钮产生的链接就是死链。每次新增/修改页面后用以下命令快速校验：
   ```bash
   # 列出所有页面配置的 PRD_PAGE_URL 与目标文件可访问性
   for f in pages/*.html; do
     url=$(grep -oE "PRD_PAGE_URL\\s*=\\s*['\"][^'\"]+['\"]" "$f" | head -1 | sed -E "s/.*['\"]([^'\"]+)['\"]/\1/")
     [ -z "$url" ] && continue
     target="${url#../}"
     [ -f "$target" ] && echo "[OK] $f -> $url" || echo "[MISS] $f -> $url"
   done
   ```
4. Push 后验证：
   - `git ls-remote origin main` 确认远程 HEAD 正确；
   - 若仓库存在 `fetch` 不更新远程跟踪引用的异常（本地 `git status` 持续显示 ahead N），手动修复：
     ```bash
     mkdir -p .git/refs/remotes/origin
     printf '<完整sha>\n' > .git/refs/remotes/origin/main
     ```
5. GitHub Pages 缓存：修改 CSS 后必须同步更新所有页面的 `?v=YYYYMMDD` 版本号，否则 10 分钟内普通窗口仍渲染旧样式。

## 关键提示词模板

### 模板 A：根据参考图绘制原型

```text
请根据上传的参考图，为【页面名】绘制高保真 HTML 原型。

约束：
1. 保持项目现有风格：主色、顶栏结构、左侧导航与既有组件类名。
2. 页面需内联 showPage/navUrl 覆盖，保证从其他页面跳转路径正确。
3. 表格/弹窗/抽屉复用既有 CSS 类名。
4. 危险操作使用项目统一的危险样式。
5. 完成后告诉我涉及的模块清单，用于下一步编写 US。
```

### 模板 B：补充用户故事

```text
请为刚才绘制的【页面名】补充用户故事（US）。

要求：
1. 关键模块（列表、弹窗、抽屉、批量操作）各一个 US。
2. 每个 US 包含「描述（desc）、筛选项（filter）、字段（fields）、数据来源（source）、操作流程（flow）、验收标准（ac）」六段内容。
3. source 中如涉及第三方开放平台 API，请附上官方文档链接。
4. 输出为 JavaScript 数组格式，方便直接嵌入页面。
```

### 模板 C：批量同步多页面

```text
请将【具体改动，如顶栏结构】按注释锚点整块同步到项目内所有 HTML 页面（index.html + pages/*.html）。

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
- [ ] US 截图存在且与当前界面一致（截图目录下对应文件 HTTP 200）。
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
2. 项目截图目录下的 US 截图（如 `assets/prd/`）。
3. 格式化需求说明文档（HTML/Word，可选）。
4. 已提交并推送的 Git commit。
