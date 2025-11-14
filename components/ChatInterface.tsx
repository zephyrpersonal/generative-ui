'use client';

import { useState, useRef, useEffect } from 'react';
import DynamicUIRenderer from './DynamicUIRenderer';

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
      {/* Header */}
      <div className="navbar bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">
            <span className="text-2xl mr-2">✨</span>
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-base-100 to-base-content">
              Generative UI
            </span>
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="badge badge-accent badge-lg gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 驱动
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="hero min-h-[60vh]">
              <div className="hero-content text-center">
                <div className="max-w-2xl">
                  <div className="mb-8">
                    <div className="inline-block p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl shadow-lg">
                      <span className="text-7xl">🎨</span>
                    </div>
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    欢迎使用 Generative UI
                  </h1>
                  <p className="py-6 text-lg text-base-content/70">
                    使用 AI 的力量，将您的想法转化为精美的 React 组件
                    <br />
                    <span className="text-sm">支持 TypeScript、Tailwind CSS 和 daisyUI</span>
                  </p>

                  <div className="divider">快速开始</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        className={`btn ${example.color} btn-lg gap-2 shadow-lg hover:scale-105 transition-transform`}
                        onClick={() => setInput(example.prompt)}
                      >
                        <span className="text-2xl">{example.icon}</span>
                        <span>{example.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2 justify-center">
                    <div className="badge badge-primary badge-lg gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      流式生成
                    </div>
                    <div className="badge badge-secondary badge-lg gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      TypeScript
                    </div>
                    <div className="badge badge-accent badge-lg gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      daisyUI
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
                <div className={`w-12 rounded-full ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-primary-focus'
                    : 'bg-gradient-to-br from-secondary to-accent'
                } flex items-center justify-center shadow-lg`}>
                  <span className="text-xl">{message.role === 'user' ? '👤' : '🤖'}</span>
                </div>
              </div>
              <div className="chat-header mb-1 font-semibold">
                {message.role === 'user' ? '你' : 'AI 助手'}
                <time className="text-xs opacity-50 ml-2">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</time>
                {message.isStreaming && (
                  <span className="ml-2 loading loading-dots loading-xs"></span>
                )}
              </div>
              <div
                className={`chat-bubble ${
                  message.role === 'user'
                    ? 'chat-bubble-primary shadow-lg'
                    : 'chat-bubble-accent shadow-xl'
                } text-base`}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <DynamicUIRenderer code={message.content} />
                )}
              </div>
              <div className="chat-footer opacity-50 text-xs mt-1">
                {message.role === 'assistant' && !message.isStreaming && '已完成'}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-base-300 bg-base-100/95 backdrop-blur-lg shadow-2xl">
        <div className="max-w-5xl mx-auto p-4">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="label">
                  <span className="label-text font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    描述您的组件想法
                  </span>
                  {input.length > 0 && (
                    <span className="label-text-alt">{input.length} 字符</span>
                  )}
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="例如：创建一个炫酷的登录表单..."
                  className="input input-bordered input-lg w-full shadow-md focus:input-primary transition-all"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className={`btn btn-primary btn-lg gap-2 shadow-lg hover:scale-105 transition-all ${
                  isLoading ? 'loading' : ''
                }`}
                disabled={isLoading || !input.trim()}
              >
                {!isLoading && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                {isLoading ? '生成中' : '发送'}
              </button>
            </div>
            {isLoading && (
              <div className="mt-3">
                <progress className="progress progress-primary w-full"></progress>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
