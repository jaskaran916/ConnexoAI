import React, { useState, useEffect, useCallback } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import { Cart, CustomerRequest, GeoLocation } from './types';
import { MOCK_CARTS, DEFAULT_CENTER } from './constants';
import { moveLocationRandomly } from './services/geoService';
import { findBestMatchWithAI } from './services/geminiService';

const App: React.FC = () => {
  const [carts, setCarts] = useState<Cart[]>(MOCK_CARTS);
  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation>(DEFAULT_CENTER);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Simulation Loop: Move carts randomly every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCarts((prevCarts) =>
        prevCarts.map((cart) => ({
          ...cart,
          location: moveLocationRandomly(cart.location),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 2. Initial Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Using default location:", error);
        }
      );
    }
  }, []);

  // 3. Handle Map Click (Simulate user moving)
  const handleMapClick = useCallback((lat: number, lng: number) => {
    // Only allow moving if no active request or strictly for demo purposes
    if (!request) {
      setUserLocation({ lat, lng });
    }
  }, [request]);

  // 4. Handle Create Request
  const handleCreateRequest = async (preference: string) => {
    setIsProcessing(true);
    
    // Create preliminary request object
    const newRequest: CustomerRequest = {
      id: Date.now().toString(),
      location: userLocation,
      itemPreference: preference,
      timestamp: Date.now(),
      status: 'PENDING',
    };
    
    setRequest(newRequest);

    // Call Gemini AI to find best match
    const match = await findBestMatchWithAI(newRequest, carts);

    if (match) {
        // Update request with match details
        setRequest(prev => prev ? ({
            ...prev,
            status: 'MATCHED',
            matchedCartId: match.cartId,
            aiReasoning: match.reasoning
        }) : null);

        // Update Cart Status
        setCarts(prev => prev.map(c => 
            c.id === match.cartId ? { ...c, status: 'BUSY' as const } : c
        ));
    }

    setIsProcessing(false);
  };

  const handleCancelRequest = () => {
    if (request?.matchedCartId) {
        // Free up the cart
        setCarts(prev => prev.map(c => 
            c.id === request.matchedCartId ? { ...c, status: 'IDLE' as const } : c
        ));
    }
    setRequest(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      <ControlPanel
        carts={carts}
        request={request}
        onRequestCreate={handleCreateRequest}
        onRequestCancel={handleCancelRequest}
        isProcessing={isProcessing}
      />
      <div className="flex-grow relative z-0">
        <MapView
          carts={carts}
          request={request}
          userLocation={userLocation}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
};

export default App;