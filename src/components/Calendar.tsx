import React from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import TaskList from './TaskList';
import DaySchedule from './DaySchedule';
import TaskForm from './TaskForm';

export function Calendar() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [view, setView] = React.useState<'list' | 'schedule'>('schedule');
  const [showForm, setShowForm] = React.useState(false);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [editingTask, setEditingTask] = React.useState(null);
  const tasks = useStore((state) => state.tasks);

  const weekStart = startOfWeek(selectedDate);
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(current => 
      direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
    );
  };

  const filteredTasks = tasks.filter((task) =>
    isSameDay(parseISO(task.date), selectedDate)
  );

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
    setShowForm(true);
  };

  const handleTaskClick = (task: any) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('schedule')}
              className={`px-4 py-2 rounded-lg ${
                view === 'schedule'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg ${
                view === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              List
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                isSameDay(day, selectedDate)
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-sm font-medium">
                {format(day, 'EEE')}
              </div>
              <div className="text-lg font-bold">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {view === 'schedule' ? (
          <DaySchedule
            tasks={filteredTasks}
            selectedDate={selectedDate}
            onTimeSlotClick={handleTimeSlotClick}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            selectedDate={selectedDate}
          />
        )}
      </div>

      {showForm && (
        <TaskForm
          onClose={() => {
            setShowForm(false);
            setSelectedTime(null);
            setEditingTask(null);
          }}
          selectedDate={selectedDate}
          initialTime={selectedTime}
          editTask={editingTask}
        />
      )}
    </div>
  );
}
