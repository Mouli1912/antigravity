import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakWidget({ currentStreak, longestStreak }: StreakWidgetProps) {
  // Determine if streak is active (at least 1 day)
  const isStreakActive = currentStreak > 0;
  
  return (
    <Card className="glass-card overflow-hidden border-0 relative">
      {/* Background glow effect if streak is high */}
      {currentStreak >= 3 && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/10 opacity-50 pointer-events-none" />
      )}
      <CardContent className="p-6 relative z-10 flex items-center gap-4">
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: isStreakActive ? [1, 1.1, 1] : 1,
              filter: isStreakActive ? ["drop-shadow(0 0 8px rgba(255, 100, 0, 0.5))", "drop-shadow(0 0 16px rgba(255, 50, 0, 0.8))", "drop-shadow(0 0 8px rgba(255, 100, 0, 0.5))"] : "none"
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className={`flex items-center justify-center w-14 h-14 rounded-full ${isStreakActive ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'}`}
          >
            <Flame className="w-7 h-7" />
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{currentStreak}</span>
                <span className="text-sm text-muted-foreground font-medium">Days</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Best</p>
              <p className="text-sm font-bold">{longestStreak} Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
