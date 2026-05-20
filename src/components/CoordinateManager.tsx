import React, { useState } from 'react';
import { Coordinate, SimulationConfig } from '../types';
import { MAP_PRESETS } from '../utils';
import { Sliders, MapPin, Compass, Play, RotateCcw, Save } from 'lucide-react';

interface CoordinateManagerProps {
  a: Coordinate;
  setA: (val: Coordinate) => void;
  crossing: Coordinate;
  setCrossing: (val: Coordinate) => void;
  b: Coordinate;
  setB: (val: Coordinate) => void;
  simulationConfig: SimulationConfig;
  setSimulationConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
}

export default function CoordinateManager({
  a,
  setA,
  crossing,
  setCrossing,
  b,
  setB,
  simulationConfig,
  setSimulationConfig,
}: CoordinateManagerProps) {
  
  // Local temporary inputs state
  const [localA, setLocalA] = useState(a);
  const [localCrossing, setLocalCrossing] = useState(crossing);
  const [localB, setLocalB] = useState(b);

  const applyCoordinates = () => {
    setA(localA);
    setCrossing(localCrossing);
    setB(localB);
  };

  const loadPreset = (presetId: string) => {
    const preset = MAP_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setA(preset.a);
      setCrossing(preset.crossing);
      setB(preset.b);
      setLocalA(preset.a);
      setLocalCrossing(preset.crossing);
      setLocalB(preset.b);
      
      // Stop playback, reset progress to beginning
      setSimulationConfig(prev => ({
        ...prev,
        currentProgressPct: 0,
        isPlaying: false
      }));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
      {/* Config header */}
      <div className="flex items-center space-x-2 border-b border-slate-150 pb-3">
        <span className="text-xl">🛠️</span>
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-wide">QUẢN TRỊ TỌA ĐỘ VÀ ĐỊNH VỊ HÀNH TRÌNH</h3>
        </div>
      </div>

      {/* Preset select dropdown */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-indigo-600 font-mono block">CHỌN TUYẾN ĐƯỜNG MẪU (PRESETS)</label>
        <div className="grid grid-cols-1 gap-2">
          {MAP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className="p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 active:border-indigo-505 transition-all flex flex-col justify-start shadow-sm"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-indigo-600">{preset.label}</span>
                <span className="text-[8.5px] font-bold font-mono text-emerald-650 tracking-wider"></span>
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium mt-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Coordinate settings panel */}
      <div className="space-y-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800">ĐIỀU CHỈNH TOẠ ĐỘ GPS ĐIỂM CỐ ĐỊNH</span>
          <button
            onClick={applyCoordinates}
            className="flex items-center space-x-1 bg-indigo-600  text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Cập nhật Bản Đồ</span>
          </button>
        </div>

        {/* Station A Input Row */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-600 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block" />
            <span>Ga Đầu Khởi Hành (Ga A):</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={localA.name}
              onChange={(e) => setLocalA({ ...localA, name: e.target.value })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 outline-none"
              placeholder="Tên ga A"
            />
            <input
              type="number"
              value={localA.lat}
              onChange={(e) => setLocalA({ ...localA, lat: parseFloat(e.target.value) || 0 })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-indigo-650 font-semibold font-mono shadow-sm"
              step="0.0001"
              placeholder="Latitude"
            />
            <input
              type="number"
              value={localA.lng}
              onChange={(e) => setLocalA({ ...localA, lng: parseFloat(e.target.value) || 0 })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-indigo-650 font-semibold font-mono shadow-sm"
              step="0.0001"
              placeholder="Longitude"
            />
          </div>
        </div>

        {/* Barrier Crossing Input Row */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-600 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block" />
            <span>Giao Lộ Rào Chắn:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={localCrossing.name}
              onChange={(e) => setLocalCrossing({ ...localCrossing, name: e.target.value })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 outline-none"
              placeholder="Tên nút giao"
            />
            <input
              type="number"
              value={localCrossing.lat}
              onChange={(e) => setLocalCrossing({ ...localCrossing, lat: parseFloat(e.target.value) || 0 })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-indigo-650 font-semibold font-mono shadow-sm"
              step="0.0001"
              placeholder="Latitude"
            />
            <input
              type="number"
              value={localCrossing.lng}
              onChange={(e) => setLocalCrossing({ ...localCrossing, lng: parseFloat(e.target.value) || 0 })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-indigo-650 font-semibold font-mono shadow-sm"
              step="0.0001"
              placeholder="Longitude"
            />
          </div>
        </div>

        {/* Station B Input Row */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-600 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
            <span>Ga Cuối Đích Đến (Ga B):</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={localB.name}
              onChange={(e) => setLocalB({ ...localB, name: e.target.value })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 outline-none"
              placeholder="Tên ga B"
            />
            <input
              type="number"
              value={localB.lat}
              onChange={(e) => setLocalB({ ...localB, lat: parseFloat(e.target.value) || 0 })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-indigo-650 font-semibold font-mono shadow-sm"
              step="0.0001"
              placeholder="Latitude"
            />
            <input
              type="number"
              value={localB.lng}
              onChange={(e) => setLocalB({ ...localB, lng: parseFloat(e.target.value) || 0 })}
              className="bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-indigo-650 font-semibold font-mono shadow-sm"
              step="0.0001"
              placeholder="Longitude"
            />
          </div>
        </div>
      </div>

      {/* Trung tâm Giám Sát Điều Hướng Thủ Công */}
      <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl space-y-4 shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-800 block">THỬ NGHIỆM GHI ĐÈ VỊ TRÍ HÀNH TRÌNH</span>
          <span className="text-[10px] text-slate-500">Giả lập tọa độ tàu trực tiếp để kiểm định liên động thiết bị bảo an ngang đường</span>
        </div>

        {/* Slider for Current Progress Pct */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono font-semibold text-slate-500">
            <span>Khởi Điểm (0%)</span>
            <span className="text-indigo-650 font-black">{simulationConfig.currentProgressPct.toFixed(1)}% hành trình</span>
            <span>Ga Đích (100%)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={simulationConfig.currentProgressPct}
            onChange={(e) => {
              setSimulationConfig(prev => ({
                ...prev,
                currentProgressPct: parseFloat(e.target.value) || 0,
                isPlaying: false // pause auto-sim so manual slider overrides correctly
              }));
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
          />
        </div>

        {/* Speed Tuning Sliders */}
        <div className="space-y-3 pt-2.5 border-t border-slate-200">
          {/* Real Speed Kmh */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Vận tốc di chuyển thực tế:</span>
              <span className="text-emerald-700 font-extrabold">{simulationConfig.speedKmh} km/h</span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={simulationConfig.speedKmh}
              onChange={(e) => {
                setSimulationConfig(prev => ({
                  ...prev,
                  speedKmh: parseInt(e.target.value) || 45
                }));
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Speed Multiplier for System acceleration */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Tốc độ cập nhật GPS:</span>
              <span className="text-indigo-650 font-extrabold">x{simulationConfig.multiplier} lần</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={simulationConfig.multiplier}
              onChange={(e) => {
                setSimulationConfig(prev => ({
                  ...prev,
                  multiplier: parseInt(e.target.value) || 1
                }));
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
