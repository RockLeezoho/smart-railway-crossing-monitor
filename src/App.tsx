import React, { useState, useEffect, useMemo } from 'react';
import AndroidFrame from './components/AndroidFrame';
import CustomMap from './components/CustomMap';
import RouteTracker from './components/RouteTracker';
import ManualControls from './components/ManualControls';
import CoordinateManager from './components/CoordinateManager';
import { Coordinate, SensorStates, SimulationConfig } from './types';
import { getDistanceMeters, getTrainPositionOnPath, MAP_PRESETS } from './utils';
import { Layers, Sliders, MapPin, Cpu, Info, Check, HelpCircle } from 'lucide-react';
import { fetchTrainStatus, fetchDeviceStatus, fetchSensorStatus, fetchCoordinates } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [isMockFrame, setIsMockFrame] = useState(true);

  // States for spatial coordinates of Stations & Crossing
  const [a, setA] = useState<Coordinate>(MAP_PRESETS[0].a);
  const [crossing, setCrossing] = useState<Coordinate>(MAP_PRESETS[0].crossing);
  const [b, setB] = useState<Coordinate>(MAP_PRESETS[0].b);



  // Backend Data States
  const [trainData, setTrainData] = useState({ latitude: 0, longitude: 0, speed: 0, distanceToBarrier: 0 });
  const [deviceData, setDeviceData] = useState({ ledRed: false, ledGreen: true, buzzer: false, lcd: 'Chờ kết nối', servo: 'UP' });
  const [sensorData, setSensorData] = useState({ hallA: false, hallB: false });

  // Polling backend
  useEffect(() => {
    const pollBackend = async () => {
      try {
        const [trainRes, devicesRes, sensorsRes, coordsRes] = await Promise.all([
          fetchTrainStatus().catch(() => null),
          fetchDeviceStatus().catch(() => null),
          fetchSensorStatus().catch(() => null),
          fetchCoordinates().catch(() => null)
        ]);

        if (trainRes) setTrainData(trainRes);
        if (devicesRes) setDeviceData(devicesRes);
        if (sensorsRes) setSensorData(sensorsRes);
        if (coordsRes) {
          if (coordsRes.stationA?.latitude) setA({ lat: coordsRes.stationA.latitude, lng: coordsRes.stationA.longitude, name: 'Ga A' });
          if (coordsRes.stationB?.latitude) setB({ lat: coordsRes.stationB.latitude, lng: coordsRes.stationB.longitude, name: 'Ga B' });
          if (coordsRes.barrier?.latitude) setCrossing({ lat: coordsRes.barrier.latitude, lng: coordsRes.barrier.longitude, name: 'Đường Ngang' });
        }
      } catch (err) {
        console.error('Error polling backend', err);
      }
    };

    const interval = setInterval(pollBackend, 1000);
    return () => clearInterval(interval);
  }, []);

  const progress = trainData.distanceToBarrier ? (getDistanceMeters(a, crossing) - trainData.distanceToBarrier) / (getDistanceMeters(a, crossing) + getDistanceMeters(crossing, b)) : 0;
  
  const trainPos = useMemo(() => {
    if (trainData.latitude === 0 && trainData.longitude === 0) {
      return getTrainPositionOnPath(a, crossing, b, 0);
    }
    return { lat: trainData.latitude, lng: trainData.longitude, name: 'Train SE1' };
  }, [trainData, a, crossing, b]);

  const distanceToCrossing = trainData.distanceToBarrier || 0;
  const distanceToB = getDistanceMeters(trainPos, b);

  // Manual Override gates setup
  const [manualOverride, setManualOverride] = useState(false);
  const [manualBarrierPosition, setManualBarrierPosition] = useState(90); // default open

  const finalBarrierPosition = manualOverride ? manualBarrierPosition : (deviceData.servo === 'DOWN' ? 0 : 90);

  // Reset helper
  const resetCrossingStates = () => {
    setManualOverride(false);
    setManualBarrierPosition(90);
  };

  // Dummy out simulation config since we rely on backend now
  const simulationConfig: SimulationConfig = {
    speedKmh: trainData.speed || 0,
    totalDistanceMeters: getDistanceMeters(a, crossing) + getDistanceMeters(crossing, b),
    currentProgressPct: progress * 100,
    isPlaying: true,
    multiplier: 1,
  };
  const setSimulationConfig = () => {};

  const sensorStates: SensorStates = {
    hallArriving: sensorData.hallA,
    hallDeparting: sensorData.hallB,
    ledRed: deviceData.ledRed,
    ledGreen: deviceData.ledGreen,
    buzzerActive: deviceData.buzzer,
    barrierPosition: finalBarrierPosition,
    barrierManualOverride: manualOverride,
    lcdMessage: deviceData.lcd,
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
