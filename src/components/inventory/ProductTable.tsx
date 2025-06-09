import React, { useState } from 'react';
import { Edit, Trash2, Filter, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ProductTable: React.FC = () => {
  const { products, loading, error, deleteProduct } = useAppContext();
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const getStockStatus = (product: Product) => {
    const ratio = product.stock / product.reorderLevel;
    if (product.stock === 0) return 'out';
    if (ratio <= 1) return 'low';
    if (ratio <= 2) return 'medium';
    return 'high';
  };

  const filteredProducts = products
    .filter(product => !filterCategory || product.category === filterCategory)
    .filter(product => {
      if (stockFilter === 'all') return true;
      return getStockStatus(product) === stockFilter;
    });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === 'price' || sortField === 'stock' || sortField === 'cost') {
      return sortDirection === 'asc'
        ? Number(a[sortField]) - Number(b[sortField])
        : Number(b[sortField]) - Number(a[sortField]);
    }
    
    const aValue = String(a[sortField]);
    const bValue = String(b[sortField]);
    
    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Get unique categories from actual products data
  const uniqueCategories = Array.from(new Set(products.map(product => product.category)));

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-medium">Inventory Products</h3>
          
          {/* Mobile Filter Toggle */}
          <button 
            className="sm:hidden flex items-center justify-between w-full px-4 py-2 bg-white border rounded-md"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <span className="flex items-center">
              <Filter size={16} className="mr-2" />
              Filters
            </span>
            <ChevronDown size={16} className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Filters */}
          <div className={`flex flex-col sm:flex-row gap-2 ${isFilterOpen ? 'block' : 'hidden'} sm:flex`}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="out">Out of Stock</option>
              <option value="low">Low Stock</option>
              <option value="medium">Medium Stock</option>
              <option value="high">High Stock</option>
            </select>
            
            <button className="bg-blue-600 text-white rounded-md px-3 py-2 text-sm font-medium flex items-center hover:bg-blue-700 transition-colors">
              <Plus size={16} className="mr-1" />
              Add Product
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-200">
          {/* Mobile Card View */}
          <div className="sm:hidden">
            {sortedProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <div key={product.id} className="p-4 border-b">
                  <div className="flex items-start space-x-4">
                    {product.imageUrl && (
                      <img 
                        className="h-16 w-16 rounded-md object-cover" 
                        src={product.imageUrl} 
                        alt={product.name}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(stockStatus)}`}>
                          {stockStatus === 'out' && 'Out of Stock'}
                          {stockStatus === 'low' && 'Low Stock'}
                          {stockStatus === 'medium' && 'Medium Stock'}
                          {stockStatus === 'high' && 'Sufficient Stock'}
                        </span>
                      </div>
                      <div className="mt-3 flex justify-end space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>
                        <button 
                          className="p-1 text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortField === 'price' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center">
                    Stock
                    {sortField === 'stock' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img className="h-10 w-10 rounded-md object-cover\" src={product.imageUrl} alt={product.name} />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                      <div className="text-xs text-gray-500">Min: {product.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(stockStatus)}`}>
                        {stockStatus === 'out' && 'Out of Stock'}
                        {stockStatus === 'low' && 'Low Stock'}
                        {stockStatus === 'medium' && 'Medium Stock'}
                        {stockStatus === 'high' && 'Sufficient Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Edit size={18} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{sortedProducts.length}</span> products
          </div>
          <div className="flex justify-center sm:justify-end">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Previous
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-gray-50"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                2
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Next
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;