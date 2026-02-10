
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Image as ImageIcon, 
  Search, 
  History, 
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { ViewMode } from './types';
import Board from './components/Board';
import VisionStudio from './components/VisionStudio';
import ResearchHub from './components/ResearchHub';
import HistoryView from './components/HistoryView';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ViewMode>(ViewMode.BOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeMode) {
      case ViewMode.BOARD:
        return <Board />;
      case ViewMode.VISION:
        return <VisionStudio />;
      case ViewMode.RESEARCH:
        return <ResearchHub />;
      case ViewMode.HISTORY:
        return <HistoryView />;
      default:
        return <div className="flex items-center justify-center h-full text-slate-400">준비 중인 기능입니다.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">Gemini Suite</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Creative Studio</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavItem 
              icon={<ClipboardList size={20} />} 
              label="Post Board" 
              active={activeMode === ViewMode.BOARD} 
              onClick={() => setActiveMode(ViewMode.BOARD)} 
            />
            <NavItem 
              icon={<ImageIcon size={20} />} 
              label="Vision Studio" 
              active={activeMode === ViewMode.VISION} 
              onClick={() => setActiveMode(ViewMode.VISION)} 
            />
            <NavItem 
              icon={<Search size={20} />} 
              label="Research Hub" 
              active={activeMode === ViewMode.RESEARCH} 
              onClick={() => setActiveMode(ViewMode.RESEARCH)} 
            />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <NavItem 
                icon={<History size={20} />} 
                label="AI History" 
                active={activeMode === ViewMode.HISTORY} 
                onClick={() => setActiveMode(ViewMode.HISTORY)} 
              />
            </div>
          </nav>

          <div className="p-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">API Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-600">Gemini Pro Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {activeMode === ViewMode.BOARD && "Community Post Board"}
              {activeMode === ViewMode.VISION && "Visual Art Lab"}
              {activeMode === ViewMode.RESEARCH && "Deep Research Engine"}
              {activeMode === ViewMode.HISTORY && "AI Interaction History"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
              onClick={() => {
                if(activeMode === ViewMode.BOARD) {
                  // Post Board 전용 신규 작성 유도 로직이 필요할 경우 처리
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 text-sm"
             >
              <Plus size={18} />
              New Action
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 transform scale-[1.02]' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</span>
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

export default App;
