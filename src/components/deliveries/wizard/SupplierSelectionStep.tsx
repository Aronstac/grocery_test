import React, { useState, useEffect, useRef } from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { Search, MapPin, DollarSign, Package } from 'lucide-react';
import { DELIVERY_LOCATIONS } from '../../../config/maps';

interface Supplier {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  price: number;
  availability: number;
  rating: number;
}

const mockSuppliers: Supplier[] = [
  {
    id: 'sup1',
    name: 'Fresh Farms Inc.',
    location: {
      lat: 50.4501,
      lng: 30.5234,
      address: 'Kyiv Central Market'
    },
    price: 120.50,
    availability: 100,
    rating: 4.8
  },
  {
    id: 'sup2',
    name: 'Valley Dairy Co.',
    location: {
      lat: 49.8397,
      lng: 24.0297,
      address: 'Lviv Food Hub'
    },
    price: 115.75,
    availability: 75,
    rating: 4.5
  },
  {
    id: 'sup3',
    name: 'Green Gardens',
    location: {
      lat: 48.4647,
      lng: 35.0462,
      address: 'Dnipro Fresh Market'
    },
    price: 118.25,
    availability: 50,
    rating: 4.6
  }
];

const SupplierSelectionStep = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const { setFieldValue, values } = useFormikContext<any>();
  const markerClustererRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 49.0, lng: 31.0 },
      zoom: 6,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    setMap(mapInstance);

    // Create markers for suppliers
    const newMarkers = mockSuppliers.map(supplier => {
      const marker = new google.maps.Marker({
        position: supplier.location,
        map: mapInstance,
        title: supplier.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#1d4ed8",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff"
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold">${supplier.name}</h3>
            <p class="text-sm text-gray-600">${supplier.location.address}</p>
            <p class="text-sm text-gray-600">Price: $${supplier.price.toFixed(2)}</p>
            <p class="text-sm text-gray-600">Available: ${supplier.availability} units</p>
            <div class="mt-2">
              <span class="text-amber-500">★</span>
              <span class="text-sm text-gray-600">${supplier.rating}</span>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        setSelectedSupplier(supplier.id);
        setFieldValue('supplier', {
          id: supplier.id,
          name: supplier.name,
          price: supplier.price
        });
        infoWindow.open(mapInstance, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Dynamically import MarkerClusterer
    import('@googlemaps/markerclusterer').then(({ MarkerClusterer }) => {
      markerClustererRef.current = new MarkerClusterer({
        map: mapInstance,
        markers: newMarkers,
      });
    }).catch(error => {
      console.error('Error loading MarkerClusterer:', error);
    });

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }
    };
  }, [setFieldValue]);

  const filteredSuppliers = mockSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = supplier.price >= priceRange[0] && supplier.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSupplier === supplier.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => {
                  setSelectedSupplier(supplier.id);
                  setFieldValue('supplier', {
                    id: supplier.id,
                    name: supplier.name,
                    price: supplier.price
                  });
                  
                  if (map) {
                    map.panTo(supplier.location);
                    map.setZoom(12);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin size={14} className="mr-1" />
                      {supplier.location.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 flex items-center">
                      <DollarSign size={14} className="mr-1" />
                      {supplier.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Package size={14} className="mr-1" />
                      {supplier.availability} units
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-amber-500">★</span>
                  <span className="ml-1 text-sm text-gray-600">{supplier.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div ref={mapRef} className="h-[600px] w-full rounded-lg border border-gray-300" />
        </div>
      </div>

      <ErrorMessage
        name="supplier.id"
        component="div"
        className="mt-1 text-sm text-red-600"
      />
    </div>
  );
};

export default SupplierSelectionStep;