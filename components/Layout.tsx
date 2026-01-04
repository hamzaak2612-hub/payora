
import React from 'react';
import { Home, TrendingUp, User, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'HOME' | 'EARNING' | 'ME';
  setActiveTab: (tab: 'HOME' | 'EARNING' | 'ME') => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen pb-20 max-w-md mx-auto bg-slate-900 shadow-2xl relative">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-40">
        <h1 className="text-xl font-bold text-emerald-400">RoboInvest Pro</h1>
        <button 
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800/90 backdrop-blur-md border-t border-slate-700 flex justify-around py-3 z-50 rounded-t-2xl">
        <button 
          onClick={() => setActiveTab('HOME')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'HOME' ? 'text-emerald-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('EARNING')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'EARNING' ? 'text-emerald-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <TrendingUp size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Earning</span>
        </button>
        <button 
          onClick={() => setActiveTab('ME')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'ME' ? 'text-emerald-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Me</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
