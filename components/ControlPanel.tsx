import React, { useState } from 'react';
import { CustomerRequest, Cart } from '../types';
import { Bot, MapPin, Truck, Utensils, Zap, Loader2 } from 'lucide-react';

interface ControlPanelProps {
  carts: Cart[];
  request: CustomerRequest | null;
  onRequestCreate: (preference: string) => void;
  onRequestCancel: () => void;
  isProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  carts,
  request,
  onRequestCreate,
  onRequestCancel,
  isProcessing,
}) => {
  const [preference, setPreference] = useState('');

  const activeCarts = carts.filter(c => c.status !== 'OFFLINE').length;
  const matchedCart = request?.matchedCartId 
    ? carts.find(c => c.id === request.matchedCartId) 
    : null;

  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000] flex flex-col gap-4 pointer-events-none">
      
      {/* Header Card */}
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-100 pointer-events-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">CartConnect</h1>
              <p className="text-xs text-gray-500 font-medium">{activeCarts} Active Carts Nearby</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      {/* Action / Status Card */}
      <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-xl border border-gray-100 pointer-events-auto transition-all">
        
        {!request ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">What are you craving?</label>
              <div className="relative">
                <Utensils className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  placeholder="e.g., Tacos, Coffee, Spicy Food..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && preference && onRequestCreate(preference)}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700 flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <p>Click anywhere on the map to set your location, or we will use your GPS.</p>
            </div>

            <button
              onClick={() => onRequestCreate(preference)}
              disabled={!preference || isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              {isProcessing ? "AI Matching..." : "Find Nearest Cart"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="font-bold text-gray-800">Request Active</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${request.status === 'MATCHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {request.status}
              </span>
            </div>

            {matchedCart ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                     {matchedCart.name[0]}
                   </div>
                   <div>
                     <p className="font-bold text-indigo-900">{matchedCart.name}</p>
                     <p className="text-xs text-indigo-700">{matchedCart.inventory.join(', ')}</p>
                   </div>
                </div>
                
                {request.aiReasoning && (
                  <div className="bg-white/80 p-2 rounded text-xs text-gray-600 mt-2 flex gap-2">
                    <Bot size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                    <p>{request.aiReasoning}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 text-gray-500">
                 <Loader2 className="animate-spin mb-2 text-indigo-500" size={32} />
                 <p className="text-sm">Analyzing GPS data...</p>
              </div>
            )}

            <button
              onClick={onRequestCancel}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              Cancel Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;