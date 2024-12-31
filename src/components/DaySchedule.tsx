import React from 'react';
import { format, addHours, parseISO, addMinutes } from 'date-fns';
import { Plus } from 'lucide-react';
import { Task } from '../types';
import TaskForm from './TaskForm';

interface DayScheduleProps {
  tasks: Task[];
  selectedDate: Date;
  onTimeSlotClick: (time: string) => void;
  onTaskClick: (task: Task) => void;
}

export default function DaySchedule({
  tasks,
  selectedDate,
  onTimeSlotClick,
  onTaskClick,
}: DayScheduleProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getTaskPosition = (task: Task) => {
    const [hours, minutes] = task.startTime.split(':').map(Number);
    const top = (hours * 60 + minutes) * (100 / 1440); // Convert to percentage of day
    const height = (task.duration * 100) / 1440; // Convert duration to percentage of day
    return { top, height };
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-[3rem_1fr] gap-2 h-[600px] overflow-y-auto">
        <div className="space-y-3">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 text-sm text-gray-500"
            >
              {format(addHours(new Date().setHours(hour, 0, 0, 0), 0), 'h a')}
            </div>
          ))}
        </div>

        <div className="relative border-l border-gray-200">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full h-16 border-t border-gray-100 cursor-pointer hover:bg-gray-50"
              style={{ top: `${(hour * 100) / 24}%` }}
              onClick={() => onTimeSlotClick(`${hour.toString().padStart(2, '0')}:00`)}
            />
          ))}

          {tasks.map((task) => {
            const { top, height } = getTaskPosition(task);
            return (
              <div
                key={task.id}
                className={`absolute left-2 right-2 p-2 rounded cursor-pointer ${
                  task.completed
                    ? 'bg-green-100 border-green-200'
                    : 'bg-blue-100 border-blue-200'
                } border`}
                style={{
                  top: `${top}%`,
                  height: `${height}%`,
                  minHeight: '1.5rem',
                }}
                onClick={() => onTaskClick(task)}
              >
                <div className="text-sm font-medium truncate">{task.title}</div>
                <div className="text-xs text-gray-500">
                  {task.startTime} - {format(addMinutes(parseISO(`${task.date}T${task.startTime}`), task.duration), 'HH:mm')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
