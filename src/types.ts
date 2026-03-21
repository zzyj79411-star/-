import { Type } from "@google/genai";

export interface BrandAnalysis {
  id: string;
  timestamp: number;
  image: string;
  "整体视觉识别与品牌调性": {
    "品牌个性关键词": string[];
    "视觉识别系统元素": string;
    "目标受众感知": string;
  };
  "构图与版面布局": {
    "构图方式": string;
    "网格系统": string;
    "视觉层次": string;
    "留白运用": string;
    "平衡与节奏": string;
  };
  "色彩系统": {
    "主色": string;
    "辅色": string;
    "点缀色": string;
    "色彩关系": string;
    "色彩情感": string;
    "色彩功能": string;
    "色彩一致性": string;
  };
    "字体与文字设计": {
    "字体选择": string;
    "字号层级": string;
    "字重与样式": string;
    "行距与字距": string;
    "文字与背景关系": string;
    "特殊文字处理": string;
    "字体下载建议链接": string[];
  };
  "图形与图像": {
    "图像风格": string;
    "图文关系": string;
    "图形元素": string;
    "素材质量": string;
  };
  "空间与背景": {
    "背景处理": string;
    "景深感": string;
    "材质与肌理": string;
  };
  "细节与质感": {
    "光影运用": string;
    "边框与装饰": string;
    "特殊效果": string;
    "精致度": string;
  };
  "设计原则综合评估": {
    "统一性": string;
    "对比度": string;
    "重复与节奏": string;
    "对齐与亲密性": string;
  };
  "可借鉴的设计亮点": {
    "创新点": string;
    "可复用技巧": string;
  };
  "AI文生图提示词": {
    "Midjourney提示词": string;
    "StableDiffusion提示词": string;
    "豆包提示词": string;
    "NanoBanana提示词": string;
    "即梦提示词": string;
    "视觉风格描述": string;
  };
}

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    "整体视觉识别与品牌调性": {
      type: Type.OBJECT,
      properties: {
        "品牌个性关键词": { type: Type.ARRAY, items: { type: Type.STRING } },
        "视觉识别系统元素": { type: Type.STRING },
        "目标受众感知": { type: Type.STRING }
      },
      required: ["品牌个性关键词", "视觉识别系统元素", "目标受众感知"]
    },
    "构图与版面布局": {
      type: Type.OBJECT,
      properties: {
        "构图方式": { type: Type.STRING },
        "网格系统": { type: Type.STRING },
        "视觉层次": { type: Type.STRING },
        "留白运用": { type: Type.STRING },
        "平衡与节奏": { type: Type.STRING }
      },
      required: ["构图方式", "网格系统", "视觉层次", "留白运用", "平衡与节奏"]
    },
    "色彩系统": {
      type: Type.OBJECT,
      properties: {
        "主色": { type: Type.STRING },
        "辅色": { type: Type.STRING },
        "点缀色": { type: Type.STRING },
        "色彩关系": { type: Type.STRING },
        "色彩情感": { type: Type.STRING },
        "色彩功能": { type: Type.STRING },
        "色彩一致性": { type: Type.STRING }
      },
      required: ["主色", "辅色", "点缀色", "色彩关系", "色彩情感", "色彩功能", "色彩一致性"]
    },
    "字体与文字设计": {
      type: Type.OBJECT,
      properties: {
        "字体选择": { type: Type.STRING },
        "字号层级": { type: Type.STRING },
        "字重与样式": { type: Type.STRING },
        "行距与字距": { type: Type.STRING },
        "文字与背景关系": { type: Type.STRING },
        "特殊文字处理": { type: Type.STRING },
        "字体下载建议链接": { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        }
      },
      required: ["字体选择", "字号层级", "字重与样式", "行距与字距", "文字与背景关系", "特殊文字处理", "字体下载建议链接"]
    },
    "图形与图像": {
      type: Type.OBJECT,
      properties: {
        "图像风格": { type: Type.STRING },
        "图文关系": { type: Type.STRING },
        "图形元素": { type: Type.STRING },
        "素材质量": { type: Type.STRING }
      },
      required: ["图像风格", "图文关系", "图形元素", "素材质量"]
    },
    "空间与背景": {
      type: Type.OBJECT,
      properties: {
        "背景处理": { type: Type.STRING },
        "景深感": { type: Type.STRING },
        "材质与肌理": { type: Type.STRING }
      },
      required: ["背景处理", "景深感", "材质与肌理"]
    },
    "细节与质感": {
      type: Type.OBJECT,
      properties: {
        "光影运用": { type: Type.STRING },
        "边框与装饰": { type: Type.STRING },
        "特殊效果": { type: Type.STRING },
        "精致度": { type: Type.STRING }
      },
      required: ["光影运用", "边框与装饰", "特殊效果", "精致度"]
    },
    "设计原则综合评估": {
      type: Type.OBJECT,
      properties: {
        "统一性": { type: Type.STRING },
        "对比度": { type: Type.STRING },
        "重复与节奏": { type: Type.STRING },
        "对齐与亲密性": { type: Type.STRING }
      },
      required: ["统一性", "对比度", "重复与节奏", "对齐与亲密性"]
    },
    "可借鉴的设计亮点": {
      type: Type.OBJECT,
      properties: {
        "创新点": { type: Type.STRING },
        "可复用技巧": { type: Type.STRING }
      },
      required: ["创新点", "可复用技巧"]
    },
    "AI文生图提示词": {
      type: Type.OBJECT,
      properties: {
        "Midjourney提示词": { type: Type.STRING },
        "StableDiffusion提示词": { type: Type.STRING },
        "豆包提示词": { type: Type.STRING },
        "NanoBanana提示词": { type: Type.STRING },
        "即梦提示词": { type: Type.STRING },
        "视觉风格描述": { type: Type.STRING }
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
