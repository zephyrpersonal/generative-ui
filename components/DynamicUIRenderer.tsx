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
    <div className="space-y-3 w-full">
      {/* 代码展示区 */}
      <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border-2 border-success/20">
        <div className="card-body p-0">
          <div className="flex items-center justify-between bg-gradient-to-r from-success/10 to-accent/10 px-4 py-3 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-success text-success-content rounded-full w-8">
                  <span className="text-sm">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold">生成的组件代码</h3>
                <p className="text-xs text-base-content/60">TypeScript + React + daisyUI</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCode(!showCode)}
                className="btn btn-sm btn-ghost gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {showCode ? '隐藏' : '查看'}
              </button>
              <button
                onClick={handleCopy}
                className={`btn btn-sm ${copied ? 'btn-success' : 'btn-primary'} gap-2`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已复制
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    复制
                  </>
                )}
              </button>
            </div>
          </div>

          {showCode && (
            <div className="p-4">
              <div className="mockup-code bg-neutral text-neutral-content max-h-96 overflow-auto">
                <pre data-prefix="$"><code className="text-xs">{extractedCode}</code></pre>
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

      {/* 使用说明 */}
      <div className="collapse collapse-plus bg-info/10 border-2 border-info/30 shadow-lg">
        <input type="checkbox" />
        <div className="collapse-title font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          如何使用此组件
        </div>
        <div className="collapse-content">
          <div className="steps steps-vertical lg:steps-horizontal mt-4">
            <div className="step step-primary">复制代码</div>
            <div className="step step-primary">创建文件</div>
            <div className="step step-primary">粘贴代码</div>
            <div className="step step-primary">导入使用</div>
          </div>
          <ol className="list-decimal list-inside space-y-2 mt-4 text-sm">
            <li className="flex items-start gap-2">
              <span>1.</span>
              <span>点击上方的 <kbd className="kbd kbd-sm">复制</kbd> 按钮复制生成的组件代码</span>
            </li>
            <li className="flex items-start gap-2">
              <span>2.</span>
              <span>在您的 Next.js 项目中创建新文件，例如：
                <code className="ml-2 px-2 py-1 bg-base-200 rounded text-xs">components/GeneratedComponent.tsx</code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>3.</span>
              <span>将复制的代码粘贴到新文件中</span>
            </li>
            <li className="flex items-start gap-2">
              <span>4.</span>
              <span>在需要的地方导入并使用：
                <code className="ml-2 px-2 py-1 bg-base-200 rounded text-xs block mt-1">
                  import GeneratedComponent from &apos;@/components/GeneratedComponent&apos;
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>5.</span>
              <span>确保您的项目已安装 <kbd className="kbd kbd-sm">daisyUI</kbd> 和 <kbd className="kbd kbd-sm">Tailwind CSS</kbd></span>
            </li>
          </ol>
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
