'use client';

import { useState, useRef, useEffect } from 'react';
import DynamicUIRenderer from './DynamicUIRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

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
    <div className="flex flex-col h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <h1 className="text-xl font-bold ml-4">🎨 Generative UI</h1>
        </div>
        <div className="flex-none">
          <div className="badge badge-secondary">AI 驱动</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold mb-2">欢迎使用 Generative UI</h2>
            <p className="text-base-content/70 mb-4">
              在下方输入您想要创建的 UI 描述，AI 将为您生成动态组件
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setInput('创建一个用户资料卡片，包含头像、姓名、职位和社交媒体链接')}
              >
                📇 用户卡片
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setInput('创建一个产品展示卡片，带有图片、价格、评分和购买按钮')}
              >
                🛍️ 产品卡片
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setInput('创建一个待办事项列表，可以添加、完成和删除任务')}
              >
                ✅ 待办列表
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setInput('创建一个数据统计面板，显示多个指标卡片')}
              >
                📊 统计面板
              </button>
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
              <div className="w-10 rounded-full bg-base-300 flex items-center justify-center">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
            </div>
            <div className="chat-header mb-1">
              {message.role === 'user' ? '你' : 'AI 助手'}
              {message.isStreaming && (
                <span className="ml-2 loading loading-dots loading-xs"></span>
              )}
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
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-base-300 bg-base-100 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="描述您想要创建的 UI 组件..."
              className="input input-bordered flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '生成中...' : '发送'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
