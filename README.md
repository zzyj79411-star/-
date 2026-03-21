# Lucid Brand Auditor - 品牌视觉审计与风格复刻实验室

Lucid Brand Auditor 是一款基于 Google Gemini AI 的专业品牌视觉分析与风格复刻工具。它能够深度解析品牌视觉设计稿、海报、UI 界面等，并输出结构化的设计分析报告，同时提供跨平台的 AI 风格复刻方案。

## 核心功能

- **深度视觉分析**：由资深品牌视觉专家（AI 模拟）对上传的图片进行专业分析，涵盖品牌一致性、色彩心理学、排版逻辑等。
- **结构化报告**：输出包含品牌调性、色彩系统、字体建议、构图分析等在内的详细报告。
- **风格复刻实验室**：
    - 提供针对 Midjourney, Stable Diffusion, 豆包 (Doubao), 即梦 (Jimeng) 等主流平台的精准提示词。
    - **AI 风格复刻生成器**：直接在应用内使用 Gemini 模型，根据原图风格生成全新的定制海报。
- **PDF 报告导出**：一键生成并下载精美的 PDF 风格蓝图报告。
- **历史记录管理**：本地存储分析记录，方便随时回溯。

## 技术栈

- **前端**：React 19, TypeScript, Vite 6
- **样式**：Tailwind CSS 4
- **动画**：Motion (formerly Framer Motion)
- **图标**：Lucide React
- **AI 能力**：Google Gemini API (@google/genai)
- **PDF 生成**：jsPDF, html2canvas

## 快速开始

### 1. 克隆项目

```bash
git clone <your-github-repo-url>
cd lucid-brand-auditor
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件，并参考 `.env.example` 进行配置：

```env
# 必填：用于基础分析的 Gemini API Key
GEMINI_API_KEY="你的_GEMINI_API_KEY"

# 可选：用于高级图像生成的 API Key (如果未提供，应用会提示用户在前端选择)
API_KEY=""
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 即可开始使用。

## 编译与部署

### 编译生产版本

```bash
npm run build
```

编译后的静态文件将位于 `dist` 目录中。

### 部署建议

#### 静态托管 (Vercel / Netlify / GitHub Pages)

由于本项目是一个单页应用 (SPA)，你可以直接将 `dist` 目录托管到任何静态网站托管平台。

**注意**：在静态托管环境下，你需要确保环境变量（如 `GEMINI_API_KEY`）已在托管平台的后台正确配置。

#### Docker 部署

项目根目录下已包含 `Dockerfile`（如果需要，请自行创建），你可以使用以下命令进行容器化部署：

```bash
docker build -t lucid-brand-auditor .
docker run -p 3000:3000 lucid-brand-auditor
```

## 开发者指南

### 项目结构

- `src/components`: 通用 UI 组件
- `src/pages`: 页面组件 (首页、分析详情页、风格实验室)
- `src/services`: AI 服务、本地存储服务
- `src/types`: TypeScript 类型定义
- `src/main.tsx`: 入口文件，包含针对 iframe 环境的 fetch 兼容性修复

### 关键配置

- `vite.config.ts`: Vite 配置文件，定义了环境变量的注入逻辑。
- `tailwind.config.ts`: Tailwind CSS 配置。

## 许可证

[MIT License](LICENSE)
