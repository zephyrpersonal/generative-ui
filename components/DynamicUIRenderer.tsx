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
      <div className="bg-base-100 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner loading-sm"></span>
          <span>正在生成组件代码...</span>
        </div>
        {extractedCode && (
          <pre className="mt-2 text-sm opacity-60 overflow-x-auto">
            <code>{extractedCode}</code>
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* 代码展示区 */}
      <div className="bg-base-100 rounded-lg overflow-hidden border border-base-300">
        <div className="flex items-center justify-between bg-base-200 px-4 py-2 border-b border-base-300">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">生成的组件代码</span>
            <div className="badge badge-success badge-sm">完成</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="btn btn-xs btn-ghost"
            >
              {showCode ? '隐藏代码' : '显示代码'}
            </button>
            <button
              onClick={handleCopy}
              className="btn btn-xs btn-ghost"
            >
              {copied ? '✓ 已复制' : '📋 复制'}
            </button>
          </div>
        </div>

        {showCode && (
          <div className="p-4 overflow-x-auto max-h-96">
            <pre className="text-xs">
              <code>{extractedCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* 预览说明 */}
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div className="text-sm">
          <p className="font-bold">组件已生成！</p>
          <p>您可以复制上面的代码到您的项目中使用。该组件使用了 TypeScript、React Hooks 和 daisyUI 样式。</p>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="collapse collapse-arrow bg-base-100 border border-base-300">
        <input type="checkbox" />
        <div className="collapse-title text-sm font-medium">
          📖 如何使用此组件
        </div>
        <div className="collapse-content text-sm space-y-2">
          <ol className="list-decimal list-inside space-y-1">
            <li>复制上面生成的组件代码</li>
            <li>在您的 Next.js 项目中创建新文件（如 <code className="bg-base-200 px-1 rounded">components/GeneratedComponent.tsx</code>）</li>
            <li>粘贴代码到文件中</li>
            <li>在需要的地方导入并使用: <code className="bg-base-200 px-1 rounded">import GeneratedComponent from &apos;@/components/GeneratedComponent&apos;</code></li>
            <li>确保您的项目已安装 daisyUI 和 Tailwind CSS</li>
          </ol>
        </div>
      </div>

      {/* 示例数据提示 */}
      {extractedCode.includes('placeholder') || extractedCode.includes('example') ? (
        <div className="alert alert-warning">
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
          <span className="text-sm">
            注意：组件中包含示例数据。在实际使用时，请替换为真实数据或接入 API。
          </span>
        </div>
      ) : null}
    </div>
  );
}
