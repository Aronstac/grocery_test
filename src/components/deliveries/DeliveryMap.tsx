import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import Card from '../ui/Card';
import { GOOGLE_MAPS_CONFIG, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, DELIVERY_LOCATIONS } from '../../config/maps';
import { Truck, Clock, CheckCircle } from 'lucide-react';

interface DeliveryMapProps {
  selectedDelivery?: Delivery;
  isDriverView?: boolean;
  showTraffic?: boolean;
  showGasStations?: boolean;
  showParking?: boolean;
  showRestAreas?: boolean;
  voiceEnabled?: boolean;
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: google.maps.DirectionsStep[];
}

// Hash function to convert string ID to a consistent number
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({ 
  selectedDelivery,
  isDriverView = false,
  showTraffic = false,
  showGasStations = true,
  showParking = false,
  showRestAreas = false,
  voiceEnabled = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [servicePoints, setServicePoints] = useState<{[key: string]: google.maps.places.PlaceResult[]}>({
    gasStations: [],
    parking: [],
    restAreas: [],
    service: []
  });
  const markersRef = useRef<google.maps.Marker[]>([]);
  const serviceMarkersRef = useRef<{[key: string]: google.maps.Marker[]}>({
    gasStations: [],
    parking: [],
    restAreas: [],
    service: []
  });
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_CONFIG.mapsApiKey,
      version: "weekly",
      libraries: ["places"],
      language: "en", // Set English language
      region: "US" // Set region to US for English units
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: MAP_DEFAULT_CENTER,
          zoom: MAP_DEFAULT_ZOOM,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          language: "en" // Set English language for map labels
        });

        // Add warehouse marker
        new google.maps.Marker({
          position: MAP_DEFAULT_CENTER,
          map: mapInstance,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#1d4ed8",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff"
          },
          title: "KPI Warehouse"
        });

        // Initialize traffic layer
        trafficLayerRef.current = new google.maps.TrafficLayer();

        setMap(mapInstance);
        setDirectionsService(new google.maps.DirectionsService());
        const renderer = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#1d4ed8",
            strokeWeight: 5,
            strokeOpacity: 0.7
          }
        });
        setDirectionsRenderer(renderer);
      }
    });

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      Object.values(serviceMarkersRef.current).forEach(markers => 
        markers.forEach(marker => marker.setMap(null))
      );
      markersRef.current = [];
      serviceMarkersRef.current = {
        gasStations: [],
        parking: [],
        restAreas: [],
        service: []
      };
    };
  }, []);

  useEffect(() => {
    if (trafficLayerRef.current && map) {
      trafficLayerRef.current.setMap(showTraffic ? map : null);
    }
  }, [showTraffic, map]);

  useEffect(() => {
    if (!selectedDelivery || !directionsService || !directionsRenderer || !map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    Object.values(serviceMarkersRef.current).forEach(markers => 
      markers.forEach(marker => marker.setMap(null))
    );
    markersRef.current = [];
    serviceMarkersRef.current = {
      gasStations: [],
      parking: [],
      restAreas: [],
      service: []
    };

    // Get a consistent delivery location based on delivery ID using hash function
    const locationIndex = hashString(selectedDelivery.id) % DELIVERY_LOCATIONS.length;
    const deliveryLocation = DELIVERY_LOCATIONS[locationIndex];

    // Create delivery marker
    const deliveryMarker = new google.maps.Marker({
      position: deliveryLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: selectedDelivery.status === 'delivered' ? "#059669" : "#d97706",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff"
      },
      title: `${deliveryLocation.name} - Delivery #${selectedDelivery.id}`
    });

    markersRef.current.push(deliveryMarker);

    // Calculate and display route - Note that origin and destination are swapped
    directionsService.route({
      origin: deliveryLocation, // Start from delivery location
      destination: MAP_DEFAULT_CENTER, // End at Politechnika
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
      language: "en", // Set English language for directions
      unitSystem: google.maps.UnitSystem.IMPERIAL // Use miles instead of kilometers
    }, (result, status) => {
      if (status === "OK" && result) {
        directionsRenderer.setDirections(result);

        // Update route info
        const route = result.routes[0];
        if (route.legs[0]) {
          setRouteInfo({
            distance: route.legs[0].distance?.text || "N/A",
            duration: route.legs[0].duration?.text || "N/A",
            steps: route.legs[0].steps
          });

          // Search for service points along the route
          const bounds = new google.maps.LatLngBounds();
          route.legs[0].steps.forEach(step => bounds.extend(step.start_location));

          const placesService = new google.maps.places.PlacesService(map);
          
          // Search for gas stations
          if (showGasStations) {
            placesService.nearbySearch({
              bounds,
              type: "gas_station",
              rankBy: google.maps.places.RankBy.DISTANCE,
              language: "en"
            }, (results, status) => {
              if (status === "OK" && results) {
                setServicePoints(prev => ({ ...prev, gasStations: results }));
                results.forEach(place => createServiceMarker(place, 'gasStations', map));
              }
            });
          }

          // Search for parking
          if (showParking) {
            placesService.nearbySearch({
              bounds,
              type: "parking",
              rankBy: google.maps.places.RankBy.DISTANCE,
              language: "en"
            }, (results, status) => {
              if (status === "OK" && results) {
                setServicePoints(prev => ({ ...prev, parking: results }));
                results.forEach(place => createServiceMarker(place, 'parking', map));
              }
            });
          }

          // Search for rest areas and service centers
          if (showRestAreas) {
            placesService.nearbySearch({
              bounds,
              type: "car_repair",
              rankBy: google.maps.places.RankBy.DISTANCE,
              language: "en"
            }, (results, status) => {
              if (status === "OK" && results) {
                setServicePoints(prev => ({ ...prev, service: results }));
                results.forEach(place => createServiceMarker(place, 'service', map));
              }
            });
          }

          // If voice navigation is enabled and we're in driver view
          if (isDriverView && voiceEnabled) {
            const speech = new SpeechSynthesisUtterance();
            speech.text = `Route to Politechnika calculated. Distance: ${route.legs[0].distance?.text}, estimated time: ${route.legs[0].duration?.text}`;
            speech.lang = 'en-US';
            window.speechSynthesis.speak(speech);
          }
        }
      }
    });

    // Add info window for selected delivery
    const deliveryInfo = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold">Delivery #${selectedDelivery.id}</h3>
          <p class="text-sm text-gray-600">${selectedDelivery.supplierName}</p>
          <p class="text-sm text-gray-600">Location: ${deliveryLocation.name}</p>
          <p class="text-sm text-gray-600">Status: ${selectedDelivery.status}</p>
          <p class="text-sm text-gray-600">Items: ${selectedDelivery.items.length}</p>
        </div>
      `
    });

    deliveryMarker.addListener("click", () => {
      deliveryInfo.open(map, deliveryMarker);
    });

    // Fit bounds to show the entire route
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(MAP_DEFAULT_CENTER);
    bounds.extend(deliveryLocation);
    map.fitBounds(bounds, 50);
  }, [selectedDelivery, directionsService, directionsRenderer, map, showGasStations, showParking, showRestAreas, isDriverView, voiceEnabled]);

  const createServiceMarker = (place: google.maps.places.PlaceResult, type: string, map: google.maps.Map) => {
    if (!place.geometry?.location) return;

    const iconUrls = {
      gasStations: "https://maps.google.com/mapfiles/ms/icons/gas.png",
      parking: "https://maps.google.com/mapfiles/ms/icons/parking.png",
      service: "https://maps.google.com/mapfiles/ms/icons/mechanic.png"
    };

    const marker = new google.maps.Marker({
      position: place.geometry.location,
      map,
      icon: {
        url: iconUrls[type as keyof typeof iconUrls],
        scaledSize: new google.maps.Size(32, 32)
      },
      title: place.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold">${place.name}</h3>
          <p class="text-sm text-gray-600">${place.vicinity}</p>
          ${place.rating ? `<p class="text-sm text-gray-600">Rating: ${place.rating} ⭐</p>` : ''}
          ${place.opening_hours?.isOpen() ? 
            '<p class="text-sm text-green-600">Open Now</p>' : 
            '<p class="text-sm text-red-600">Closed</p>'
          }
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    serviceMarkersRef.current[type].push(marker);
  };

  return (
    <Card title="Navigation" className="mt-6">
      {isDriverView && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
            <Truck className="text-blue-600\" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900">Distance</p>
              <p className="text-lg font-semibold text-blue-700">{routeInfo?.distance}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg">
            <Clock className="text-amber-600" size={20} />
            <div>
              <p className="text-sm font-medium text-amber-900">ETA</p>
              <p className="text-lg font-semibold text-amber-700">{routeInfo?.duration}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <div>
              <p className="text-sm font-medium text-green-900">Service Points</p>
              <p className="text-lg font-semibold text-green-700">
                {Object.values(servicePoints).reduce((sum, points) => sum + points.length, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1">
          <div ref={mapRef} className="h-[400px] w-full rounded-lg" />
        </div>

        {isDriverView && routeInfo?.steps && (
          <div className="lg:w-80">
            <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto">
              <h3 className="font-medium text-gray-900 mb-4">Turn-by-Turn Directions</h3>
              <div className="space-y-4">
                {routeInfo.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm" dangerouslySetInnerHTML={{ __html: step.instructions }} />
                      <p className="text-xs text-gray-500 mt-1">{step.distance?.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DeliveryMap;