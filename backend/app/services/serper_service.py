import httpx
import logging
from typing import List
from datetime import datetime
import os
from app.models.news_models import RawArticle

logger = logging.getLogger(__name__)

class SerperService:
    def __init__(self):
        self.api_key = os.getenv('SERPER_API_KEY')
        self.base_url = "https://google.serper.dev/search"

    async def search_news(self, keywords: List[str], category: str, num_results: int = 10) -> List[RawArticle]:
        """Search for news articles using Serper API"""
        if not self.api_key:
            logger.warning("Serper API key not found")
            return []

        articles = []
        
        try:
            async with httpx.AsyncClient() as client:
                for keyword in keywords:
                    try:
                        headers = {
                            'X-API-KEY': self.api_key,
                            'Content-Type': 'application/json'
                        }
                        
                        payload = {
                            'q': f"{keyword} news",
                            'type': 'news',
                            'num': num_results,
                            'tbs': 'qdr:d'  # Last day
                        }
                        
                        response = await client.post(
                            self.base_url,
                            json=payload,
                            headers=headers,
                            timeout=30.0
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            news_results = data.get('news', [])
                            
                            for item in news_results:
                                article = RawArticle(
                                    title=item.get('title', ''),
                                    content=item.get('snippet', ''),
                                    url=item.get('link', ''),
                                    source=item.get('source', 'Unknown'),
                                    source_type="news",
                                    timestamp=self.parse_date(item.get('date', '')),
                                    category=category
                                )
                                articles.append(article)
                        else:
                            logger.error(f"Serper API error: {response.status_code}")
                            
                    except Exception as e:
                        logger.error(f"Error searching for keyword '{keyword}': {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"Error in Serper search_news: {e}")
        
        logger.info(f"Fetched {len(articles)} articles from Serper for {category}")
        return articles

    def parse_date(self, date_str: str) -> datetime:
        """Parse date string from Serper API"""
        try:
            # Serper returns dates in various formats, handle common ones
            if 'ago' in date_str.lower():
                return datetime.now()
            # Add more date parsing logic as needed
            return datetime.now()
        except:
            return datetime.now()