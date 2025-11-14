'use client';

import { useState, useRef, useEffect } from 'react';
import DynamicUIRenderer from './DynamicUIRenderer';
import ThemeSwitcher from './ThemeSwitcher';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  isError?: boolean;
}

const examplePrompts = [
  {
    icon: '🧾',
    title: '信息卡片',
    description: '生成一个展示头像、姓名、职位与社交链接的用户资料卡',
    prompt: '创建一个用户资料卡片，包含头像、姓名、职位和社交媒体链接',
  },
  {
    icon: '🛒',
    title: '产品展示',
    description: '展示图片、价格、评分与操作按钮的产品卡片',
    prompt: '创建一个产品展示卡片，带有图片、价格、评分和购买按钮',
  },
  {
    icon: '✅',
    title: '待办列表',
    description: '带有添加、完成和删除交互的待办事项列表',
    prompt: '创建一个待办事项列表，可以添加、完成和删除任务',
  },
  {
    icon: '📊',
    title: '数据仪表盘',
    description: '包含多张指标卡片和趋势图的轻量看板',
    prompt: '创建一个数据统计面板，显示多个指标卡片',
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasConversation = messages.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submitMessage = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    const createdAt = new Date().toISOString();
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: prompt,
      createdAt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        throw new Error('生成失败，请检查服务是否可用');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMessageId = `${Date.now()}-assistant`;
      let fullContent = '';

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
          isStreaming: true,
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: fullContent,
                  isStreaming: true,
                }
              : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: fullContent,
                isStreaming: false,
              }
            : msg
        )
      );
    } catch (err) {
      console.error('Error:', err);
      const message = err instanceof Error ? err.message : '生成 UI 时出现未知错误。';
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          content: '抱歉，生成 UI 时出现问题，请稍后重试或检查后端服务配置。',
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submitMessage();
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await submitMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#f7f8fb] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-lg font-semibold text-white">
              UI
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Generative UI Studio</p>
              <p className="text-xs text-neutral-500">将自然语言转化为可运行的界面原型</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-xs text-neutral-500 md:block">
              <p>支持流式渲染 · React · Tailwind CSS</p>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-10 px-6 py-8">
          {!hasConversation && (
            <section className="mt-10 rounded-3xl border border-dashed border-neutral-200 bg-white/70 p-10 text-center shadow-sm">
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-3xl text-white">
                  ✨
                </div>
                <div className="space-y-3">
                  <h1 className="text-2xl font-semibold text-neutral-900">欢迎来到生成式界面工作台</h1>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    描述你想要的组件，AI 将实时输出可直接使用的 React + Tailwind 代码，并在页面中即时渲染。
                  </p>
                </div>
                <div className="grid w-full gap-4 sm:grid-cols-2">
                  {examplePrompts.map((example) => (
                    <button
                      key={example.prompt}
                      type="button"
                      onClick={() => {
                        setInput(example.prompt);
                        inputRef.current?.focus();
                      }}
                      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-left transition-transform duration-200 hover:-translate-y-1 hover:border-neutral-900 hover:shadow-md"
                    >
                      <span className="text-2xl">{example.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{example.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{example.description}</p>
                      </div>
                      <span className="text-xs text-neutral-400">{example.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {messages.map((message) => {
            const timestamp = new Date(message.createdAt).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex max-w-[80%] flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="font-medium text-neutral-600">
                      {message.role === 'user' ? '你' : '界面助手'}
                    </span>
                    <span>·</span>
                    <span>{timestamp}</span>
                  </div>

                  {message.role === 'user' ? (
                    <div className="rounded-3xl bg-neutral-900 px-5 py-4 text-sm leading-relaxed text-white shadow-sm">
                      {message.content}
                    </div>
                  ) : message.isError ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-600">
                      {message.content}
                    </div>
                  ) : (
                    <DynamicUIRenderer code={message.content} isStreaming={Boolean(message.isStreaming)} />
                  )}

                  {message.isStreaming && !message.isError && (
                    <span className="text-xs text-blue-500">AI 正在生成界面…</span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white/80 backdrop-blur">
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>按 Enter 发送 · Shift + Enter 换行</span>
            <span>{input.length > 0 ? `${input.length} 字符` : '提示词越具体效果越好'}</span>
          </div>
          <div className="flex items-end gap-3 rounded-3xl border border-neutral-200 bg-white px-4 py-3 shadow-sm focus-within:border-neutral-900">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：生成一个简洁的登录表单，包含社交登录按钮"
              rows={2}
              className="min-h-[60px] flex-1 resize-none border-none bg-transparent text-sm leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isLoading || !input.trim()
                  ? 'bg-neutral-200 text-neutral-400'
                  : 'bg-neutral-900 text-white hover:bg-neutral-700'
              }`}
            >
              {isLoading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12L19 5L12 19L10.5 13.5L5 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-400"></span>
              <span>{error}</span>
            </div>
          )}
        </form>
      </footer>
    </div>
  );
}
