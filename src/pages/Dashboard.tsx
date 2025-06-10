import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Truck,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { apiClient } from '../api/client';

const Dashboard: React.FC = () => {
  const { products, deliveries, employees } = useAppContext();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.getAnalyticsSummary();
      setAnalytics(response);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = analytics?.stats || {};
  const upcomingDeliveries = deliveries.filter(d => d.status === 'pending' || d.status === 'in_transit').slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock <= p.reorder_level).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                ${(stats.todaysRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-full p-3 bg-green-100 text-green-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{deliveries.length}</p>
            </div>
            <div className="rounded-full p-3 bg-amber-100 text-amber-600">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Inventory Items</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{products.length}</p>
            </div>
            <div className="rounded-full p-3 bg-blue-100 text-blue-600">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Deliveries</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {deliveries.filter(d => d.status === 'pending').length}
              </p>
            </div>
            <div className="rounded-full p-3 bg-indigo-100 text-indigo-600">
              <Truck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h3 className="font-medium text-gray-800">Low Stock Alerts</h3>
            <div className="text-gray-500">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded overflow-hidden mr-3">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          <span className="text-red-600 font-semibold">{product.stock}</span> remaining (Min: {product.reorderLevel})
                        </p>
                      </div>
                    </div>
                    <button className="text-xs text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No low stock items!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Upcoming Deliveries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h3 className="font-medium text-gray-800">Upcoming Deliveries</h3>
            <div className="text-gray-500">
              <Clock size={20} className="text-blue-500" />
            </div>
          </div>
          <div className="p-6">
            {upcomingDeliveries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {upcomingDeliveries.map((delivery) => (
                  <div key={delivery.id} className="py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {delivery.supplierName}{' '}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            delivery.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {delivery.status === 'pending' ? 'Pending' : 'In Transit'}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Expected: {new Date(delivery.expectedDate).toLocaleDateString()} - ${delivery.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        View
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {delivery.items.length} items
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No upcoming deliveries</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;