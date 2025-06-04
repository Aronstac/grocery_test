import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Navigation, Clock, Package, AlertTriangle, Phone, Fuel, Route } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatsCard from '../../components/ui/StatsCard';
import { useAppContext } from '../../context/AppContext';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { deliveries } = useAppContext();

  // Get the first pending or in-transit delivery as the current delivery
  const currentDelivery = deliveries.find(d => 
    d.status === 'pending' || d.status === 'in-transit'
  );

  const mockStats = {
    deliveriesCompleted: 12,
    distanceCovered: 145.8,
    timeOnRoad: '6h 45m',
    fuelLevel: 65
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Driver Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your delivery schedule.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/route')}
          className="p-4 border rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex flex-col items-center text-blue-700"
        >
          <Navigation size={24} className="mb-2" />
          <span className="text-sm font-medium">Start Navigation</span>
        </button>
        <button
          onClick={() => navigate('/gas-card')}
          className="p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors flex flex-col items-center text-green-700"
        >
          <Fuel size={24} className="mb-2" />
          <span className="text-sm font-medium">Gas Card</span>
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
          title="Deliveries Today" 
          value={mockStats.deliveriesCompleted}
          icon={<Package size={24} />} 
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard 
          title="Distance Covered" 
          value={`${mockStats.distanceCovered} km`}
          icon={<Route size={24} />} 
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard 
          title="Time on Road" 
          value={mockStats.timeOnRoad}
          icon={<Clock size={24} />} 
          iconColor="bg-amber-100 text-amber-600"
        />
        <StatsCard 
          title="Fuel Level" 
          value={`${mockStats.fuelLevel}%`}
          icon={<Fuel size={24} />} 
          iconColor="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Current Delivery */}
      {currentDelivery ? (
        <Card title="Current Delivery" icon={<Map size={20} className="text-blue-500" />}>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{currentDelivery.supplierName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Expected: {new Date(currentDelivery.expectedDate).toLocaleTimeString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                currentDelivery.status === 'pending' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentDelivery.status === 'pending' ? 'Ready to Start' : 'In Progress'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700">Delivery Items</h4>
              <ul className="mt-2 space-y-2">
                {currentDelivery.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex justify-between">
                    <span>{item.productName}</span>
                    <span className="font-medium">{item.quantity} units</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => navigate('/route')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Navigation size={16} className="mr-2" />
                Start Navigation
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="py-8 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Active Deliveries</h3>
            <p className="text-gray-500 mt-2">Check back later for new assignments</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DriverDashboard;