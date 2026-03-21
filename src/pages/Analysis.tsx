import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  Download, 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  Layout as LayoutIcon, 
  Palette, 
  Type as TypeIcon, 
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  Loader2
} from "lucide-react";
import { storage } from '../services/storage';
import { BrandAnalysis } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../components/Toast';

export function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const downloadPDF = async () => {
    if (!reportRef.current || !analysis) return;
    setIsGenerating(true);
    
    try {
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible and has white background for PDF
          const clonedElement = clonedDoc.getElementById('report-content');
          if (clonedElement) {
            clonedElement.style.padding = '40px';
            clonedElement.style.background = 'white';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If the content is longer than one page, we might want to split it, 
      // but for a "single page" request, we'll scale it or just add one long page.
      // Standard A4 is ~297mm high.
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Lucid-Analysis-${analysis.id.slice(0, 8)}.pdf`);
      showToast('PDF 报告已生成并开始下载', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast('PDF 生成失败，请重试。', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-low transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight">视觉审计报告</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-headline font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isGenerating ? '正在生成...' : '下载完整 PDF 报告'}
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div 
        id="report-content"
        ref={reportRef} 
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white rounded-[2rem] p-4 lg:p-8"
      >
        {/* Left Column: Image */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          <div className="relative rounded-[2rem] overflow-hidden bg-surface-low shadow-ambient ghost-border aspect-[3/4] flex items-center justify-center">
            <img
              src={analysis.image}
              alt="Source"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4">
              <div className="px-4 py-2 rounded-full glass-panel ghost-border text-[10px] font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="opacity-60">AUDIT TARGET</span>
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>审计目标</span>
              </div>
            </div>
          </div>
          
          <Link 
            to={`/style-lab/${analysis.id}`}
            className="block p-8 rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Zap className="w-24 h-24" />
            </div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest opacity-80">Style Replication</h4>
              </div>
              <h3 className="font-headline text-2xl font-extrabold leading-tight">AI 风格复刻实验室</h3>
              <p className="text-xs opacity-70 leading-relaxed">获取 Nano Banana、即梦、豆包、Stable Diffusion、Midjourney 等平台的精准提示词。</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest pt-2">
                进入实验室 <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <div className="p-6 rounded-2xl bg-surface-low ghost-border space-y-2">
            <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">分析时间</h4>
            <p className="text-sm font-bold">{new Date(analysis.timestamp).toLocaleString()}</p>
          </div>
        </div>

        {/* Right Column: Detailed Report */}
        <div className="lg:col-span-8 space-y-12">
          {/* Brand Identity */}
          <section className="space-y-6">
            <h3 className="font-headline text-xl font-extrabold tracking-tight flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" /> 整体视觉识别与品牌调性
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-surface-low ghost-border space-y-3">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">品牌个性关键词</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis["整体视觉识别与品牌调性"]["品牌个性关键词"].map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{kw}</span>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-surface-low ghost-border space-y-3">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">目标受众感知</h4>
                <p className="text-sm leading-relaxed text-on-surface">{analysis["整体视觉识别与品牌调性"]["目标受众感知"]}</p>
              </div>
              <div className="col-span-full p-6 rounded-2xl bg-surface-low ghost-border space-y-3">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">视觉识别系统元素</h4>
                <p className="text-sm leading-relaxed text-on-surface">{analysis["整体视觉识别与品牌调性"]["视觉识别系统元素"]}</p>
              </div>
            </div>
          </section>

          {/* Layout */}
          <section className="space-y-6">
            <h3 className="font-headline text-xl font-extrabold tracking-tight flex items-center gap-2 text-primary">
              <LayoutIcon className="w-5 h-5" /> 构图与版面布局
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis["构图与版面布局"]).map(([key, value]) => (
                <div key={key} className="p-5 rounded-2xl bg-surface-lowest ghost-border shadow-sm space-y-2">
                  <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">{key}</h4>
                  <p className="text-sm leading-relaxed text-on-surface">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Colors */}
          <section className="space-y-6">
            <h3 className="font-headline text-xl font-extrabold tracking-tight flex items-center gap-2 text-primary">
              <Palette className="w-5 h-5" /> 色彩系统
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-surface-low ghost-border space-y-2">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">主色</h4>
                <p className="text-sm font-bold">{analysis["色彩系统"]["主色"]}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-low ghost-border space-y-2">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">辅色</h4>
                <p className="text-sm font-bold">{analysis["色彩系统"]["辅色"]}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-low ghost-border space-y-2">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">点缀色</h4>
                <p className="text-sm font-bold">{analysis["色彩系统"]["点缀色"]}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['色彩关系', '色彩情感', '色彩功能', '色彩一致性'].map((key) => (
                <div key={key} className="p-5 rounded-2xl bg-surface-lowest ghost-border shadow-sm space-y-2">
                  <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">{key}</h4>
                  <p className="text-sm leading-relaxed text-on-surface">{analysis["色彩系统"][key as keyof typeof analysis["色彩系统"]]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
            <h3 className="font-headline text-xl font-extrabold tracking-tight flex items-center gap-2 text-primary">
              <TypeIcon className="w-5 h-5" /> 字体与文字设计
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis["字体与文字设计"]).map(([key, value]) => {
                if (key === "字体下载建议链接") return null;
                return (
                  <div key={key} className="p-5 rounded-2xl bg-surface-lowest ghost-border shadow-sm space-y-2">
                    <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">{key}</h4>
                    <p className="text-sm leading-relaxed text-on-surface">{value as string}</p>
                  </div>
                );
              })}
            </div>
            {analysis["字体与文字设计"]["字体下载建议链接"]?.length > 0 && (
              <div className="p-6 rounded-2xl bg-surface-low ghost-border space-y-4">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">字体下载建议链接</h4>
                <div className="flex flex-wrap gap-3">
                  {analysis["字体与文字设计"]["字体下载建议链接"].map((link, i) => (
                    <a 
                      key={i} 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-lowest ghost-border text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <ExternalLink className="w-3 h-3" />
                      字体资源 {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Highlights */}
          <section className="space-y-6">
            <h3 className="font-headline text-xl font-extrabold tracking-tight flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" /> 可借鉴的设计亮点
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">创新点</h4>
                <p className="text-sm leading-relaxed text-on-surface font-medium italic">"{analysis["可借鉴的设计亮点"]["创新点"]}"</p>
              </div>
              <div className="p-6 rounded-2xl bg-tertiary-fixed/5 border border-tertiary-fixed/20 space-y-3">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-tertiary-fixed">可复用技巧</h4>
                <p className="text-sm leading-relaxed text-on-surface font-medium italic">"{analysis["可借鉴的设计亮点"]["可复用技巧"]}"</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
