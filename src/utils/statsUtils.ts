import { eachDayOfInterval, parseISO, format } from 'date-fns';
import { Task, Project } from '../types';
import { DateRange } from './types';

export const calculateTimeStats = (
  tasks: Task[],
  dateRange: DateRange,
  selectedCategory: string
) => {
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

  return days.map(day => {
    const dayTasks = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
             (selectedCategory === 'all' || task.category === selectedCategory);
    });
    
    const totalTime = dayTasks.reduce((acc, task) => acc + task.timeSpent, 0);
    
    return {
      date: format(day, dateRange.formatString),
      time: Math.round(totalTime / 3600 * 100) / 100, // Convert to hours
    };
  });
};

export const calculateStackedTimeStats = (
  tasks: Task[],
  dateRange: DateRange,
  categories: string[]
) => {
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

  return days.map(day => {
    const dayStats = {
      date: format(day, dateRange.formatString),
    } as Record<string, any>;

    categories.forEach(category => {
      const categoryTasks = tasks.filter(task => 
        task.category === category &&
        format(parseISO(task.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      dayStats[category] = Math.round(
        categoryTasks.reduce((acc, task) => acc + task.timeSpent, 0) / 3600 * 100
      ) / 100;
    });

    return dayStats;
  });
};

export const calculateCategoryStats = (tasks: Task[]) => {
  const stats = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = { totalTime: 0, taskCount: 0 };
    }
    acc[task.category].totalTime += task.timeSpent;
    acc[task.category].taskCount++;
    return acc;
  }, {} as Record<string, { totalTime: number; taskCount: number }>);

  const totalTime = Object.values(stats).reduce((acc, stat) => acc + stat.totalTime, 0);

  return Object.entries(stats).map(([name, stat]) => ({
    name,
    value: stat.totalTime,
    percentage: totalTime > 0 ? (stat.totalTime / totalTime) * 100 : 0,
    taskCount: stat.taskCount,
  }));
};

export const calculateProjectStats = (tasks: Task[], projects: Project[]) => {
  const stats = tasks.reduce((acc, task) => {
    if (task.projectId) {
      if (!acc[task.projectId]) {
        acc[task.projectId] = { totalTime: 0, taskCount: 0 };
      }
      acc[task.projectId].totalTime += task.timeSpent;
      acc[task.projectId].taskCount++;
    }
    return acc;
  }, {} as Record<string, { totalTime: number; taskCount: number }>);

  const totalTime = Object.values(stats).reduce((acc, stat) => acc + stat.totalTime, 0);

  return projects.map(project => ({
    id: project.id,
    name: project.name,
    value: stats[project.id]?.totalTime || 0,
    percentage: totalTime > 0 ? ((stats[project.id]?.totalTime || 0) / totalTime) * 100 : 0,
    taskCount: stats[project.id]?.taskCount || 0,
  }));
};

export const formatTime = (value: number) => `${value.toFixed(1)}h`;

export const formatTooltip = (value: number, name: string) => {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  return [`${hours}h ${minutes}m`, name];
};