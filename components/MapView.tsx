import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Cart, CustomerRequest, CartStatus } from '../types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_TILE_LAYER, MAP_ATTRIBUTION } from '../constants';

interface MapViewProps {
  carts: Cart[];
  request: CustomerRequest | null;
  userLocation: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapView: React.FC<MapViewProps> = ({ carts, request, userLocation, onMapClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const requestMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        DEFAULT_ZOOM
      );

      L.tileLayer(MAP_TILE_LAYER, {
        attribution: MAP_ATTRIBUTION,
      }).addTo(map);

      mapInstanceRef.current = map;

      map.on('click', (e) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      // Cleanup happens on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update Cart Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Define icons
    const cartIconIdle = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const cartIconBusy = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const matchedIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-10 h-10 bg-green-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

    carts.forEach((cart) => {
      const isMatched = request?.matchedCartId === cart.id;
      
      let icon = cart.status === CartStatus.BUSY ? cartIconBusy : cartIconIdle;
      if (isMatched) icon = matchedIcon;

      if (markersRef.current[cart.id]) {
        // Update position
        markersRef.current[cart.id].setLatLng([cart.location.lat, cart.location.lng]);
        markersRef.current[cart.id].setIcon(icon);
      } else {
        // Create marker
        const marker = L.marker([cart.location.lat, cart.location.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${cart.name}</b><br/>${cart.inventory.join(', ')}`);
        markersRef.current[cart.id] = marker;
      }
    });

    // Cleanup removed carts (if any)
    Object.keys(markersRef.current).forEach((id) => {
      if (!carts.find((c) => c.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [carts, request]);

  // Update Request Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (request) {
      const requestIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (requestMarkerRef.current) {
        requestMarkerRef.current.setLatLng([request.location.lat, request.location.lng]);
      } else {
        requestMarkerRef.current = L.marker([request.location.lat, request.location.lng], {
          icon: requestIcon,
        }).addTo(map).bindPopup("Customer Waiting Here");
      }
    } else {
      if (requestMarkerRef.current) {
        requestMarkerRef.current.remove();
        requestMarkerRef.current = null;
      }
    }
  }, [request]);

   // Update User Marker
   useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    const userIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

    if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
            icon: userIcon,
            zIndexOffset: -100 // Keep below other markers
        }).addTo(map);
    }

  }, [userLocation]);


  return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};

export default MapView;