# ⚙️ LLM API 配置指南

本文档详细说明如何配置不同的 LLM 服务。

## 📋 目录

- [环境变量](#环境变量)
- [OpenAI](#openai)
- [OpenRouter](#openrouter)
- [DeepSeek](#deepseek)
- [本地 LLM (Ollama)](#本地-llm-ollama)
- [其他服务](#其他服务)
- [常见问题](#常见问题)

## 环境变量

所有配置通过 `.env.local` 文件进行：

```env
# 必需
LLM_API_KEY=your-api-key

# 可选
LLM_BASE_URL=https://api.example.com/v1
LLM_MODEL=model-name
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
LLM_DEFAULT_HEADERS={"Header": "Value"}
```

### 环境变量详解

| 变量 | 必需 | 默认值 | 说明 |
|------|------|--------|------|
| `LLM_API_KEY` | ✅ | - | API 密钥，优先于 `OPENAI_API_KEY` |
| `OPENAI_API_KEY` | ❌ | - | OpenAI API 密钥（向后兼容） |
| `LLM_BASE_URL` | ❌ | `https://api.openai.com/v1` | API 端点 URL |
| `LLM_MODEL` | ❌ | `gpt-4o-mini` | 模型标识符 |
| `LLM_TEMPERATURE` | ❌ | `0.7` | 生成温度 (0-2)，越高越随机 |
| `LLM_MAX_TOKENS` | ❌ | `2000` | 最大生成 token 数 |
| `LLM_DEFAULT_HEADERS` | ❌ | - | 额外的 HTTP 请求头（JSON 格式） |

## OpenAI

### 标准配置

```env
LLM_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### 使用不同模型

```env
LLM_API_KEY=sk-proj-xxxxxxxxxxxxx
LLM_MODEL=gpt-4o
```

### 可用模型

- `gpt-4o` - 最新的 GPT-4 Omni（推荐）
- `gpt-4o-mini` - 更快更便宜的版本（默认）
- `gpt-4-turbo` - GPT-4 Turbo
- `gpt-3.5-turbo` - 最便宜的选项

### 获取 API Key

1. 访问 https://platform.openai.com/api-keys
2. 登录或注册账户
3. 点击 "Create new secret key"
4. 复制密钥并保存到 `.env.local`

## OpenRouter

OpenRouter 提供访问多个 AI 模型的统一接口。

### 基础配置

```env
LLM_API_KEY=sk-or-v1-xxxxxxxxxxxxx
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=anthropic/claude-3.5-sonnet
```

### 推荐配置（包含 HTTP Referer）

```env
LLM_API_KEY=sk-or-v1-xxxxxxxxxxxxx
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=anthropic/claude-3.5-sonnet
LLM_DEFAULT_HEADERS={"HTTP-Referer": "https://your-domain.com", "X-Title": "Generative UI"}
```

> **注意**: OpenRouter 推荐设置 HTTP-Referer 以便追踪使用情况和享受免费额度。

### 热门模型

**高性能模型：**
```env
# Claude 3.5 Sonnet（推荐）
LLM_MODEL=anthropic/claude-3.5-sonnet

# GPT-4 Turbo
LLM_MODEL=openai/gpt-4-turbo

# GPT-4o
LLM_MODEL=openai/gpt-4o
```

**经济型模型：**
```env
# Claude 3 Haiku
LLM_MODEL=anthropic/claude-3-haiku

# GPT-3.5 Turbo
LLM_MODEL=openai/gpt-3.5-turbo

# Llama 3.1 8B（免费）
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

### 获取 API Key

1. 访问 https://openrouter.ai/
2. 使用 Google 或 GitHub 登录
3. 前往 https://openrouter.ai/keys
4. 点击 "Create Key" 创建新密钥
5. 复制密钥并保存到 `.env.local`

## DeepSeek

DeepSeek 提供高性价比的中文和英文模型。

### 配置

```env
LLM_API_KEY=sk-xxxxxxxxxxxxx
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
```

### 可用模型

- `deepseek-chat` - 通用对话模型
- `deepseek-coder` - 专门用于代码生成

### 获取 API Key

1. 访问 https://platform.deepseek.com/
2. 注册并登录
3. 前往 API Keys 页面
4. 创建新密钥

## 本地 LLM (Ollama)

使用 Ollama 在本地运行开源模型，完全免费。

### 前置要求

1. 安装 Ollama: https://ollama.ai/
2. 下载模型：
   ```bash
   ollama pull llama3.1:8b
   ```

### 配置

```env
LLM_API_KEY=ollama
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=llama3.1:8b
```

### 推荐模型

```bash
# Llama 3.1 8B - 平衡性能和速度
ollama pull llama3.1:8b

# Llama 3.1 70B - 更高质量（需要更多资源）
ollama pull llama3.1:70b

# DeepSeek Coder - 专门用于代码
ollama pull deepseek-coder:6.7b

# Qwen 2.5 Coder - 优秀的代码模型
ollama pull qwen2.5-coder:7b
```

### 性能调优

```env
# 增加上下文长度
LLM_MAX_TOKENS=4000

# 调整温度以获得更确定的输出
LLM_TEMPERATURE=0.5
```

## 其他服务

### 自建 API 服务

如果你有自己的 OpenAI 兼容 API 服务：

```env
LLM_API_KEY=your-custom-key
LLM_BASE_URL=https://your-api.example.com/v1
LLM_MODEL=your-model-name
```

### Azure OpenAI

```env
LLM_API_KEY=your-azure-key
LLM_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
LLM_MODEL=gpt-4
```

### 国内服务商

许多国内服务商提供 OpenAI 兼容接口，配置方式类似：

```env
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.provider.com/v1
LLM_MODEL=provider-model-name
```

## 常见问题

### Q: 如何选择合适的模型？

**A:** 考虑以下因素：

- **质量优先**: GPT-4o, Claude 3.5 Sonnet
- **成本优先**: GPT-4o-mini, Claude 3 Haiku
- **本地运行**: Ollama + Llama 3.1
- **中文优化**: DeepSeek, Qwen

### Q: 为什么我的请求失败？

**A:** 检查以下项目：

1. **API Key 正确**: 确认密钥没有过期或权限不足
2. **Base URL 正确**: 确认服务地址和端点路径
3. **模型可用**: 确认该服务支持你指定的模型
4. **网络连接**: 确认可以访问 API 服务
5. **余额充足**: 确认账户有足够的额度

### Q: 如何降低 API 费用？

**A:** 尝试以下方法：

1. 使用更便宜的模型（如 gpt-4o-mini）
2. 降低 `LLM_MAX_TOKENS` 限制输出长度
3. 考虑使用 OpenRouter 的免费模型
4. 使用本地 Ollama（完全免费）
5. 添加速率限制防止滥用

### Q: 温度参数如何影响输出？

**A:**

- `0.0-0.3`: 非常确定，适合需要精确代码的场景
- `0.4-0.7`: 平衡，大多数场景的推荐值（默认 0.7）
- `0.8-1.0`: 更有创意，输出更多样化
- `1.0+`: 非常随机，通常不推荐用于代码生成

### Q: 可以同时使用多个 API 吗？

**A:** 当前版本只支持单一 API 配置。如需切换，修改 `.env.local` 文件后重启服务器即可。

### Q: 如何调试 API 问题？

**A:**

1. 检查浏览器开发者工具的 Console 和 Network 选项卡
2. 查看服务器日志输出
3. 验证环境变量已正确加载：
   ```javascript
   console.log({
     hasKey: !!process.env.LLM_API_KEY,
     baseUrl: process.env.LLM_BASE_URL,
     model: process.env.LLM_MODEL
   });
   ```

### Q: 生产环境部署建议？

**A:**

1. 使用环境变量管理服务（如 Vercel、Railway）
2. 添加速率限制中间件
3. 实现用户认证
4. 记录 API 使用情况
5. 设置错误报警
6. 定期监控 API 费用

## 🔗 相关链接

- [OpenAI 文档](https://platform.openai.com/docs)
- [OpenRouter 文档](https://openrouter.ai/docs)
- [DeepSeek 文档](https://platform.deepseek.com/docs)
- [Ollama 文档](https://ollama.ai/docs)

## 💡 贡献

如果你使用了其他 LLM 服务并希望分享配置，欢迎提交 Pull Request！
