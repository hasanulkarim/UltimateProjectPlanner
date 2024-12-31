import { create } from 'zustand';
    import { Task, Timer, Project, TaskCategory } from './types';
    import { saveToLocalStorage, loadFromLocalStorage } from './utils/storage';
    import { ref, onValue, set, update } from 'firebase/database';
    import { database } from './utils/firebase';
    
    interface Store {
      tasks: Task[];
      timer: Timer;
      projects: Project[];
      categories: TaskCategory[];
      userId: string | null;
      setUserId: (id: string | null) => void;
      addTask: (task: Task) => void;
      updateTask: (taskId: string, updates: Partial<Task>) => void;
      deleteTask: (taskId: string) => void;
      toggleTaskComplete: (taskId: string) => void;
      startTimer: (taskId: string, continuePastTarget?: boolean) => void;
      stopTimer: () => void;
      pauseTimer: () => void;
      updateElapsedTime: (time: number) => void;
      updateTaskTime: (taskId: string, time: number) => void;
      snoozeTask: (taskId: string, minutes: number) => void;
      checkSnoozeTimer: () => boolean;
      addProject: (project: Project) => void;
      updateProject: (projectId: string, updates: Partial<Project>) => void;
      deleteProject: (projectId: string) => void;
      addCategory: (category: TaskCategory) => void;
      deleteCategory: (category: TaskCategory) => void;
      calculateProjectProgress: (project: Project) => number;
    }
    
    // Load initial state from localStorage
    const initialTasks = loadFromLocalStorage('tasks') || [];
    const initialTimer = loadFromLocalStorage('timer') || {
      taskId: null,
      isRunning: false,
      elapsedTime: 0,
      snoozeUntil: null,
      continuedPastTarget: false,
    };
    const initialProjects = loadFromLocalStorage('projects') || [];
    const initialCategories = loadFromLocalStorage('categories') || [
      'office',
      'home',
      'coding',
      'learning',
      'projects',
    ];
    
    export const useStore = create<Store>((set, get) => ({
      tasks: initialTasks,
      timer: initialTimer,
      projects: initialProjects,
      categories: initialCategories,
      userId: null,
    
      setUserId: (id: string | null) => {
        set({ userId: id });
        if (id) {
          // Subscribe to Firebase updates
          const userRef = ref(database, `users/${id}`);
          onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              set({
                tasks: data.tasks || [],
                projects: data.projects || [],
                categories: data.categories || initialCategories,
              });
            }
          });
        }
      },
    
      calculateProjectProgress: (project: Project) => {
        if (!project.milestones || project.milestones.length === 0) {
          return project.progress || 0;
        }
        const completedMilestones = project.milestones.filter(m => m.completed).length;
        return Math.round((completedMilestones / project.milestones.length) * 100);
      },
    
      addTask: (task) =>
        set((state) => {
          const newTasks = [...state.tasks, task];
          saveToLocalStorage('tasks', newTasks);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/tasks`), newTasks);
          }
          return { tasks: newTasks };
        }),
    
      updateTask: (taskId, updates) =>
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          );
          saveToLocalStorage('tasks', newTasks);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/tasks`), newTasks);
          }
          return { tasks: newTasks };
        }),
    
      deleteTask: (taskId) =>
        set((state) => {
          const newTasks = state.tasks.filter((task) => task.id !== taskId);
          const newTimer = state.timer.taskId === taskId ? 
            { 
              taskId: null, 
              isRunning: false, 
              elapsedTime: 0, 
              snoozeUntil: null, 
              continuedPastTarget: false 
            } : state.timer;
          
          saveToLocalStorage('tasks', newTasks);
          saveToLocalStorage('timer', newTimer);
          
          if (state.userId) {
            update(ref(database, `users/${state.userId}`), {
              tasks: newTasks,
              timer: newTimer,
            });
          }
          
          return {
            tasks: newTasks,
            timer: newTimer,
          };
        }),
    
      toggleTaskComplete: (taskId) =>
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          saveToLocalStorage('tasks', newTasks);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/tasks`), newTasks);
          }
          return { tasks: newTasks };
        }),
    
      startTimer: (taskId, continuePastTarget = false) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === taskId);
        if (task) {
          const newTimer = {
            taskId,
            isRunning: true,
            elapsedTime: state.timer.taskId === taskId ? state.timer.elapsedTime : task.timeSpent,
            snoozeUntil: null,
            continuedPastTarget: continuePastTarget,
          };
          saveToLocalStorage('timer', newTimer);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/timer`), newTimer);
          }
          set({ timer: newTimer });
        }
      },
    
      stopTimer: () => {
        const state = get();
        const newTimer = {
          taskId: null,
          isRunning: false,
          elapsedTime: 0,
          snoozeUntil: null,
          continuedPastTarget: false,
        };
        saveToLocalStorage('timer', newTimer);
        if (state.userId) {
          set(ref(database, `users/${state.userId}/timer`), newTimer);
        }
        set({ timer: newTimer });
      },
    
      pauseTimer: () =>
        set((state) => {
          const newTimer = { ...state.timer, isRunning: false };
          saveToLocalStorage('timer', newTimer);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/timer`), newTimer);
          }
          return { timer: newTimer };
        }),
    
      updateElapsedTime: (time) =>
        set((state) => {
          const newTimer = { ...state.timer, elapsedTime: time };
          saveToLocalStorage('timer', newTimer);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/timer`), newTimer);
          }
          return { timer: newTimer };
        }),
    
      updateTaskTime: (taskId, time) =>
        set((state) => {
          const newTasks = state.tasks.map((task) =>
            task.id === taskId ? { ...task, timeSpent: time } : task
          );
          const newTimer = {
            ...state.timer,
            elapsedTime: time,
          };
          
          saveToLocalStorage('tasks', newTasks);
          saveToLocalStorage('timer', newTimer);
          
          if (state.userId) {
            update(ref(database, `users/${state.userId}`), {
              tasks: newTasks,
              timer: newTimer,
            });
          }
          
          return {
            tasks: newTasks,
            timer: newTimer,
          };
        }),
    
      snoozeTask: (taskId, minutes) =>
        set((state) => {
          const newTimer = {
            ...state.timer,
            taskId,
            isRunning: false,
            snoozeUntil: Date.now() + minutes * 60 * 1000,
            continuedPastTarget: false,
          };
          saveToLocalStorage('timer', newTimer);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/timer`), newTimer);
          }
          return { timer: newTimer };
        }),
    
      checkSnoozeTimer: () => {
        const state = get();
        if (state.timer.snoozeUntil && Date.now() >= state.timer.snoozeUntil) {
          const newTimer = {
            ...state.timer,
            snoozeUntil: null,
          };
          saveToLocalStorage('timer', newTimer);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/timer`), newTimer);
          }
          set({ timer: newTimer });
          return true;
        }
        return false;
      },
    
      addProject: (project) =>
        set((state) => {
          const newProject = {
            ...project,
            progress: project.progress || 0,
            milestones: project.milestones || [],
          };
          const newProjects = [...state.projects, newProject];
          saveToLocalStorage('projects', newProjects);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/projects`), newProjects);
          }
          return { projects: newProjects };
        }),
    
      updateProject: (projectId, updates) =>
        set((state) => {
          const newProjects = state.projects.map((project) =>
            project.id === projectId ? { ...project, ...updates } : project
          );
          saveToLocalStorage('projects', newProjects);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/projects`), newProjects);
          }
          return { projects: newProjects };
        }),
    
      deleteProject: (projectId) =>
        set((state) => {
          const newProjects = state.projects.filter((project) => project.id !== projectId);
          const newTasks = state.tasks.filter((task) => task.projectId !== projectId);
          
          saveToLocalStorage('projects', newProjects);
          saveToLocalStorage('tasks', newTasks);
          
          if (state.userId) {
            update(ref(database, `users/${state.userId}`), {
              projects: newProjects,
              tasks: newTasks,
            });
          }
          
          return {
            projects: newProjects,
            tasks: newTasks,
          };
        }),
    
      addCategory: (category) =>
        set((state) => {
          if (!state.categories.includes(category)) {
            const newCategories = [...state.categories, category];
            saveToLocalStorage('categories', newCategories);
            if (state.userId) {
              set(ref(database, `users/${state.userId}/categories`), newCategories);
            }
            return { categories: newCategories };
          }
          return state;
        }),
    
      deleteCategory: (category) =>
        set((state) => {
          const newCategories = state.categories.filter((c) => c !== category);
          saveToLocalStorage('categories', newCategories);
          if (state.userId) {
            set(ref(database, `users/${state.userId}/categories`), newCategories);
          }
          return { categories: newCategories };
        }),
    }));
