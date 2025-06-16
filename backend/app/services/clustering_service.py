import logging
from typing import List
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
import numpy as np
from app.models.news_models import RawArticle

logger = logging.getLogger(__name__)

class ClusteringService:
    def __init__(self):
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Sentence transformer model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load sentence transformer: {e}")
            self.model = None

    async def cluster_articles(self, articles: List[RawArticle]) -> List[List[RawArticle]]:
        """Cluster similar articles together"""
        if not self.model or len(articles) < 2:
            # Return each article as its own cluster
            return [[article] for article in articles]

        try:
            # Extract text for embedding
            texts = [f"{article.title} {article.content}" for article in articles]
            
            # Generate embeddings
            embeddings = self.model.encode(texts)
            
            # Perform clustering
            clustering = DBSCAN(eps=0.5, min_samples=2, metric='cosine')
            cluster_labels = clustering.fit_predict(embeddings)
            
            # Group articles by cluster
            clusters = {}
            for i, label in enumerate(cluster_labels):
                if label == -1:  # Noise points get their own cluster
                    clusters[f"noise_{i}"] = [articles[i]]
                else:
                    if label not in clusters:
                        clusters[label] = []
                    clusters[label].append(articles[i])
            
            # Convert to list format
            result = list(clusters.values())
            
            logger.info(f"Clustered {len(articles)} articles into {len(result)} clusters")
            return result
            
        except Exception as e:
            logger.error(f"Error in clustering: {e}")
            # Fallback: return each article as its own cluster
            return [[article] for article in articles]