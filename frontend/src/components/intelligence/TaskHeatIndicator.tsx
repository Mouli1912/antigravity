import { motion } from 'framer-motion';
import { calculateHeatLevel, HeatLevel } from '@/lib/intelligence';
import { AlertCircle, Flame, Clock } from 'lucide-react';

interface TaskHeatIndicatorProps {
  ignoreScore: number;
}

export function TaskHeatIndicator({ ignoreScore }: TaskHeatIndicatorProps) {
  const heatLevel = calculateHeatLevel(ignoreScore);
  
  if (heatLevel === 'none') return null;

  const config = {
    yellow: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      icon: Clock,
      label: 'Stale'
    },
    orange: {
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      icon: AlertCircle,
      label: 'At Risk'
    },
    red: {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      icon: Flame,
      label: 'Ignored'
    }
  };

  const current = config[heatLevel];
  const Icon = current.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${current.bg} ${current.color}`}
    >
      <Icon className="w-3 h-3" />
      <span>{current.label}</span>
    </motion.div>
  );
}
