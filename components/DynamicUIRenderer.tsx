'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiveProvider, LivePreview, LiveError } from 'react-live';

interface DynamicUIRendererProps {
  code: string;
}

export default function DynamicUIRenderer({ code }: DynamicUIRendererProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // 提取代码块
  const extractedCode = useMemo(() => {
    const codeBlockRegex = /```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/g;
    const matches = [...code.matchAll(codeBlockRegex)];
    if (matches.length > 0) {
      return matches[0][1].trim();
    }
    return code;
  }, [code]);

  // 处理代码，移除 export default 和 import 语句，提取组件函数
  const processedCode = useMemo(() => {
    let processed = extractedCode;

    // 移除所有 import 语句
    processed = processed.replace(/import\s+.*?from\s+['"].*?['"]\s*;?\s*/g, '');

    // 移除 'use client' 指令
    processed = processed.replace(/['"]use client['"];?\s*/g, '');

    // 移除 export default
    processed = processed.replace(/export\s+default\s+/g, '');

    // 如果是函数声明，转换为立即执行
    // 例如: function MyComponent() { ... } => (() => { function MyComponent() { ... }; return <MyComponent />; })()
    const functionMatch = processed.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (functionMatch) {
      const componentName = functionMatch[1];
      // 将整个函数包装，并在最后返回组件实例
      processed = `(() => { ${processed}; return <${componentName} />; })()`;
    }

    // 如果是 const 声明的组件
    const constMatch = processed.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
    if (constMatch) {
      const componentName = constMatch[1];
      processed = `(() => { ${processed}; return <${componentName} />; })()`;
    }

    return processed;
  }, [extractedCode]);

  // 检查是否是完整的代码块
  const hasCompleteCode = useMemo(() => {
    return extractedCode.length > 50 && (
      extractedCode.includes('return') ||
      extractedCode.includes('=>') ||
      extractedCode.includes('function')
    );
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
  if (!hasCompleteCode) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <div>
              <h3 className="font-semibold">正在生成组件...</h3>
              <p className="text-sm text-base-content/60">AI 正在为您创建精美的 UI</p>
            </div>
          </div>
          {extractedCode && (
            <div className="mt-4 p-3 bg-base-200 rounded-lg">
              <pre className="text-xs opacity-70 overflow-x-auto">
                <code>{extractedCode.substring(0, 200)}...</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* 实时预览区 */}
      <div className="card bg-base-100 shadow-2xl border-2 border-primary">
        <div className="card-body p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10">
            <div className="flex items-center gap-2">
              <div className="badge badge-primary gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                实时预览
              </div>
              <span className="text-sm font-bold">生成的组件</span>
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
                    <span className="ml-1">复制</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 min-h-[200px] bg-gradient-to-br from-base-200/50 to-base-100">
            <LiveProvider
              code={processedCode}
              noInline={false}
              scope={{ useState }}
            >
              <div className="rounded-lg">
                <LivePreview />
              </div>
              <LiveError
                className="alert alert-error mt-4 text-xs font-mono"
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </LiveProvider>
          </div>

          {/* Code Display */}
          {showCode && (
            <div className="p-4 bg-base-200 border-t border-base-300">
              <div className="mockup-code">
                <pre data-prefix=">" className="text-warning"><code>components/GeneratedComponent.tsx</code></pre>
                <pre data-prefix="$" className="text-success"><code>cat GeneratedComponent.tsx</code></pre>
                <pre data-prefix="" className="bg-warning/10"><code className="text-xs">{extractedCode}</code></pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="stats stats-horizontal shadow-lg w-full bg-base-100">
        <div className="stat place-items-center">
          <div className="stat-title">状态</div>
          <div className="stat-value text-primary text-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-desc text-success">渲染成功</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">代码行数</div>
          <div className="stat-value text-secondary">{extractedCode.split('\n').length}</div>
          <div className="stat-desc">lines</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">技术栈</div>
          <div className="stat-value text-accent text-xl">
            <div className="flex gap-1 items-center">
              <span>⚛️</span>
              <span>🎨</span>
            </div>
          </div>
          <div className="stat-desc">React + daisyUI</div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="collapse collapse-arrow bg-base-100 border border-base-300 shadow-lg">
        <input type="checkbox" />
        <div className="collapse-title font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>如何在项目中使用</span>
          <div className="badge badge-info badge-sm">指南</div>
        </div>
        <div className="collapse-content">
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-sm">
              <div className="font-bold">上方是实时预览</div>
              <div>您看到的组件已经在浏览器中实时渲染。点击&quot;查看代码&quot;可以查看源码并复制到您的项目中。</div>
            </div>
          </div>

          <ul className="steps steps-vertical w-full">
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">查看预览</div>
                <p className="text-sm opacity-70">上方显示的是组件的实时渲染效果</p>
              </div>
            </li>
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">复制代码</div>
                <p className="text-sm opacity-70">点击 <kbd className="kbd kbd-xs">复制</kbd> 按钮获取完整代码</p>
              </div>
            </li>
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">集成到项目</div>
                <p className="text-sm opacity-70">在项目中创建 <code className="text-xs bg-base-200 px-1 rounded">components/YourComponent.tsx</code></p>
              </div>
            </li>
            <li className="step step-primary">
              <div className="text-left ml-4">
                <div className="font-bold">开始使用</div>
                <p className="text-sm opacity-70">导入并在页面中使用组件</p>
              </div>
            </li>
          </ul>

          <div className="divider">前置要求</div>
          <div className="flex flex-wrap gap-2">
            <kbd className="kbd">React 18+</kbd>
            <kbd className="kbd">TypeScript</kbd>
            <kbd className="kbd">Tailwind CSS</kbd>
            <kbd className="kbd">daisyUI</kbd>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      {(extractedCode.includes('placeholder') || extractedCode.includes('example') || extractedCode.includes('示例')) && (
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
            <div className="text-xs">该组件使用了示例/占位数据。在实际项目中，请替换为真实数据或接入 API。</div>
          </div>
        </div>
      )}
    </div>
  );
}
