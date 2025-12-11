import React, { useState, useMemo } from 'react';
import { Newspaper, ExternalLink, Calendar, Clock } from 'lucide-react';
import { GeminiResponse } from '../types';

interface NewsCardProps {
  data: GeminiResponse | null;
  loading: boolean;
}

interface NewsItem {
  title: string;
  url: string;
  date: string;
  time: string;
  lang: 'en' | 'cn';
}

export const NewsCard: React.FC<NewsCardProps> = ({ data, loading }) => {
  const [activeTab, setActiveTab] = useState<'en' | 'cn'>('cn');

  const newsItems = useMemo(() => {
    if (!data?.text || !data?.groundingChunks) return [];

    let parsedJson: NewsItem[] = [];
    try {
      const cleanJson = data.text.replace(/```json\n?|\n?```/g, '').trim();
      parsedJson = JSON.parse(cleanJson);
      if (!Array.isArray(parsedJson)) parsedJson = [];
    } catch (e) {
      console.error("Failed to parse news JSON:", e);
    }

    // Map Grounding Chunks to News Items
    // We use Grounding Chunks as the source of truth for Title and URL to ensure validity.
    // We try to find metadata (Date, Time) from the JSON response.
    const validItems = data.groundingChunks
      .map(chunk => {
        let title = chunk.web?.title || '';
        let url = chunk.web?.uri || '';

        // Clean URL: Remove trailing punctuation often added by AI text generation context
        url = url.replace(/[.,;)]+$/, '').trim();

        // Strict Validation: Must start with http
        if (!url.startsWith('http')) {
          // Fallback: Try to find a valid URL in JSON that matches the title
          const jsonMatch = parsedJson.find(p => p.title.includes(title) || title.includes(p.title));
          if (jsonMatch && jsonMatch.url && jsonMatch.url.startsWith('http')) {
            url = jsonMatch.url;
          } else {
            return null; // Invalid item
          }
        }

        // Try to find matching metadata in JSON
        // Heuristic: Check if JSON title includes chunk title or vice versa, or URL match
        const meta = parsedJson.find(p =>
          p.url === url ||
          title.includes(p.title) ||
          p.title.includes(title)
        );

        return {
          title: title,
          url: url,
          date: meta?.date || '',
          time: meta?.time || '',
          // Simple language detection based on title characters
          lang: /[\u4e00-\u9fa5]/.test(title) ? 'cn' : 'en'
        } as NewsItem;
      })
      .filter((item): item is NewsItem => item !== null);

    // Deduplicate by URL
    const uniqueItems = validItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.url === item.url)
    );

    // Sort by Date + Time descending
    return uniqueItems.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return dateB - dateA;
    });

  }, [data]);

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl animate-pulse h-96">
        <div className="h-6 bg-slate-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex space-x-4">
              <div className="h-16 w-16 bg-slate-700 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const filteredItems = newsItems.filter(item => item.lang === activeTab);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Newspaper className="text-blue-500" size={20} />
          <h2 className="text-lg font-bold text-white">最新快訊</h2>
        </div>
        <div className="flex bg-slate-900 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('cn')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'cn' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            中文
          </button>
          <button
            onClick={() => setActiveTab('en')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            English
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-lg p-3 transition-all visited:text-slate-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-blue-100 group-hover:text-blue-400 visited:text-slate-500 line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-2">
                      {item.date && (
                        <div className="flex items-center text-xs text-slate-500">
                          <Calendar size={10} className="mr-1" />
                          {item.date}
                        </div>
                      )}
                      {item.time && (
                        <div className="flex items-center text-xs text-slate-500">
                          <Clock size={10} className="mr-1" />
                          {item.time}
                        </div>
                      )}
                      {item.url && (
                        <div className="flex items-center text-xs text-slate-600">
                          <span className="w-1 h-1 bg-slate-600 rounded-full mr-2"></span>
                          {new URL(item.url).hostname}
                        </div>
                      )}
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400 ml-3 flex-shrink-0" />
                </div>
              </a>
            ))
          ) : (
            <div className="text-center text-slate-500 py-8">
              {activeTab === 'en' ? 'No English news found.' : '暫無中文新聞。'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};