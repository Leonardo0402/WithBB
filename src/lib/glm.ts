import type { GlmChatContentPart, GlmChatRequest, GlmChatResponse } from '../types/games';

export const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

function normalizeContent(content: string | GlmChatContentPart[] | undefined): string {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text ?? '')
      .join('\n')
      .trim();
  }

  return '';
}

export async function requestGlm(apiKey: string, request: GlmChatRequest): Promise<string> {
  const response = await fetch(GLM_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      stream: false,
    }),
  });

  const data = (await response.json().catch(() => null)) as GlmChatResponse | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || `GLM 请求失败（HTTP ${response.status}）`);
  }

  const text = normalizeContent(data?.choices?.[0]?.message?.content);

  if (!text) {
    throw new Error('GLM 没有返回可用内容，请稍后重试。');
  }

  return text;
}
