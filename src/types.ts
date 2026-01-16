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

export interface Paper {
  source: string;
  title: string;
  keyFindings: string[];
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

