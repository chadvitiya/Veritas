# AI News Reporter - Bias-Minimized News Aggregation

A sophisticated AI-powered news aggregation platform that fetches, clusters, and analyzes news from multiple sources to provide bias-minimized, comprehensive summaries.

## Features

- **Multi-Source Aggregation**: Fetches news from Reddit, Google News (via Serper API), and other sources
- **AI-Powered Clustering**: Groups similar articles using sentence transformers
- **Bias Analysis**: Uses VADER sentiment analysis to detect emotional tone and bias
- **AI Summarization**: Leverages Gemini API for detailed, cited summaries
- **Real-Time Updates**: Automatic hourly refresh with manual refresh capability
- **Responsive Design**: Beautiful, production-ready interface
- **Category-Based**: Six distinct news categories (geopolitics, history, science, general, crime, market)

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Vite for development and building

### Backend
- FastAPI (Python)
- AsyncPRAW for Reddit API
- Serper API for Google News
- Sentence Transformers for clustering
- VADER Sentiment for bias analysis
- Gemini API for summarization

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- API Keys for:
  - Gemini API
  - Serper API
  - Reddit API (optional, can work in read-only mode)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Edit `.env` with your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key
SERPER_API_KEY=your_serper_api_key
REDDIT_CLIENT_ID=your_reddit_client_id  # Optional
REDDIT_CLIENT_SECRET=your_reddit_client_secret  # Optional
REDDIT_USER_AGENT=NewsAggregator/1.0
```

6. Start the backend server:
```bash
python run.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

- `GET /api/categories` - Get all news categories
- `GET /api/news/{category}` - Get news clusters for a category
- `POST /api/news/{category}/refresh` - Manually refresh news for a category
- `GET /api/health` - Health check endpoint

## Architecture

### Data Flow
1. **Source Fetching**: Parallel fetching from Reddit and Serper APIs
2. **Article Clustering**: Sentence transformers group similar articles
3. **Sentiment Analysis**: VADER analyzes bias and tone for each source
4. **AI Summarization**: Gemini generates comprehensive summaries with citations
5. **Caching**: Results cached for performance with hourly auto-refresh

### Key Components
- **NewsService**: Main orchestrator for news processing
- **ClusteringService**: Groups similar articles using ML
- **SentimentService**: Analyzes bias and emotional tone
- **GeminiService**: Generates AI summaries with proper citations
- **NewsScheduler**: Handles automatic hourly updates

## Production Deployment

### Backend
- Deploy to Railway, Render, or similar Python hosting
- Set environment variables in hosting platform
- Ensure sufficient memory for ML models (sentence transformers)

### Frontend
- Deploy to Vercel, Netlify, or similar static hosting
- Update API_BASE_URL in newsApi.ts to production backend URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details