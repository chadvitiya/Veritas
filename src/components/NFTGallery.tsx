import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface GeneratedNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  generatedAt: Date;
  biasChecksCount: number;
}

interface NFTGalleryProps {
  isVisible: boolean;
  onClose: () => void;
}

export const NFTGallery: React.FC<NFTGalleryProps> = ({ isVisible, onClose }) => {
  const [nfts, setNfts] = useState<GeneratedNFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<GeneratedNFT | null>(null);

  useEffect(() => {
    if (isVisible) {
      loadNFTs();
    }
  }, [isVisible]);

  const loadNFTs = () => {
    const savedNFTs = localStorage.getItem('generatedNFTs');
    if (savedNFTs) {
      const parsedNFTs = JSON.parse(savedNFTs).map((nft: any) => ({
        ...nft,
        generatedAt: new Date(nft.generatedAt),
      }));
      setNfts(parsedNFTs.reverse()); // Show newest first
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your NFT Collection</h2>
                  <p className="text-sm text-gray-600">{nfts.length} NFTs earned</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {nfts.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No NFTs Yet</h3>
                  <p className="text-gray-600">
                    Complete bias checks to earn your first NFT collectible!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <motion.div
                      key={nft.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedNFT(nft)}
                    >
                      <div 
                        className="aspect-square flex items-center justify-center text-white relative"
                        style={{ background: nft.image }}
                      >
                        <div className="text-center">
                          <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-80" />
                          <h4 className="text-lg font-bold mb-1">{nft.name}</h4>
                          <p className="text-sm opacity-90">{nft.biasChecksCount} Checks</p>
                        </div>
                        
                        {/* Rarity Badge */}
                        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                          <span className="text-xs font-medium">
                            {nft.attributes.find(attr => attr.trait_type === 'Rarity')?.value}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(nft.generatedAt, 'MMM dd, yyyy')}
                          </span>
                          <span>{nft.attributes.find(attr => attr.trait_type === 'Theme')?.value}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* NFT Detail Modal */}
          <AnimatePresence>
            {selectedNFT && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center p-4"
                onClick={() => setSelectedNFT(null)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{selectedNFT.name}</h3>
                      <button
                        onClick={() => setSelectedNFT(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div 
                        className="aspect-square rounded-xl flex items-center justify-center text-white"
                        style={{ background: selectedNFT.image }}
                      >
                        <div className="text-center">
                          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-80" />
                          <h4 className="text-2xl font-bold mb-2">{selectedNFT.name}</h4>
                          <p className="text-lg opacity-90">{selectedNFT.biasChecksCount} Bias Checks</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {selectedNFT.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Attributes</h4>
                          <div className="space-y-2">
                            {selectedNFT.attributes.map((attr, index) => (
                              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">{attr.trait_type}</span>
                                <span className="text-sm text-gray-600">{attr.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-1">Generated</h5>
                          <p className="text-sm text-blue-700">
                            {format(selectedNFT.generatedAt, 'MMMM dd, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};