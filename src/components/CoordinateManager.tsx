import React, { useState } from 'react';
import { Coordinate, SimulationConfig } from '../types';
import { MAP_PRESETS } from '../utils';
import { Sliders, MapPin, Compass, Play, RotateCcw, Save, Link, Globe } from 'lucide-react';
import { testApiConnection } from '../services/api';

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

  // API Server connection states
  const [apiUrl, setApiUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('API_BASE_URL') || '';
    }
    return '';
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const applyCoordinates = () => {
    setA(localA);
    setCrossing(localCrossing);
    setB(localB);
  };

  const handleSaveConnection = async () => {
    setTestStatus('testing');
    const cleanedUrl = apiUrl.trim();
    // Test connectivity
    const success = await testApiConnection(cleanedUrl);
    if (success || cleanedUrl === '') {
      localStorage.setItem('API_BASE_URL', cleanedUrl);
      setTestStatus(cleanedUrl === '' ? 'idle' : 'success');
    } else {
      setTestStatus('failed');
      // Still save to let them override if they wish, but keep warning badge
      localStorage.setItem('API_BASE_URL', cleanedUrl);
    }
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
          <h3 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">CẤU HÌNH THIẾT LẬP HỆ THỐNG</h3>
        </div>
      </div>

      {/* 1. API Server Connection Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Globe className="w-5 h-5 text-indigo-600" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">KẾT NỐI MÁY CHỦ TRUNG TÂM</h4>
            <p className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
              Nhập IP máy tính khi chạy trên điện thoại thật (ví dụ: http://192.168.1.50:8080)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col space-y-1">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => {
                setApiUrl(e.target.value);
                setTestStatus('idle');
              }}
              className="bg-white border border-slate-350 rounded-xl p-2.5 text-xs text-slate-800 font-mono shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-full"
              placeholder="Đại chỉ IP Server (bỏ trống = localhost)"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Status badge */}
            <div className="text-[10px] font-bold font-mono">
              {testStatus === 'idle' && (
                <span className="text-slate-400">Chưa kiểm tra</span>
              )}
              {testStatus === 'testing' && (
                <span className="text-indigo-650 animate-pulse">Checking...</span>
              )}
              {testStatus === 'success' && (
                <span className="text-emerald-600">Đã kết nối máy chủ</span>
              )}
              {testStatus === 'failed' && (
                <span className="text-rose-600 font-extrabold">Không có phản hồi</span>
              )}
            </div>

            <button
              onClick={handleSaveConnection}
              disabled={testStatus === 'testing'}
              className="bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-[10px] uppercase px-4 py-2 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              Lưu & Kiểm Tra
            </button>
          </div>
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
              className="p-3.5 text-left bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 active:border-indigo-505 transition-all flex flex-col justify-start shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-indigo-600">{preset.label}</span>
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium mt-1 leading-normal">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Coordinate settings panel */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 uppercase">ĐIỀU CHỈNH GPS ĐIỂM CỐ ĐỊNH</span>
          <button
            onClick={applyCoordinates}
            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9.5px] uppercase px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu Tọa Độ</span>
          </button>
        </div>

        {/* Station A Input Stacked */}
        <div className="space-y-1.5 border-b border-slate-200/80 pb-3 last:border-0 last:pb-0">
          <label className="text-[10px] font-semibold text-slate-650 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block" />
            <span className="font-bold">Ga Đầu Khởi Hành (Ga A):</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={localA.name}
              onChange={(e) => setLocalA({ ...localA, name: e.target.value })}
              className="w-full bg-white border border-slate-350 rounded-xl p-2.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Tên ga A"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 font-bold">LAT:</span>
                <input
                  type="number"
                  value={localA.lat}
                  onChange={(e) => setLocalA({ ...localA, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-350 rounded-xl pl-9 pr-2 py-2 text-xs text-indigo-650 font-semibold font-mono shadow-sm focus:border-indigo-500 outline-none"
                  step="0.000001"
                  placeholder="Vĩ độ"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 font-bold">LNG:</span>
                <input
                  type="number"
                  value={localA.lng}
                  onChange={(e) => setLocalA({ ...localA, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-350 rounded-xl pl-9 pr-2 py-2 text-xs text-indigo-650 font-semibold font-mono shadow-sm focus:border-indigo-500 outline-none"
                  step="0.000001"
                  placeholder="Kinh độ"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Barrier Crossing Input Stacked */}
        <div className="space-y-1.5 border-b border-slate-200/80 pb-3 last:border-0 last:pb-0">
          <label className="text-[10px] font-semibold text-slate-650 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block" />
            <span className="font-bold">Giao Lộ Rào Chắn:</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={localCrossing.name}
              onChange={(e) => setLocalCrossing({ ...localCrossing, name: e.target.value })}
              className="w-full bg-white border border-slate-350 rounded-xl p-2.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Tên rào chắn"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 font-bold">LAT:</span>
                <input
                  type="number"
                  value={localCrossing.lat}
                  onChange={(e) => setLocalCrossing({ ...localCrossing, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-350 rounded-xl pl-9 pr-2 py-2 text-xs text-indigo-650 font-semibold font-mono shadow-sm focus:border-indigo-500 outline-none"
                  step="0.000001"
                  placeholder="Vĩ độ"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 font-bold">LNG:</span>
                <input
                  type="number"
                  value={localCrossing.lng}
                  onChange={(e) => setLocalCrossing({ ...localCrossing, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-350 rounded-xl pl-9 pr-2 py-2 text-xs text-indigo-650 font-semibold font-mono shadow-sm focus:border-indigo-500 outline-none"
                  step="0.000001"
                  placeholder="Kinh độ"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Station B Input Stacked */}
        <div className="space-y-1.5 pb-1">
          <label className="text-[10px] font-semibold text-slate-650 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
            <span className="font-bold">Ga Cuối Đích Đến (Ga B):</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={localB.name}
              onChange={(e) => setLocalB({ ...localB, name: e.target.value })}
              className="w-full bg-white border border-slate-350 rounded-xl p-2.5 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Tên ga B"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 font-bold">LAT:</span>
                <input
                  type="number"
                  value={localB.lat}
                  onChange={(e) => setLocalB({ ...localB, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-350 rounded-xl pl-9 pr-2 py-2 text-xs text-indigo-650 font-semibold font-mono shadow-sm focus:border-indigo-500 outline-none"
                  step="0.000001"
                  placeholder="Vĩ độ"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 font-bold">LNG:</span>
                <input
                  type="number"
                  value={localB.lng}
                  onChange={(e) => setLocalB({ ...localB, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-350 rounded-xl pl-9 pr-2 py-2 text-xs text-indigo-650 font-semibold font-mono shadow-sm focus:border-indigo-500 outline-none"
                  step="0.000001"
                  placeholder="Kinh độ"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trung tâm Giám Sát Điều Hướng Thủ Công */}
      <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl space-y-4 shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-800 block">THỬ NGHIỆM GHI ĐÈ VỊ TRÍ HÀNH TRÌNH</span>
          <span className="text-[10px] text-slate-500 font-medium">Giả lập tọa độ tàu trực tiếp để kiểm định liên động thiết bị bảo an ngang đường</span>
        </div>

        {/* Slider for Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-500">
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
                isPlaying: false
              }));
            }}
            className="w-full h-2 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Speed Tuning Sliders */}
        <div className="space-y-3.5 pt-3.5 border-t border-slate-200">
          {/* Real Speed Kmh */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-semibold">
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
            <div className="flex justify-between text-[10px] font-mono font-semibold">
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
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
