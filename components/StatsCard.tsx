import React from 'react';
import { TrendingUp, Award, Target, Info } from 'lucide-react';
import { GeminiResponse } from '../types';

interface StatsCardProps {
  data: GeminiResponse | null;
  loading: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl animate-pulse h-96">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
          <div className="h-4 bg-slate-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="text-blue-500" size={20} />
          <h2 className="text-lg font-bold text-white">本季數據</h2>
        </div>

      </div>

      <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
        <div className="prose prose-invert prose-sm max-w-none">
          <ul className="space-y-3">
            {data.text.split('\n').filter(line => line.trim().length > 0).map((line, index) => {
              // Strip asterisks and other markdown chars for clean display
              const cleanLine = line.replace(/[*#]/g, '').replace(/^[-•]\s*/, '').trim();
              if (!cleanLine) return null;

              // Check for Headers
              const isHeader = cleanLine.includes('大谷翔平') || cleanLine.includes('打擊數據') || cleanLine.includes('投球數據');

              // Filter out unwanted header
              if (cleanLine.includes('以下為大谷翔平2025年賽季的統計數據') || cleanLine.includes('以下是大谷翔平最近完整賽季')) return null;

              if (isHeader) {
                return (
                  <li key={index} className="block mt-6 mb-3 first:mt-0">
                    <h3 className="text-xl font-bold text-white border-b border-blue-500/30 pb-2 inline-block">
                      {cleanLine}
                    </h3>
                  </li>
                );
              }

              return (
                <li key={index} className="flex items-start space-x-2 text-slate-300">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span>{cleanLine}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 border-t border-slate-700">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">資料來源</h3>
        <div className="flex flex-wrap gap-2">
          {data.groundingChunks.length > 0 ? (
            data.groundingChunks.slice(0, 3).map((chunk, idx) => chunk.web?.uri ? (
              <a
                key={idx}
                href={chunk.web.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline bg-blue-900/20 px-2 py-1 rounded truncate max-w-[200px]"
              >
                {chunk.web.title || new URL(chunk.web.uri).hostname}
              </a>
            ) : null)
          ) : (
            <span className="text-xs text-slate-600">無直接來源連結。</span>
          )}
        </div>
      </div>
    </div>
  );
};