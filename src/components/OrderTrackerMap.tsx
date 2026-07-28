import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Phone, MessageSquare, Compass, ShieldAlert, Sparkles, Navigation, User, ArrowLeft, RotateCcw } from 'lucide-react';

interface OrderTrackerMapProps {
  onBack?: () => void;
}

export default function OrderTrackerMap({ onBack }: OrderTrackerMapProps) {
  const { activeTrackedOrder, trackingStep, setTrackingStep, adminUpdateOrderStatus } = useApp();

  if (!activeTrackedOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-neutral-900/40 dark:bg-neutral-950/20 rounded-3xl border border-neutral-800">
        <Compass size={48} className="text-neutral-600 animate-spin-slow" />
        <h4 className="mt-4 font-extrabold text-white text-lg">No Active Live Tracking</h4>
        <p className="text-xs text-neutral-400 mt-2 max-w-sm">
          Once your subscription meal or trial order is dispatched from the kitchen, you will see real-time updates of your delivery partner on this map!
        </p>
      </div>
    );
  }

  const { id: orderId, userName, address, orderStatus, eta } = activeTrackedOrder;

  // Vijay Nagar Indore coordinates & landmarks mapped on a 1000x600 grid
  const kitchen = { x: 120, y: 480, name: "PUREATY Kitchen (Vijay Nagar)" };
  const checkpoints = [
    { x: 120, y: 480, name: "Kitchen Headquarters", statusText: "Food Prepared & Packed" },
    { x: 340, y: 410, name: "A.B. Road (Vijay Nagar)", statusText: "Cruising A.B. Road" },
    { x: 550, y: 280, name: "C21 Mall Area", statusText: "Near C21 Mall" },
    { x: 750, y: 220, name: "Meghdoot Garden Area", statusText: "Out for Delivery near Meghdoot Garden" },
    { x: 880, y: 150, name: "Customer's Gate", statusText: "Arrived at Your Gate!" }
  ];

  // Current driver location interpolating between checkpoints based on trackingStep (0-4)
  const driverPos = checkpoints[trackingStep] || kitchen;

  const getStatusMessage = () => {
    switch (orderStatus) {
      case 'cooking':
        return 'Our chefs are handcrafting your meal with pure ghee rotis...';
      case 'dispatched':
        return 'Dispatched! Suresh Kumar is on his way to your address.';
      case 'near_sector':
        return 'Out for Delivery! Suresh is nearby in Sector 4.';
      case 'delivered':
        return 'Tiffin Delivered! Hope you enjoy your healthy homemade food.';
      default:
        return 'Awaiting dispatch...';
    }
  };

  const getStepProgress = () => {
    if (orderStatus === 'delivered') return 100;
    return trackingStep * 25;
  };

  const handleSimulateStep = () => {
    if (trackingStep < 4) {
      const nextStep = trackingStep + 1;
      setTrackingStep(nextStep);
      
      let nextStatus: 'dispatched' | 'near_sector' | 'delivered' = 'dispatched';
      let nextEta = '15 mins';

      if (nextStep === 1) {
        nextStatus = 'dispatched';
        nextEta = '15 mins';
      } else if (nextStep === 2 || nextStep === 3) {
        nextStatus = 'near_sector';
        nextEta = nextStep === 2 ? '10 mins' : '4 mins';
      } else if (nextStep === 4) {
        nextStatus = 'delivered';
        nextEta = '0 mins';
      }

      adminUpdateOrderStatus(orderId, nextStatus, nextEta);
    }
  };

  const handleResetSimulation = () => {
    setTrackingStep(0);
    adminUpdateOrderStatus(orderId, 'dispatched', '20 mins');
  };

  return (
    <div className="bg-neutral-950 text-neutral-100 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl relative">
      
      {/* Top action header bar */}
      <div className="p-5 border-b border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Delivery Tracking</span>
            </div>
            <h3 className="text-base font-black text-white mt-0.5">Order #{orderId}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-neutral-500 font-bold block">Estimated Arrival</span>
            <span className="text-sm font-black text-orange-500">{orderStatus === 'delivered' ? 'ARRIVED' : eta}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-400 font-extrabold flex items-center gap-1.5">
            <Sparkles size={12} />
            Thermal-Lock Tiffin
          </div>
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Tracking Info Column */}
        <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-neutral-800 space-y-6 flex flex-col justify-between bg-neutral-900/30">
          
          <div className="space-y-5">
            {/* Status updates card */}
            <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider">Status</span>
                <span className="text-xs font-black text-emerald-400 uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800">
                  {orderStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                {getStatusMessage()}
              </p>

              {/* Slider timeline */}
              <div className="pt-2">
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${getStepProgress()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-500 mt-2">
                  <span className={trackingStep >= 0 ? 'text-emerald-400' : ''}>Kitchen</span>
                  <span className={trackingStep >= 2 ? 'text-emerald-400' : ''}>Transit</span>
                  <span className={trackingStep >= 4 ? 'text-emerald-400' : ''}>Arrived</span>
                </div>
              </div>
            </div>

            {/* Delivery Partner Details */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Your Delivery Executive</h4>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <div className="w-11 h-11 rounded-xl bg-emerald-600/30 border border-emerald-800 flex items-center justify-center text-emerald-400 font-black text-sm shadow-inner">
                  SK
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-extrabold text-white text-xs truncate">Suresh Kumar</h5>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <span className="text-yellow-500 font-bold">★ 4.9</span> • Honda Activa (MP-09-EL-4911)
                  </p>
                </div>
              </div>

              {/* Instant Call actions */}
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="tel:+919399372194"
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 text-neutral-300 transition-colors"
                >
                  <Phone size={13} className="text-emerald-500" />
                  Call Suresh
                </a>
                <button 
                  onClick={() => alert('Simulated WhatsApp chat with Suresh opened! "Hello Suresh, please drop the tiffin at my security gate if I don\'t answer."')}
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 text-neutral-300 transition-colors"
                >
                  <MessageSquare size={13} className="text-orange-500" />
                  Text Partner
                </button>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Delivery Address</h4>
              <div className="p-3.5 bg-neutral-900/30 border border-neutral-850 rounded-2xl space-y-1.5">
                <div className="flex gap-2 items-start text-xs text-neutral-300">
                  <MapPin size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-white block">{userName}</span>
                    <p className="text-[11px] leading-relaxed mt-0.5 text-neutral-400">{address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATION CONTROLS BOX */}
          <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-900/40 space-y-3 pt-3">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
              <Navigation size={12} className="animate-pulse" />
              Demo Simulator Dashboard
            </div>
            <p className="text-[10px] text-neutral-400 leading-normal">
              Simulate real-time driver movement step-by-step to test the map route, ETA countdown, and status transitions:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulateStep}
                disabled={trackingStep === 4}
                className={`py-2 px-3 rounded-lg text-[11px] font-black transition-colors text-center ${
                  trackingStep === 4 
                    ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {trackingStep === 4 ? 'Arrived' : 'Advance Partner'}
              </button>
              <button
                type="button"
                onClick={handleResetSimulation}
                className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-black transition-colors text-center flex items-center justify-center gap-1"
              >
                <RotateCcw size={10} />
                Restart
              </button>
            </div>
          </div>

        </div>

        {/* Right Map Canvas/SVG Column */}
        <div className="lg:col-span-8 p-4 relative bg-[#0e1320] flex flex-col justify-center min-h-[400px]">
          
          {/* Compass layout overlay */}
          <div className="absolute top-4 left-4 z-10 p-2.5 rounded-xl bg-neutral-900/85 backdrop-blur-xs border border-neutral-800 text-[10px] text-neutral-400 font-extrabold flex items-center gap-1.5">
            <Compass size={12} className="text-emerald-500 animate-spin-slow" />
            Indore Vijay Nagar Area Map
          </div>

          {/* Zoom/Pan info banner overlay */}
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-neutral-900/80 backdrop-blur-xs border border-neutral-800 text-[9px] text-neutral-500 font-bold flex items-center gap-1">
            <span>● Suresh Kumar:</span>
            <span className="text-emerald-400 font-extrabold">{checkpoints[trackingStep]?.statusText || 'Preparing'}</span>
          </div>

          {/* SVG MAP CANVAS */}
          <div className="w-full h-full min-h-[380px] bg-neutral-950/80 rounded-2xl border border-neutral-900 overflow-hidden relative shadow-inner">
            <svg 
              viewBox="0 0 1000 600" 
              className="w-full h-full max-h-[460px] select-none text-neutral-800"
              style={{ background: '#0a0d17' }}
            >
              <defs>
                <radialGradient id="glow-kitchen" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glow-customer" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glow-bike" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="road-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#065f46" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Neighborhood block outlines & parks */}
              {/* Meghdoot Garden Area */}
              <rect x="50" y="320" width="140" height="90" rx="15" fill="#042f1a" opacity="0.4" stroke="#064e3b" strokeWidth="1" />
              <text x="120" y="370" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">Meghdoot Park Area</text>

              {/* Vijay Nagar residential blocks */}
              <rect x="250" y="220" width="120" height="110" rx="10" fill="#111827" stroke="#1f2937" strokeWidth="1" />
              <rect x="250" y="450" width="140" height="110" rx="10" fill="#111827" stroke="#1f2937" strokeWidth="1" />
              <text x="310" y="510" fill="#4b5563" fontSize="10" fontWeight="bold" textAnchor="middle">Vijay Nagar Blocks</text>

              {/* Commercial Blocks */}
              <rect x="420" y="80" width="180" height="130" rx="15" fill="#111827" stroke="#1f2937" strokeWidth="1" />
              <text x="510" y="150" fill="#4b5563" fontSize="10" fontWeight="bold" textAnchor="middle">C21 Mall Area</text>

              {/* Main Play Ground */}
              <rect x="650" y="300" width="160" height="200" rx="20" fill="#042f1a" opacity="0.4" stroke="#064e3b" strokeWidth="1" />
              <text x="730" y="400" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">Vijay Nagar Play Ground</text>

              {/* Scheme No. 54 Area */}
              <rect x="800" y="40" width="160" height="90" rx="12" fill="#111827" stroke="#1f2937" strokeWidth="1" />
              <text x="880" y="90" fill="#4b5563" fontSize="10" fontWeight="bold" textAnchor="middle">Scheme No. 54</text>

              {/* Decorative Secondary Roads (Background Grid) */}
              <line x1="50" y1="200" x2="950" y2="200" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50" y1="120" x2="400" y2="120" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="200" y1="50" x2="200" y2="550" stroke="#1e293b" strokeWidth="2" strokeDasharray="10,5" />
              <line x1="400" y1="50" x2="400" y2="550" stroke="#1e293b" strokeWidth="2" />
              <line x1="620" y1="50" x2="620" y2="550" stroke="#1e293b" strokeWidth="2" />
              <line x1="820" y1="120" x2="820" y2="550" stroke="#1e293b" strokeWidth="1.5" />

              {/* CORE DELIVERY HIGHWAY PATH (Glow & Main Route lines) */}
              {/* Draw connecting roads path between checkpoints */}
              {/* Path: (120,480) -> (340,410) -> (550,280) -> (750,220) -> (880,150) */}
              <path 
                d="M 120 480 L 120 410 L 340 410 L 550 410 L 550 280 L 750 280 L 750 150 L 880 150" 
                fill="none" 
                stroke="#1f2937" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 120 480 L 120 410 L 340 410 L 550 410 L 550 280 L 750 280 L 750 150 L 880 150" 
                fill="none" 
                stroke="#065f46" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                opacity="0.8"
              />

              {/* Active completed route (Highlight green road completed) */}
              {/* We draw segments of path completed depending on trackingStep */}
              <path 
                d={`M 120 480 ${
                  trackingStep >= 1 ? 'L 120 410 L 340 410' : ''
                } ${
                  trackingStep >= 2 ? 'L 550 410 L 550 280' : ''
                } ${
                  trackingStep >= 3 ? 'L 750 280 L 750 150' : ''
                } ${
                  trackingStep >= 4 ? 'L 880 150' : ''
                }`}
                fill="none" 
                stroke="#10b981" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeDasharray="4,2"
                className="transition-all duration-1000"
              />

              {/* Landmarks / Checkpoint nodes on the map */}
              {checkpoints.map((pt, idx) => (
                <g key={pt.name}>
                  {idx !== 0 && idx !== checkpoints.length - 1 && (
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5" />
                  )}
                </g>
              ))}

              {/* KITCHEN SOURCE DECORATOR */}
              <circle cx={kitchen.x} cy={kitchen.y} r="45" fill="url(#glow-kitchen)" />
              <circle cx={kitchen.x} cy={kitchen.y} r="8" fill="#065f46" stroke="#10b981" strokeWidth="2.5" />
              <g transform={`translate(${kitchen.x - 45}, ${kitchen.y - 35})`}>
                <rect width="90" height="20" rx="6" fill="#064e3b" stroke="#047857" strokeWidth="1" />
                <text x="45" y="13" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">🍳 FM Kitchen HQ</text>
              </g>

              {/* CUSTOMER DESTINATION DECORATOR */}
              <circle cx={880} cy={150} r="45" fill="url(#glow-customer)" />
              <circle cx={880} cy={150} r="8" fill="#ea580c" stroke="#f97316" strokeWidth="2.5" />
              <g transform={`translate(${880 - 45}, ${150 - 35})`}>
                <rect width="90" height="20" rx="6" fill="#7c2d12" stroke="#ea580c" strokeWidth="1" />
                <text x="45" y="13" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">🏡 {userName.split(' ')[0]}'s Home</text>
              </g>

              {/* MOVING DELIVERY EXECUTIVE BIKER ICON */}
              {/* Calculated dynamic location based on step. Interpolating along coordinates */}
              {/* Step 0: 120,480 | Step 1: 340,410 | Step 2: 550,280 | Step 3: 750,220 | Step 4: 880,150 */}
              {(() => {
                let currentX = 120;
                let currentY = 480;

                if (trackingStep === 0) {
                  currentX = 120; currentY = 480;
                } else if (trackingStep === 1) {
                  currentX = 340; currentY = 410;
                } else if (trackingStep === 2) {
                  currentX = 550; currentY = 280;
                } else if (trackingStep === 3) {
                  currentX = 750; currentY = 150;
                } else if (trackingStep === 4) {
                  currentX = 880; currentY = 150;
                }

                return (
                  <g className="transition-all duration-1000 ease-out">
                    {/* Ring Halo glow around biker */}
                    <circle cx={currentX} cy={currentY} r="32" fill="url(#glow-bike)" className="animate-pulse" />
                    
                    {/* Dark Background marker */}
                    <circle cx={currentX} cy={currentY} r="16" fill="#111827" stroke="#10b981" strokeWidth="2.5" className="shadow-lg" />
                    
                    {/* Custom Scooter Mini-icon */}
                    <g transform={`translate(${currentX - 10}, ${currentY - 10})`}>
                      <path 
                        d="M19 15h-1.5l-1-3H13v3h-2l-2-6H5v1h3l2 6h4v-3h2l1 3H19v-1z M6 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm11 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" 
                        fill="#10b981" 
                      />
                    </g>
                    
                    {/* Tiny Driver Name Tag */}
                    <g transform={`translate(${currentX - 35}, ${currentY - 32})`}>
                      <rect width="70" height="14" rx="4" fill="#10b981" opacity="0.9" />
                      <text x="35" y="10" fill="#022c22" fontSize="7" fontWeight="black" textAnchor="middle">🚴 Suresh (S{trackingStep})</text>
                    </g>
                  </g>
                );
              })()}

            </svg>
          </div>

        </div>

      </div>

      {/* Safety Policy Info Banner footer */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Pre-insulated steel tiffins retain heat at 72°C for over 6 hours.
        </span>
        <span className="text-neutral-500">
          Last updated: Just now
        </span>
      </div>

    </div>
  );
}
