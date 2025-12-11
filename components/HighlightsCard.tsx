import React, { useMemo } from 'react';
import { PlayCircle, Youtube, Calendar, Clock } from 'lucide-react';
import { GeminiResponse } from '../types';

interface HighlightsCardProps {
  data: GeminiResponse | null;
  loading: boolean;
}

interface VideoItem {
  title: string;
  url: string;
  date: string;
  time: string;
  thumbnail?: string;
}

export const HighlightsCard: React.FC<HighlightsCardProps> = ({ data, loading }) => {
  const videoItems = useMemo(() => {
    if (!data?.text || !data?.groundingChunks) return [];

    let parsedJson: VideoItem[] = [];
    try {
      const cleanJson = data.text.replace(/```json\n?|\n?```/g, '').trim();
      parsedJson = JSON.parse(cleanJson);
      if (!Array.isArray(parsedJson)) parsedJson = [];
    } catch (e) {
      console.error("Failed to parse highlights JSON:", e);
    }

    // Map Grounding Chunks to Video Items
    const validItems = data.groundingChunks
      .filter(chunk => chunk.web?.uri && chunk.web?.title)
      .map(chunk => {
        const title = chunk.web!.title;
        const url = chunk.web!.uri;

        // Try to find matching metadata in JSON
        const meta = parsedJson.find(p =>
          p.url === url ||
          title.includes(p.title) ||
          p.title.includes(title)
        );

        // Thumbnail Logic
        let thumbnailUrl = '';
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (ytMatch && ytMatch[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
        }

        return {
          title: title,
          url: url,
          date: meta?.date || '',
          time: meta?.time || '',
          thumbnail: thumbnailUrl
        } as VideoItem;
      });

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
        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-slate-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <PlayCircle className="text-red-500" size={20} />
          <h2 className="text-lg font-bold text-white">精彩片段 (YouTube)</h2>
        </div>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-grow">
        <div className="space-y-3">
          {videoItems.length > 0 ? (
            videoItems.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center bg-slate-900 hover:bg-red-900/10 border border-slate-700 hover:border-red-500/50 transition-all rounded-lg overflow-hidden"
              >
                <div className="w-32 h-24 bg-slate-950 flex-shrink-0 relative overflow-hidden">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Youtube className="text-red-600 group-hover:text-red-500 transition-transform group-hover:scale-110" size={32} />
                    </div>
                  )}
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-colors">
                    <PlayCircle className="text-white/80 w-8 h-8 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <div className="p-3 min-w-0 flex-1 flex flex-col justify-between h-24">
                  <h4 className="text-sm font-medium text-white group-hover:text-red-400 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <div className="flex items-center space-x-3 mt-1">
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
                    <span className="text-xs text-slate-600 truncate ml-auto">YouTube</span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              搜尋結果中未找到影片。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};