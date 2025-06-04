import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Scan, ClipboardList, AlertTriangle, Phone, ArrowDownCircle, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatsCard from '../../components/ui/StatsCard';
import { useAppContext } from '../../context/AppContext';

const WarehouseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { deliveries, products } = useAppContext();

  const mockStats = {
    ordersProcessed: 45,
    accuracyRate: 99.2,
    pendingTasks: 8,
    lowStockItems: products.filter(p => p.stock <= p.reorderLevel).length
  };

  // Get incoming deliveries
  const incomingDeliveries = deliveries
    .filter(d => d.status === 'pending' || d.status === 'in-transit')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Warehouse Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your work overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/scanner')}
          className="p-4 border rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex flex-col items-center text-blue-700"
        >
          <Scan size={24} className="mb-2" />
          <span className="text-sm font-medium">Scan Items</span>
        </button>
        <button
          onClick={() => navigate('/tasks')}
          className="p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors flex flex-col items-center text-green-700"
        >
          <ClipboardList size={24} className="mb-2" />
          <span className="text-sm font-medium">View Tasks</span>
        </button>
        <button
          onClick={() => navigate('/report-problem')}
          className="p-4 border rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors flex flex-col items-center text-amber-700"
        >
          <AlertTriangle size={24} className="mb-2" />
          <span className="text-sm font-medium">Report Issue</span>
        </button>
        <button className="p-4 border rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors flex flex-col items-center text-indigo-700">
          <Phone size={24} className="mb-2" />
          <span className="text-sm font-medium">Contact Support</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Orders Processed" 
          value={mockStats.ordersProcessed}
          icon={<Package size={24} />} 
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard 
          title="Accuracy Rate" 
          value={`${mockStats.accuracyRate}%`}
          icon={<CheckCircle2 size={24} />} 
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard 
          title="Pending Tasks" 
          value={mockStats.pendingTasks}
          icon={<ClipboardList size={24} />} 
          iconColor="bg-amber-100 text-amber-600"
        />
        <StatsCard 
          title="Low Stock Items" 
          value={mockStats.lowStockItems}
          icon={<AlertTriangle size={24} />} 
          iconColor="bg-red-100 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Shipments */}
        <Card 
          title="Incoming Shipments" 
          icon={<ArrowDownCircle size={20} className="text-blue-500" />}
        >
          {incomingDeliveries.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {incomingDeliveries.map((delivery) => (
                <div key={delivery.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{delivery.supplierName}</p>
                      <p className="text-xs text-gray-500">
                        Expected: {new Date(delivery.expectedDate).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      delivery.status === 'pending' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {delivery.status === 'pending' ? 'Pending' : 'In Transit'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {delivery.items.length} items to process
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No incoming shipments</p>
            </div>
          )}
        </Card>

        {/* Work Orders */}
        <Card 
          title="Today's Work Orders" 
          icon={<ClipboardList size={20} className="text-green-500" />}
        >
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-900">Stock Replenishment</p>
                  <p className="text-xs text-blue-700 mt-1">Dairy Section - Aisle 3</p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  In Progress
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-amber-900">Quality Check</p>
                  <p className="text-xs text-amber-700 mt-1">Fresh Produce</p>
                </div>
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                  Pending
                </span>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-green-900">Order Picking</p>
                  <p className="text-xs text-green-700 mt-1">Online Orders #1234-1238</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WarehouseDashboard;