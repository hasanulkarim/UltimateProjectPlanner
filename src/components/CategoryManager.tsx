import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '../store';

export default function CategoryManager() {
  const { categories, addCategory, deleteCategory } = useStore();
  const [newCategory, setNewCategory] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim().toLowerCase());
      setNewCategory('');
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="capitalize">{category}</span>
            {!['office', 'home', 'coding', 'learning', 'projects'].includes(category) && (
              <button
                onClick={() => deleteCategory(category)}
                className="p-1 hover:bg-gray-200 rounded-full"
                title="Delete category"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
