import React from 'react';
import { CreditCard, Clock, AlertTriangle, Receipt } from 'lucide-react';
import Card from '../../components/ui/Card';

const GasCard: React.FC = () => {
  const mockGasCard = {
    cardNumber: 'GC-1234-5678',
    balance: 750.25,
    expiryDate: '2025-12-31',
    lastUsed: '2025-05-20T10:30:00Z',
    status: 'active'
  };

  const recentTransactions = [
    { id: 1, date: '2025-05-20', amount: 45.75, location: 'Shell Station - Kyiv' },
    { id: 2, date: '2025-05-18', amount: 52.30, location: 'WOG - Lviv' },
    { id: 3, date: '2025-05-15', amount: 48.90, location: 'OKKO - Kharkiv' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Gas Card</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your fuel expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="absolute top-0 right-0 p-4">
            <CreditCard size={24} className="text-white/50" />
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-blue-100">Available Balance</p>
            <p className="text-3xl font-bold mt-2">${mockGasCard.balance.toFixed(2)}</p>
            <div className="mt-4">
              <p className="text-sm text-blue-100">Card Number</p>
              <p className="font-mono mt-1">{mockGasCard.cardNumber}</p>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-100">
              <Clock size={16} className="mr-1" />
              <span>Expires: {new Date(mockGasCard.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Recent Transactions</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <Receipt size={16} className="text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{transaction.location}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="font-medium">${transaction.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Usage Guidelines" className="bg-blue-50">
        <div className="space-y-4">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Important Information</h4>
              <ul className="mt-2 space-y-2 text-sm text-blue-800">
                <li>Only use for company vehicle fuel expenses</li>
                <li>Keep all receipts for documentation</li>
                <li>Report any suspicious activity immediately</li>
                <li>Card is non-transferable</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GasCard;