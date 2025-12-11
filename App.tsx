import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Instagram, Youtube } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { NewsCard } from './components/NewsCard';
import { HighlightsCard } from './components/HighlightsCard';
import { fetchStats, fetchNews, fetchHighlights } from './services/geminiService';
import { GeminiResponse, LoadingState } from './types';

function App() {
  const [statsData, setStatsData] = useState<GeminiResponse | null>(null);
  const [newsData, setNewsData] = useState<GeminiResponse | null>(null);
  const [highlightsData, setHighlightsData] = useState<GeminiResponse | null>(null);

  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    news: true,
    highlights: true,
  });

  const loadAllData = useCallback(async () => {
    // Reset loading states
    setLoading({ stats: true, news: true, highlights: true });

    // Fetch sequentially to avoid hitting rate limits (429) or overloading the model (503)
    try {
      // 1. Fetch Stats
      const stats = await fetchStats();
      setStatsData(stats);
      setLoading(prev => ({ ...prev, stats: false }));

      // 2. Fetch News
      const news = await fetchNews();
      setNewsData(news);
      setLoading(prev => ({ ...prev, news: false }));

      // 3. Fetch Highlights
      const highlights = await fetchHighlights();
      setHighlightsData(highlights);
      setLoading(prev => ({ ...prev, highlights: false }));
    } catch (error) {
      console.error("Error in sequential fetch:", error);
      // Ensure loading states are cleared even if something blows up
      setLoading({ stats: false, news: false, highlights: false });
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const isAnyLoading = loading.stats || loading.news || loading.highlights;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header onRefresh={loadAllData} isRefreshing={isAnyLoading} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Intro Banner */}
        <div className="mb-8 relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900 to-slate-900 border border-slate-700 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516731338870-2035388c303f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between z-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                SHOTIME
              </h2>
              <p className="text-blue-200 text-lg max-w-xl">
                掌握棒球獨角獸的即時情報。
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="https://www.instagram.com/shoheiohtani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-pink-500/25"
                >
                  <Instagram size={20} />
                  <span className="font-medium">Instagram</span>
                </a>
                <a
                  href="https://www.youtube.com/@Dodgers"
                  target="_blank"
                  rel="noopener noreferrer"
                  /* Change the hex code below (e.g., #bd3c3cff) to adjust the button color */
                  className="flex items-center space-x-2 bg-[#bd3c3cff] hover:bg-red-900 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-red-500/25"
                >
                  <Youtube size={20} />
                  <span className="font-medium">Dodgers YouTube</span>
                </a>
              </div>
            </div>
            <div className="mt-6 md:mt-0 hidden md:block">
              <div className="bg-blue-600/20 border border-blue-500/30 backdrop-blur-md px-6 py-3 rounded-xl">
                <span className="text-blue-300 text-sm font-semibold uppercase tracking-wider">狀態</span>
                <div className="text-xl font-bold text-white">現役 / 傳奇</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">

          {/* Column 1: Stats */}
          <div className="h-full">
            <StatsCard data={statsData} loading={loading.stats} />
          </div>

          {/* Column 2: News */}
          <div className="h-full">
            <NewsCard data={newsData} loading={loading.news} />
          </div>

          {/* Column 3: Highlights */}
          <div className="h-full">
            <HighlightsCard data={highlightsData} loading={loading.highlights} />
          </div>

        </div>
      </main>


    </div>
  );
}

export default App;