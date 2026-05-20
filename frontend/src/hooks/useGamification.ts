import { useState, useEffect } from 'react';
import { BADGES, calculateLevel } from '@/lib/gamification';

interface GamificationState {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  unlockedBadges: string[];
  totalTasksCompleted: number;
}

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  unlockedBadges: [],
  totalTasksCompleted: 0,
};

export function useGamification() {
  const [state, setState] = useState<GamificationState>(DEFAULT_STATE);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('antigravity_gamification');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (e) {
        console.error("Failed to parse gamification state");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('antigravity_gamification', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Check streak on mount and date change
  useEffect(() => {
    if (!isLoaded || !state.lastCompletedDate) return;

    const today = new Date().toDateString();
    const lastDate = new Date(state.lastCompletedDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      today !== state.lastCompletedDate &&
      yesterday.toDateString() !== state.lastCompletedDate
    ) {
      // Missed a day (or more), reset streak
      setState((prev) => ({
        ...prev,
        currentStreak: 0,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, state.lastCompletedDate]);

  const playSound = (type: 'complete' | 'levelup' | 'badge') => {
    try {
      // Using simple oscillator for web audio so we don't need external assets
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'complete') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'levelup') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1); // C#5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio not supported or blocked", e);
    }
  };

  const checkBadges = (newState: GamificationState): string[] => {
    const newlyUnlocked: string[] = [];
    const { totalTasksCompleted, currentStreak, unlockedBadges } = newState;
    const hour = new Date().getHours();

    const checkAndAdd = (id: string, condition: boolean) => {
      if (condition && !unlockedBadges.includes(id)) {
        newlyUnlocked.push(id);
      }
    };

    checkAndAdd('first_step', totalTasksCompleted >= 1);
    checkAndAdd('task_10', totalTasksCompleted >= 10);
    checkAndAdd('task_50', totalTasksCompleted >= 50);
    checkAndAdd('task_100', totalTasksCompleted >= 100);
    
    checkAndAdd('streak_3', currentStreak >= 3);
    checkAndAdd('streak_7', currentStreak >= 7);
    checkAndAdd('streak_30', currentStreak >= 30);
    
    checkAndAdd('night_owl', (hour >= 0 && hour < 5) && totalTasksCompleted > 0);

    return newlyUnlocked;
  };

  const addXP = (amount: number) => {
    if (!isLoaded) return;
    
    playSound('complete');

    setState((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = calculateLevel(newXp);
      const isLevelUp = newLevel > prev.level;

      const today = new Date().toDateString();
      let newStreak = prev.currentStreak;
      let newLongestStreak = prev.longestStreak;

      // Update streak if it's the first task completed today
      if (prev.lastCompletedDate !== today) {
        newStreak += 1;
        if (newStreak > newLongestStreak) {
          newLongestStreak = newStreak;
        }
      }

      const newTotalTasks = prev.totalTasksCompleted + 1;

      const tempState = {
        ...prev,
        xp: newXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: today,
        totalTasksCompleted: newTotalTasks,
      };

      const unlocked = checkBadges(tempState);
      
      if (isLevelUp) {
        setJustLeveledUp(true);
        setTimeout(() => setJustLeveledUp(false), 5000);
        playSound('levelup');
      }
      
      if (unlocked.length > 0) {
        setNewlyUnlockedBadges(unlocked);
        tempState.unlockedBadges = [...prev.unlockedBadges, ...unlocked];
        // Maybe a different sound for badge
      }

      return tempState;
    });
  };

  const clearNewlyUnlockedBadges = () => {
    setNewlyUnlockedBadges([]);
  };

  return {
    state,
    addXP,
    justLeveledUp,
    newlyUnlockedBadges,
    clearNewlyUnlockedBadges,
    isLoaded
  };
}
