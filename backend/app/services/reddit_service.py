import asyncpraw
import asyncio
import logging
from typing import List
from datetime import datetime
import os
from app.models.news_models import RawArticle

logger = logging.getLogger(__name__)

class RedditService:
    def __init__(self):
        self.reddit = None
        self.initialize_reddit()

    def initialize_reddit(self):
        """Initialize Reddit API client"""
        try:
            client_id = os.getenv('REDDIT_CLIENT_ID')
            client_secret = os.getenv('REDDIT_CLIENT_SECRET')
            user_agent = os.getenv('REDDIT_USER_AGENT', 'NewsAggregator/1.0')
            
            if not client_id or not client_secret:
                logger.warning("Reddit credentials not found, using read-only mode")
                # Use read-only mode without authentication
                self.reddit = asyncpraw.Reddit(
                    client_id=None,
                    client_secret=None,
                    user_agent=user_agent
                )
            else:
                self.reddit = asyncpraw.Reddit(
                    client_id=client_id,
                    client_secret=client_secret,
                    user_agent=user_agent
                )
        except Exception as e:
            logger.error(f"Failed to initialize Reddit client: {e}")
            self.reddit = None

    async def fetch_posts(self, subreddits: List[str], category: str, limit: int = 10) -> List[RawArticle]:
        """Fetch posts from specified subreddits"""
        if not self.reddit:
            logger.warning("Reddit client not available")
            return []

        articles = []
        
        try:
            for subreddit_name in subreddits:
                try:
                    subreddit = await self.reddit.subreddit(subreddit_name)
                    
                    # Get hot posts
                    async for submission in subreddit.hot(limit=limit):
                        if submission.stickied or submission.is_self:
                            continue
                            
                        # Create article object
                        article = RawArticle(
                            title=submission.title,
                            content=submission.selftext or submission.title,
                            url=submission.url,
                            source=f"r/{subreddit_name}",
                            source_type="reddit",
                            timestamp=datetime.fromtimestamp(submission.created_utc),
                            category=category
                        )
                        articles.append(article)
                        
                except Exception as e:
                    logger.error(f"Error fetching from r/{subreddit_name}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error in Reddit fetch_posts: {e}")
        
        finally:
            if self.reddit:
                await self.reddit.close()
        
        logger.info(f"Fetched {len(articles)} articles from Reddit for {category}")
        return articles