import { GeoLocation } from '../types';

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export const calculateDistance = (loc1: GeoLocation, loc2: GeoLocation): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) *
      Math.cos(toRad(loc2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Simulate random movement for carts
export const moveLocationRandomly = (loc: GeoLocation, intensity: number = 0.001): GeoLocation => {
  return {
    lat: loc.lat + (Math.random() - 0.5) * intensity,
    lng: loc.lng + (Math.random() - 0.5) * intensity,
  };
};