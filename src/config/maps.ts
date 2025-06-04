// Google Maps API Configuration
export const GOOGLE_MAPS_CONFIG = {
  mapsApiKey: 'AIzaSyCh-5B7bev5ZJrC_Nes3oGXQRkr78pDV64',
  placesApiKey: 'AIzaSyDx2TVbLgyU_pRwPcaWmzq6qz_ooNC_BFs',
  directionsApiKey: 'AIzaSyBa_XIzB35F9ZSZrc-_hmPqQ5T3DoD0SF4'
};

// KPI (Kyiv Polytechnic Institute) coordinates
export const MAP_DEFAULT_CENTER = {
  lat: 50.4489,
  lng: 30.4572
};

// Major Ukrainian cities for random delivery locations
export const DELIVERY_LOCATIONS = [
  { name: 'Lviv', lat: 49.8397, lng: 24.0297 },
  { name: 'Kharkiv', lat: 50.0000, lng: 36.2292 },
  { name: 'Odesa', lat: 46.4825, lng: 30.7233 },
  { name: 'Dnipro', lat: 48.4647, lng: 35.0462 },
  { name: 'Zaporizhzhia', lat: 47.8388, lng: 35.1396 },
  { name: 'Vinnytsia', lat: 49.2331, lng: 28.4682 },
  { name: 'Poltava', lat: 49.5883, lng: 34.5514 },
  { name: 'Chernihiv', lat: 51.4982, lng: 31.2893 },
  { name: 'Cherkasy', lat: 49.4444, lng: 32.0598 }
];

export const MAP_DEFAULT_ZOOM = 6; // Zoomed out to show more of Ukraine