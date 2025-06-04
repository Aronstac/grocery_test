import React from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';

const Tasks: React.FC = () => {
  const tasks = [
    {
      id: 1,
      title: 'Unload Delivery #1234',
      status: 'in-progress',
      priority: 'high',
      deadline: '2025-05-22T14:00:00Z',
      location: 'Loading Dock A',
      items: ['Organic Bananas', 'Whole Milk', 'Sourdough Bread']
    },
    {
      id: 2,
      title: 'Restock Dairy Section',
      status: 'pending',
      priority: 'medium',
      deadline: '2025-05-22T16:00:00Z',
      location: 'Section B-3',
      items: ['Yogurt', 'Cheese', 'Butter']
    },
    {
      id: 3,
      title: 'Quality Check Fresh Produce',
      status: 'completed',
      priority: 'medium',
      deadline: '2025-05-22T12:00:00Z',
      location: 'Section A-1',
      items: ['Tomatoes', 'Lettuce', 'Cucumbers']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'in-progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'pending':
        return <AlertCircle size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your assigned tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <ClipboardList size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-xl font-semibold">{tasks.length}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-xl font-semibold">
              {tasks.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-xl font-semibold">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Task List">
        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border ${
                task.status === 'completed' ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full flex items-center ${getStatusClass(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">{task.status}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Location: {task.location}</p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Items:</p>
                    <ul className="mt-1 text-sm text-gray-500">
                      {task.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <span className="text-sm text-gray-500">
                    Due: {new Date(task.deadline).toLocaleTimeString()}
                  </span>
                  {task.status !== 'completed' && (
                    <button className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {task.status === 'pending' ? 'Start Task' : 'Complete Task'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Tasks;