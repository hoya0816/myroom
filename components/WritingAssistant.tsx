
import React, { useState } from 'react';
import { Send, Sparkles, Copy, Download, RefreshCw, Volume2, Save } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { storageService } from '../services/storage';
import Markdown from './Markdown';

const WritingAssistant: React.FC = () => {
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setIsSaved(false);
    try {
      const result = await geminiService.generateText(
        `다음 주제에 대해 전문적이고 창의적인 글을 작성해주세요: ${prompt}`,
        "당신은 실력 있는 전문 작가입니다. 마크다운 형식을 적극 활용하여 구조화된 글을 제공하십시오."
      );
      if (result) setContent(result);
    } catch (error) {
      console.error(error);
      alert("글 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content || isSaving) return;
    setIsSaving(true);
    try {
      await storageService.saveItem({
        type: 'text',
        title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
        content: content
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <Sparkles className="text-indigo-600" size={20} />
            Creative Prompt
          </h2>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 미래 도시의 일상을 묘사하는 짧은 소설을 써줘..."
            className="w-full h-48 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700 outline-none transition-all"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
            AI 글쓰기 시작
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Volume2 size={18} />
            Quick Features
          </h3>
          <p className="text-sm opacity-90 leading-relaxed">
            작성된 내용은 Firestore에 실시간으로 저장되며, 마크다운 형식으로 렌더링됩니다.
          </p>
        </div>
      </div>

      <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="font-bold text-slate-700">AI Generated Content</span>
          <div className="flex gap-2">
            {content && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`p-2 rounded-md transition-all flex items-center gap-1 text-sm font-medium ${isSaved ? 'text-green-600 bg-green-50' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaved ? 'Saved!' : 'Save'}
              </button>
            )}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(content);
                alert("Copied to clipboard!");
              }}
              className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-500"
              title="Copy"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto bg-white">
          {content ? (
            <Markdown content={content} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
              <Sparkles size={48} strokeWidth={1} />
              <p className="italic">프롬프트를 입력하면 AI가 창의적인 글을 작성합니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingAssistant;
