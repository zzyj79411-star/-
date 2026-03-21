import { BrandAnalysis } from "../types";

const STORAGE_KEY = 'lucid_analysis_history';

export const storage = {
  saveAnalysis: (analysis: BrandAnalysis) => {
    const history = storage.getHistory();
    const newHistory = [analysis, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  },

  getHistory: (): BrandAnalysis[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getAnalysisById: (id: string): BrandAnalysis | undefined => {
    const history = storage.getHistory();
    return history.find(item => item.id === id);
  },

  deleteAnalysis: (id: string) => {
    const history = storage.getHistory();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  }
};
