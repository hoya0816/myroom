
import React, { useState, useEffect } from 'react';
import { History, Trash2, ExternalLink, FileText, ImageIcon, Search, Calendar, RefreshCw } from 'lucide-react';
import { storageService } from '../services/storage';
import { HistoryItem } from '../types';
import Markdown from './Markdown';

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const data = await storageService.getHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      try {
        await storageService.deleteItem(id);
        setHistory(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="text-indigo-500" size={20} />;
      case 'image': return <ImageIcon className="text-purple-500" size={20} />;
      case 'research': return <Search className="text-blue-500" size={20} />;
      default: return <History className="text-slate-500" size={20} />;
    }
  };

  return (
    <div className="flex h-full gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar List */}
      <div className="w-1/3 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold flex items-center gap-2">
            <History size={18} />
            History (Cloud)
          </h2>
          <button 
            onClick={fetchHistory}
            className="p-1 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-indigo-600"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <RefreshCw className="animate-spin mb-2" size={32} />
              <p className="text-sm font-medium">불러오는 중...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 opacity-60">
              <History size={48} strokeWidth={1} />
              <p className="mt-2 text-sm font-medium">저장된 기록이 없습니다.</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-4 rounded-xl transition-all group border ${
                  selectedItem?.id === item.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">{getTypeIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${selectedItem?.id === item.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                      <Calendar size={10} />
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {selectedItem ? (
          <>
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedItem.type)}
                <h3 className="font-bold text-slate-800 truncate max-w-[70%]">{selectedItem.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="lg:hidden text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              {selectedItem.type === 'text' || selectedItem.type === 'research' ? (
                <Markdown content={selectedItem.content} />
              ) : selectedItem.type === 'image' ? (
                <div className="space-y-4">
                  <img 
                    src={selectedItem.content} 
                    alt={selectedItem.title} 
                    className="w-full max-w-lg mx-auto rounded-2xl shadow-lg border border-slate-200"
                  />
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt</p>
                    <p className="text-sm text-slate-700 leading-relaxed italic">{selectedItem.title}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              <ExternalLink size={32} strokeWidth={1.5} className="text-slate-300" />
            </div>
            <p className="font-medium">Cloud에 저장된 기록을 선택하여 확인하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
