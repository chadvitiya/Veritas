import { useState, useEffect } from 'react';

export const useBiasCheckCounter = () => {
  const [biasChecksCount, setBiasChecksCount] = useState(0);
  const [showNFTShowcase, setShowNFTShowcase] = useState(false);

  useEffect(() => {
    // Load count from localStorage on mount
    const savedCount = localStorage.getItem('biasChecksCount');
    if (savedCount) {
      setBiasChecksCount(parseInt(savedCount, 10));
    }
  }, []);

  const incrementBiasCheck = () => {
    const newCount = biasChecksCount + 1;
    setBiasChecksCount(newCount);
    localStorage.setItem('biasChecksCount', newCount.toString());

    // Show NFT showcase every 25 checks
    if (newCount % 25 === 0) {
      setShowNFTShowcase(true);
    }
  };

  const closeNFTShowcase = () => {
    setShowNFTShowcase(false);
  };

  return {
    biasChecksCount,
    showNFTShowcase,
    incrementBiasCheck,
    closeNFTShowcase,
  };
};