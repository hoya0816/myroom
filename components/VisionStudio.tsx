
import React, { useState } from 'react';
import { ImageIcon, Wand2, Download, Maximize2, Loader2, Save, RefreshCw } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { storageService } from '../services/storage';

const VisionStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{url: string, prompt: string, saved?: boolean, isSaving?: boolean}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const url = await geminiService.generateImage(prompt);
      if (url) {
        setImages(prev => [{ url, prompt, saved: false, isSaving: false }, ...prev]);
      }
    } catch (error) {
      console.error(error);
      alert("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (img: typeof images[0], idx: number) => {
    if (img.isSaving || img.saved) return;
    
    const updatingImages = [...images];
    updatingImages[idx].isSaving = true;
    setImages(updatingImages);

    try {
      await storageService.saveItem({
        type: 'image',
        title: img.prompt,
        content: img.url
      });
      const finalImages = [...images];
      finalImages[idx].saved = true;
      finalImages[idx].isSaving = false;
      setImages(finalImages);
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
      const failedImages = [...images];
      failedImages[idx].isSaving = false;
      setImages(failedImages);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
            <ImageIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Vision Art Lab</h2>
            <p className="text-sm font-medium text-slate-400">당신의 상상력을 고화질 AI 예술로 변환하세요</p>
          </div>
        </div>

        <div className="flex gap-4">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="상세한 묘사를 입력하세요 (예: 사이버펑크 스타일의 서울 야경, 8k, 네온사인)..."
            className="flex-1 px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-slate-700 font-medium"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="px-10 py-5 bg-purple-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition-all shadow-xl shadow-purple-200"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((img, idx) => (
          <div key={idx} className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
              <p className="text-white text-sm font-bold line-clamp-2 mb-4 leading-relaxed">{img.prompt}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSave(img, idx)}
                  disabled={img.saved || img.isSaving}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                    img.saved ? 'bg-green-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/40'
                  }`}
                >
                  {img.isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  {img.saved ? 'Saved' : 'Save to Cloud'}
                </button>
                <button 
                   onClick={() => {
                    const a = document.createElement('a');
                    a.href = img.url;
                    a.download = `gemini-art.png`;
                    a.click();
                  }}
                  className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40 transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="aspect-square bg-slate-100 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600">AI 캔버스 작업 중</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Creating Masterpiece...</p>
            </div>
          </div>
        )}
      </div>

      {images.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-32 text-slate-200">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <ImageIcon size={48} strokeWidth={1} />
          </div>
          <p className="text-lg font-bold">생성된 이미지가 없습니다.</p>
          <p className="text-sm font-medium mt-1">새로운 예술 작품을 만들어보세요.</p>
        </div>
      )}
    </div>
  );
};

export default VisionStudio;
