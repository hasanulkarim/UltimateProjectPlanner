export type TaskCategory = 'office' | 'home' | 'coding' | 'learning' | 'projects' | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration: number;
  completed: boolean;
  timeSpent: number;
  category: TaskCategory;
  projectId?: string;
  googleEventId?: string;
}

export interface Timer {
  taskId: string | null;
  isRunning: boolean;
  elapsedTime: number;
  snoozeUntil: number | null;
  continuedPastTarget: boolean;
}

export interface CategoryStats {
  totalTime: number;
  percentage: number;
  taskCount: number;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  dueDate?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  categories: TaskCategory[];
  progress: number;
  milestones: Milestone[];
}

export interface DateRange {
  start: Date;
  end: Date;
  formatString: string;
}