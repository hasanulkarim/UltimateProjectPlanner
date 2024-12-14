import React from 'react';
import { Bell, Play, CheckCircle, Clock } from 'lucide-react';
import { stopRepeatingSound } from '../utils/notifications';

interface NotificationModalProps {
  taskTitle: string;
  onContinue: () => void;
  onComplete: () => void;
  onSnooze: (minutes: number) => void;
  onClose: () => void;
}

export default function NotificationModal({
  taskTitle,
  onContinue,
  onComplete,
  onSnooze,
  onClose,
}: NotificationModalProps) {
  React.useEffect(() => {
    return () => {
      stopRepeatingSound();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">Timer Completed</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Timer completed for task: <span className="font-medium">{taskTitle}</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onContinue}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Continue</span>
          </button>
          
          <button
            onClick={onComplete}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete Task</span>
          </button>
          
          <button
            onClick={() => onSnooze(5)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Snooze 5m</span>
          </button>
          
          <button
            onClick={() => onSnooze(15)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Snooze 15m</span>
          </button>
        </div>
      </div>
    </div>
  );
}