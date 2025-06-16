import { NewsCategory } from '../types/news';

export const newsCategories: NewsCategory[] = [
  {
    id: 'science',
    name: 'Science',
    color: 'purple-600',
    icon: 'Microscope',
    description: 'Scientific discoveries, research breakthroughs, and technological innovations.'
  },
  {
    id: 'geopolitics',
    name: 'Geopolitics',
    color: 'blue-600',
    icon: 'Globe',
    description: 'International relations, global politics, and diplomatic developments.'
  },
  {
    id: 'general',
    name: 'General News',
    color: 'gray-600',
    icon: 'Newspaper',
    description: 'General news and current events from around the world.'
  },
  {
    id: 'crime',
    name: 'Crime',
    color: 'red-600',
    icon: 'Shield',
    description: 'Crime reports, law enforcement, and justice system updates.'
  },
  {
    id: 'sharemarket',
    name: 'Share Market',
    color: 'green-600',
    icon: 'TrendingUp',
    description: 'Stock market trends, financial news, and economic developments.'
  },
  {
    id: 'history',
    name: 'History',
    color: 'amber-600',
    icon: 'Clock',
    description: 'Historical events, discoveries, and educational content about the past.'
  }
];