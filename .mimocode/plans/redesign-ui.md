# ChronoRail UI 全面重构任务

## 项目背景
ChronoRail 是一个中文的游戏版本时间线可视化工具（React 19 + Vite + TypeScript + Tailwind CSS v4），部署在 GitHub Pages（base `/ChronoRail/`）。功能：时间轴视图（甘特图式显示各游戏版本/卡池区间）、日历视图、游戏管理、随机数生成器。数据来自米哈游 API（CI 拉取到 public/data/game-versions.json）和本地手动维护。

当前在 `redesign` 分支，工作区是干净可构建的状态（`npm run dev` 可跑，`npm run build` 通过）。

## 核心任务
**保留数据管理层不动，把整个 UI 层（src/components/ 全部 + src/App.tsx + src/index.css）重新设计成一个高质量、现代的暗色应用。**

## 必须保留（数据层，禁止修改逻辑）
- `src/types/index.ts` — 所有类型定义
- `src/hooks/` — useGames / useVersions / useGitHub / useResponsive（它们的返回接口是 UI 的契约，不得改变签名）
- `src/services/` — storage.ts / mihoyo.ts / github.ts
- `src/utils/` — parser.ts / date.ts
- `src/constants/navigation.ts` — 导航配置（保留 label 文字）
- `public/data/` — 数据文件
- `src/main.tsx`、`index.html` — 入口（index.html 中 body 背景色可微调）
- `src/components/Common/GameIcon.tsx`、`gameData.tsx` — 游戏图标/颜色（可直接复用）
- `src/components/Common/ErrorBoundary.tsx` — 错误边界（可保留或重构，功能不变）

## 可以重写（UI 层）
- `src/App.tsx` — 布局编排（数据 hooks 的调用方式保持，但布局/组件可以完全重写）
- `src/components/` 下所有视图和布局组件：Layout（Header/Sidebar/MobileDrawer）、Timeline（TimelineView/TimelineRow/VersionBlock）、Calendar（CalendarView/CalendarDay）、Game（GameList/GameCard/GameForm）、Version（VersionForm/VersionDetail）、RandomNumber（RandomNumberView）、Common（Button/Modal/Toast 可重写）
- `src/index.css` — 完全重写设计系统

## 功能要求（必须全部保留，不允许丢功能）
1. 时间轴视图：按月的甘特图，左侧游戏名列 + 右侧版本块/卡池块，支持前后翻月、"今天"按钮跳回当前月，今天的竖线标记，版本块可点击弹详情
2. 日历视图：月历网格，每天显示该日有版本的条目（带游戏色），可切换月份
3. 游戏管理：卡片网格列表，添加/编辑/删除游戏（弹窗表单 + 预置游戏库），导出/导入 JSON
4. 版本管理：添加/编辑/删除版本（弹窗表单），版本详情弹窗
5. 随机数生成器：3x3 数字九宫格 + 自定义输入，生成随机数带闪烁动画
6. 移动端适配：汉堡菜单抽屉，侧边栏收起
7. 所有用户可见文字保持中文（与现在的文案一致，不要改文案内容）

## 设计规范（必须严格遵守）
参考 21st.dev 上顶级暗色 dashboard 的设计语言，**克制、专业、有高级感**：

### 配色
- 页面背景：近黑 `#0a0a0c`（或 #0b0b0e），干净无噪点、无网格线、无大面积渐变光晕
- 表面层次靠明度：侧边栏/头部 `#101014`、卡片 `#17171a`、hover `#1e1e24`、输入框 `#131318`
- 边框统一：`rgba(255,255,255,0.06~0.1)`，极细（1px），不用彩色边框
- 强调色：indigo `#6366f1`（hover `#4f46e5`），只用于：主按钮、"今天"按钮、选中态、时间轴今天线、焦点环
- 文字层级：主文字 `#e8e8f0`、次级 `#8a8a9a`、弱化 `#5c5c6e`、最弱 `#48484f`
- 语义色：成功 `#34d399`、警告 `#fbbf24`、危险 `#f87171`、信息 `#818cf8`（低饱和，小面积使用）
- 游戏色来自 `gameColors`（保持每个游戏的专属色用于色块/圆点/顶部色条，但底色用低透明度 10-20%，边框 30-40%，禁止大面积高饱和填充）

### 质感与层次
- 深灰明度层次代替阴影和发光。可保留非常克制的投影（黑 20-30%，blur 12-20px）用于弹窗/下拉
- 禁止：霓虹发光、glow 动画、噪点纹理、渐变光晕背景、pulse 闪烁、大圆角渐变边框
- 圆角：卡片 12px、按钮 8px、输入框 8px、标签胶囊 9999px、弹窗 12px
- 字体：系统无衬线（Inter / -apple-system），数字用 tabular 对齐

### 布局与构图
- 桌面端：左侧导航栏（宽 220-240px，含导航项 + 游戏列表分组）+ 顶部细 header（高 48-56px）+ 右侧内容区
- 导航项：图标 + 文字，选中态 = `bg-white/8%` 圆角背景 + 白色文字；未选中 = 灰字，hover 轻微提亮。无左侧光条、无渐变
- 分组标题：10px 大写字母间距（英文）或 12px 中文弱化色，作为 section label
- 间距系统：4 的倍数，内容区 padding 16-24px，卡片内 padding 16-20px
- 时间轴行：行高 80-100px，版本块使用游戏色低透明渐变（从 25% 到 12% 垂直）+ 同色 40% 边框 + 白色文字
- 今天的竖线：2px 纯色 `#6366f1` + 极淡的 6px 光晕，顶部小圆点

### 动效（克制）
- hover：150-200ms 颜色过渡
- 弹窗：fade + 轻微 zoom（200ms，cubic-bezier(0.16,1,0.3,1)）
- 页面/列表入场：fade-up 300ms，stagger 50ms（仅首次渲染）
- 随机数闪烁动画保留（这是原有功能）
- 遵守 prefers-reduced-motion

## 验证要求
完成后必须：
1. `npm run lint` 通过（无 error）
2. `npm run build` 通过
3. 说明改了哪些文件、每个视图的最终样子、以及任何需要人工确认的点

## 约束
- 不要新增 npm 依赖（除非绝对必要，且要说明理由）——优先用现有 Tailwind v4 能力
- 不要动 package.json 的依赖列表
- 不要创建 shadcn 相关文件
- 每个组件保持职责单一，避免巨型文件
- 代码注释用中文
