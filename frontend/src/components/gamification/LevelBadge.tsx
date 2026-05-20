import { motion } from 'framer-motion';

interface LevelBadgeProps {
  level: number;
  justLeveledUp?: boolean;
}

export function LevelBadge({ level, justLeveledUp = false }: LevelBadgeProps) {
  return (
    <motion.div 
      className="relative group cursor-default"
      animate={justLeveledUp ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
      <div className="relative flex items-center justify-center bg-card border border-border rounded-full px-3 py-1 gap-2 shadow-sm">
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-[10px] font-black text-primary">★</span>
        </div>
        <span className="font-bold text-sm">Lvl {level}</span>
      </div>
    </motion.div>
  );
}
