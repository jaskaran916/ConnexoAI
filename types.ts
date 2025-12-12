export interface GeoLocation {
  lat: number;
  lng: number;
}

export enum CartStatus {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export interface Cart {
  id: string;
  name: string;
  description: string;
  location: GeoLocation;
  status: CartStatus;
  inventory: string[];
  rating: number;
}

export interface CustomerRequest {
  id: string;
  location: GeoLocation;
  itemPreference: string;
  timestamp: number;
  status: 'PENDING' | 'MATCHED' | 'COMPLETED';
  matchedCartId?: string;
  aiReasoning?: string;
}

export interface MatchResult {
  cartId: string;
  reasoning: string;
  estimatedArrivalMinutes: number;
}