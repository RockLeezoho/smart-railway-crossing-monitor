import React, { useMemo } from 'react';
import { Coordinate } from '../types';
import { Compass, Train, Radio, Sliders } from 'lucide-react';

interface CustomMapProps {
  a: Coordinate;
  crossing: Coordinate;
  b: Coordinate;
  trainPos: { lat: number; lng: number; segment: 'A_TO_CROSSING' | 'CROSSING_TO_B' };
  progress: number;
  sensorStates: {
    hallArriving: boolean;
    hallDeparting: boolean;
    ledRed: boolean;
    ledGreen: boolean;
    barrierPosition: number;
  };
}

export default function CustomMap({
  a,
  crossing,
  b,
  trainPos,
  progress,
  sensorStates,
}: CustomMapProps) {
  const width = 360;
  const height = 300;

  // Compute dynamic mathematical projection bounds
  const bounds = useMemo(() => {
    const lats = [a.lat, crossing.lat, b.lat];
    const lngs = [a.lng, crossing.lng, b.lng];
    
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat || 0.001;
    const lngSpan = maxLng - minLng || 0.001;

    // Apply healthy 25% viewport scaling margin
    return {
      minLat: minLat - latSpan * 0.25,
      maxLat: maxLat + latSpan * 0.25,
      minLng: minLng - lngSpan * 0.25,
      maxLng: maxLng + lngSpan * 0.25,
    };
  }, [a, crossing, b]);

  // Translate Geolocation to exact SVG Viewport coordinates
  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    // Invert Y axis for SVG (0 is top)
    const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    
    // Fallback clamp to ensure rendering occurs within bounds if math goes NaN
    return {
      x: isNaN(x) ? width / 2 : Math.max(20, Math.min(width - 20, x)),
      y: isNaN(y) ? height / 2 : Math.max(20, Math.min(height - 20, y)),
    };
  };

  const ptA = project(a.lat, a.lng);
  const ptCrossing = project(crossing.lat, crossing.lng);
  const ptB = project(b.lat, b.lng);
  const ptTrain = project(trainPos.lat, trainPos.lng);

  // Calculate rotation angle (tangent) for the train heading icon
  const trainRotation = useMemo(() => {
    const startPt = trainPos.segment === 'A_TO_CROSSING' ? ptA : ptCrossing;
    const endPt = trainPos.segment === 'A_TO_CROSSING' ? ptCrossing : ptB;
    const dy = endPt.y - startPt.y;
    const dx = endPt.x - startPt.x;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    return angleDeg;
  }, [trainPos, ptA, ptCrossing, ptB]);

  return (
    <div className="relative bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-inner select-none h-[300px] shadow-sm">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-75" />

      {/* Map Scale / Preset Reference Watermark */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-semibold flex items-center space-x-1.5 text-slate-600 shadow-sm">
        <Compass className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
        <span>GPS MONITORING • 50m</span>
      </div>

      <svg 
        viewBox="0 0 360 300" 
        preserveAspectRatio="none" 
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      >
        <style>{`
          @keyframes ping-svg {
            0% {
              r: 6px;
              opacity: 0.9;
              stroke-width: 1.5;
            }
            100% {
              r: 32px;
              opacity: 0;
              stroke-width: 0.5;
            }
          }
          .animate-ping-svg {
            animation: ping-svg 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>

        {/* Sensor Range Indicator (Radar pulse around Crossing) */}
        {sensorStates.hallArriving && (
          <circle
            cx={ptCrossing.x}
            cy={ptCrossing.y}
            className="fill-rose-500/10 stroke-rose-500/40 animate-ping-svg"
          />
        )}

        <defs>
          {/* Visual glow filters */}
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Striped track patterns */}
          <pattern id="rail-pattern" width="10" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="3" x2="10" y2="3" stroke="#475569" strokeWidth="2" />
            <line x1="5" y1="0" x2="5" y2="6" stroke="#1e293b" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* Custom Decorative Landscape features */}
        <circle cx={40} cy={180} r="15" fill="#f1f5f9" opacity="0.8" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M 0 140 Q 50 120 120 150 T 240 130" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.5" />
        <path d="M 120 280 Q 180 250 250 270" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.5" />

        {/* Railway Trajectory Line Underlay */}
        <path
          d={`M ${ptA.x} ${ptA.y} L ${ptCrossing.x} ${ptCrossing.y} L ${ptB.x} ${ptB.y}`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Dynamic Railway Metal Track Overlay */}
        <path
          d={`M ${ptA.x} ${ptA.y} L ${ptCrossing.x} ${ptCrossing.y} L ${ptB.x} ${ptB.y}`}
          fill="none"
          stroke="url(#rail-pattern)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Secondary Road intersection crossing line (represented vertically/diagonally) */}
        <line
          x1={ptCrossing.x - 25}
          y1={ptCrossing.y + 40}
          x2={ptCrossing.x + 25}
          y2={ptCrossing.y - 40}
          stroke="#4b5563"
          strokeWidth="8"
          strokeDasharray="4 2"
        />
        <line
          x1={ptCrossing.x - 25}
          y1={ptCrossing.y + 40}
          x2={ptCrossing.x + 25}
          y2={ptCrossing.y - 40}
          stroke="#eab308"
          strokeWidth="2"
        />

        {/* -------------------- DRAW STATION A -------------------- */}
        <g transform={`translate(${ptA.x}, ${ptA.y})`}>
          <circle r="12" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" className="shadow-sm" />
          <circle r="4" fill="#6366f1" />
          <foreignObject x="-50" y="-32" width="100" height="20">
            <div className="text-center font-bold text-[9px] text-slate-800 tracking-wide bg-white/95 py-0.5 px-1 rounded border border-slate-200 shadow-sm truncate">
              {a.name}
            </div>
          </foreignObject>
        </g>

        {/* -------------------- DRAW STATION B -------------------- */}
        <g transform={`translate(${ptB.x}, ${ptB.y})`}>
          <circle r="12" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" className="shadow-sm" />
          <circle r="4" fill="#10b981" />
          <foreignObject x="-50" y="14" width="100" height="20">
            <div className="text-center font-bold text-[9px] text-slate-800 tracking-wide bg-white/95 py-0.5 px-1 rounded border border-slate-200 shadow-sm truncate">
              {b.name}
            </div>
          </foreignObject>
        </g>

        {/* -------------------- DRAW CROSSING / BARRIER -------------------- */}
        <g transform={`translate(${ptCrossing.x}, ${ptCrossing.y})`}>
          {/* Signal foundation */}
          <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />

          {/* LED indicator (Dynamic Color depending on active traffic states) */}
          <circle
            cx="0"
            cy="0"
            r="5"
            fill={sensorStates.ledRed ? '#ef4444' : sensorStates.ledGreen ? '#10b981' : '#64748b'}
            filter={sensorStates.ledRed ? 'url(#glow-red)' : sensorStates.ledGreen ? 'url(#glow-green)' : ''}
            className={sensorStates.ledRed ? 'animate-pulse' : ''}
          />

          {/* Graphical Barrier Arm representing angle rotation */}
          <line
            x1="0"
            y1="0"
            x2="24"
            y2="0"
            stroke="#ef4444"
            strokeWidth="3.5"
            strokeDasharray="4 2"
            transform={`rotate(${-sensorStates.barrierPosition})`}
            className="transition-transform duration-300 ease-out origin-left"
          />

          <foreignObject x="11" y="-30" width="110" height="20">
            <div className="font-bold text-[8px] text-slate-700 tracking-wide bg-white/95 px-1 py-0.5 rounded border border-slate-300 shadow-sm leading-none">
              Rào Chắn
            </div>
          </foreignObject>
        </g>

        {/* -------------------- ANIMATED TRAIN ICON -------------------- */}
        <g
          transform={`translate(${ptTrain.x}, ${ptTrain.y}) rotate(${trainRotation})`}
          className="transition-transform duration-100 ease-linear"
        >
          {/* Headlight cone */}
          <polygon
            points="10,-6 40,-20 40,20 10,6"
            fill="url(#lightGrad)"
            opacity="0.35"
          />

          {/* Train chassis base shadow */}
          <rect x="-18" y="-10" width="34" height="20" rx="4" fill="#020617" opacity="0.6" />
          
          {/* Train engine body (Vietnam iconic train color palette: blue & red) */}
          <rect x="-16" y="-8" width="30" height="16" rx="3" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1" />
          
          {/* Red decoration cockpit nose */}
          <path d="M 6 -8 L 14 -3 L 14 3 L 6 8 Z" fill="#dc2626" />

          {/* Windshield */}
          <rect x="5" y="-5" width="4" height="10" fill="#38bdf8" />

          {/* Animated cabin windows */}
          <rect x="-10" y="-7" width="4" height="2" fill="#e2e8f0" />
          <rect x="-4" y="-7" width="4" height="2" fill="#e2e8f0" />
          <rect x="-10" y="5" width="4" height="2" fill="#e2e8f0" />
          <rect x="-4" y="5" width="4" height="2" fill="#e2e8f0" />

          {/* Miniature blinking pantograph/indicator */}
          <circle cx="-12" cy="0" r="1.5" fill="#facc15" className="animate-ping" />
        </g>

        <defs>
          <linearGradient id="lightGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Embedded Live Status overlay */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 text-[10.5px] z-20 flex flex-col space-y-1 text-slate-700 shadow-md">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <span className={`w-2 h-2 rounded-full ${progress === 1 ? 'bg-emerald-500' : progress === 0 ? 'bg-slate-400' : 'bg-amber-500 animate-pulse'}`} />
          <span>Tàu Bắc Nam SE1</span>
        </div>
        <div className="text-[9.5px] text-slate-500 font-bold font-mono">
          {progress === 0 && 'Chưa di chuyển'}
          {progress > 0 && progress < 0.5 && 'Đang đến rào chắn'}
          {progress >= 0.5 && progress < 0.55 && 'Đang đi qua rào chắn'}
          {progress >= 0.55 && progress < 1 && 'Đã qua, di chuyển về B'}
          {progress === 1 && 'Đã về Ga an toàn'}
        </div>
      </div>
    </div>
  );
}
