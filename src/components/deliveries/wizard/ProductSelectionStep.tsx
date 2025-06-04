import React, { useState } from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

const ProductSelectionStep = () => {
  const { products } = useAppContext();
  const { setFieldValue, values } = useFormikContext<any>();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter active products and sort by name
  const availableProducts = products
    .filter(product => 
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      product.stock > 0
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleProductSelect = (product: any) => {
    setFieldValue('selectedProduct', {
      id: product.id,
      name: product.name,
      stock: product.stock,
      category: product.category
    });
    // Clear supplier selection when product changes
    setFieldValue('supplier', {
      id: '',
      name: '',
      price: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
      </div>

      <div className="grid gap-4">
        {availableProducts.map((product) => (
          <div
            key={product.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              values.selectedProduct?.id === product.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleProductSelect(product)}
          >
            <div className="flex items-start space-x-4">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">SKU: {product.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${product.price.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <Package size={14} className="text-gray-400" />
                      <span className="ml-1 text-sm text-gray-500">{product.stock} in stock</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                  {product.stock <= product.reorderLevel && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ml-2">
                      <AlertTriangle size={12} className="mr-1" />
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {availableProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No products found matching your search criteria</p>
          </div>
        )}
      </div>

      <ErrorMessage
        name="selectedProduct.id"
        component="div"
        className="mt-1 text-sm text-red-600"
      />
    </div>
  );
};

export default ProductSelectionStep;