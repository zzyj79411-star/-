import { GoogleGenAI } from "@google/genai";

// 允许跨域请求
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

// ---------- 系统指令 ----------
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

// ---------- 响应 Schema ----------
// 注：这里使用了 JSON Schema 格式，而不是 Type 枚举
const ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    "整体视觉识别与品牌调性": {
      type: "OBJECT",
      properties: {
        "品牌个性关键词": { type: "ARRAY", items: { type: "STRING" } },
        "视觉识别系统元素": { type: "STRING" },
        "目标受众感知": { type: "STRING" }
      },
      required: ["品牌个性关键词", "视觉识别系统元素", "目标受众感知"]
    },
    "构图与版面布局": {
      type: "OBJECT",
      properties: {
        "构图方式": { type: "STRING" },
        "网格系统": { type: "STRING" },
        "视觉层次": { type: "STRING" },
        "留白运用": { type: "STRING" },
        "平衡与节奏": { type: "STRING" }
      },
      required: ["构图方式", "网格系统", "视觉层次", "留白运用", "平衡与节奏"]
    },
    "色彩系统": {
      type: "OBJECT",
      properties: {
        "主色": { type: "STRING" },
        "辅色": { type: "STRING" },
        "点缀色": { type: "STRING" },
        "色彩关系": { type: "STRING" },
        "色彩情感": { type: "STRING" },
        "色彩功能": { type: "STRING" },
        "色彩一致性": { type: "STRING" }
      },
      required: ["主色", "辅色", "点缀色", "色彩关系", "色彩情感", "色彩功能", "色彩一致性"]
    },
    "字体与文字设计": {
      type: "OBJECT",
      properties: {
        "字体选择": { type: "STRING" },
        "字号层级": { type: "STRING" },
        "字重与样式": { type: "STRING" },
        "行距与字距": { type: "STRING" },
        "文字与背景关系": { type: "STRING" },
        "特殊文字处理": { type: "STRING" },
        "字体下载建议链接": { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["字体选择", "字号层级", "字重与样式", "行距与字距", "文字与背景关系", "特殊文字处理", "字体下载建议链接"]
    },
    "图形与图像": {
      type: "OBJECT",
      properties: {
        "图像风格": { type: "STRING" },
        "图文关系": { type: "STRING" },
        "图形元素": { type: "STRING" },
        "素材质量": { type: "STRING" }
      },
      required: ["图像风格", "图文关系", "图形元素", "素材质量"]
    },
    "空间与背景": {
      type: "OBJECT",
      properties: {
        "背景处理": { type: "STRING" },
        "景深感": { type: "STRING" },
        "材质与肌理": { type: "STRING" }
      },
      required: ["背景处理", "景深感", "材质与肌理"]
    },
    "细节与质感": {
      type: "OBJECT",
      properties: {
        "光影运用": { type: "STRING" },
        "边框与装饰": { type: "STRING" },
        "特殊效果": { type: "STRING" },
        "精致度": { type: "STRING" }
      },
      required: ["光影运用", "边框与装饰", "特殊效果", "精致度"]
    },
    "设计原则综合评估": {
      type: "OBJECT",
      properties: {
        "统一性": { type: "STRING" },
        "对比度": { type: "STRING" },
        "重复与节奏": { type: "STRING" },
        "对齐与亲密性": { type: "STRING" }
      },
      required: ["统一性", "对比度", "重复与节奏", "对齐与亲密性"]
    },
    "可借鉴的设计亮点": {
      type: "OBJECT",
      properties: {
        "创新点": { type: "STRING" },
        "可复用技巧": { type: "STRING" }
      },
      required: ["创新点", "可复用技巧"]
    },
    "AI文生图提示词": {
      type: "OBJECT",
      properties: {
        "Midjourney提示词": { type: "STRING" },
        "StableDiffusion提示词": { type: "STRING" },
        "豆包提示词": { type: "STRING" },
        "NanoBanana提示词": { type: "STRING" },
        "即梦提示词": { type: "STRING" },
        "视觉风格描述": { type: "STRING" }
      },
      required: ["Midjourney提示词", "StableDiffusion提示词", "豆包提示词", "NanoBanana提示词", "即梦提示词", "视觉风格描述"]
    }
  },
  required: [
    "整体视觉识别与品牌调性",
    "构图与版面布局",
    "色彩系统",
    "字体与文字设计",
    "图形与图像",
    "空间与背景",
    "细节与质感",
    "设计原则综合评估",
    "可借鉴的设计亮点",
    "AI文生图提示词"
  ]
};

// 核心处理函数
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 解析 base64 数据
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
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export default allowCors(handler);
