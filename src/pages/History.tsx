import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { History as HistoryIcon, Trash2, ExternalLink, Calendar, Search } from "lucide-react";
import { storage } from '../services/storage';
import { BrandAnalysis } from '../types';

export function History() {
  const [history, setHistory] = useState<BrandAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
  };

  const executeDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    storage.deleteAnalysis(id);
    setHistory(storage.getHistory());
    setDeletingId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(null);
  };

  const filteredHistory = history.filter(item => 
    item["AI文生图提示词"]["视觉风格描述"].toLowerCase().includes(searchTerm.toLowerCase()) ||
    item["整体视觉识别与品牌调性"]["品牌个性关键词"].some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/20 pb-6">
        <div className="space-y-1">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary" /> 审计历史记录
          </h2>
          <p className="text-on-surface-variant text-sm">查看并管理您过往的品牌视觉审计报告</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="搜索风格或关键词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
          />
        </div>
      </div>

      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative rounded-3xl bg-surface-low border border-outline-variant/10 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                <Link to={`/analysis/${item.id}`} className="block">
                  <div className="overflow-hidden bg-surface-highest">
                    <img 
                      src={item.image} 
                      alt="Thumbnail" 
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        {deletingId === item.id ? (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                            <button
                              onClick={(e) => executeDelete(item.id, e)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 border border-white/20"
                            >
                              确认删除
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="px-4 py-2 rounded-xl bg-surface-highest text-on-surface font-black text-xs uppercase tracking-widest hover:bg-surface-high transition-all active:scale-95 border border-outline-variant/20"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => confirmDelete(item.id, e)}
                            className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-bold line-clamp-2 leading-relaxed">
                        {item["AI文生图提示词"]["视觉风格描述"]}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item["整体视觉识别与品牌调性"]["品牌个性关键词"].slice(0, 3).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-wider">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-outline-variant/10">
                      <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                        查看详情 <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center">
            <HistoryIcon className="w-10 h-10 text-outline-variant" />
          </div>
          <div className="space-y-2">
            <h3 className="font-headline text-xl font-bold">暂无历史记录</h3>
            <p className="text-on-surface-variant text-sm max-w-xs">
              {searchTerm ? '没有找到匹配的审计报告' : '您还没有进行过任何品牌视觉审计'}
            </p>
          </div>
          {!searchTerm && (
            <Link 
              to="/" 
              className="px-6 py-3 rounded-xl primary-gradient text-white font-headline font-bold text-sm shadow-lg shadow-primary/20"
            >
              开始第一次审计
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}
