import React, { useState } from 'react';
import { Map, AlertTriangle, Navigation2, Volume2, VolumeX, Layers } from 'lucide-react';
import Card from '../../components/ui/Card';
import DeliveryMap from '../../components/deliveries/DeliveryMap';
import { useAppContext } from '../../context/AppContext';

const RouteMap: React.FC = () => {
  const { deliveries } = useAppContext();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showGasStations, setShowGasStations] = useState(true);
  const [showParking, setShowParking] = useState(false);
  const [showRestAreas, setShowRestAreas] = useState(false);

  // Get the first pending or in-transit delivery as the current delivery
  const currentDelivery = deliveries.find(d => 
    d.status === 'pending' || d.status === 'in-transit'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Route Navigation</h1>
          <p className="text-sm text-gray-500 mt-1">Follow your delivery route and find essential services</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg ${
              voiceEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={voiceEnabled ? 'Disable voice navigation' : 'Enable voice navigation'}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`p-2 rounded-lg ${
              showTraffic ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={showTraffic ? 'Hide traffic' : 'Show traffic'}
          >
            <Navigation2 size={20} />
          </button>
          <button
            onClick={() => {
              setShowGasStations(!showGasStations);
              setShowParking(!showParking);
              setShowRestAreas(!showRestAreas);
            }}
            className={`p-2 rounded-lg ${
              showGasStations ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            title="Toggle all service points"
          >
            <Layers size={20} />
          </button>
        </div>
      </div>

      {currentDelivery ? (
        <>
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800">Active Delivery</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Delivering to {currentDelivery.supplierName}. Expected by{' '}
                  {new Date(currentDelivery.expectedDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </Card>

          <DeliveryMap 
            selectedDelivery={currentDelivery}
            isDriverView={true}
            showTraffic={showTraffic}
            showGasStations={showGasStations}
            showParking={showParking}
            showRestAreas={showRestAreas}
            voiceEnabled={voiceEnabled}
          />
        </>
      ) : (
        <Card>
          <div className="py-8 text-center">
            <Map size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Active Route</h3>
            <p className="text-gray-500 mt-2">Wait for your next delivery assignment</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RouteMap;