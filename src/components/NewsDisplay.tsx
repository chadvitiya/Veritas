import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useSignMessage } from 'wagmi';
import { 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Award,
  Sparkles
} from 'lucide-react';
import { NewsCategory, NewsCluster } from '../types/news';
import { newsService } from '../services/newsApi';
import { format } from 'date-fns';
import { useBiasCheckCounter } from '../hooks/useBiasCheckCounter';
import { NFTShowcase } from './NFTShowcase';
import { NFTGallery } from './NFTGallery';

interface NewsDisplayProps {
  category: NewsCategory;
  onBack: () => void;
}

function VoteOnBias({ articleId, onVote }: { articleId: string; onVote: () => void }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const vote = async (choice: string) => {
    if (!signMessageAsync) return;
    
    setVoting(true);
    try {
      const message = `I vote "${choice}" on article ID: ${articleId}`;
      const signature = await signMessageAsync({ message });
      console.log('Vote signed:', { address, message, signature });
      setVoted(true);
      onVote(); // Increment bias check counter
    } catch (error) {
      console.error('Voting failed:', error);
    } finally {
      setVoting(false);
    }
  };

  if (!address) {
    return (
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">Connect your wallet to vote on bias analysis</p>
      </div>
    );
  }

  if (voted) {
    return (
      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Vote submitted successfully!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mb-3">Do you agree with this bias analysis?</p>
      <div className="flex gap-3">
        <button 
          onClick={() => vote('Agree')} 
          disabled={voting}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          👍 Agree
        </button>
        <button 
          onClick={() => vote('Disagree')} 
          disabled={voting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          👎 Disagree
        </button>
      </div>
    </div>
  );
}

export const NewsDisplay: React.FC<NewsDisplayProps> = ({ category, onBack }) => {
  const [newsClusters, setNewsClusters] = useState<NewsCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNFTGallery, setShowNFTGallery] = useState(false);

  const { 
    biasChecksCount, 
    showNFTShowcase, 
    incrementBiasCheck, 
    closeNFTShowcase 
  } = useBiasCheckCounter();

  useEffect(() => {
    loadNews();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [category.id]);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const clusters = await newsService.fetchNews(category.id);
      setNewsClusters(clusters);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load news:', error);
      setError('Failed to load news. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    if (!isOnline) {
      setError('No internet connection. Please check your connection and try again.');
      return;
    }
    
    setRefreshing(true);
    setError(null);
    
    try {
      const clusters = await newsService.refreshNews(category.id);
      setNewsClusters(clusters);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh news:', error);
      setError('Failed to refresh news. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const getBiasColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-700 bg-green-100';
      case 'negative': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getBiasIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      default: return Minus;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading latest news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* NFT Progress Banner */}
        {biasChecksCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Bias Check Progress</h3>
                  <p className="text-sm text-purple-100">
                    {biasChecksCount} checks completed • {25 - (biasChecksCount % 25)} until next NFT
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full h-2 w-32">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((biasChecksCount % 25) / 25) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => setShowNFTGallery(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Gallery
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Categories</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div>
              <h1 className={`text-3xl font-bold text-${category.color} mb-1`}>
                {category.name}
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: {format(lastUpdated, 'MMM dd, yyyy • h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <button
              onClick={refreshNews}
              disabled={refreshing || !isOnline}
              className="flex items-center gap-2 px-4 py-2 bg-white shadow-sm rounded-lg hover:shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {newsClusters.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No news available</h3>
              <p className="text-gray-500 mb-4">
                {isOnline 
                  ? "Try refreshing or check back later for updates." 
                  : "Please check your internet connection and try again."
                }
              </p>
              {isOnline && (
                <button
                  onClick={refreshNews}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-8">
              {newsClusters.map((cluster, clusterIndex) => (
                <motion.div
                  key={cluster.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: clusterIndex * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-8"
                >
                  {cluster.articles.map((article) => (
                    <div key={article.id}>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                            {article.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{format(new Date(article.timestamp), 'MMM dd, h:mm a')}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide bg-${category.color}/10 text-${category.color}`}>
                              {category.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>

                      {article.differing_narratives && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Differing Narratives</h3>
                          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                            <p className="text-gray-700">
                              {article.differing_narratives}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bias and Tone Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {article.bias_analysis.map((bias, index) => {
                            const BiasIcon = getBiasIcon(bias.sentiment);
                            return (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900">{bias.source}</span>
                                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBiasColor(bias.sentiment)}`}>
                                    <BiasIcon className="w-3 h-3" />
                                    <span className="capitalize">{bias.sentiment}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{bias.tone}</p>
                                <div className="text-xs text-gray-500">
                                  Sentiment score: {bias.compound.toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <VoteOnBias articleId={article.id} onVote={incrementBiasCheck} />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {article.sources.map((source, index) => (
                            <a
                              key={index}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                source.type === 'news' ? 'bg-blue-500' :
                                source.type === 'reddit' ? 'bg-orange-500' :
                                'bg-sky-500'
                              }`} />
                              <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                {source.name}
                              </span>
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6"
        >
          <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
            {isOnline ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Live • Auto-refresh enabled</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Offline • Limited functionality</span>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* NFT Showcase Modal */}
      <NFTShowcase
        isVisible={showNFTShowcase}
        onClose={closeNFTShowcase}
        biasChecksCount={biasChecksCount}
      />

      {/* NFT Gallery Modal */}
      <NFTGallery
        isVisible={showNFTGallery}
        onClose={() => setShowNFTGallery(false)}
      />
    </div>
  );
};