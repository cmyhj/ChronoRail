# ChronoRail 彻底重新设计

## 这是什么
ChronoRail 是一个游戏版本时间线工具，追踪 9 款手游（原神、星铁、绝区零、鸣潮、明日方舟、重返未来1999、终末地、异环、二重螺旋）的版本更新和卡池时间线。当前 UI 是传统的"左侧导航栏 + 右时间轴甘特图"布局。

## 任务
**彻底重新设计整个应用。不是换颜色、不是调整间距——是从概念层面重新思考这个工具应该长什么样。**

## 自由边界
- 布局、导航方式、信息架构——随意改
- 数据层（types/hooks/services/utils）——可以重构
- 文案——可以改
- 组件结构——可以拆、可以并、可以删
- 可以参考你见过的任何优秀产品设计（Linear、Notion Calendar、Arc、Vercel、Stripe、Apple…）

## 必须保留的核心功能
1. 能看到每款游戏的版本时间区间（甘特图或等效表达）
2. 能切换月份/时间范围
3. 能看到"今天"在哪
4. 能管理游戏（增删改）
5. 能管理版本（增删改）
6. 日历视图（可选的第二视图）
7. 随机数生成器（小工具）
8. 移动端可用

## 设计方向建议（不是硬性要求）
- 21st.dev 上顶级暗色 dashboard 的风格作为参考
- 干净、克制、有呼吸感
- 信息层级清晰
- 让"扫一眼就知道接下来哪个游戏要更新"成为第一优先级

## 技术现状
- React 19 + Vite + TypeScript + Tailwind CSS v4
- 路由: react-router-dom v7
- 图标: lucide-react
- 日期: dayjs
- 数据: localStorage + 米哈游 API（public/data/game-versions.json）
- 部署: GitHub Pages（base /ChronoRail/）

## 执行要求
1. 先通读现有代码理解数据流
2. 构思一个全新的设计方案
3. 实现它
4. npm run lint && npm run build 必须通过
5. 总结改了什么、为什么这样设计
