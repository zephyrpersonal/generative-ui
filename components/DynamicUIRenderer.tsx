'use client';

import { useState, useEffect, useMemo } from 'react';

interface DynamicUIRendererProps {
  code: string;
}

export default function DynamicUIRenderer({ code }: DynamicUIRendererProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // 提取代码块
  const extractedCode = useMemo(() => {
    const codeBlockRegex = /```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/g;
    const matches = [...code.matchAll(codeBlockRegex)];
    if (matches.length > 0) {
      return matches[0][1].trim();
    }
    return code;
  }, [code]);

  // 检查是否是完整的代码块
  const hasCompleteCode = useMemo(() => {
    return extractedCode.includes('export default') ||
           extractedCode.includes('function') ||
           extractedCode.includes('const') ||
           extractedCode.includes('return');
  }, [extractedCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 如果代码还在流式传输中且不完整，显示加载状态
  if (!hasCompleteCode && extractedCode.length < 50) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <div>
              <h3 className="font-semibold">正在生成组件代码...</h3>
              <p className="text-sm text-base-content/60">AI 正在为您创建精美的组件</p>
            </div>
          </div>
          {extractedCode && (
            <div className="mt-4 p-3 bg-base-200 rounded-lg">
              <pre className="text-xs opacity-70 overflow-x-auto">
                <code>{extractedCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* 代码展示区 - 使用 daisyUI card */}
      <div className="card bg-base-100 shadow-xl border border-success">
        <div className="card-body p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-success/10">
            <div className="flex items-center gap-2">
              <div className="badge badge-success gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                完成
              </div>
              <span className="text-sm font-bold">生成的组件代码</span>
            </div>
            <div className="join">
              <button
                onClick={() => setShowCode(!showCode)}
                className="btn btn-sm btn-ghost join-item tooltip"
                data-tip={showCode ? '隐藏代码' : '查看代码'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </button>
              <button
                onClick={handleCopy}
                className={`btn btn-sm join-item ${copied ? 'btn-success' : 'btn-primary'}`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-1">已复制</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="ml-1">复制代码</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Display */}
          {showCode && (
            <div className="p-4 bg-base-200">
              <div className="mockup-code">
                <pre data-prefix=">" className="text-warning"><code>generative-ui/components/GeneratedComponent.tsx</code></pre>
                <pre data-prefix="$" className="text-success"><code>cat GeneratedComponent.tsx</code></pre>
                <pre data-prefix="" className="bg-warning/10"><code className="text-xs">{extractedCode}</code></pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 功能特性 */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-lg w-full bg-base-100">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-title">生成完成</div>
          <div className="stat-value text-primary text-2xl">Ready</div>
          <div className="stat-desc">可立即使用</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="stat-title">代码行数</div>
          <div className="stat-value text-secondary text-2xl">{extractedCode.split('\n').length}</div>
          <div className="stat-desc">TypeScript</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div className="stat-title">样式系统</div>
          <div className="stat-value text-accent text-2xl">daisyUI</div>
          <div className="stat-desc">Tailwind CSS</div>
        </div>
      </div>

      {/* 使用说明 - 使用 daisyUI collapse */}
      <div className="collapse collapse-arrow bg-base-100 border border-base-300 shadow-lg">
        <input type="checkbox" />
        <div className="collapse-title font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>如何使用此组件</span>
          <div className="badge badge-info badge-sm">指南</div>
        </div>
        <div className="collapse-content">
          {/* Steps */}
          <ul className="steps steps-vertical w-full mt-4">
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">复制代码</div>
                <p className="text-sm opacity-70">点击上方 <kbd className="kbd kbd-xs">复制代码</kbd> 按钮</p>
              </div>
            </li>
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">创建文件</div>
                <p className="text-sm opacity-70">在项目中创建 <code className="text-xs bg-base-200 px-1 rounded">components/GeneratedComponent.tsx</code></p>
              </div>
            </li>
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">粘贴代码</div>
                <p className="text-sm opacity-70">将代码粘贴到新文件</p>
              </div>
            </li>
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">导入使用</div>
                <div className="mockup-code mt-2 text-xs">
                  <pre data-prefix="import"><code>GeneratedComponent from &apos;@/components/GeneratedComponent&apos;</code></pre>
                </div>
              </div>
            </li>
          </ul>

          <div className="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-sm">
              <div className="font-bold">前置要求</div>
              <div className="flex gap-2 mt-1">
                <kbd className="kbd kbd-sm">daisyUI</kbd>
                <kbd className="kbd kbd-sm">Tailwind CSS</kbd>
                <kbd className="kbd kbd-sm">TypeScript</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 示例数据提示 */}
      {extractedCode.includes('placeholder') || extractedCode.includes('example') ? (
        <div className="alert alert-warning shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold">包含示例数据</h3>
            <div className="text-xs">该组件使用了示例数据。在实际项目中，请替换为真实数据或接入 API。</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
