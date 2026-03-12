export interface ChannelMeta {
  slug: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
}

export interface Channel extends ChannelMeta {
  latest_html: string | null;
  rolling_html: string | null;
  narrative_html: string | null;
}

export interface SummaryMeta {
  filename: string;
  title: string;
  date: string;
  video_id: string;
  duration: number;
  tags: string[];
  body_html: string;
}

export interface SummaryList {
  items: SummaryMeta[];
  total: number;
  page: number;
  limit: number;
}
