import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { Upload, Sparkles, Palette, Type as TypeIcon, Layout as LayoutIcon, Loader2 } from "lucide-react";
import { analyzeImage } from '../services/ai';
import { storage } from '../services/storage';

import { useToast } from '../components/Toast';

export function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeImage(image);
      const analysisWithMeta = {
        ...result,
        id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
        timestamp: Date.now(),
        image
      };
      storage.saveAnalysis(analysisWithMeta);
      showToast('分析完成！', 'success');
      navigate(`/analysis/${analysisWithMeta.id}`);
    } catch (err) {
      console.error(err);
      setError('分析失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-start space-y-8 sm:space-y-12 pt-8 sm:pt-16 pb-12 sm:pb-20 text-center"
    >
      <div className="space-y-3 sm:space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-headline font-bold uppercase tracking-widest mb-2 sm:mb-4">
          <Sparkles className="w-3 h-3" /> AI-Powered Design Intelligence <span className="ml-2 opacity-60">人工智能驱动的设计智能</span>
        </div>
        <h2 className="font-headline text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tighter max-w-3xl mx-auto leading-[0.95]">
          解构品牌视觉 <br />
          <span className="text-primary">洞察设计逻辑</span>
        </h2>
        <p className="text-on-surface-variant max-w-md mx-auto text-xs sm:text-sm px-6">
          上传品牌视觉设计稿，获取由资深专家生成的专业分析报告。
        </p>
      </div>

      <div className="w-full max-w-lg space-y-6 sm:space-y-10 px-6">
        {!image ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-[2.5rem] border-2 border-dashed border-outline-variant/30 bg-surface-low hover:bg-surface-highest/50 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-lowest shadow-ambient flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="text-primary w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <p className="font-headline font-bold text-lg">点击或拖拽上传设计稿</p>
              <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">支持海报、UI、包装等视觉素材</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-10">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-surface-low shadow-ambient ghost-border aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center">
              <img src={image} alt="Preview" className="w-full h-full object-contain" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 px-4 py-2 rounded-full glass-panel ghost-border text-[10px] font-headline font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-lg"
              >
                移除
              </button>
            </div>
            
            {!isAnalyzing ? (
              <button
                onClick={startAnalysis}
                className="w-full py-4.5 rounded-2xl primary-gradient text-white font-headline font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-6 h-6" /> 开始深度分析
              </button>
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-surface-low ghost-border flex flex-col items-center justify-center space-y-5 sm:space-y-8 text-center">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                </div>
                <div className="space-y-1.5 sm:space-y-3">
                  <p className="font-headline font-bold text-xl">专家正在审计中</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">正在解构视觉识别系统...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-4 sm:pt-8">
        <div className="flex items-center gap-2.5 text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest">
          <Palette className="w-4.5 h-4.5 text-primary" /> 色彩系统审计
        </div>
        <div className="flex items-center gap-2.5 text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest">
          <TypeIcon className="w-4.5 h-4.5 text-primary" /> 字体排版分析
        </div>
        <div className="flex items-center gap-2.5 text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest">
          <LayoutIcon className="w-4.5 h-4.5 text-primary" /> 构图布局解构
        </div>
      </div>
    </motion.section>
  );
}
