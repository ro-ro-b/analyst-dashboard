export interface ChannelMeta {
  slug: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export interface ChannelDetail extends ChannelMeta {
  latest_html?: string;
  narrative_html?: string;
  rolling_html?: string;
}

export interface SummaryMeta {
  filename: string;
  date: string;
  title: string;
  tags: string[];
  body_html: string;
}

export interface PaginatedSummaries {
  summaries: SummaryMeta[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
