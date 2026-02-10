
import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
  PenTool, 
  Trash2, 
  ChevronLeft, 
  Calendar, 
  User, 
  Send,
  Loader2,
  Search,
  Sparkles,
  Eye,
  CheckCircle2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Type,
  Image as ImageIcon
} from 'lucide-react';
import { storageService } from '../services/storage';
import { geminiService } from '../services/gemini';
import { Post } from '../types';
import Markdown from './Markdown';

type BoardState = 'list' | 'write' | 'view';

const Board: React.FC = () => {
  const [viewState, setViewState] = useState<BoardState>('list');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  
  const titleRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await storageService.getPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (viewState === 'write') {
      titleRef.current?.focus();
    }
  }, [viewState]);

  // 서식 및 이미지 삽입 로직 통합
  const insertText = (before: string, after: string = "", defaultText: string = "") => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    
    const replacement = before + selectedText + after;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const applyStyle = (type: string) => {
    switch (type) {
      case 'bold': insertText("**", "**", "텍스트"); break;
      case 'italic': insertText("*", "*", "텍스트"); break;
      case 'underline': insertText("<u>", "</u>", "텍스트"); break;
      case 'h1': insertText("\n# ", "\n", "제목1"); break;
      case 'h2': insertText("\n## ", "\n", "제목2"); break;
      case 'list': insertText("\n- ", "", "리스트 항목"); break;
      case 'ordered': insertText("\n1. ", "", "순서 리스트"); break;
      case 'quote': insertText("\n> ", "\n", "인용구"); break;
      case 'code': insertText("`", "`", "코드"); break;
      case 'image': fileInputRef.current?.click(); break; // 이미지 버튼 클릭 시 파일 인풋 트리거
      default: break;
    }
  };

  // 이미지 파일 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 용량 제한 체크 (Firestore 문서 당 1MB 제한 고려)
    if (file.size > 800 * 1024) {
      alert("이미지 용량이 너무 큽니다. 800KB 이하의 파일을 선택해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      insertText(`\n![이미지 설명](${base64})\n`, "", "");
    };
    reader.readAsDataURL(file);
    
    // 인풋 초기화 (같은 파일 다시 선택 가능하게)
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    
    setLoading(true);
    try {
      await storageService.savePost({ 
        title: title.trim(), 
        content: content.trim(), 
        author: author.trim() 
      });
      setTitle(''); setContent(''); setAuthor('');
      setViewState('list');
      setShowPreview(false);
      fetchPosts();
    } catch (error) {
      alert("저장 중 오류가 발생했습니다. (이미지 포함 시 용량이 너무 클 수 있습니다)");
    } finally {
      setLoading(false);
    }
  };

  const handleAiPolish = async () => {
    if (!content.trim()) return;
    setIsAiProcessing(true);
    try {
      const polished = await geminiService.generateText(
        `다음 글을 전문적으로 다듬어주세요. 이미지 태그(![](...))가 있다면 절대 삭제하거나 변경하지 마세요:\n\n${content}`,
        "마크다운 형식을 유지하며 문체를 세련되게 교정하십시오."
      );
      if (polished && confirm("AI 교정본으로 교체할까요?")) setContent(polished);
    } catch (error) {
      alert("AI 오류 발생");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("정말 삭제하시겠습니까?")) {
      await storageService.deletePost(id);
      fetchPosts();
      if (selectedPost?.id === id) setViewState('list');
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Classic Editor Board</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Multimedia Cloud Management</p>
          </div>
        </div>
        
        {viewState === 'list' ? (
          <button 
            onClick={() => setViewState('write')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            <PenTool size={18} />
            Write New Post
          </button>
        ) : (
          <button 
            onClick={() => setViewState('list')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={18} />
            Back to List
          </button>
        )}
      </div>

      {/* Main Panel */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[650px]">
        {viewState === 'list' && (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Publications ({posts.length})</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Search knowledge..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading && posts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="font-bold">Syncing with Cloud...</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 py-32">
                  <Type size={64} strokeWidth={1} />
                  <p className="mt-4 font-bold text-lg">아직 작성된 글이 없습니다.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-10 py-5">Article Title</th>
                      <th className="px-10 py-5 w-40">Contributor</th>
                      <th className="px-10 py-5 w-40">Published At</th>
                      <th className="px-10 py-5 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {posts.map((post) => (
                      <tr key={post.id} onClick={() => { setSelectedPost(post); setViewState('view'); }} className="group hover:bg-indigo-50/30 cursor-pointer transition-colors">
                        <td className="px-10 py-6"><span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{post.title}</span></td>
                        <td className="px-10 py-6 font-semibold text-slate-500 text-sm">{post.author}</td>
                        <td className="px-10 py-6 text-slate-400 text-sm">{new Date(post.timestamp).toLocaleDateString()}</td>
                        <td className="px-10 py-6 text-right">
                          <button onClick={(e) => handleDelete(post.id, e)} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {viewState === 'write' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Rich Editor Toolbar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <ToolbarButton onClick={() => applyStyle('bold')} icon={<Bold size={16} />} title="굵게" />
                <ToolbarButton onClick={() => applyStyle('italic')} icon={<Italic size={16} />} title="기울임" />
                <ToolbarButton onClick={() => applyStyle('underline')} icon={<Underline size={16} />} title="밑줄" />
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <ToolbarButton onClick={() => applyStyle('h1')} icon={<Heading1 size={16} />} title="제목1" />
                <ToolbarButton onClick={() => applyStyle('h2')} icon={<Heading2 size={16} />} title="제목2" />
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <ToolbarButton onClick={() => applyStyle('list')} icon={<List size={16} />} title="불렛 리스트" />
                <ToolbarButton onClick={() => applyStyle('ordered')} icon={<ListOrdered size={16} />} title="순서 리스트" />
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <ToolbarButton onClick={() => applyStyle('quote')} icon={<Quote size={16} />} title="인용구" />
                <ToolbarButton onClick={() => applyStyle('code')} icon={<Code size={16} />} title="코드" />
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <ToolbarButton onClick={() => applyStyle('image')} icon={<ImageIcon size={16} />} title="사진 추가" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100" />
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${showPreview ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                >
                  <Eye size={14} /> {showPreview ? 'Editor Mode' : 'Live Preview'}
                </button>
                <button 
                  onClick={handleAiPolish}
                  disabled={isAiProcessing || !content}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all disabled:opacity-50"
                >
                  {isAiProcessing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} AI Assist
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className={`flex-1 flex flex-col p-10 lg:p-14 overflow-y-auto ${showPreview ? 'hidden lg:flex' : 'flex'}`}>
                <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 space-y-8">
                  <input ref={titleRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter an Inspiring Title..." className="w-full text-5xl font-black text-slate-800 placeholder:text-slate-100 border-none outline-none focus:ring-0 bg-transparent tracking-tight" />
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-sm font-bold">
                      <User size={14} />
                      <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author Name" className="bg-transparent border-none outline-none focus:ring-0 w-32" />
                    </div>
                  </div>
                  <textarea 
                    ref={textAreaRef} 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="이미지를 여기에 드래그하거나 도구 모음을 사용하여 작성하세요..." 
                    className="w-full flex-1 min-h-[400px] text-xl text-slate-600 placeholder:text-slate-100 leading-[1.8] border-none outline-none focus:ring-0 resize-none bg-transparent font-medium" 
                  />
                </div>
              </div>

              {showPreview && (
                <div className="flex-1 bg-slate-50/40 border-l border-slate-100 p-10 lg:p-14 overflow-y-auto animate-in slide-in-from-right-4 duration-500">
                  <div className="max-w-4xl mx-auto w-full">
                    <h1 className="text-4xl font-black text-slate-800 mb-8 tracking-tight">{title || 'Untitled Article'}</h1>
                    <div className="prose prose-indigo max-w-none">
                      <Markdown content={content || '_No content generated yet._'} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex justify-end">
              <button onClick={handleSave} disabled={loading} className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-200 active:scale-95">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />} Publish to Cloud
              </button>
            </div>
          </div>
        )}

        {viewState === 'view' && selectedPost && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto w-full p-12 lg:p-20">
              <h1 className="text-6xl font-black text-slate-800 leading-[1.1] mb-12 tracking-tight">{selectedPost.title}</h1>
              <div className="flex items-center justify-between border-y border-slate-100 py-8 mb-16">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100"><User size={28} /></div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">{selectedPost.author}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lead Contributor</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Calendar size={16} /> {new Date(selectedPost.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="prose prose-indigo lg:prose-xl max-w-none min-h-[400px] leading-[1.8] text-slate-600">
                <Markdown content={selectedPost.content} />
              </div>
              <div className="mt-32 pt-12 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => setViewState('list')} className="text-slate-400 font-black hover:text-indigo-600 transition-colors flex items-center gap-2">← Back to Dashboard</button>
                <button onClick={(e) => handleDelete(selectedPost.id, e)} className="px-6 py-3 text-red-400 font-bold hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"><Trash2 size={18} /> Delete Article</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ onClick: () => void, icon: React.ReactNode, title: string, className?: string }> = ({ onClick, icon, title, className = "" }) => (
  <button 
    onClick={(e) => { e.preventDefault(); onClick(); }} 
    className={`p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all ${className}`} 
    title={title}
  >
    {icon}
  </button>
);

export default Board;
