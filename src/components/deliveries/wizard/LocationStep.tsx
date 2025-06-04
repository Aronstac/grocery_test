import React, { useEffect, useRef } from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { MapPin } from 'lucide-react';
import { DeliveryWizardValues } from './types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

const LocationStep = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { setFieldValue } = useFormikContext<DeliveryWizardValues>();

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 50.4489, lng: 30.4572 },
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    const addressInput = document.getElementById('location.address') as HTMLInputElement;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInput);
    autocompleteRef.current.bindTo('bounds', map);

    markerRef.current = new window.google.maps.Marker({
      map,
      draggable: true,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#1d4ed8",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff"
      }
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.geometry) return;

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      markerRef.current?.setPosition(place.geometry.location);
      setFieldValue('location.coordinates', {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    });

    markerRef.current.addListener('dragend', () => {
      const position = markerRef.current?.getPosition();
      if (position) {
        setFieldValue('location.coordinates', {
          lat: position.lat(),
          lng: position.lng()
        });
      }
    });

    // Draw delivery radius circles
    [5, 10, 15].forEach(radius => {
      new window.google.maps.Circle({
        strokeColor: '#1d4ed8',
        strokeOpacity: 0.2,
        strokeWeight: 2,
        fillColor: '#1d4ed8',
        fillOpacity: 0.05,
        map,
        center: { lat: 50.4489, lng: 30.4572 },
        radius: radius * 1000
      });
    });

  }, [setFieldValue]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
          Delivery Address
        </label>
        <div className="mt-1 relative">
          <Field
            type="text"
            name="location.address"
            id="location.address"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
            placeholder="Enter delivery address"
          />
          <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <ErrorMessage
          name="location.address"
          component="div"
          className="mt-1 text-sm text-red-600"
        />
      </div>

      <div>
        <label htmlFor="location.unit" className="block text-sm font-medium text-gray-700">
          Apartment/Unit Number (Optional)
        </label>
        <Field
          type="text"
          name="location.unit"
          id="location.unit"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter apartment or unit number"
        />
      </div>

      <div>
        <label htmlFor="location.accessInstructions" className="block text-sm font-medium text-gray-700">
          Access Instructions (Optional)
        </label>
        <Field
          as="textarea"
          name="location.accessInstructions"
          id="location.accessInstructions"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add any special instructions for accessing the location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Location on Map
        </label>
        <div ref={mapRef} className="h-[300px] w-full rounded-lg border border-gray-300" />
      </div>
    </div>
  );
};

export default LocationStep;