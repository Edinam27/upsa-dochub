'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Clock,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { 
  TOOLS, 
  TOOL_CATEGORIES, 
  getToolsByCategory, 
  getAllCategories,
  searchTools,
  getPopularTools
} from '@/lib/tools-config';
import { useUserPreferencesStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import ToolCard from '@/components/tools/ToolCard';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'category' | 'popular' | 'recent';

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('category');
  const [showFilters, setShowFilters] = useState(false);
  
  const { preferences } = useUserPreferencesStore();
  const favoriteTools = preferences.favoriteTools || [];
  
  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let tools = Object.values(TOOLS);
    
    // Apply search filter
    if (searchQuery.trim()) {
      tools = searchTools(searchQuery);
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      tools = tools.filter(tool => tool.category === selectedCategory);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'name':
        tools.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        tools.sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name);
          }
          return a.category.localeCompare(b.category);
        });
        break;
      case 'popular':
        const popularIds = getPopularTools().map(t => t.id);
        tools.sort((a, b) => {
          const aIndex = popularIds.indexOf(a.id);
          const bIndex = popularIds.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        break;
      case 'recent':
        // Sort by favorites first, then alphabetically
        tools.sort((a, b) => {
          const aFav = favoriteTools.includes(a.id);
          const bFav = favoriteTools.includes(b.id);
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }
    
    return tools;
  }, [searchQuery, selectedCategory, sortBy, favoriteTools]);
  
  // Group tools by category for grid view
  const groupedTools = useMemo(() => {
    if (sortBy !== 'category' || selectedCategory !== 'all') {
      return { 'All Tools': filteredTools };
    }
    
    const grouped: Record<string, typeof filteredTools> = {};
    filteredTools.forEach(tool => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push(tool);
    });
    
    return grouped;
  }, [filteredTools, sortBy, selectedCategory]);
  
  const categories = getAllCategories();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              PDF Tools
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Powerful PDF processing tools designed for UPSA students. 
              Process your documents quickly and securely, right in your browser.
            </motion.p>
          </div>
          
          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-upsa-gold focus:border-transparent transition-all"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                {/* Sort Filter */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-upsa-gold focus:border-transparent"
                  >
                    <option value="category">By Category</option>
                    <option value="name">By Name</option>
                    <option value="popular">Most Popular</option>
                    <option value="recent">Favorites First</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-upsa-blue shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-upsa-blue shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Tools Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Count */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-gray-600">
            {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </motion.div>
        
        {/* No Results */}
        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tools found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-upsa-gold text-white px-6 py-3 rounded-lg hover:bg-upsa-gold/90 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
        
        {/* Tools Display */}
        {filteredTools.length > 0 && (
          <div className="space-y-12">
            {Object.entries(groupedTools).map(([categoryName, tools], categoryIndex) => (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * categoryIndex }}
              >
                {/* Category Header */}
                {Object.keys(groupedTools).length > 1 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      {TOOL_CATEGORIES[categoryName as keyof typeof TOOL_CATEGORIES]?.icon}
                      <h2 className="text-2xl font-bold text-gray-900">
                        {categoryName}
                      </h2>
                    </div>
                    {TOOL_CATEGORIES[categoryName as keyof typeof TOOL_CATEGORIES]?.description && (
                      <p className="text-gray-600">
                        {TOOL_CATEGORIES[categoryName as keyof typeof TOOL_CATEGORIES].description}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Tools Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <ToolCard tool={tool} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* Tools List */
                  <div className="space-y-4">
                    {tools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <ToolCard tool={tool} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}