export interface VideoInfo {
  title: string;
  author: string;
  lengthSeconds: number;
  viewCount: number;
  thumbnailUrl: string;
}

export interface MarketHighlight {
  title: string;
  description: string;
}

export interface KeyFinding {
  title: string;
  description: string;
}

export interface Paper {
  source: string;
  title: string;
  keyFindings: KeyFinding[];
}

export interface SummaryResponse {
  title: string;
  author: string;
  duration: number;
  marketHighlights: MarketHighlight[];
  papers: Paper[];
  conclusion: string;
  transcriptLength: number;
  transcriptSource: string;
}

export interface UsageLog {
  id: number;
  endpoint: string;
  video_url: string;
  video_title: string;
  video_author: string;
  video_duration: number;
  status: string;
  error_message: string | null;
  processing_time_ms: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  completed_at: string;
}

export interface UsageLogResponse {
  total: number;
  data: UsageLog[];
}

export interface SummaryHistory {
  id: number;
  video_url: string;
  video_title: string;
  summary: string; // This is a JSON string of SummaryResponse
  created_at: string;
}

export interface SummaryHistoryResponse {
  total: number;
  data: SummaryHistory[];
}

