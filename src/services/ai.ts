// services/ai.ts

// 注意：移除了原来的 GoogleGenAI 导入和 apiKey 逻辑
// 现在所有分析请求都通过我们自己的后端代理 /api/gemini 完成

export async function analyzeImage(image: string) {
  // 调用 Vercel Serverless Function 代理
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image }),
  });

  if (!response.ok) {
    // 尝试解析错误信息
    let errorMessage = '分析失败，请稍后再试。';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // 如果响应不是 JSON，使用状态文本
      errorMessage = `请求失败 (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}