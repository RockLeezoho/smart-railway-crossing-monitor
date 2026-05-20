import React, { useMemo } from 'react';
import { Play, Pause, RotateCcw, Compass, ArrowRight, ShieldAlert, CheckCircle2, Navigation, AlertTriangle } from 'lucide-react';
import { Coordinate, SimulationConfig } from '../types';

interface RouteTrackerProps {
  a: Coordinate;
  crossing: Coordinate;
  b: Coordinate;
  progress: number;
  simulationConfig: SimulationConfig;
  setSimulationConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  distanceToCrossing: number;
  distanceToB: number;
}

export default function RouteTracker({
  a,
  crossing,
  b,
  progress,
  simulationConfig,
  setSimulationConfig,
  distanceToCrossing,
  distanceToB,
}: RouteTrackerProps) {
  
  // Calculate simulated seconds remaining based on spatial parameters
  const timeRemainingSeconds = useMemo(() => {
    if (progress >= 1) return 0;
    
    // Constant speed simulation to calculate realistic tracking metrics
    const speedMps = (simulationConfig.speedKmh * 1000) / 3600;
    const remainingDistance = progress < 0.5 
      ? distanceToCrossing 
      : distanceToB;
    
    return speedMps > 0 ? Math.round(remainingDistance / speedMps) : 0;
  }, [progress, simulationConfig.speedKmh, distanceToCrossing, distanceToB]);

  const formattedTimeRemaining = useMemo(() => {
    if (progress >= 1) return 'Đã đến ga B';
    if (progress < 0.01) return 'Đang chờ xuất phát';
    
    const minutes = Math.floor(timeRemainingSeconds / 60);
    const seconds = timeRemainingSeconds % 60;
    
    if (minutes === 0) {
      return `${seconds} giây`;
    }
    return `${minutes} phút ${seconds} giây`;
  }, [timeRemainingSeconds, progress]);

  // Determine elegant accompanying alert notifications
  const notificationMsg = useMemo(() => {
    if (progress === 0) {
      return {
        text: `Tàu SE1 đang dừng đỗ tại ${a.name}. Quá trình khởi hành sắp bắt đầu. Cửa rào chắn Khâm Thiên đang mở an toàn.`,
        type: 'info',
      };
    }
    if (progress > 0 && progress < 0.3) {
      return {
        text: `Tàu đã khởi hành từ ${a.name}. Đang di chuyển ổn định với vận tốc ${simulationConfig.speedKmh}km/h. Sẽ đến rào chắn trong giây lát.`,
        type: 'info',
      };
    }
    if (progress >= 0.3 && progress < 0.5) {
      return {
        text: `CẢNH BÁO KHẨN CẤP: Tàu sắt đang đi vào khu vực cảm biến số 1! Thanh chắn rào đang tự động hạ xuống. Không vượt qua đường ngang!`,
        type: 'warning',
      };
    }
    if (progress >= 0.5 && progress < 0.55) {
      return {
        text: `ĐANG DI CHUYỂN QUA RÀO CHẮN: Tàu đang chiếm đóng đường rào chắn. Cả hai luồng đèn đỏ liên tục nháy khẩn cấp.`,
        type: 'danger',
      };
    }
    if (progress >= 0.55 && progress < 0.8) {
      return {
        text: `Tàu đã đi qua an toàn! Cảm biến Hall 2 đã nhận diện tín hiệu giải tỏa. Tay chắn rào tự động nâng lên góc 90 độ phục vụ xe cộ đường bộ.`,
        type: 'success',
      };
    }
    return {
      text: `Tàu SE1 chuẩn bị tiến vào ga đích ${b.name} làm thủ tục cập cảng. Lộ trình hoàn thiện 100%.`,
      type: 'success',
    };
  }, [progress, a, b, simulationConfig.speedKmh]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      {/* Simulation Master Playback Controls */}
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="text-slate-600">
          <span className="text-xs block font-bold text-slate-800">CHỈ HUY HÀNH TRÌNH TỰ ĐỘNG</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Play/Pause */}
          <button
            onClick={() => setSimulationConfig(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
            className={`p-2 rounded-xl transition font-medium text-xs flex items-center space-x-1 border ${
              simulationConfig.isPlaying
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
            }`}
          >
            {simulationConfig.isPlaying ? <Pause className="w-4 h-4 fill-amber-800" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{simulationConfig.isPlaying ? 'Tạm Dừng' : 'Kích Hoạt Tự Động'}</span>
          </button>
          
          {/* Reset button */}
          <button
            onClick={() => setSimulationConfig(prev => ({ ...prev, currentProgressPct: 0, isPlaying: false }))}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-250 text-slate-700 border border-slate-300 transition"
            title="Reset về vạch xuất phát A"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speedometer and Spatial Meters Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {/* Speed widget */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center shadow-sm">
          <Navigation className="w-4 h-4 text-emerald-600 mx-auto rotate-45 mb-1" />
          <span className="text-[9px] text-slate-600 font-bold block">VẬN TỐC</span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">{simulationConfig.speedKmh} km/h</span>
        </div>

        {/* Distance countdown */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center shadow-sm">
          <Compass className="w-4 h-4 text-indigo-600 mx-auto mb-1 animate-spin-slow" />
          <span className="text-[9px] text-slate-600 font-bold block">ĐẾN RÀO</span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">
            {progress >= 0.5 ? 'Đã đi qua' : `${Math.round(distanceToCrossing)}m`}
          </span>
        </div>

        {/* Remaining time */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center shadow-sm">
          <span className="text-sm mb-1 block">⏱️</span>
          <span className="text-[9px] text-slate-600 font-bold block">CÒN LẠI</span>
          <span className="text-xs font-extrabold text-rose-600 tracking-tight truncate block">
            {progress >= 0.5 ? `${Math.round(distanceToB)}m` : formattedTimeRemaining}
          </span>
        </div>
      </div>

      {/* Map Path Route indicators */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 font-sans text-sm relative">
        <div className="text-[10px] text-slate-500 font-bold mb-2">TIẾN TRÌNH TUYẾN SẮT:</div>
        
        {/* Visual progress bar with station pins */}
        <div className="relative pt-6 pb-2">
          {/* Route connector track */}
          <div className="absolute left-0 right-0 h-1.5 bg-slate-200 rounded-full top-1/2 -translate-y-1/2" />
          {/* Animated active train progress stream overlay */}
          <div 
            className="absolute left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full top-1/2 -translate-y-1/2 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />

          {/* Station A Pin */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className={`w-3.5 h-3.5 rounded-full border-2 ${progress >= 0 ? 'bg-indigo-600 border-indigo-300 shadow-glow' : 'bg-slate-200 border-slate-350'}`} />
            <span className="text-[10px] mt-1.5 font-bold text-slate-600">Ga A</span>
          </div>

          {/* Crossing Pin */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className={`w-3.5 h-3.5 rounded-full border-2 ${progress >= 0.5 ? 'bg-amber-500 border-amber-300 shadow-glow' : 'bg-slate-200 border-slate-350'}`} />
            <span className="text-[10px] mt-1.5 font-bold text-slate-600">Chắn</span>
          </div>

          {/* Station B Pin */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center font-bold">
            <div className={`w-3.5 h-3.5 rounded-full border-2 ${progress >= 1.0 ? 'bg-emerald-500 border-emerald-300 shadow-glow' : 'bg-slate-200 border-slate-350'}`} />
            <span className="text-[10px] mt-1.5 font-bold text-slate-600">Ga B</span>
          </div>
        </div>
      </div>

      {/* Advisory notifications drawer - resembling Android bus notifications */}
      <div className={`p-4 rounded-2xl border flex items-start space-x-3 transition-colors ${
        notificationMsg.type === 'danger'
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : notificationMsg.type === 'warning'
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-indigo-50 border-indigo-250 text-indigo-850'
      }`}>
        <div className="mt-0.5">
          {notificationMsg.type === 'danger' && <ShieldAlert className="w-5 h-5 text-rose-600" />}
          {notificationMsg.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
          {notificationMsg.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {notificationMsg.type === 'info' && <Navigation className="w-5 h-5 text-indigo-600 rotate-90" />}
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-1">CẬP NHẬT LỘ TRÌNH THỜI GIAN THỰC</h4>
          <p className="text-[11px] leading-relaxed font-medium opacity-95">
            {notificationMsg.text}
          </p>
        </div>
      </div>
    </div>
  );
}
