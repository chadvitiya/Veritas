import { ConnectButton } from '@rainbow-me/rainbowkit';
import React, { useState } from 'react';
import { CategorySelector } from './components/CategorySelector';
import { NewsDisplay } from './components/NewsDisplay';
import { NewsCategory } from './types/news';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);

  const handleCategorySelect = (category: NewsCategory) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="font-sans">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">AI News Reporter</h1>
        </div>
        <ConnectButton />
      </header>

      {selectedCategory ? (
        <NewsDisplay category={selectedCategory} onBack={handleBack} />
      ) : (
        <CategorySelector
          selectedCategory={selectedCategory?.id || null}
          onCategorySelect={handleCategorySelect}
        />
      )}
    </div>
  );
}

export default App;