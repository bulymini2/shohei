import React from 'react';
import { Activity, Menu, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <span className="text-white font-bold text-xl tracking-tighter">17</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">OHTANI<span className="text-blue-500">VERSE</span></h1>
              <p className="text-xs text-slate-400">即時追蹤與情報中心</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${isRefreshing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 active:scale-95'}
            `}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? '更新中...' : '更新數據'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};