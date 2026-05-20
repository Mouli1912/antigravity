import { motion } from 'framer-motion';
import { getXpForCurrentLevel, getXpForNextLevel } from '@/lib/gamification';

interface XPBarProps {
  xp: number;
  level: number;
}

export function XPBar({ xp, level }: XPBarProps) {
  const currentLevelXp = getXpForCurrentLevel(level);
  const nextLevelXp = getXpForNextLevel(level);
  
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  
  const progressPercentage = Math.min(
    100,
    Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100)
  );

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-primary tracking-wider uppercase font-bold">Lvl {level}</span>
        <span className="text-muted-foreground">{xp} / {nextLevelXp} XP</span>
      </div>
      <div className="h-3 w-full bg-secondary overflow-hidden rounded-full border border-border shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
