import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Copy, 
  Check, 
  ArrowLeft, 
  Sparkles,
  Info,
  Download,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Send,
  Globe
} from "lucide-react";
import { storage } from '../services/storage';
import { BrandAnalysis } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GoogleGenAI } from "@google/genai";
import { useToast } from '../components/Toast';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export function StyleLab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterText, setPosterText] = useState('');
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('nanobanana');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-image');
  const [hasApiKey, setHasApiKey] = useState(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          console.error('Failed to check API key:', e);
        }
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelection = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error('Failed to open key selection:', e);
      }
    }
  };

  const platforms = [
    { 
      id: 'nanobanana', 
      name: 'Nano Banana', 
      models: ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'],
      canGenerate: true 
    },
    { 
      id: 'jimeng', 
      name: '即梦', 
      models: ['即梦 2.0', '即梦 1.0'],
      url: 'https://jimeng.com/',
      canGenerate: false 
    },
    { 
      id: 'doubao', 
      name: '豆包', 
      models: ['豆包-文生图-大模型'],
      url: 'https://www.doubao.com/',
      canGenerate: false 
    },
    { 
      id: 'sd', 
      name: 'Stable Diffusion', 
      models: ['SDXL', 'SD 1.5'],
      url: 'https://civitai.com/',
      canGenerate: false 
    },
    { 
      id: 'mj', 
      name: 'Midjourney', 
      models: ['v6.0', 'v5.2'],
      url: 'https://www.midjourney.com/',
      canGenerate: false 
    }
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  useEffect(() => {
    if (id) {
      const data = storage.getAnalysisById(id);
      if (data) {
        setAnalysis(data);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadStyleReport = async () => {
    if (!pdfTemplateRef.current || !analysis) return;
    setIsGenerating(true);
    
    try {
      const template = pdfTemplateRef.current;
      template.style.display = 'block';
      
      const canvas = await html2canvas(template, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });
      
      template.style.display = 'none';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Lucid-Style-Lab-${analysis.id.slice(0, 8)}.pdf`);
      showToast('风格报告已生成并开始下载', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast('PDF 生成失败，请重试。', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePoster = async () => {
    if (!posterText || !analysis) return;

    // Check if we need to select an API key for specific models
    const needsUserKey = selectedModel === 'gemini-3.1-flash-image-preview' || selectedModel === 'gemini-3-pro-image-preview';
    if (needsUserKey && window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          setHasApiKey(true);
        }
      } catch (e) {
        console.error('API key selection failed:', e);
      }
    }

    setIsGeneratingPoster(true);
    setGeneratedPoster(null);
    try {
      // Use process.env.API_KEY if available (for user-selected keys), fallback to GEMINI_API_KEY
      // Note: process.env.API_KEY is injected by the platform at runtime
      const apiKey = (window as any).process?.env?.API_KEY || 
                     (process as any).env?.API_KEY || 
                     process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('API Key is missing. Please configure it in the settings.');
      }

      // Extract base64 data and mime type
      const imageData = analysis.image.split(',')[1];
      const mimeType = analysis.image.split(';')[0].split(':')[1];

      const promptText = `你是一位顶尖的视觉设计师。请深度模仿上传图片的视觉风格（包括构图、色彩、光影、质感和排版逻辑），为我生成一张全新的海报。
              
海报中必须清晰展示以下文字内容： "${posterText}"。

风格参考描述： ${analysis["AI文生图提示词"]["视觉风格描述"]}。
参考提示词（Nano Banana 风格）： ${analysis["AI文生图提示词"]["NanoBanana提示词"]}。

要求：
1. 视觉风格与原图高度统一，仿佛出自同一系列。
2. 构图平衡且具有冲击力。
3. 文字排版要自然融入整体风格，确保易读性。
4. 输出高质量、高分辨率的图像。`;

      // Using direct fetch to avoid "Cannot set property fetch of #<Window>" error
      // which can happen if the SDK tries to polyfill fetch in a restricted environment.
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          parts: [
            {
              inlineData: {
                data: imageData,
                mimeType: mimeType,
              },
            },
            {
              text: promptText,
            },
          ],
        }],
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: { message: res.statusText } }));
        console.error('API Error:', errorData);
        
        if (res.status === 403) {
          throw new Error('权限不足 (403)。请确保 API Key 已正确配置且具有访问权限。');
        }
        throw new Error(errorData.error?.message || '生成失败，请稍后重试。');
      }

      const data = await res.json();
      
      if (data.candidates?.[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedPoster(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            showToast('海报已成功生成', 'success');
            break;
          }
        }
      } else {
        throw new Error('AI 未返回图像内容，请尝试修改文案或更换模型。');
      }
    } catch (err) {
      console.error('Poster generation failed:', err);
      showToast(err instanceof Error ? err.message : '海报生成失败，请重试。', 'error');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const downloadGeneratedPoster = () => {
    if (!generatedPoster) return;
    const link = document.createElement('a');
    link.href = generatedPoster;
    link.download = `Lucid-Generated-Poster-${analysis?.id.slice(0, 8)}.png`;
    link.click();
  };

  if (!analysis) return null;

  const prompts = [
    { label: 'Nano Banana', key: 'nb', value: analysis["AI文生图提示词"]["NanoBanana提示词"], hint: '侧重于真实感、光影细节和材质描述' },
    { label: '即梦 (Jimeng)', key: 'jm', value: analysis["AI文生图提示词"]["即梦提示词"], hint: '侧重于创意构思、艺术感和细节丰富度' },
    { label: '豆包 (Doubao)', key: 'db', value: analysis["AI文生图提示词"]["豆包提示词"], hint: '符合豆包文生图的语言习惯，描述画面细节和氛围' },
    { label: 'Stable Diffusion', key: 'sd', value: analysis["AI文生图提示词"]["StableDiffusion提示词"], hint: '包含高质量标签、风格关键词、技术参数建议' },
    { label: 'Midjourney', key: 'mj', value: analysis["AI文生图提示词"]["Midjourney提示词"], hint: '包含媒介、风格、构图、光影、色彩、艺术家参考' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-low transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" /> AI 风格复刻实验室
            </h2>
            <p className="text-on-surface-variant text-sm">深度解析视觉风格，提供跨平台 AI 复刻方案</p>
          </div>
        </div>
        <button 
          onClick={downloadStyleReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl primary-gradient text-white font-headline font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isGenerating ? '正在生成...' : '下载风格报告'}
        </button>
      </div>

      {/* Hidden PDF Template */}
      <div 
        ref={pdfTemplateRef} 
        style={{ 
          display: 'none', 
          position: 'absolute', 
          left: '-9999px', 
          width: '800px',
          padding: '40px',
          background: 'white',
          color: 'black'
        }}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b-2 border-black pb-4" style={{ borderColor: '#000000' }}>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#000000' }}>LUCID STYLE LAB</h1>
              <p className="text-sm uppercase tracking-widest font-bold opacity-60" style={{ color: '#000000' }}>AI Style Replication Blueprint</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold" style={{ color: '#000000' }}>ID: {analysis.id.slice(0, 8)}</p>
              <p className="text-xs" style={{ color: '#000000' }}>{new Date(analysis.timestamp).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-l-4 border-black pl-3" style={{ borderLeftColor: '#000000' }}>SOURCE STYLE</h2>
              <div className="border border-black/10 rounded-lg overflow-hidden aspect-square flex items-center justify-center" style={{ borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#f9fafb' }}>
                <img src={analysis.image} alt="Source" className="max-w-full max-h-full object-contain p-4" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-black/5" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(0,0,0,0.05)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-2" style={{ color: '#000000' }}>STYLE DESCRIPTION</h3>
                <p className="text-sm leading-relaxed italic" style={{ color: '#000000' }}>"{analysis["AI文生图提示词"]["视觉风格描述"]}"</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold border-l-4 border-black pl-3" style={{ borderLeftColor: '#000000' }}>AI PROMPTS</h2>
            <div className="space-y-6">
              {prompts.map((prompt) => (
                <div key={prompt.key} className="p-4 border border-black/10 rounded-xl space-y-2" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#000000' }}>{prompt.label}</h4>
                    <p className="text-[9px] opacity-40 uppercase font-bold" style={{ color: '#000000' }}>{prompt.hint}</p>
                  </div>
                  <p className="text-xs font-mono p-3 rounded border border-black/5 leading-relaxed" style={{ backgroundColor: '#f9fafb', borderColor: 'rgba(0,0,0,0.05)', color: '#000000' }}>
                    {prompt.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-black/10 text-center" style={{ borderTopColor: 'rgba(0,0,0,0.1)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: '#000000' }}>Generated by Lucid Style Replication Lab</p>
          </div>
        </div>
      </div>

      <div id="style-lab-content" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Source Image & Style Description */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          <div className="relative rounded-[2rem] overflow-hidden bg-surface-low shadow-ambient ghost-border aspect-square flex items-center justify-center">
            <img
              src={analysis.image}
              alt="Source"
              className="w-full h-full object-contain p-4"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 right-4">
              <div className="px-4 py-2 rounded-full glass-panel ghost-border text-[10px] font-headline font-bold uppercase tracking-widest">
                Source Asset
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest">视觉风格深度描述</h4>
            </div>
            <p className="text-sm leading-relaxed text-on-surface italic font-medium">
              "{analysis["AI文生图提示词"]["视觉风格描述"]}"
            </p>
          </div>

          {/* AI Poster Generation Section - Moved to Left Column */}
          <div className="p-8 rounded-[2rem] bg-surface-low border border-primary/20 space-y-6 shadow-xl shadow-primary/5">
            <div className="space-y-2">
              <h3 className="font-headline text-xl font-extrabold flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-primary" /> AI 风格复刻生成器
              </h3>
              <p className="text-on-surface-variant text-[11px]">输入文案，AI 将模仿原图风格为您生成全新海报</p>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">选择生成平台</p>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      setSelectedModel(p.models[0]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedPlatform === p.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-surface-highest text-on-surface-variant hover:bg-surface-highest/80'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">选择大模型</p>
                {(selectedPlatform === 'nanobanana' && window.aistudio) && (
                  <button 
                    onClick={handleOpenKeySelection}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    {hasApiKey ? '已配置 Key' : '配置 API Key'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentPlatform?.models.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModel(m)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedModel === m 
                        ? 'bg-primary/10 text-primary border border-primary/30' 
                        : 'bg-surface-highest/50 text-on-surface-variant border border-transparent hover:border-outline-variant/30'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={posterText}
                  onChange={(e) => setPosterText(e.target.value)}
                  placeholder="输入海报需要的文字内容..."
                  className="w-full p-4 rounded-xl bg-surface-lowest border border-outline-variant/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all outline-none text-xs min-h-[100px] resize-none"
                />
                
                {currentPlatform?.canGenerate ? (
                  <button
                    onClick={handleGeneratePoster}
                    disabled={isGeneratingPoster || !posterText}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-headline font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isGeneratingPoster ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isGeneratingPoster ? '正在生成海报...' : '立即生成海报'}
                  </button>
                ) : (
                  <a
                    href={currentPlatform?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-highest text-primary font-headline font-bold text-xs border border-primary/20 hover:bg-primary/5 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    跳转至 {currentPlatform?.name} 生成
                  </a>
                )}
              </div>
            </div>

            <AnimatePresence>
              {generatedPoster && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4 pt-2"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-surface-lowest shadow-ambient ghost-border aspect-[3/4] flex items-center justify-center">
                    <img
                      src={generatedPoster}
                      alt="Generated Poster"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={downloadGeneratedPoster}
                        className="p-2 rounded-full glass-panel ghost-border text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">
                    AI 已根据原图风格完成复刻生成
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Prompts Grid */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {prompts.map((prompt) => (
              <div key={prompt.key} className="p-8 rounded-[2.5rem] bg-surface-low border border-outline-variant/10 space-y-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-headline text-xl font-bold flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" /> {prompt.label}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{prompt.hint}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(prompt.value, prompt.key)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-highest text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    {copied === prompt.key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied === prompt.key ? '已复制' : '复制提示词'}
                  </button>
                </div>
                
                <div className="relative">
                  <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant/10 font-mono text-sm leading-relaxed min-h-[120px] text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {prompt.value}
                  </div>
                  <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-12 h-12 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-surface-highest/30 border border-outline-variant/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold">使用建议</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                提示词已针对不同平台的算法特性进行优化。在 Midjourney 中建议配合 <code className="bg-surface-highest px-1 rounded">--v 6.0</code> 使用；在 Stable Diffusion 中建议使用高质量的基础模型（如 SDXL）。
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
