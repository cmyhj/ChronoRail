# ChronoRail

二次元游戏版本时间线可视化工具

## 功能特性

- 🎮 支持多款游戏版本追踪
- 📅 时间轴和日历两种视图
- 🔄 米哈游游戏自动获取版本信息
- ☁️ GitHub 云端数据同步
- 📱 响应式设计，支持移动端
- 🎨 二次元游戏风格 UI

## 支持的游戏

| 游戏 | 自动获取 | 说明 |
|------|----------|------|
| 原神 | ✅ | 通过米哈游官方API获取 |
| 崩坏：星穹铁道 | ✅ | 通过米哈游官方API获取 |
| 绝区零 | ✅ | 通过米哈游官方API获取 |
| 自定义游戏 | ❌ | 手动输入版本信息 |

## 快速开始

### 1. 访问网站

直接访问: https://cmyhj.github.io/ChronoRail/

### 2. 添加游戏

点击左侧菜单的 **"+"** 按钮，选择预置游戏或自定义添加。

### 3. 获取版本

- **自动获取**: 对于米哈游游戏，点击游戏卡片上的"刷新版本"按钮
- **手动添加**: 点击游戏详情页的"手动添加"按钮

## GitHub 云端同步配置

### 为什么需要配置？

- 多设备同步数据
- 数据云端备份
- 换电脑不丢失数据

### 配置步骤

#### 第一步：创建 GitHub Personal Access Token

1. 登录 GitHub，点击右上角头像 → **Settings**

2. 左侧菜单最下方 → **Developer settings**

3. 左侧菜单 → **Personal access tokens** → **Tokens (classic)**

4. 点击 **Generate new token** → **Generate new token (classic)**

5. 填写信息：
   - **Note**: `ChronoRail Sync`
   - **Expiration**: 选择过期时间（建议90天或1年）
   - **Select scopes**: 勾选 **repo**（完整仓库访问权限）

6. 点击 **Generate token**

7. **立即复制Token**（只显示一次！）

#### 第二步：在网站中配置

1. 点击右上角的 **设置图标** ⚙️
2. 选择 **GitHub 同步配置**
3. 填入：
   - **Personal Access Token**: 粘贴刚才复制的Token
   - **仓库所有者**: `cmyhj`
   - **仓库名称**: `ChronoRail`
   - **数据文件路径**: `data/chronorail.json`（默认）
4. 点击 **测试连接** 验证配置
5. 点击 **保存**

#### 第三步：使用同步

配置完成后：
- 点击 **"同步到GitHub"** 将本地数据上传
- 点击 **"从GitHub同步"** 下载云端数据
- 点击 **"双向同步"** 合并本地和云端数据

### Token 安全提示

⚠️ **重要**：
- Token 只保存在你的浏览器本地，不会上传到任何服务器
- 不要分享Token给他人
- 定期更换Token（建议每90天）
- 如果Token泄露，立即在GitHub删除并重新生成

## GitHub Actions 自动部署

本项目已配置 GitHub Actions 自动部署到 GitHub Pages。

### 工作流程

```
代码推送到 main 分支
        ↓
GitHub Actions 自动触发
        ↓
安装依赖 (npm ci)
        ↓
构建项目 (npm run build)
        ↓
部署到 GitHub Pages
        ↓
网站自动更新
```

### 配置文件

部署配置位于 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

### 启用 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存

### 查看部署状态

1. 进入仓库 **Actions** 标签页
2. 查看最新的 workflow 运行状态
3. 绿色 ✅ 表示部署成功
4. 红色 ❌ 表示部署失败，点击查看日志

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173/ChronoRail/

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 |
| 类型系统 | TypeScript |
| 构建工具 | Vite |
| CSS框架 | Tailwind CSS |
| 日期处理 | Day.js |
| 图标库 | Lucide React |
| 部署 | GitHub Pages |
| CI/CD | GitHub Actions |

## 项目结构

```
ChronoRail/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 部署配置
├── public/
│   └── favicon.svg           # 网站图标
├── src/
│   ├── components/           # React 组件
│   │   ├── Calendar/         # 日历视图
│   │   ├── Common/           # 通用组件
│   │   ├── Game/             # 游戏管理
│   │   ├── Layout/           # 布局组件
│   │   ├── Timeline/         # 时间轴视图
│   │   └── Version/          # 版本管理
│   ├── hooks/                # 自定义 Hooks
│   ├── services/             # API 服务
│   ├── styles/               # 样式配置
│   ├── types/                # TypeScript 类型
│   ├── utils/                # 工具函数
│   ├── App.tsx               # 主应用组件
│   └── main.tsx              # 入口文件
├── data/
│   └── chronorail.json       # 数据文件
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── tailwind.config.js        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
└── vite.config.ts            # Vite 配置
```

## API 说明

### 米哈游公告API

```
原神: https://hk4e-ann-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnList
星铁: https://hkrpg-ann-api.mihoyo.com/common/hkrpg_cn/announcement/api/getAnnList
绝区零: https://announcement-api.mihoyo.com/common/nap_cn/announcement/api/getAnnList
```

### GitHub API

用于数据云端同步：
```
GET/PUT https://api.github.com/repos/{owner}/{repo}/contents/{path}
```

## 常见问题

### Q: 数据会丢失吗？

A: 数据存储在浏览器LocalStorage中，清除浏览器缓存会丢失数据。建议配置GitHub同步备份。

### Q: Token安全吗？

A: Token只保存在你的浏览器本地，不会上传到任何服务器。但请勿在公共电脑上保存Token。

### Q: 支持哪些浏览器？

A: 支持所有现代浏览器：Chrome、Firefox、Safari、Edge。

### Q: 手机端怎么使用？

A: 直接在手机浏览器访问即可，网站会自动适配移动端。

## 许可证

MIT License

## 联系方式

- GitHub: https://github.com/cmyhj/ChronoRail
- Issues: https://github.com/cmyhj/ChronoRail/issues

## 致谢

- 米哈游官方API
- React
- Vite
- Tailwind CSS
- Lucide Icons
