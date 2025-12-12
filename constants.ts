import { Cart, CartStatus } from './types';

// Default center (San Francisco)
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
export const DEFAULT_ZOOM = 14;

export const MOCK_CARTS: Cart[] = [
  {
    id: 'c1',
    name: 'Taco Titan',
    description: 'Authentic street tacos and burritos.',
    location: { lat: 37.7749, lng: -122.4194 },
    status: CartStatus.IDLE,
    inventory: ['Tacos', 'Burritos', 'Soda'],
    rating: 4.8,
  },
  {
    id: 'c2',
    name: 'Burger Bliss',
    description: 'Gourmet smash burgers.',
    location: { lat: 37.7849, lng: -122.4094 },
    status: CartStatus.IDLE,
    inventory: ['Burgers', 'Fries', 'Shakes'],
    rating: 4.5,
  },
  {
    id: 'c3',
    name: 'Vegan Voyager',
    description: 'Plant-based street food.',
    location: { lat: 37.7649, lng: -122.4294 },
    status: CartStatus.BUSY,
    inventory: ['Vegan Wraps', 'Salads', 'Smoothies'],
    rating: 4.9,
  },
  {
    id: 'c4',
    name: 'Curry Cruiser',
    description: 'Spicy indian curries on the go.',
    location: { lat: 37.7700, lng: -122.4100 },
    status: CartStatus.IDLE,
    inventory: ['Curry', 'Naan', 'Mango Lassi'],
    rating: 4.6,
  },
  {
    id: 'c5',
    name: 'Coffee Cartel',
    description: 'Espresso and pastries.',
    location: { lat: 37.7800, lng: -122.4300 },
    status: CartStatus.IDLE,
    inventory: ['Coffee', 'Latte', 'Croissants'],
    rating: 4.7,
  }
];

export const MAP_TILE_LAYER = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';