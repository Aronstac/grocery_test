import React, { useState } from 'react';
import { Scan, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';

const Scanner: React.FC = () => {
  const [scannedItems, setScannedItems] = useState([
    { id: 1, code: 'PRD-001', name: 'Organic Bananas', location: 'A-12-3', status: 'success' },
    { id: 2, code: 'PRD-002', name: 'Whole Milk', location: 'B-05-1', status: 'error' }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Product Scanner</h1>
        <p className="text-sm text-gray-500 mt-1">Scan products to verify and locate storage positions</p>
      </div>

      <Card>
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Scan size={48} className="text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">Point camera at product barcode</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Open Scanner
          </button>
        </div>
      </Card>

      <Card title="Recently Scanned Items">
        <div className="space-y-4">
          {scannedItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <Package size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Code: {item.code}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-6 text-right">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-gray-500">{item.location}</p>
                </div>
                {item.status === 'success' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <AlertTriangle size={20} className="text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Storage Map" className="bg-blue-50">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                i === 5 ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
              }`}
            >
              {String.fromCharCode(65 + Math.floor(i / 6))}-{(i % 6) + 1}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Scanner;