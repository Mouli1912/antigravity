import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGES } from '@/lib/gamification';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AchievementModalProps {
  unlockedBadgeIds: string[];
  onClose: () => void;
}

export function AchievementModal({ unlockedBadgeIds, onClose }: AchievementModalProps) {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    if (unlockedBadgeIds.length > 0) {
      // Trigger confetti when showing a badge
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [currentBadgeIndex, unlockedBadgeIds]);

  if (unlockedBadgeIds.length === 0) return null;

  const currentBadgeId = unlockedBadgeIds[currentBadgeIndex];
  const badge = BADGES.find(b => b.id === currentBadgeId);

  if (!badge) return null;

  const handleNext = () => {
    if (currentBadgeIndex < unlockedBadgeIds.length - 1) {
      setCurrentBadgeIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm overflow-hidden border rounded-3xl bg-card shadow-2xl glass-card"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent" />
          
          <div className="relative p-8 flex flex-col items-center text-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-primary mb-6">Achievement Unlocked!</h3>
            
            <motion.div 
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className={`w-32 h-32 mb-6 rounded-full flex items-center justify-center text-6xl shadow-lg bg-background border-4 border-border ${badge.color}`}
            >
              {badge.icon}
            </motion.div>
            
            <h2 className="text-2xl font-black mb-2">{badge.name}</h2>
            <p className="text-muted-foreground mb-8">{badge.description}</p>
            
            <Button onClick={handleNext} className="w-full rounded-xl py-6 font-bold text-lg" size="lg">
              {currentBadgeIndex < unlockedBadgeIds.length - 1 ? "Next Reward" : "Awesome!"}
            </Button>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
