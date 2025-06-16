import logging
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.models.news_models import BiasAnalysis

logger = logging.getLogger(__name__)

class SentimentService:
    def __init__(self):
        try:
            self.analyzer = SentimentIntensityAnalyzer()
            logger.info("VADER sentiment analyzer initialized")
        except Exception as e:
            logger.error(f"Failed to initialize sentiment analyzer: {e}")
            self.analyzer = None

    def analyze_sentiment(self, text: str, source: str) -> BiasAnalysis:
        """Analyze sentiment and bias of text"""
        if not self.analyzer:
            return BiasAnalysis(
                source=source,
                sentiment="neutral",
                compound=0.0,
                tone="Analysis unavailable"
            )

        try:
            # Get sentiment scores
            scores = self.analyzer.polarity_scores(text)
            compound = scores['compound']
            
            # Determine sentiment category
            if compound >= 0.05:
                sentiment = "positive"
            elif compound <= -0.05:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            # Generate tone description
            tone = self.generate_tone_description(scores)
            
            return BiasAnalysis(
                source=source,
                sentiment=sentiment,
                compound=compound,
                tone=tone
            )
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return BiasAnalysis(
                source=source,
                sentiment="neutral",
                compound=0.0,
                tone="Analysis failed"
            )

    def generate_tone_description(self, scores: dict) -> str:
        """Generate a human-readable tone description"""
        pos = scores['pos']
        neu = scores['neu']
        neg = scores['neg']
        
        if pos > 0.5:
            return "Highly positive, optimistic tone"
        elif pos > 0.3:
            return "Moderately positive tone"
        elif neg > 0.5:
            return "Highly negative, critical tone"
        elif neg > 0.3:
            return "Moderately negative tone"
        elif neu > 0.7:
            return "Neutral, factual reporting"
        else:
            return "Mixed emotional tone"