export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GeminiResponse {
  text: string;
  groundingChunks: GroundingChunk[];
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  snippet?: string;
  date?: string;
}

export type TabView = 'dashboard' | 'news' | 'highlights';

export interface LoadingState {
  stats: boolean;
  news: boolean;
  highlights: boolean;
}