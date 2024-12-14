import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Project, Milestone } from '../types';
import { useStore } from '../store';

interface ProjectProgressProps {
  project: Project;
  onProgressChange: (progress: number) => void;
  onMilestoneToggle: (milestoneId: string) => void;
}

export default function ProjectProgress({
  project,
  onProgressChange,
  onMilestoneToggle,
}: ProjectProgressProps) {
  const calculateProjectProgress = useStore((state) => state.calculateProjectProgress);
  const progressOptions = Array.from({ length: 11 }, (_, i) => i * 10);
  const milestones = project.milestones || [];
  
  // Calculate automatic progress based on milestones
  const automaticProgress = calculateProjectProgress(project);

  // Use automatic progress if available, otherwise use manual progress
  const currentProgress = project.progress ?? automaticProgress;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress ({currentProgress}%)
          {milestones.length > 0 && (
            <span className="text-sm text-gray-500 ml-2">
              (Auto-calculated from milestones)
            </span>
          )}
        </label>
        <select
          value={project.progress ?? currentProgress}
          onChange={(e) => onProgressChange(Number(e.target.value))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {progressOptions.map((value) => (
            <option key={value} value={value}>
              {value}%
            </option>
          ))}
        </select>
        <div className="mt-2 bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {milestones.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Milestones</h4>
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onMilestoneToggle(milestone.id)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {milestone.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}