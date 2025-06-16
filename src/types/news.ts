export interface NewsCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface NewsSource {
  name: string;
  url: string;
  type: 'news' | 'reddit' | 'twitter';
}

export interface BiasAnalysis {
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  compound: number;
  tone: string;
}

export interface NewsSummary {
  id: string;
  title: string;
  summary: string;
  differing_narratives?: string;
  bias_analysis: BiasAnalysis[];
  sources: NewsSource[];
  category: string;
  timestamp: string;
  cluster_id: string;
}

export interface NewsCluster {
  id: string;
  topic: string;
  articles: NewsSummary[];
  last_updated: string;
}