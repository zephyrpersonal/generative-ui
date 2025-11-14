'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import * as Babel from '@babel/standalone';
import { LiveContext, LiveProvider, LivePreview } from 'react-live';

interface DynamicUIRendererProps {
  code: string;
  isStreaming?: boolean;
}

type TransformResult = { code: string; error: string | null };

function PreviewError({ onChange }: { onChange: (message: string | null) => void }) {
  const live = useContext(LiveContext);
  const errorMessage = typeof live?.error === 'string' ? live.error : null;

  useEffect(() => {
    onChange(errorMessage);
  }, [errorMessage, onChange]);

  if (!errorMessage) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
      <p className="mb-2 font-medium">渲染出错</p>
      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">{errorMessage}</pre>
    </div>
  );
}

const isRenderable = (source: string) => {
  const cleaned = source.trim();
  if (!cleaned) return false;

  let depth = 0;
  for (const char of cleaned) {
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth < 0) return false;
  }

  if (depth !== 0) return false;

  return (
    /return\s+\(/.test(cleaned) ||
    /=>\s*\(/.test(cleaned) ||
    cleaned.startsWith('<') ||
    cleaned.includes('render(')
  );
};

export default function DynamicUIRenderer({ code, isStreaming = false }: DynamicUIRendererProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState('');
  const stableCodeRef = useRef('');
  const runtimeCodeRef = useRef('');

  const extractedCode = useMemo(() => {
    const codeBlockRegex = /```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/g;
    const matches = [...code.matchAll(codeBlockRegex)];
    if (matches.length > 0) {
      return matches[0][1].trim();
    }
    return code.trim();
  }, [code]);

  const processedCode = useMemo(() => {
    if (!extractedCode) return '';

    let processed = extractedCode;

    processed = processed.replace(/import\s+[\s\S]*?from\s+['"].*?['"]\s*;?\s*/g, '');
    processed = processed.replace(/import\s+['"].*?['"]\s*;?\s*/g, '');
    processed = processed.replace(/['"]use client['"];?\s*/g, '');
    processed = processed.replace(/export\s+default\s+/g, '');
    processed = processed.replace(/export\s+/g, '');

    processed = processed.trim();

    if (processed.startsWith('<')) {
      return processed;
    }

    let componentName: string | null = null;

    const functionMatch = processed.match(/function\s+([A-Z]\w*)\s*\(/);
    if (functionMatch) {
      componentName = functionMatch[1];
    }

    if (!componentName) {
      const constMatch = processed.match(
        /const\s+([A-Z]\w*)\s*(?::[^=\n]+)?=\s*(?:\([^)]*\)\s*=>|function\b)/,
      );
      if (constMatch) {
        componentName = constMatch[1];
      }
    }

    if (componentName) {
      if (!processed.includes('render(')) {
        processed = `${processed}\n\nrender(<${componentName} />);`;
      }
    } else if (processed.includes('<') && processed.includes('>')) {
      if (!processed.includes('render(')) {
        processed = `render(${processed});`;
      }
    }

    return processed;
  }, [extractedCode]);

  const canRender = useMemo(() => isRenderable(extractedCode), [extractedCode]);
  const hasStablePreview = Boolean(stableCodeRef.current);
  const waitingForFirstRender = isStreaming && !hasStablePreview;

  useEffect(() => {
    if (!processedCode) {
      stableCodeRef.current = '';
      setPreviewCode('');
      return;
    }

    if (canRender) {
      stableCodeRef.current = processedCode;
      setPreviewCode(processedCode);
    } else if (stableCodeRef.current) {
      setPreviewCode(stableCodeRef.current);
    } else {
      setPreviewCode('');
    }
  }, [processedCode, canRender]);

  useEffect(() => {
    setLiveError(null);
  }, [previewCode]);

  const transformResult: TransformResult = useMemo(() => {
    if (!previewCode) {
      return { code: '', error: null };
    }

    try {
      const result = Babel.transform(previewCode, {
        presets: ['env', 'react'],
        plugins: ['transform-typescript', 'proposal-class-properties', 'proposal-object-rest-spread'],
        filename: 'GeneratedComponent.tsx',
      });

      return {
        code: result.code ?? '',
        error: null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '代码转换失败';
      return {
        code: '',
        error: message,
      };
    }
  }, [previewCode]);

  useEffect(() => {
    if (!transformResult.error && transformResult.code) {
      runtimeCodeRef.current = transformResult.code;
    }
  }, [transformResult]);

  const runtimeCodeToRender = transformResult.code || runtimeCodeRef.current;
  const activeError = transformResult.error ?? liveError;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {isStreaming && (
          <div className="absolute inset-x-0 top-0 h-[2px] animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200" />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Live Preview</p>
            <p className="mt-1 text-sm font-medium text-neutral-800">生成的界面组件</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                activeError
                  ? 'bg-red-50 text-red-500'
                  : isStreaming
                  ? 'bg-blue-50 text-blue-500'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: activeError ? '#ef4444' : isStreaming ? '#3b82f6' : '#10b981' }}
              ></span>
              {activeError ? '渲染失败' : isStreaming ? '实时生成中' : '已完成'}
            </span>
            <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white/80 p-1">
              <button
                type="button"
                onClick={() => setShowCode((prev) => !prev)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  showCode ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {showCode ? '隐藏代码' : '查看代码'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  copied ? 'bg-emerald-500 text-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {copied ? '已复制' : '复制代码'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          {waitingForFirstRender && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-neutral-100" />
                <div className="h-28 w-full animate-pulse rounded-2xl bg-neutral-100" />
                <div className="h-8 w-1/2 animate-pulse rounded-2xl bg-neutral-100" />
              </div>
              {extractedCode && (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs font-medium text-neutral-500">正在生成代码片段…</p>
                  <pre className="mt-2 max-h-48 overflow-hidden whitespace-pre-wrap break-words text-[11px] text-neutral-400">
                    {`${extractedCode.slice(0, 200)}${extractedCode.length > 200 ? '…' : ''}`}
                  </pre>
                </div>
              )}
            </div>
          )}

          {transformResult.error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
              <p className="mb-2 font-medium">代码转换失败</p>
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">{transformResult.error}</pre>
            </div>
          )}

          {!waitingForFirstRender && runtimeCodeToRender && (
            <LiveProvider
              code={runtimeCodeToRender}
              noInline={true}
              scope={{
                useState,
                useEffect,
                useMemo,
                useRef,
                React,
              }}
            >
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-5 shadow-inner">
                <LivePreview />
              </div>
              <PreviewError onChange={setLiveError} />
            </LiveProvider>
          )}

          {!waitingForFirstRender && !previewCode && (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
              等待生成可渲染的代码…
            </div>
          )}
        </div>

        {showCode && (
          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-5">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">Generated Code</p>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-neutral-700">
                {extractedCode}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span className="rounded-full bg-white px-3 py-1 shadow-sm">行数：{extractedCode.split('\n').length}</span>
        {activeError ? (
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-500">请检查代码语法或缺失的依赖</span>
        ) : (
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">支持 React · Tailwind CSS</span>
        )}
        {(extractedCode.includes('placeholder') || extractedCode.includes('example') || extractedCode.includes('示例')) && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-600">包含示例数据，记得替换为真实内容</span>
        )}
      </div>
    </div>
  );
}
