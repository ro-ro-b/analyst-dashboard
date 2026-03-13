export interface ChannelOverview {
  slug: string;
  name: string;
  url: string;
  type: 'narrative' | 'info';
  syncCount: number;
  lastSync: string;
  summaryCount: number;
  hasNew: boolean;
  notes?: string;
}

export interface RenderedContent {
  type: 'latest' | 'rolling' | 'narrative' | 'video_summary';
  generatedDate?: string;
  model?: string;
  sourceVideo?: string;
  sourceDate?: string;
  videoCount?: number;
  html: string;
}

export interface ChannelDetail {
  slug: string;
  name: string;
  type: 'narrative' | 'info';
  syncCount: number;
  lastSync: string;
  latest: RenderedContent | null;
  rolling: RenderedContent | null;
  narrative: RenderedContent | null;
}

export interface SummaryMeta {
  filename: string;
  title: string;
  sourceDate: string;
  duration?: string;
  videoUrl?: string;
  generatedDate?: string;
  model?: string;
}

export interface SummaryFull {
  filename: string;
  title: string;
  sourceDate: string;
  duration?: string;
  videoUrl?: string;
  channel: string;
  channelSlug: string;
  generatedDate?: string;
  model?: string;
  html: string;
}
