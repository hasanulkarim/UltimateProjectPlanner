import React from 'react';
import { subMonths, subYears } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useStore } from '../store';
import { TimeRange, getDateRange, formatDateForDisplay } from '../utils/dateUtils';
import {
  calculateTimeStats,
  calculateCategoryStats,
  calculateProjectStats,
  calculateStackedTimeStats,
  formatTime,
  formatTooltip,
} from '../utils/statsUtils';

const COLORS: Record<string, string> = {
  office: '#3B82F6',
  home: '#10B981',
  coding: '#6366F1',
  learning: '#F59E0B',
  projects: '#EC4899',
};

type ChartType = 'total' | 'category';

export default function Statistics() {
  const { tasks, categories, projects } = useStore();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [timeRange, setTimeRange] = React.useState<TimeRange>('week');
  const [chartType, setChartType] = React.useState<ChartType>('total');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedProject, setSelectedProject] = React.useState<string>('all');

  // Generate dynamic colors for categories
  const categoryColors = React.useMemo(() => {
    const colors = { ...COLORS };
    categories.forEach((category, index) => {
      if (!colors[category]) {
        const hue = (index * 137.508) % 360;
        colors[category] = `hsl(${hue}, 70%, 50%)`;
      }
    });
    return colors;
  }, [categories]);

  // Generate dynamic colors for projects
  const projectColors = React.useMemo(() => {
    return projects.reduce((acc, project, index) => {
      const hue = (index * 137.508) % 360;
      acc[project.id] = `hsl(${hue}, 70%, 50%)`;
      return acc;
    }, {} as Record<string, string>);
  }, [projects]);

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (timeRange) {
      case 'week':
        setSelectedDate(current => direction === 'prev' ? subMonths(current, 1) : subMonths(current, -1));
        break;
      case 'month':
        setSelectedDate(current => direction === 'prev' ? subMonths(current, 1) : subMonths(current, -1));
        break;
      case 'year':
        setSelectedDate(current => direction === 'prev' ? subYears(current, 1) : subYears(current, -1));
        break;
    }
  };

  const dateRange = getDateRange(timeRange, selectedDate);
  const stackedTimeStats = calculateStackedTimeStats(tasks, dateRange, categories);
  const categoryStats = calculateCategoryStats(tasks);
  const projectStats = calculateProjectStats(tasks, projects);

  // Calculate Y-axis domain for time charts
  const getYAxisDomain = (data: any[]) => {
    if (chartType === 'total') {
      const maxTotal = Math.max(...data.map(day => 
        categories.reduce((sum, cat) => sum + (day[cat] || 0), 0)
      ));
      return [0, Math.ceil(maxTotal * 1.1)];
    } else {
      const maxTime = Math.max(...data.map(item => item.time));
      return [0, Math.ceil(maxTime * 1.1)];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Time Tracking Statistics</h2>
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'year'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Year
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('total')}
              className={`px-4 py-2 rounded-lg ${
                chartType === 'total'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Total Time
            </button>
            <button
              onClick={() => setChartType('category')}
              className={`px-4 py-2 rounded-lg ${
                chartType === 'category'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              By Category
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateDate('prev')}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Previous {timeRange}
        </button>
        <h3 className="text-lg font-semibold">
          {formatDateForDisplay(selectedDate, timeRange)}
        </h3>
        <button
          onClick={() => navigateDate('next')}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Next {timeRange}
        </button>
      </div>

      {chartType === 'category' && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Distribution Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'total' ? (
                <BarChart data={stackedTimeStats}>
                  <XAxis dataKey="date" />
                  <YAxis domain={getYAxisDomain(stackedTimeStats)} tickFormatter={formatTime} />
                  <Tooltip formatter={formatTime} />
                  <Legend />
                  {categories.map((category) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      stackId="a"
                      fill={categoryColors[category]}
                      name={category}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={stackedTimeStats}>
                  <XAxis dataKey="date" />
                  <YAxis domain={getYAxisDomain(stackedTimeStats)} tickFormatter={formatTime} />
                  <Tooltip formatter={formatTime} />
                  <Legend />
                  {categories.map((category) => (
                    <Line
                      key={category}
                      type="monotone"
                      dataKey={category}
                      stroke={categoryColors[category]}
                      name={category}
                      dot={false}
                      hide={selectedCategory !== 'all' && selectedCategory !== category}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                  tooltipFormatter={formatTooltip}
                >
                  {categoryStats.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={categoryColors[entry.name]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Project Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                  tooltipFormatter={formatTooltip}
                >
                  {projectStats.map((entry) => (
                    <Cell 
                      key={`cell-${entry.id}`} 
                      fill={projectColors[entry.id]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Details Grid */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((stat) => (
              <div
                key={stat.name}
                className="bg-gray-50 p-4 rounded-lg"
                style={{ borderLeft: `4px solid ${categoryColors[stat.name]}` }}
              >
                <h4 className="text-lg font-medium capitalize">{stat.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Total Time: {formatTime(stat.value / 3600)}</p>
                  <p>Tasks: {stat.taskCount}</p>
                  <p>Percentage: {stat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
