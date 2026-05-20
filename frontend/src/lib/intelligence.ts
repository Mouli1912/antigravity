export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  time: string;
  priority: string;
  completed: boolean;
  createdAt: string;
  ignoreScore: number;
  rescheduleCount: number;
  subtasks: Subtask[];
  lastInteractedAt: string;
}

export type HeatLevel = 'none' | 'yellow' | 'orange' | 'red';

export function calculateHeatLevel(ignoreScore: number): HeatLevel {
  if (ignoreScore >= 10) return 'red';
  if (ignoreScore >= 5) return 'orange';
  if (ignoreScore >= 2) return 'yellow';
  return 'none';
}

export const INTERVENTION_THRESHOLD = 5;

// Heuristic keyword matching for smart suggestions
const KEYWORD_MAP: Record<string, string[]> = {
  study: ['Read one page', 'Watch a 5-minute video', 'Set up study space'],
  build: ['Open code editor', 'Design single component', 'Write first line of code'],
  code: ['Open code editor', 'Design single component', 'Write first line of code'],
  gym: ['Put on gym clothes', 'Stretch for 2 mins', 'Pack gym bag'],
  workout: ['Put on gym clothes', 'Do 10 pushups', 'Stretch for 2 mins'],
  clean: ['Pick up 5 items', 'Wipe one surface', 'Take out trash'],
  email: ['Open inbox', 'Draft one reply', 'Delete 5 spam emails'],
  work: ['Open laptop', 'Review priorities', 'Set a 15-min timer'],
};

export function generateSmartSuggestions(title: string, reason: string): Subtask[] {
  const lowerTitle = title.toLowerCase();
  
  let suggestedSteps: string[] = [];
  
  // Try to find matching keywords
  for (const [keyword, steps] of Object.entries(KEYWORD_MAP)) {
    if (lowerTitle.includes(keyword)) {
      suggestedSteps = [...steps];
      break;
    }
  }

  // Fallbacks if no keyword matches
  if (suggestedSteps.length === 0) {
    if (reason === 'too_long' || reason === 'too_difficult') {
      suggestedSteps = [
        'Break this down into 3 smaller steps',
        'Set a 10-minute timer and just start',
        'Find one small piece you can do right now'
      ];
    } else if (reason === 'no_motivation') {
      suggestedSteps = [
        'Just do it for 2 minutes',
        'Visualize how good it will feel to finish',
        'Listen to a pump-up song'
      ];
    } else {
      suggestedSteps = [
        'Define the very first step',
        'Commit to 5 minutes of focus',
        'Remove any distractions'
      ];
    }
  }

  return suggestedSteps.map((step, index) => ({
    id: `sub_${Date.now()}_${index}`,
    title: step,
    completed: false
  }));
}

export function updateTaskIgnoreScores(tasks: Task[]): Task[] {
  const today = new Date().toDateString();
  const now = new Date().getTime();
  
  return tasks.map(task => {
    if (task.completed) return task;
    
    // If task is over 24 hours old and hasn't been interacted with recently, increase score
    const createdTime = new Date(task.createdAt).getTime();
    const lastInteractTime = new Date(task.lastInteractedAt).getTime();
    
    // Check if a full day has passed since last interaction
    const msInDay = 1000 * 60 * 60 * 24;
    
    if (now - lastInteractTime > msInDay) {
      // Increase score by 1 for each day ignored
      const daysIgnored = Math.floor((now - lastInteractTime) / msInDay);
      return {
        ...task,
        ignoreScore: Math.min(20, task.ignoreScore + daysIgnored),
        lastInteractedAt: new Date().toISOString() // Update to prevent double counting
      };
    }
    
    return task;
  });
}
