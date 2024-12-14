import React from 'react';
import { format, parseISO, addMinutes } from 'date-fns';
import { CheckCircle, Circle, Play, Pause, Timer, Plus, Clock, Pencil, Trash } from 'lucide-react';
import { useStore } from '../store';
import TaskForm from './TaskForm';
import TimeEditModal from './TimeEditModal';
import NotificationModal from './NotificationModal';
import { Task } from '../types';
import { showSystemNotification, stopRepeatingSound } from '../utils/notifications';

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
}

export default function TaskList({ tasks, selectedDate }: TaskListProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [editingTime, setEditingTime] = React.useState<Task | null>(null);
  const [completedTask, setCompletedTask] = React.useState<Task | null>(null);
  
  const { 
    timer, 
    startTimer, 
    pauseTimer, 
    stopTimer, 
    deleteTask, 
    toggleTaskComplete,
    snoozeTask,
    updateTaskTime,
    checkSnoozeTimer
  } = useStore();

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  // Check timer completion
  React.useEffect(() => {
    if (timer.isRunning && timer.taskId) {
      const task = tasks.find((t) => t.id === timer.taskId);
      if (task) {
        const targetDuration = task.duration * 60; // Convert minutes to seconds
        if (timer.elapsedTime >= targetDuration && !timer.continuedPastTarget) {
          pauseTimer();
          updateTaskTime(task.id, timer.elapsedTime);
          const notification = showSystemNotification(task.title);
          if (notification) {
            notification.onclick = () => {
              window.focus();
              setCompletedTask(task);
            };
          }
          setCompletedTask(task);
        }
      }
    }
  }, [timer, tasks, pauseTimer, updateTaskTime]);

  // Check for snooze timer
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (timer.snoozeUntil && timer.taskId) {
        const shouldNotify = checkSnoozeTimer();
        if (shouldNotify) {
          const task = tasks.find((t) => t.id === timer.taskId);
          if (task) {
            const notification = showSystemNotification(task.title);
            if (notification) {
              notification.onclick = () => {
                window.focus();
                setCompletedTask(task);
              };
            }
            setCompletedTask(task);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.snoozeUntil, timer.taskId, tasks, checkSnoozeTimer]);

  const formatTime = (seconds: number) => {
    const negative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    return `${negative ? '-' : ''}${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      if (timer.taskId === taskId) {
        stopTimer();
      }
      deleteTask(taskId);
    }
  };

  const handleContinue = (taskId: string) => {
    stopRepeatingSound();
    startTimer(taskId, true);
    setCompletedTask(null);
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const isCurrentTask = timer.taskId === task.id;
    const endTime = format(
      addMinutes(parseISO(`${task.date}T${task.startTime}`), task.duration),
      'HH:mm'
    );

    const targetDuration = task.duration * 60;
    const remainingTime = isCurrentTask ? targetDuration - timer.elapsedTime : targetDuration;

    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className="text-blue-500 hover:text-blue-600"
          >
            {task.completed ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>
          <div>
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-500">
              {task.startTime} - {endTime} | Duration: {task.duration} min | Time spent: {formatTime(task.timeSpent)}
              {isCurrentTask && timer.isRunning && (
                <span className="ml-2 text-blue-600">
                  | Remaining: {formatTime(remainingTime)}
                </span>
              )}
              {isCurrentTask && timer.snoozeUntil && (
                <span className="ml-2 text-yellow-600">
                  | Snoozed until {format(timer.snoozeUntil, 'HH:mm')}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingTime(task)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Edit time spent"
          >
            <Clock className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setEditingTask(task)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Edit task"
          >
            <Pencil className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Delete task"
          >
            <Trash className="w-5 h-5 text-red-400" />
          </button>
          {!task.completed && (
            <>
              <Timer className="w-5 h-5 text-gray-400" />
              <button
                onClick={() => {
                  if (isCurrentTask && timer.isRunning) {
                    pauseTimer();
                  } else {
                    startTimer(task.id);
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isCurrentTask && timer.isRunning ? (
                  <Pause className="w-5 h-5 text-red-500" />
                ) : (
                  <Play className="w-5 h-5 text-green-500" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Tasks for {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {showForm && (
        <TaskForm onClose={() => setShowForm(false)} selectedDate={selectedDate} />
      )}

      {editingTask && (
        <TaskForm
          onClose={() => setEditingTask(null)}
          selectedDate={selectedDate}
          editTask={editingTask}
        />
      )}

      {editingTime && (
        <TimeEditModal
          task={editingTime}
          onClose={() => setEditingTime(null)}
        />
      )}

      {completedTask && (
        <NotificationModal
          taskTitle={completedTask.title}
          onContinue={() => handleContinue(completedTask.id)}
          onComplete={() => {
            stopRepeatingSound();
            toggleTaskComplete(completedTask.id);
            setCompletedTask(null);
          }}
          onSnooze={(minutes) => {
            stopRepeatingSound();
            snoozeTask(completedTask.id, minutes);
            setCompletedTask(null);
          }}
          onClose={() => {
            stopRepeatingSound();
            setCompletedTask(null);
          }}
        />
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
          {activeTasks.length === 0 ? (
            <p className="text-gray-500">No active tasks</p>
          ) : (
            activeTasks.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Completed Tasks</h3>
          {completedTasks.length === 0 ? (
            <p className="text-gray-500">No completed tasks</p>
          ) : (
            completedTasks.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </div>
      </div>
    </div>
  );
}