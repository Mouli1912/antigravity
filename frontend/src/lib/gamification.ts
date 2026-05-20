export const XP_VALUES = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  ALL_TASKS_BONUS: 30,
};

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first task', icon: '🎯', color: 'text-blue-400' },
  { id: 'streak_3', name: '3 Day Streak', description: 'Keep a streak for 3 days', icon: '🔥', color: 'text-orange-400' },
  { id: 'streak_7', name: '7 Day Warrior', description: 'Keep a streak for 7 days', icon: '⚔️', color: 'text-red-500' },
  { id: 'streak_30', name: 'Consistency King', description: 'Keep a streak for 30 days', icon: '👑', color: 'text-yellow-400' },
  { id: 'task_10', name: 'Getting Started', description: 'Complete 10 tasks', icon: '⭐', color: 'text-green-400' },
  { id: 'task_50', name: 'Task Master', description: 'Complete 50 tasks', icon: '🌟', color: 'text-purple-400' },
  { id: 'task_100', name: 'Task Destroyer', description: 'Complete 100 tasks', icon: '💥', color: 'text-rose-500' },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a task after midnight', icon: '🦉', color: 'text-indigo-400' },
];

export function calculateLevel(xp: number): number {
  // Simple exponential curve: Level 1 = 0, Level 2 = 100, Level 3 = 250, Level 4 = 500, Level 5 = 850...
  // Formula approx: level = Math.floor(Math.sqrt(xp / 50)) + 1 ?
  // Let's use a defined scale for early levels and formula for later.
  
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 850) return 4;
  if (xp < 1300) return 5;
  
  // Beyond level 5
  return Math.floor(Math.sqrt((xp - 1300) / 100)) + 6;
}

export function getXpForNextLevel(level: number): number {
  if (level === 1) return 100;
  if (level === 2) return 250;
  if (level === 3) return 500;
  if (level === 4) return 850;
  if (level === 5) return 1300;
  
  return 1300 + Math.pow(level - 5, 2) * 100;
}

export function getXpForCurrentLevel(level: number): number {
  if (level === 1) return 0;
  if (level === 2) return 100;
  if (level === 3) return 250;
  if (level === 4) return 500;
  if (level === 5) return 850;
  
  return 1300 + Math.pow(level - 6, 2) * 100;
}
