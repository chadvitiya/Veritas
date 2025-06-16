import httpx
import logging
import json
from typing import List, Dict, Optional
import os
from app.models.news_models import RawArticle, BiasAnalysis

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

    async def generate_summary(self, articles: List[RawArticle], bias_analyses: List[BiasAnalysis]) -> Optional[Dict]:
        """Generate AI summary using Gemini SDK"""
        if not self.api_key:
            logger.warning("Gemini API key not found")
            return None

        try:
            from google import genai
            from google.genai import types

            # Initialize Gemini client
            client = genai.Client(api_key=self.api_key)
            prompt = self.create_summary_prompt(articles, bias_analyses)

            model = "gemma-3n-e4b-it"
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)]
                )
            ]

            config = types.GenerateContentConfig(response_mime_type="text/plain")
            full_response = ""

            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=config
            ):
                if chunk.text:  # Safely handle None
                    full_response += chunk.text
                    logger.info(f"Chunk received: {chunk.text}")


            return self.parse_summary_response(full_response)

        except Exception as e:
            logger.error(f"Error generating summary with Gemini SDK: {e}")
            return None

    def create_summary_prompt(self, articles: List[RawArticle], bias_analyses: List[BiasAnalysis]) -> str:
        """Create the prompt for Gemini API"""
        
        # Prepare articles text
        articles_text = ""
        for i, article in enumerate(articles, 1):
            articles_text += f"\nArticle {i} ({article.source}):\n"
            articles_text += f"Title: {article.title}\n"
            articles_text += f"Content: {article.content}\n"
            articles_text += f"URL: {article.url}\n"
        
        # Prepare bias analysis text
        bias_text = ""
        for bias in bias_analyses:
            bias_text += f"\n{bias.source}: {bias.sentiment} sentiment (score: {bias.compound}), {bias.tone}"
        
        prompt = f"""You are a neutral and detailed news summarizer.

You are given {len(articles)} articles from different sources about the same topic. Your job is to generate a structured, detailed, and cited summary with the following format:

• Begin with a brief topic title
• Under "Summary", write a detailed factual summary of the event
• Cite facts with the original source name in parentheses after each sentence (e.g., "(Reuters)", "(The Guardian)")
• Include a section titled "Differing Narratives" that highlights conflicting information or tone across sources
• Include a section titled "Bias and Tone Analysis" summarizing the sentiment and emotional tone detected in each source, if available
• Write clearly, formally, and factually. Do not speculate. Only state facts confirmed in 2 or more articles unless clearly stated otherwise

Articles:
{articles_text}

Bias Analysis:
{bias_text}

Please provide your response in the following JSON format:
{{
    "title": "Brief topic title",
    "summary": "Detailed factual summary with citations",
    "differing_narratives": "Analysis of conflicting information or perspectives",
    "bias_analysis_summary": "Summary of sentiment and tone across sources"
}}
"""
        
        return prompt

    def parse_summary_response(self, response_text: str) -> Optional[Dict]:
        """Parse the Gemini API response"""
        try:
            # Try to extract JSON from the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback: parse manually
                return {
                    "title": "News Summary",
                    "summary": response_text,
                    "differing_narratives": None,
                    "bias_analysis_summary": None
                }
                
        except json.JSONDecodeError:
            logger.error("Failed to parse Gemini response as JSON")
            return {
                "title": "News Summary",
                "summary": response_text,
                "differing_narratives": None,
                "bias_analysis_summary": None
            }