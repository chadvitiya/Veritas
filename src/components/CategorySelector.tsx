import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Clock, Microscope, Newspaper, Shield, TrendingUp, DivideIcon as LucideIcon } from 'lucide-react';
import { NewsCategory } from '../types/news';
import { newsCategories } from '../data/categories';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Clock,
  Microscope,
  Newspaper,
  Shield,
  TrendingUp,
};

interface CategorySelectorProps {
  selectedCategory: string | null;
  onCategorySelect: (category: NewsCategory) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">
            AI News Reporter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Bias-minimized, real-time news aggregation powered by AI. 
            Select a category to explore comprehensive, multi-source analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {newsCategories.map((category, index) => {
            const Icon = iconMap[category.icon];
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => onCategorySelect(category)}
              >
                <div className="news-card p-8 h-full group">
                  <div className={`w-16 h-16 bg-${category.color}/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${category.color}/20 transition-colors duration-300`}>
                    <Icon className={`w-8 h-8 text-${category.color}`} />
                  </div>
                  
                  <h3 className="text-2xl font-display font-semibold text-gray-900 mb-3">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="mt-6 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span>Explore category</span>
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Real-time updates • Multi-source analysis • Bias detection
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};