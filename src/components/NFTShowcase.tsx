import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Award, Download, Share2, Trophy } from 'lucide-react';

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

interface NFTShowcaseProps {
  isVisible: boolean;
  onClose: () => void;
  biasChecksCount: number;
}

const NFT_BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
];

const NFT_TRAITS = {
  background: ['Cosmic', 'Aurora', 'Ocean', 'Forest', 'Sunset', 'Pastel', 'Rose', 'Peach'],
  pattern: ['Geometric', 'Organic', 'Abstract', 'Minimalist', 'Complex', 'Flowing'],
  rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
  theme: ['Truth Seeker', 'Bias Hunter', 'News Detective', 'Information Guardian', 'Reality Checker'],
};

export const NFTShowcase: React.FC<NFTShowcaseProps> = ({ isVisible, onClose, biasChecksCount }) => {
  const [generatedNFT, setGeneratedNFT] = useState<GeneratedNFT | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isVisible && !generatedNFT) {
      generateNFT();
    }
  }, [isVisible]);

  const generateNFT = async () => {
    setIsGenerating(true);
    setShowCelebration(true);

    // Simulate NFT generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const backgroundIndex = Math.floor(Math.random() * NFT_BACKGROUNDS.length);
    const rarityRoll = Math.random();
    let rarity: string;
    
    if (rarityRoll < 0.5) rarity = 'Common';
    else if (rarityRoll < 0.75) rarity = 'Uncommon';
    else if (rarityRoll < 0.9) rarity = 'Rare';
    else if (rarityRoll < 0.98) rarity = 'Epic';
    else rarity = 'Legendary';

    const nft: GeneratedNFT = {
      id: `bias-hunter-${Date.now()}`,
      name: `Bias Hunter #${Math.floor(Math.random() * 9999) + 1}`,
      description: `A unique NFT commemorating ${biasChecksCount} bias checks completed. This digital collectible represents your commitment to unbiased news consumption and critical thinking.`,
      image: NFT_BACKGROUNDS[backgroundIndex],
      attributes: [
        { trait_type: 'Background', value: NFT_TRAITS.background[backgroundIndex] },
        { trait_type: 'Pattern', value: NFT_TRAITS.pattern[Math.floor(Math.random() * NFT_TRAITS.pattern.length)] },
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Theme', value: NFT_TRAITS.theme[Math.floor(Math.random() * NFT_TRAITS.theme.length)] },
        { trait_type: 'Bias Checks', value: biasChecksCount.toString() },
        { trait_type: 'Generation', value: Math.floor(biasChecksCount / 25).toString() },
      ],
      generatedAt: new Date(),
      biasChecksCount,
    };

    setGeneratedNFT(nft);
    setIsGenerating(false);

    // Save to localStorage
    const existingNFTs = JSON.parse(localStorage.getItem('generatedNFTs') || '[]');
    existingNFTs.push(nft);
    localStorage.setItem('generatedNFTs', JSON.stringify(existingNFTs));
  };

  const handleDownload = () => {
    if (!generatedNFT) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(generatedNFT.name, 200, 200);
      
      ctx.font = '16px Inter';
      ctx.fillText(`${generatedNFT.biasChecksCount} Bias Checks`, 200, 230);
      
      // Download
      const link = document.createElement('a');
      link.download = `${generatedNFT.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share && generatedNFT) {
      try {
        await navigator.share({
          title: generatedNFT.name,
          text: `I just earned my ${generatedNFT.name} NFT for completing ${biasChecksCount} bias checks on AI News Reporter!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Celebration Animation */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none z-10"
                >
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 1, 
                        scale: 0,
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%'
                      }}
                      animate={{ 
                        opacity: 0, 
                        scale: 1,
                        y: '-100%'
                      }}
                      transition={{ 
                        duration: 2,
                        delay: i * 0.1,
                        ease: 'easeOut'
                      }}
                      className="absolute text-yellow-400 text-2xl"
                    >
                      ✨
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Congratulations!</h2>
                  <p className="text-sm text-gray-600">You've earned a new NFT</p>
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
            <div className="p-6">
              {isGenerating ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating your NFT...</h3>
                  <p className="text-gray-600">Creating a unique collectible for your achievement</p>
                </div>
              ) : generatedNFT ? (
                <div className="space-y-6">
                  {/* Achievement Banner */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
                    <Award className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold mb-2">Milestone Achieved!</h3>
                    <p className="text-purple-100">
                      You've completed <span className="font-bold">{biasChecksCount}</span> bias checks
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* NFT Preview */}
                    <div className="space-y-4">
                      <div 
                        className="aspect-square rounded-xl flex items-center justify-center text-white relative overflow-hidden"
                        style={{ background: generatedNFT.image }}
                      >
                        <div className="text-center">
                          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-80" />
                          <h4 className="text-xl font-bold mb-2">{generatedNFT.name}</h4>
                          <p className="text-sm opacity-90">{biasChecksCount} Bias Checks</p>
                        </div>
                        
                        {/* Rarity Badge */}
                        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-xs font-medium">
                            {generatedNFT.attributes.find(attr => attr.trait_type === 'Rarity')?.value}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleDownload}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={handleShare}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>

                    {/* NFT Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {generatedNFT.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Attributes</h4>
                        <div className="space-y-2">
                          {generatedNFT.attributes.map((attr, index) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">{attr.trait_type}</span>
                              <span className="text-sm text-gray-600">{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-2">Next Milestone</h5>
                        <p className="text-sm text-blue-700">
                          Complete {25 - (biasChecksCount % 25)} more bias checks to earn your next NFT!
                        </p>
                        <div className="mt-2 bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((biasChecksCount % 25) / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};