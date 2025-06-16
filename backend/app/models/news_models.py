from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class NewsCategory(BaseModel):
    id: str
    name: str
    color: str
    icon: str
    description: str

class NewsSource(BaseModel):
    name: str
    url: str
    type: str  # 'news', 'reddit', 'twitter'

class BiasAnalysis(BaseModel):
    source: str
    sentiment: str  # 'positive', 'neutral', 'negative'
    compound: float
    tone: str

class NewsSummary(BaseModel):
    id: str
    title: str
    summary: str
    differing_narratives: Optional[str] = None
    bias_analysis: List[BiasAnalysis]
    sources: List[NewsSource]
    category: str
    timestamp: str
    cluster_id: str

class NewsCluster(BaseModel):
    id: str
    topic: str
    articles: List[NewsSummary]
    last_updated: str

class RawArticle(BaseModel):
    title: str
    content: str
    url: str
    source: str
    source_type: str
    timestamp: datetime
    category: str