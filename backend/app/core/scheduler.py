import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict
from app.services.news_service import NewsService

logger = logging.getLogger(__name__)

class NewsScheduler:
    def __init__(self, news_service: NewsService):
        self.news_service = news_service
        self.running = False
        self.task = None
        
        # Categories to refresh
        self.categories = [
            'geopolitics', 'history', 'science', 
            'general', 'crime', 'market'
        ]

    async def start(self):
        """Start the scheduler"""
        if self.running:
            return
        
        self.running = True
        self.task = asyncio.create_task(self._scheduler_loop())
        logger.info("News scheduler started")

    async def stop(self):
        """Stop the scheduler"""
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("News scheduler stopped")

    async def _scheduler_loop(self):
        """Main scheduler loop"""
        while self.running:
            try:
                # Check each category for refresh needs
                for category in self.categories:
                    if await self.news_service.should_refresh_category(category):
                        logger.info(f"Refreshing news for category: {category}")
                        try:
                            await self.news_service.fetch_and_process_news(category)
                        except Exception as e:
                            logger.error(f"Error refreshing {category}: {e}")
                
                # Wait for next check (every 30 minutes)
                await asyncio.sleep(1800)  # 30 minutes
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error