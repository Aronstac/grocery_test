import React from 'react';
import { Package, Filter, Download, Upload, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductTable from '../components/inventory/ProductTable';
import Card from '../components/ui/Card';

const Inventory: React.FC = () => {
  const { products } = useAppContext();

  // Count products by category
  const categoryCounts = products.reduce<Record<string, number>>((acc, product) => {
    const { category } = product;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {});

  // Count low stock products
  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory, stock levels, and categories</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={16} className="mr-1" />
            Export
          </button>
          <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Upload size={16} className="mr-1" />
            Import
          </button>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Package size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-xl font-semibold">{products.length}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <Filter size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-xl font-semibold">{Object.keys(categoryCounts).length}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Low Stock Items</p>
            <p className="text-xl font-semibold">{lowStockCount}</p>
          </div>
        </Card>
      </div>

      {/* Category Quick View */}
      <Card title="Categories Overview" className="overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div 
              key={category} 
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <h4 className="font-medium text-gray-800">{category}</h4>
              <p className="text-sm text-gray-500 mt-1">{count} products</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
};

export default Inventory;