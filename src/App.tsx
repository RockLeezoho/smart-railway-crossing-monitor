import React, { useState, useEffect, useMemo } from 'react';
import AndroidFrame from './components/AndroidFrame';
import CustomMap from './components/CustomMap';
import RouteTracker from './components/RouteTracker';
import ManualControls from './components/ManualControls';
import CoordinateManager from './components/CoordinateManager';
import { Coordinate, SensorStates, SimulationConfig } from './types';
import { getDistanceMeters, getTrainPositionOnPath, MAP_PRESETS } from './utils';
import { Layers, Sliders, MapPin, Cpu, Info, Check, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [isMockFrame, setIsMockFrame] = useState(true);

  // States for spatial coordinates of Stations & Crossing
  const [a, setA] = useState<Coordinate>(MAP_PRESETS[0].a);
  const [crossing, setCrossing] = useState<Coordinate>(MAP_PRESETS[0].crossing);
  const [b, setB] = useState<Coordinate>(MAP_PRESETS[0].b);

  // Simulation speed & distance parameters
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>({
    speedKmh: 50,
    totalDistanceMeters: 1000, // resolved in useEffect below
    currentProgressPct: 0,
    isPlaying: false,
    multiplier: 6,
  });

  // Calculate physical metrics dynamically on coordinate shift
  useEffect(() => {
    const distAtoCrossing = getDistanceMeters(a, crossing);
    const distCrossingToB = getDistanceMeters(crossing, b);
    setSimulationConfig((prev) => ({
      ...prev,
      totalDistanceMeters: distAtoCrossing + distCrossingToB,
    }));
  }, [a, crossing, b]);

  const progress = simulationConfig.currentProgressPct / 100;
  
  // Interpolated Train coordinate position on route path
  const trainPos = useMemo(() => {
    return getTrainPositionOnPath(a, crossing, b, progress);
  }, [a, crossing, b, progress]);

  // Spatial Distance metrics
  const distanceToCrossing = useMemo(() => {
    if (progress >= 0.5) return 0;
    return getDistanceMeters(trainPos, crossing);
  }, [trainPos, crossing, progress]);

  const distanceToB = useMemo(() => {
    if (progress >= 1) return 0;
    if (progress < 0.5) {
      return getDistanceMeters(trainPos, crossing) + getDistanceMeters(crossing, b);
    }
    return getDistanceMeters(trainPos, b);
  }, [trainPos, crossing, b, progress]);

  // Auto-calculated physical sensor simulation parameters
  // Approach zone is 350 meters before crossing on segment A to Crossing
  const isApproachingZone = progress > 0 && progress < 0.5 && distanceToCrossing <= 350;
  // Crossing zone is immediately after crossing up to 5% progress
  const isCrossingZone = progress >= 0.5 && progress < 0.56;

  // Hall sensors triggers
  const hallArriving = isApproachingZone;
  const hallDeparting = isCrossingZone;

  // Manual Override gates setup
  const [manualOverride, setManualOverride] = useState(false);
  const [manualBarrierPosition, setManualBarrierPosition] = useState(90); // default open

  // Auto barrier calculations
  const autoBarrierPosition = (isApproachingZone || isCrossingZone) ? 0 : 90;
  const finalBarrierPosition = manualOverride ? manualBarrierPosition : autoBarrierPosition;

  // LED lights active status
  const ledRed = (isApproachingZone || isCrossingZone);
  const ledGreen = !ledRed;

  // Information LCD displays text
  const lcdMessage = useMemo(() => {
    if (progress === 0) {
      return `${a.name.toUpperCase()} \nTRẠNG THÁI: CHỜ CHẠY`;
    }
    if (progress > 0 && progress < 0.3) {
      return `TÀU SE1 KHỞI HÀNH\nKC CHẮN: ${Math.round(distanceToCrossing)} MÉT`;
    }
    if (isApproachingZone) {
      return `CẢNH BÁO TÀU ĐẾN!\nHẠ CHẮN - CHÚ Ý NHÌN KIỂM`;
    }
    if (isCrossingZone) {
      return `NGUY HIỂM: TÀU ĐANG QUA\nĐƯỜNG NGANG KHÓA`;
    }
    if (progress >= 0.56 && progress < 0.8) {
      return `TÀU QUA AN TOÀN!\nĐÃ NÂNG RAO CHẮN TỰ ĐỘNG`;
    }
    if (progress === 1) {
      return `HÀNH TRÌNH HOÀN TẤT\nTẦU SE1 ĐÃ CẬP ${b.name.toUpperCase()}`;
    }
    return `TÀU DI CHUYỂN VỀ B\nKC ĐÍCH: ${Math.round(distanceToB)} MÉT`;
  }, [progress, distanceToCrossing, distanceToB, a, b, isApproachingZone, isCrossingZone]);

  // Simulation Clock Tick Loop
  useEffect(() => {
    if (!simulationConfig.isPlaying) return;

    const tickMs = 100;
    const interval = setInterval(() => {
      setSimulationConfig((prev) => {
        if (prev.currentProgressPct >= 100) {
          return {
            ...prev,
            currentProgressPct: 100,
            isPlaying: false,
          };
        }

        // speed * time
        const speedMps = (prev.speedKmh * 1000) / 3600;
        const progressDeltaMeters = speedMps * (tickMs / 1000) * prev.multiplier;
        const progressPctDelta = (progressDeltaMeters / prev.totalDistanceMeters) * 100;
        
        const nextProgress = Math.min(100, prev.currentProgressPct + progressPctDelta);

        return {
          ...prev,
          currentProgressPct: nextProgress,
          isPlaying: nextProgress < 100,
        };
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [simulationConfig.isPlaying, simulationConfig.speedKmh, simulationConfig.totalDistanceMeters, simulationConfig.multiplier]);

  // Reset helper
  const resetCrossingStates = () => {
    setManualOverride(false);
    setManualBarrierPosition(90);
    setSimulationConfig(prev => ({
      ...prev,
      currentProgressPct: 0,
      isPlaying: false
    }));
  };

  const sensorStates: SensorStates = {
    hallArriving,
    hallDeparting,
    ledRed,
    ledGreen,
    buzzerActive: finalBarrierPosition === 0 || ledRed,
    barrierPosition: finalBarrierPosition,
    barrierManualOverride: manualOverride,
    lcdMessage,
  };

  return (
    <AndroidFrame
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isMockFrame={isMockFrame}
      setIsMockFrame={setIsMockFrame}
    >
      {/* Outer Scroll Container inside Frame */}
      <div className="flex-1 overflow-y-auto pb-4 space-y-4">
        {/* Dynamic header depending on the active View Controller */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100 px-5 pt-4 pb-3 border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xl">
              {activeTab === 'map' && '🗺️'}
              {activeTab === 'barrier' && '🚧'}
              {activeTab === 'config' && '⚙️'}
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">
                {activeTab === 'map' && 'Định Vị Hành Trình Tàu'}
                {activeTab === 'barrier' && 'An Toàn Rào Chắn'}
                {activeTab === 'config' && 'CẤU HÌNH ĐỊNH VỊ TOẠ ĐỘ'}
              </h2>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[9px] font-mono text-emerald-700 font-bold animate-pulse">
            ONLINE
          </div>
        </div>

        {/* Outer view swapper */}
        <div className="px-4 space-y-4">
          
          {/* Main Map + Tracker controller TAB */}
          {activeTab === 'map' && (
            <>
              {/* Fake Google Maps Search Floating bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">TUYẾN TÀU HOẠT ĐỘNG</p>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                      SE1: Ga Hà Nội ↔ Bình Triệu 
                    </p>
                  </div>
                </div>
                <div className="bg-indigo-50 text-[10px] text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg border border-indigo-100">
                  Phát Sóng
                </div>
              </div>

              {/* Geo Vector Map Container */}
              <CustomMap
                a={a}
                crossing={crossing}
                b={b}
                trainPos={trainPos}
                progress={progress}
                sensorStates={sensorStates}
              />

              {/* Navigation Tracking Drawer / bottom sheet */}
              <RouteTracker
                a={a}
                crossing={crossing}
                b={b}
                progress={progress}
                simulationConfig={simulationConfig}
                setSimulationConfig={setSimulationConfig}
                distanceToCrossing={distanceToCrossing}
                distanceToB={distanceToB}
              />
            </>
          )}

          {/* Barrier Hardware status tab */}
          {activeTab === 'barrier' && (
            <>
              <ManualControls
                sensorStates={sensorStates}
                toggleManualOverride={() => setManualOverride(!manualOverride)}
                manuallySetBarrier={(pos) => setManualBarrierPosition(pos)}
                resetCrossingStates={resetCrossingStates}
              />
            </>
          )}

          {/* System Settings & GPS configuration tab */}
          {activeTab === 'config' && (
            <CoordinateManager
              a={a}
              setA={setA}
              crossing={crossing}
              setCrossing={setCrossing}
              b={b}
              setB={setB}
              simulationConfig={simulationConfig}
              setSimulationConfig={setSimulationConfig}
            />
          )}



        </div>
      </div>
    </AndroidFrame>
  );
}
