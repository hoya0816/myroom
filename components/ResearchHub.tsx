
import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Link as LinkIcon, Send, User, Bot, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { geminiService } from '../services/gemini';

const ResearchHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await geminiService.searchAndResearch(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.text,
        timestamp: Date.now(),
        groundingUrls: result.urls
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      alert("연구 결과 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="text-blue-600" size={20} />
          <span className="font-bold text-slate-700">실시간 연구 허브</span>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded-full border border-slate-200">
          Google Search Enabled
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Search size={32} className="text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-lg">무엇을 조사해 드릴까요?</p>
              <p className="text-sm">실시간 웹 검색을 바탕으로 정확한 정보를 제공합니다.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {msg.groundingUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-100/50 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <LinkIcon size={12} className="text-slate-500" />
                        <span className="text-[10px] font-semibold text-slate-600 truncate">{url.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                <Loader2 className="animate-spin" size={20} />
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm italic text-slate-400">
                인터넷에서 관련 정보를 검색하고 있습니다...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative max-w-4xl mx-auto">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="궁금한 실시간 정보를 물어보세요..."
            className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
          />
          <button 
            onClick={handleSearch}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchHub;
