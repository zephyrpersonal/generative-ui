# 🎨 Generative UI - AI 驱动的动态 UI 生成器

一个基于 Next.js 的 AI 驱动应用，通过聊天界面输入描述即可生成动态 React 组件代码，支持流式传输。

## ✨ 特性

- 🤖 **AI 驱动**: 使用 OpenAI GPT-4 模型生成 React 组件代码
- 💬 **聊天界面**: 直观的对话式交互体验
- 🌊 **流式传输**: 实时流式显示 AI 生成的代码
- 🎨 **daisyUI 样式**: 生成的组件使用 daisyUI 和 Tailwind CSS
- ⚡ **Next.js 15**: 使用最新的 Next.js App Router
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🔄 **TypeScript**: 完整的类型支持

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- OpenAI API Key

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd generative-ui
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**

   复制 `.env.example` 为 `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 并添加您的 OpenAI API Key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   获取 API Key: https://platform.openai.com/api-keys

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **打开浏览器**

   访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用方法

1. 在聊天框中输入您想要创建的 UI 组件描述
2. 点击"发送"按钮或按回车键
3. AI 将流式生成 React 组件代码
4. 您可以查看生成的代码，复制并在您的项目中使用

### 示例提示词

- "创建一个用户资料卡片，包含头像、姓名、职位和社交媒体链接"
- "创建一个产品展示卡片，带有图片、价格、评分和购买按钮"
- "创建一个待办事项列表，可以添加、完成和删除任务"
- "创建一个数据统计面板，显示多个指标卡片"
- "创建一个登录表单，包含邮箱、密码输入框和记住我选项"

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + daisyUI
- **AI**: OpenAI GPT-4 API
- **流式处理**: Vercel AI SDK
- **React**: 18.3+

## 📁 项目结构

```
generative-ui/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # AI 生成 API 端点
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
├── components/
│   ├── ChatInterface.tsx         # 聊天界面组件
│   └── DynamicUIRenderer.tsx     # 动态 UI 渲染器
├── public/                       # 静态资源
├── .env.example                  # 环境变量示例
├── next.config.js                # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 项目依赖
```

## 🎯 核心功能

### 1. 流式 AI 生成

使用 OpenAI 的流式 API 和 Vercel AI SDK，实时显示生成的代码：

```typescript
const stream = OpenAIStream(response);
return new StreamingTextResponse(stream);
```

### 2. 智能提示系统

AI 被配置为专门生成：
- TypeScript + React 函数组件
- 使用 daisyUI 组件类名
- 包含必要的 import 语句
- 带有状态管理和交互效果

### 3. 代码渲染

提供代码预览、复制和使用说明功能

## 🔧 配置

### daisyUI 主题

在 `tailwind.config.ts` 中配置主题：

```typescript
daisyui: {
  themes: ["light", "dark", "cupcake"],
}
```

### OpenAI 模型

在 `app/api/generate/route.ts` 中修改模型：

```typescript
model: 'gpt-4o-mini', // 可改为 'gpt-4' 等
```

## 📝 开发

### 构建生产版本

```bash
npm run build
npm start
```

### 代码检查

```bash
npm run lint
```

## ⚠️ 注意事项

1. **API 费用**: 使用 OpenAI API 会产生费用，请注意控制使用量
2. **安全性**: 不要将 `.env.local` 文件提交到版本控制
3. **代码执行**: 当前版本仅显示生成的代码，不直接执行（出于安全考虑）
4. **生产环境**: 在生产环境部署前，建议添加速率限制和认证机制

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [daisyUI](https://daisyui.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Tailwind CSS](https://tailwindcss.com/)
