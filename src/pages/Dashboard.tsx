import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  AlertTriangle,
  Truck
} from 'lucide-react';

import Card from '../components/ui/Card';
import StatsCard from '../components/ui/StatsCard';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import { mockFinancialData } from '../data/financialData';
import { useAppContext } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { products, deliveries } = useAppContext();

  // Upcoming deliveries
  const upcomingDeliveries = deliveries
    .filter(d => d.status === 'pending' || d.status === 'in-transit')
    .slice(0, 5);

  // Low stock products
  const lowStockProducts = products
    .filter(p => p.stock <= p.reorderLevel)
    .slice(0, 5);

  // Line chart data
  const revenueData = {
    labels: mockFinancialData.dailyRevenue.map(day => new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Revenue',
        data: mockFinancialData.dailyRevenue.map(day => day.revenue),
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29, 78, 216, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Expenses',
        data: mockFinancialData.dailyRevenue.map(day => day.expenses),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3,
        fill: true,
      }
    ],
  };

  // Bar chart data
  const categorySalesData = {
    labels: mockFinancialData.topSellingCategories.map(cat => cat.category),
    datasets: [
      {
        label: 'Sales ($)',
        data: mockFinancialData.topSellingCategories.map(cat => cat.sales),
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
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Today's Revenue" 
          value={`$${mockFinancialData.dailyRevenue[6].revenue.toFixed(2)}`} 
          icon={<DollarSign size={24} />} 
          change={8.2} 
          trend="up" 
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard 
          title="Orders" 
          value="37" 
          icon={<ShoppingCart size={24} />} 
          change={-2.1} 
          trend="down" 
          iconColor="bg-amber-100 text-amber-600"
        />
        <StatsCard 
          title="Inventory Items" 
          value={products.length} 
          icon={<Package size={24} />} 
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard 
          title="Pending Deliveries" 
          value={deliveries.filter(d => d.status === 'pending').length} 
          icon={<Truck size={24} />} 
          iconColor="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue vs Expenses (Last 7 Days)" className="col-span-1">
          <LineChart data={revenueData} height={250} />
        </Card>
        <Card title="Top-Selling Categories" className="col-span-1">
          <BarChart data={categorySalesData} height={250} />
        </Card>
      </div>
      
      {/* Alerts and upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card 
          title="Low Stock Alerts" 
          icon={<AlertTriangle size={20} className="text-amber-500" />}
          className="col-span-1"
        >
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
        </Card>
        
        {/* Upcoming Deliveries */}
        <Card 
          title="Upcoming Deliveries" 
          icon={<Clock size={20} className="text-blue-500" />}
          className="col-span-1"
        >
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
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;