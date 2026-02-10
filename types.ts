
export enum ViewMode {
  BOARD = 'board',
  VISION = 'vision',
  RESEARCH = 'research',
  HISTORY = 'history'
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  groundingUrls?: Array<{title: string, uri: string}>;
}

export interface HistoryItem {
  id: string;
  type: 'text' | 'image' | 'research';
  title: string;
  content: string;
  timestamp: number;
  metadata?: any;
}
