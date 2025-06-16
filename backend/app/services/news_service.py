import asyncio
import logging
from typing import List, Dict
from datetime import datetime, timedelta
import hashlib
import json
from app.models.news_models import NewsCluster, NewsSummary, RawArticle
from app.services.reddit_service import RedditService
from app.services.serper_service import SerperService
from app.services.gemini_service import GeminiService
from app.services.clustering_service import ClusteringService
from app.services.sentiment_service import SentimentService

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.reddit_service = RedditService()
        self.serper_service = SerperService()
        self.gemini_service = GeminiService()
        self.clustering_service = ClusteringService()
        self.sentiment_service = SentimentService()
        
        # In-memory cache for news clusters
        self.news_cache: Dict[str, List[NewsCluster]] = {}
        self.last_updated: Dict[str, datetime] = {}
        
        # Category to subreddit mapping
        self.category_subreddits = {
            'geopolitics': ['worldnews', 'geopolitics', 'internationalpolitics'],
            'history': ['history', 'todayilearned', 'historyporn'],
            'science': ['science', 'technology', 'futurology'],
            'general': ['news', 'worldnews', 'politics'],
            'crime': ['news', 'truecrime', 'serialkillers'],
            'market': ['investing', 'stocks', 'economics']
        }
        
        # Category to search keywords
        self.category_keywords = {
            'geopolitics': ['international relations', 'diplomacy', 'foreign policy', 'global politics'],
            'history': ['historical discovery', 'archaeology', 'ancient history', 'historical anniversary'],
            'science': ['scientific breakthrough', 'research study', 'technology innovation', 'space exploration'],
            'general': ['breaking news', 'current events', 'latest news'],
            'crime': ['criminal investigation', 'court case', 'law enforcement', 'crime news'],
            'market': ['stock market', 'financial news', 'economic indicators', 'market analysis']
        }

    async def get_news_clusters(self, category: str) -> List[NewsCluster]:
        """Get cached news clusters for a category"""
        if category not in self.news_cache:
            # If no cache exists, fetch news immediately
            await self.fetch_and_process_news(category)
        
        return self.news_cache.get(category, [])

    async def fetch_and_process_news(self, category: str) -> List[NewsCluster]:
        """Fetch news from all sources and process into clusters"""
        try:
            logger.info(f"Fetching news for category: {category}")
            
            # Fetch from all sources concurrently
            reddit_task = self.reddit_service.fetch_posts(
                self.category_subreddits.get(category, []), 
                category
            )
            serper_task = self.serper_service.search_news(
                self.category_keywords.get(category, []), 
                category
            )
            
            reddit_articles, serper_articles = await asyncio.gather(
                reddit_task, serper_task, return_exceptions=True
            )
            
            # Handle exceptions
            if isinstance(reddit_articles, Exception):
                logger.error(f"Reddit fetch failed: {reddit_articles}")
                reddit_articles = []
            
            if isinstance(serper_articles, Exception):
                logger.error(f"Serper fetch failed: {serper_articles}")
                serper_articles = []
            
            # Combine all articles
            all_articles = reddit_articles + serper_articles
            
            if not all_articles:
                logger.warning(f"No articles found for category: {category}")
                return []
            
            logger.info(f"Found {len(all_articles)} articles for {category}")
            
            # Cluster similar articles
            clusters = await self.clustering_service.cluster_articles(all_articles)
            
            # Process each cluster
            processed_clusters = []
            for cluster in clusters:
                try:
                    processed_cluster = await self.process_cluster(cluster, category)
                    if processed_cluster:
                        processed_clusters.append(processed_cluster)
                except Exception as e:
                    logger.error(f"Error processing cluster: {e}")
                    continue
            
            # Cache the results
            self.news_cache[category] = processed_clusters
            self.last_updated[category] = datetime.now()
            
            logger.info(f"Processed {len(processed_clusters)} clusters for {category}")
            return processed_clusters
            
        except Exception as e:
            logger.error(f"Error in fetch_and_process_news for {category}: {e}")
            return []

    async def process_cluster(self, articles: List[RawArticle], category: str) -> NewsCluster:
        """Process a cluster of articles into a summarized news cluster"""
        try:
            if not articles:
                return None
            
            # Generate cluster ID
            cluster_id = self.generate_cluster_id(articles)
            
            # Get sentiment analysis for each article
            bias_analyses = []
            for article in articles:
                sentiment_data = self.sentiment_service.analyze_sentiment(
                    article.content, article.source
                )
                bias_analyses.append(sentiment_data)
            
            # Generate AI summary using Gemini
            summary_data = await self.gemini_service.generate_summary(
                articles, bias_analyses
            )
            
            if not summary_data:
                return None
            
            # Create news sources
            sources = [
                {
                    'name': article.source,
                    'url': article.url,
                    'type': article.source_type
                }
                for article in articles
            ]
            
            # Create the news summary
            news_summary = NewsSummary(
                id=f"{cluster_id}_summary",
                title=summary_data.get('title', articles[0].title),
                summary=summary_data.get('summary', ''),
                differing_narratives=summary_data.get('differing_narratives'),
                bias_analysis=bias_analyses,
                sources=sources,
                category=category,
                timestamp=datetime.now().isoformat(),
                cluster_id=cluster_id
            )
            
            # Create the cluster
            cluster = NewsCluster(
                id=cluster_id,
                topic=summary_data.get('title', articles[0].title),
                articles=[news_summary],
                last_updated=datetime.now().isoformat()
            )
            
            return cluster
            
        except Exception as e:
            logger.error(f"Error processing cluster: {e}")
            return None

    def generate_cluster_id(self, articles: List[RawArticle]) -> str:
        """Generate a unique ID for a cluster based on article titles"""
        titles = [article.title for article in articles]
        combined = ''.join(sorted(titles))
        return hashlib.md5(combined.encode()).hexdigest()[:12]

    async def should_refresh_category(self, category: str) -> bool:
        """Check if a category needs refreshing (older than 1 hour)"""
        if category not in self.last_updated:
            return True
        
        last_update = self.last_updated[category]
        return datetime.now() - last_update > timedelta(hours=1)