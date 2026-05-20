import { useState, useEffect } from 'react';
import { Task, Subtask, updateTaskIgnoreScores, INTERVENTION_THRESHOLD } from '@/lib/intelligence';

const DEFAULT_TASKS: Task[] = [
  { 
    id: 1, 
    title: "Review Q3 Marketing Strategy", 
    time: "10:00 AM", 
    priority: "High", 
    completed: false,
    createdAt: new Date().toISOString(),
    ignoreScore: 0,
    rescheduleCount: 0,
    subtasks: [],
    lastInteractedAt: new Date().toISOString()
  },
  { 
    id: 2, 
    title: "Build portfolio website", 
    time: "1:30 PM", 
    priority: "Medium", 
    completed: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    ignoreScore: 6, // High ignore score for demo
    rescheduleCount: 2,
    subtasks: [],
    lastInteractedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  { 
    id: 3, 
    title: "Team Weekly Sync", 
    time: "3:00 PM", 
    priority: "High", 
    completed: false,
    createdAt: new Date().toISOString(),
    ignoreScore: 0,
    rescheduleCount: 0,
    subtasks: [],
    lastInteractedAt: new Date().toISOString()
  }
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Analytics State
  const [recoveredTasksCount, setRecoveredTasksCount] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('antigravity_tasks');
    const savedRecovered = localStorage.getItem('antigravity_recovered');
    
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        // Update ignore scores upon load
        const updated = updateTaskIgnoreScores(parsed);
        setTasks(updated);
      } catch {
        setTasks(DEFAULT_TASKS);
      }
    } else {
      setTasks(DEFAULT_TASKS);
    }
    
    if (savedRecovered) {
      setRecoveredTasksCount(Number(savedRecovered));
    }
    
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('antigravity_tasks', JSON.stringify(tasks));
      localStorage.setItem('antigravity_recovered', recoveredTasksCount.toString());
    }
  }, [tasks, recoveredTasksCount, isLoaded]);

  const addTask = (title: string, time: string, priority: string = "Medium") => {
    const newTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title,
      time: time || "Anytime",
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      ignoreScore: 0,
      rescheduleCount: 0,
      subtasks: [],
      lastInteractedAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const completeTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        // If it was highly ignored, count as recovered
        if (t.ignoreScore >= INTERVENTION_THRESHOLD) {
          setRecoveredTasksCount(c => c + 1);
        }
        return { ...t, completed: true, lastInteractedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, lastInteractedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  
  const rescheduleTask = (id: number, newTime: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          time: newTime,
          rescheduleCount: t.rescheduleCount + 1,
          ignoreScore: t.ignoreScore + 2, // Rescheduling increases ignore score
          lastInteractedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const setSubtasks = (taskId: number, subtasks: Subtask[]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks, ignoreScore: 0 } : t)); // Reset ignore score when intervened
  };

  const completeSubtask = (taskId: number, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st),
          lastInteractedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  return {
    tasks,
    isLoaded,
    recoveredTasksCount,
    addTask,
    completeTask,
    updateTask,
    deleteTask,
    rescheduleTask,
    setSubtasks,
    completeSubtask
  };
}
