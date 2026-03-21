import { GoogleGenAI } from "@google/genai";
import { ANALYSIS_SCHEMA } from "../types";

const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return (window as any).process?.env?.API_KEY || (process as any).env?.API_KEY || process.env.GEMINI_API_KEY || "";
  }
  return process.env.API_KEY || process.env.GEMINI_API_KEY || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const SYSTEM_INSTRUCTION = `你是一位资深品牌平面视觉工作者，拥有 10 年以上国际一线品牌服务经验。你的任务是对用户上传的图片（品牌视觉设计稿、海报、UI 界面、包装等）进行深度专业分析，输出结构化的设计分析报告。

特别要求：
1. **字体下载链接**：在“字体与文字设计”中，提供报告中提到的字体的下载链接或搜索链接（如 Google Fonts, Adobe Fonts 等）。确保“字体下载建议链接”是一个包含这些 URL 字符串的数组。
2. **AI 复刻提示词**：
   - **Midjourney**: 英文提示词，包含媒介、风格、构图、光影、色彩、艺术家参考。
   - **Stable Diffusion**: 英文提示词，包含高质量标签、风格关键词、技术参数建议。
   - **豆包 (Doubao)**: 中文提示词，符合豆包文生图的语言习惯，描述画面细节和氛围。
   - **即梦 (Jimeng)**: 中文提示词，侧重于创意构思、艺术感和细节丰富度，符合即梦平台的生成偏好。
   - **Nano Banana (Gemini)**: 英文提示词，侧重于真实感、光影细节和材质描述。
3. **专业性**：分析应体现资深专家的洞察力，指出设计背后的逻辑、品牌一致性以及对受众的情感影响。`;

export async function analyzeImage(image: string) {
  const base64Data = image.split(',')[1];
  const mimeType = image.split(';')[0].split(':')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: "请对这张图片进行深度专业分析，输出结构化的设计分析报告。",
        },
      ],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  return JSON.parse(response.text || '{}');
}
