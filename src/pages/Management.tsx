import React from 'react';
import { Users, UserX, UserCheck, Clock, BarChart as ChartBar, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import EmployeeTable from '../components/management/EmployeeTable';
import Card from '../components/ui/Card';
import BarChart from '../components/charts/BarChart';

const Management: React.FC = () => {
  const { employees } = useAppContext();

  // Count employees by status
  const activeCount = employees.filter(e => e.status === 'active').length;
  const onLeaveCount = employees.filter(e => e.status === 'on-leave').length;
  const terminatedCount = employees.filter(e => e.status === 'terminated').length;

  // Count employees by department
  const departmentCounts = employees.reduce<Record<string, number>>((acc, employee) => {
    const { department } = employee;
    if (!acc[department]) {
      acc[department] = 0;
    }
    acc[department] += 1;
    return acc;
  }, {});

  // Department chart data
  const departmentData = {
    labels: Object.keys(departmentCounts),
    datasets: [
      {
        label: 'Employees',
        data: Object.values(departmentCounts),
        backgroundColor: [
          'rgba(29, 78, 216, 0.7)',
          'rgba(13, 148, 136, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)',
        ],
        borderColor: [
          'rgba(29, 78, 216, 1)',
          'rgba(13, 148, 136, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Staff Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your store's employees, schedules, and departments</p>
      </div>

      {/* Staff Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Staff</p>
            <p className="text-xl font-semibold">{employees.length}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <UserCheck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-xl font-semibold">{activeCount}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">On Leave</p>
            <p className="text-xl font-semibold">{onLeaveCount}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <UserX size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Terminated</p>
            <p className="text-xl font-semibold">{terminatedCount}</p>
          </div>
        </Card>
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Department Distribution" className="col-span-1 lg:col-span-1">
          <BarChart data={departmentData} height={300} options={{ indexAxis: 'y' }} />
        </Card>
        
        <Card title="Quick Access" className="col-span-1 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
              <Users size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Schedule Management</span>
            </button>
            <button className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
              <ChartBar size={24} className="text-teal-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Performance Review</span>
            </button>
            <button className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center">
              <FileText size={24} className="text-amber-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">HR Documents</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Employee Table */}
      <EmployeeTable />
    </div>
  );
};

export default Management;