import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Calendar } from './components/Calendar';
import Statistics from './components/Statistics';
import Projects from './components/Projects';
import CategoryManager from './components/CategoryManager';
import Auth from './components/Auth';
import { Clock } from 'lucide-react';
import { requestNotificationPermission } from './utils/notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';

export function App() {
  const { timer, updateElapsedTime, updateTaskTime, setUserId } = useStore();
  const [view, setView] = useState<'calendar' | 'statistics' | 'projects' | 'categories'>('calendar');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, [setUserId]);

  useEffect(() => {
    let lastTick = Date.now();
    let interval: number | null = null;

    if (timer.isRunning && timer.taskId) {
      interval = window.setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTick) / 1000);
        lastTick = now;
        
        const newElapsedTime = timer.elapsedTime + delta;
        updateElapsedTime(newElapsedTime);
        updateTaskTime(timer.taskId!, newElapsedTime);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.taskId, timer.elapsedTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Auth />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Project Planner</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('calendar')}
                  className={`px-4 py-2 rounded-lg ${
                    view === 'calendar'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setView('statistics')}
                  className={`px-4 py-2 rounded-lg ${
                    view === 'statistics'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Statistics
                </button>
                <button
                  onClick={() => setView('projects')}
                  className={`px-4 py-2 rounded-lg ${
                    view === 'projects'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setView('categories')}
                  className={`px-4 py-2 rounded-lg ${
                    view === 'categories'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Categories
                </button>
              </div>
            </div>
            {timer.isRunning && timer.taskId && (
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-blue-700 font-medium">
                  Timer: {formatTime(timer.elapsedTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {view === 'calendar' && <Calendar />}
        {view === 'statistics' && <Statistics />}
        {view === 'projects' && <Projects />}
        {view === 'categories' && <CategoryManager />}
      </main>
    </div>
  );
}
