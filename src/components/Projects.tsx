import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Flag } from 'lucide-react';
import { useStore } from '../store';
import { Project, Milestone } from '../types';
import ProjectForm from './ProjectForm';
import TaskList from './TaskList';
import ProjectProgress from './ProjectProgress';
import MilestoneForm from './MilestoneForm';

export default function Projects() {
  const { projects, tasks, deleteProject, updateProject } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleDelete = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project and all its tasks?')) {
      deleteProject(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    }
  };

  const handleProgressChange = (projectId: string, progress: number) => {
    updateProject(projectId, { progress });
  };

  const handleMilestoneSave = (projectId: string, milestone: Milestone) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const milestones = [...(project.milestones || [])];
      const existingIndex = milestones.findIndex(m => m.id === milestone.id);
      
      if (existingIndex >= 0) {
        milestones[existingIndex] = milestone;
      } else {
        milestones.push(milestone);
      }
      
      updateProject(projectId, { milestones });
    }
    setShowMilestoneForm(false);
  };

  const handleMilestoneToggle = (projectId: string, milestoneId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && project.milestones) {
      const milestones = project.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      updateProject(projectId, { milestones });
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {showForm && (
        <ProjectForm
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
          project={editingProject}
        />
      )}

      {showMilestoneForm && selectedProject && (
        <MilestoneForm
          onClose={() => setShowMilestoneForm(false)}
          onSave={(milestone) => handleMilestoneSave(selectedProject.id, milestone)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{project.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingProject(project);
                    setShowForm(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(project.startDate).toLocaleDateString()}
                  {project.dueDate && ` - ${new Date(project.dueDate).toLocaleDateString()}`}
                </span>
              </div>

              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                  {project.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(project.priority)}`}>
                  {project.priority.toUpperCase()}
                </span>
              </div>
            </div>

            <ProjectProgress
              project={project}
              onProgressChange={(progress) => handleProgressChange(project.id, progress)}
              onMilestoneToggle={(milestoneId) => handleMilestoneToggle(project.id, milestoneId)}
            />

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => {
                  setSelectedProject(project);
                  setShowMilestoneForm(true);
                }}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add Milestone
              </button>
              <button
                onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {selectedProject?.id === project.id ? 'Hide Tasks' : 'Show Tasks'}
              </button>
            </div>

            {selectedProject?.id === project.id && (
              <div className="mt-4">
                <TaskList
                  tasks={tasks.filter((task) => task.projectId === project.id)}
                  selectedDate={new Date()}
                  projectId={project.id}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
