import { OpenAI } from 'openai';

// 创建 OpenAI API 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT: 设置运行时为 edge 以支持流式传输
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response('Missing prompt', { status: 400 });
    }

    // 创建系统提示，指导 AI 生成 React 组件代码
    const systemPrompt = `你是一个专业的 React 组件生成助手。根据用户的需求，生成完整的 React 组件代码。

要求：
1. 使用 TypeScript 和现代 React (函数组件 + Hooks)
2. 使用 Tailwind CSS 和 daisyUI 类名进行样式设计
3. 生成的代码必须是完整可用的，包含所有必要的 import 语句
4. 使用 daisyUI 的组件类名，如: btn, card, badge, alert, modal, input, select 等
5. 代码要有良好的结构和可读性
6. 如果需要状态管理，使用 useState
7. 添加适当的交互效果和动画

请直接输出可执行的 React 组件代码，格式如下：
\`\`\`tsx
// 组件代码
\`\`\`

只输出代码块，不要有其他解释文字。`;

    // 调用 OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // 创建可读流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('Error in generate API:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
