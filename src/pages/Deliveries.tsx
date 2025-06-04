import React, { useState } from 'react';
import { Truck, Clock, CheckCircle, PackagePlus, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DeliveryTable from '../components/deliveries/DeliveryTable';
import DeliveryMap from '../components/deliveries/DeliveryMap';
import DeliveryWizard from '../components/deliveries/DeliveryWizard';
import Card from '../components/ui/Card';

const Deliveries: React.FC = () => {
  const { deliveries } = useAppContext();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | undefined>();
  const [showDeliveryWizard, setShowDeliveryWizard] = useState(false);

  // Count deliveries by status
  const pendingCount = deliveries.filter(d => d.status === 'pending').length;
  const inTransitCount = deliveries.filter(d => d.status === 'in-transit').length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Deliveries Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage incoming shipments and deliveries</p>
        </div>
        <button 
          onClick={() => setShowDeliveryWizard(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PackagePlus size={16} className="mr-2" />
          New Delivery
        </button>
      </div>

      {/* Delivery Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Truck size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Deliveries</p>
            <p className="text-xl font-semibold">{deliveries.length}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-semibold">{pendingCount}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <Truck size={24} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">In Transit</p>
            <p className="text-xl font-semibold">{inTransitCount}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-xl font-semibold">{deliveredCount}</p>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {pendingCount + inTransitCount > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Upcoming Deliveries</h3>
              <p className="text-sm text-amber-700 mt-1">
                You have {pendingCount + inTransitCount} upcoming deliveries. Make sure your receiving area is prepared.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Delivery Table */}
      <DeliveryTable onSelectDelivery={setSelectedDelivery} />

      {/* Delivery Map */}
      <DeliveryMap selectedDelivery={selectedDelivery} />

      {/* Delivery Wizard Modal */}
      {showDeliveryWizard && (
        <DeliveryWizard onClose={() => setShowDeliveryWizard(false)} />
      )}
    </div>
  );
};

export default Deliveries;