from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from app.services.news_service import NewsService
from app.models.news_models import NewsCategory, NewsCluster
from app.core.scheduler import NewsScheduler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global news service instance
news_service = None
scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global news_service, scheduler
    news_service = NewsService()
    scheduler = NewsScheduler(news_service)
    
    # Disable this line to stop auto-scheduling
    # asyncio.create_task(scheduler.start())
    logger.info("News aggregation scheduler is DISABLED on startup")

    yield

    if scheduler:
        await scheduler.stop()
    logger.info("Application shutdown complete")


app = FastAPI(
    title="AI News Reporter API",
    description="Bias-minimized news aggregation with AI analysis",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI News Reporter API is running"}

@app.get("/api/news/{category}", response_model=list[NewsCluster])
async def get_news(category: str):
    """Get news clusters for a specific category"""
    try:
        if not news_service:
            raise HTTPException(status_code=503, detail="News service not initialized")
        
        clusters = await news_service.get_news_clusters(category)
        return clusters
    except Exception as e:
        logger.error(f"Error fetching news for category {category}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

@app.post("/api/news/{category}/refresh", response_model=list[NewsCluster])
async def refresh_news(category: str, background_tasks: BackgroundTasks):
    """Manually refresh news for a specific category"""
    try:
        if not news_service:
            raise HTTPException(status_code=503, detail="News service not initialized")
        
        # Trigger immediate refresh in background
        background_tasks.add_task(news_service.fetch_and_process_news, category)
        
        # Return current cached data
        clusters = await news_service.get_news_clusters(category)
        return clusters
    except Exception as e:
        logger.error(f"Error refreshing news for category {category}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to refresh news: {str(e)}")

@app.get("/api/categories", response_model=list[NewsCategory])
async def get_categories():
    """Get all available news categories"""
    return [
        NewsCategory(
            id="geopolitics",
            name="Geopolitics",
            color="geopolitics",
            icon="Globe",
            description="International relations, diplomacy, and global political developments"
        ),
        NewsCategory(
            id="history",
            name="History", 
            color="history",
            icon="Clock",
            description="Historical discoveries, anniversaries, and educational content"
        ),
        NewsCategory(
            id="science",
            name="Science",
            color="science", 
            icon="Microscope",
            description="Scientific breakthroughs, research, and technological advances"
        ),
        NewsCategory(
            id="general",
            name="General News",
            color="general",
            icon="Newspaper", 
            description="Breaking news, current events, and trending stories"
        ),
        NewsCategory(
            id="crime",
            name="Crime",
            color="crime",
            icon="Shield",
            description="Criminal investigations, legal proceedings, and public safety"
        ),
        NewsCategory(
            id="market",
            name="Share Market",
            color="market",
            icon="TrendingUp",
            description="Financial markets, economic indicators, and investment news"
        )
    ]

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service_status": "running" if news_service else "not_initialized"
    }