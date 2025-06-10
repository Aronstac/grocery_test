import React from 'react';
import { CreditCard, Plus, Fuel } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const GasCards: React.FC = () => {
  const { gasCards, loading } = useAppContext();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Gas Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Loading gas cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Gas Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Manage fuel cards for drivers</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={16} className="mr-2" />
          Issue Card
        </button>
      </div>

      {/* Gas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gasCards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <CreditCard size={24} className="text-white/50" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-blue-100">Available Balance</p>
              <p className="text-3xl font-bold mt-2">${card.balance?.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-blue-100">Card Number</p>
              <p className="font-mono mt-1">{card.card_number}</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Employee</p>
                <p className="text-sm font-medium">{card.employee?.name || 'Unassigned'}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  card.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {card.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gasCards.length === 0 && (
        <div className="text-center py-12">
          <Fuel size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No gas cards found</h3>
          <p className="text-gray-500 mt-2">Issue your first gas card to get started</p>
        </div>
      )}
    </div>
  );
};

export default GasCards;