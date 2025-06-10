import React from 'react';
import { Store, Plus, MapPin } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const Stores: React.FC = () => {
  const { stores, loading } = useAppContext();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Stores</h1>
          <p className="text-sm text-gray-500 mt-1">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Stores</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store locations</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} className="mr-2" />
          Add Store
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-blue-100 text-blue-600 mr-4">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{store.name}</h3>
                  <p className="text-sm text-gray-500">{store.city}, {store.region}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-start">
                <MapPin size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-600">{store.address}</p>
              </div>
              
              {store.phone && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">📞 {store.phone}</p>
                </div>
              )}
              
              {store.email && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">✉️ {store.email}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className={`px-2 py-1 text-xs rounded-full ${
                store.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {store.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-12">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No stores found</h3>
          <p className="text-gray-500 mt-2">Add your first store location to get started</p>
        </div>
      )}
    </div>
  );
};

export default Stores;