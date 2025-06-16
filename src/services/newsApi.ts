import { NewsCluster, NewsCategory } from '../types/news';

// Dynamically determine the API base URL based on the current protocol
const getApiBaseUrl = () => {
  const protocol = window.location.protocol;
  const hostname = 'localhost';
  const port = '8000';
  return `${protocol}//${hostname}:${port}/api`;
};

class NewsService {
  async fetchNews(category: string): Promise<NewsCluster[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/news/${category}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new Error('Failed to fetch news data');
    }
  }

  async refreshNews(category: string): Promise<NewsCluster[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/news/${category}/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error refreshing news:', error);
      throw new Error('Failed to refresh news data');
    }
  }

  async getCategories(): Promise<NewsCategory[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async healthCheck(): Promise<{ status: string; service_status: string }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Health check failed');
    }
  }
}

export const newsService = new NewsService();