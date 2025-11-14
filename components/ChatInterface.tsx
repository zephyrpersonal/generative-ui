'use client';

import { useState, useRef, useEffect } from 'react';
import DynamicUIRenderer from './DynamicUIRenderer';
import ThemeSwitcher from './ThemeSwitcher';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const examplePrompts = [
  {
    icon: '👤',
    label: '用户卡片',
    prompt: '创建一个用户资料卡片，包含头像、姓名、职位和社交媒体链接',
    color: 'btn-info'
  },
  {
    icon: '🛍️',
    label: '产品卡片',
    prompt: '创建一个产品展示卡片，带有图片、价格、评分和购买按钮',
    color: 'btn-success'
  },
  {
    icon: '✅',
    label: '待办列表',
    prompt: '创建一个待办事项列表，可以添加、完成和删除任务',
    color: 'btn-warning'
  },
  {
    icon: '📊',
    label: '统计面板',
    prompt: '创建一个数据统计面板，显示多个指标卡片',
    color: 'btn-secondary'
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate UI');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      // 创建助手消息用于流式更新
      const assistantMessageId = (Date.now() + 1).toString();
      let fullContent = '';

      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          isStreaming: true,
        },
      ]);

      // 读取流式数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;

        // 更新消息内容
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      }

      // 完成流式传输
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，生成 UI 时出现错误。请检查您的 API 密钥配置或稍后重试。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Header - 使用 daisyUI navbar */}
      <header className="navbar bg-base-100 shadow-xl border-b border-base-300">
        <div className="navbar-start">
          <a className="btn btn-ghost normal-case text-xl gap-2">
            <span className="text-2xl">✨</span>
            <span className="font-bold">Generative UI</span>
          </a>
        </div>

        <div className="navbar-center hidden lg:flex">
          <div className="flex gap-2">
            <div className="badge badge-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 驱动
            </div>
            <div className="badge badge-secondary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              流式生成
            </div>
            <div className="badge badge-accent gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              TypeScript
            </div>
          </div>
        </div>

        <div className="navbar-end gap-2">
          <div className="indicator">
            <span className="indicator-item badge badge-success badge-xs"></span>
            <button className="btn btn-ghost btn-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">在线</span>
            </button>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="hero min-h-[calc(100vh-20rem)]">
              <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left max-w-2xl">
                  <div className="flex justify-center lg:justify-start mb-6">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-24">
                        <span className="text-5xl">🎨</span>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-5xl font-bold">
                    欢迎使用 <span className="text-primary">Generative UI</span>
                  </h1>
                  <p className="py-6 text-lg">
                    使用 AI 的力量，将您的想法转化为精美的 React 组件。
                    支持 TypeScript、Tailwind CSS 和 daisyUI。
                  </p>

                  <div className="alert shadow-lg mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <h3 className="font-bold">开始体验</h3>
                      <div className="text-xs">选择下方的示例，或直接描述您想要的组件</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {examplePrompts.map((example, index) => (
                      <div key={index} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer" onClick={() => setInput(example.prompt)}>
                        <div className="card-body p-4">
                          <div className="flex items-center gap-3">
                            <div className={`avatar placeholder`}>
                              <div className={`${example.color.replace('btn-', 'bg-')} text-base-100 rounded-lg w-12`}>
                                <span className="text-2xl">{example.icon}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h2 className="card-title text-base">{example.label}</h2>
                              <p className="text-xs text-base-content/60 line-clamp-2">{example.prompt}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="divider my-8">功能特性</div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="stat bg-base-100 rounded-box shadow">
                      <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="stat-title text-xs">实时</div>
                      <div className="stat-value text-primary text-2xl">流式</div>
                    </div>

                    <div className="stat bg-base-100 rounded-box shadow">
                      <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <div className="stat-title text-xs">语言</div>
                      <div className="stat-value text-secondary text-2xl">TS</div>
                    </div>

                    <div className="stat bg-base-100 rounded-box shadow">
                      <div className="stat-figure text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div className="stat-title text-xs">样式</div>
                      <div className="stat-value text-accent text-xl">daisy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${
                message.role === 'user' ? 'chat-end' : 'chat-start'
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <div className={`w-full h-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                  } text-base-100`}>
                    <span className="text-lg">{message.role === 'user' ? '👤' : '🤖'}</span>
                  </div>
                </div>
              </div>
              <div className="chat-header">
                {message.role === 'user' ? '你' : 'AI 助手'}
                <time className="text-xs opacity-50 ml-1">
                  {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <div
                className={`chat-bubble ${
                  message.role === 'user'
                    ? 'chat-bubble-primary'
                    : 'chat-bubble-secondary'
                }`}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <DynamicUIRenderer code={message.content} />
                )}
              </div>
              <div className="chat-footer opacity-50">
                {message.isStreaming ? (
                  <span className="loading loading-dots loading-xs"></span>
                ) : message.role === 'assistant' ? (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已完成
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - 使用 daisyUI form-control */}
      <footer className="border-t border-base-300 bg-base-100 shadow-xl">
        <div className="max-w-5xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="form-control">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                描述您的组件想法
              </span>
              {input.length > 0 && (
                <span className="label-text-alt badge badge-ghost">{input.length} 字符</span>
              )}
            </label>
            <div className="input-group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例如：创建一个炫酷的登录表单..."
                className="input input-bordered input-lg w-full focus:input-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`btn btn-primary btn-lg ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || !input.trim()}
              >
                {!isLoading && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                <span className="hidden sm:inline">{isLoading ? '生成中...' : '发送'}</span>
              </button>
            </div>
            {isLoading && (
              <progress className="progress progress-primary w-full mt-2"></progress>
            )}
            <label className="label">
              <span className="label-text-alt">
                <kbd className="kbd kbd-xs">Enter</kbd> 发送
              </span>
              <span className="label-text-alt">支持 Markdown 和代码块</span>
            </label>
          </form>
        </div>
      </footer>
    </div>
  );
}
