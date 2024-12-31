import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { useStore } from '../store';
import { Task, TaskCategory } from '../types';
import { addToGoogleCalendar, initGoogleCalendar } from '../utils/googleCalendar';

interface TaskFormProps {
  onClose: () => void;
  selectedDate: Date;
  initialTime?: string | null;
  editTask?: Task | null;
}

export default function TaskForm({ onClose, selectedDate, initialTime, editTask }: TaskFormProps) {
  const { addTask, updateTask, categories, projects, startTimer } = useStore();
  const [title, setTitle] = React.useState(editTask?.title || '');
  const [description, setDescription] = React.useState(editTask?.description || '');
  const [date, setDate] = React.useState(editTask?.date || format(selectedDate, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = React.useState(editTask?.startTime || initialTime || '09:00');
  const [duration, setDuration] = React.useState(editTask?.duration.toString() || '30');
  const [category, setCategory] = React.useState<TaskCategory>(editTask?.category || 'office');
  const [projectId, setProjectId] = React.useState<string | undefined>(editTask?.projectId);
  const [addToGoogle, setAddToGoogle] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!editTask) {
      initGoogleCalendar().catch(console.error);
    }
  }, [editTask]);

  const handleSubmit = async (e: React.FormEvent, startImmediately: boolean = false) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const taskData = {
        title,
        description,
        date,
        startTime,
        duration: parseInt(duration),
        category,
        projectId,
      };
      
      if (editTask) {
        updateTask(editTask.id, taskData);
      } else {
        const newTask: Task = {
          id: crypto.randomUUID(),
          completed: false,
          timeSpent: 0,
          ...taskData,
        };

        if (addToGoogle) {
          const eventId = await addToGoogleCalendar(newTask);
          if (eventId) {
            newTask.googleEventId = eventId;
          }
        }

        addTask(newTask);
        
        if (startImmediately) {
          startTimer(newTask.id);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project (Optional)
            </label>
            <select
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              required
            />
          </div>

          {!editTask && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="addToGoogle"
                checked={addToGoogle}
                onChange={(e) => setAddToGoogle(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="addToGoogle" className="ml-2 block text-sm text-gray-900">
                Add to Google Calendar
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
            </button>
            {!editTask && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Create & Start
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
