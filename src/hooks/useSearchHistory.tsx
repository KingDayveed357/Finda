import { useState, useEffect } from 'react';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  category?: string;
}

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (query: string, category?: string) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      category
    };

    const updatedHistory = [newItem, ...searchHistory.filter(item => item.query !== query)]
      .slice(0, 50); // Keep only last 50 searches

    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const getRecentSearches = (limit = 10) => {
    return searchHistory.slice(0, limit).map(item => item.query);
  };

  const getSearchesByCategory = (category: string) => {
    return searchHistory
      .filter(item => item.category === category)
      .map(item => item.query);
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    getRecentSearches,
    getSearchesByCategory
  };
};
