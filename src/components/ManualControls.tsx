import React, { useState, useEffect, useRef } from 'react';
import { Radio, Lightbulb, Keyboard, Info, RotateCcw, ShieldCheck, AlertOctagon, Volume2, VolumeX } from 'lucide-react';
import { SensorStates } from '../types';

interface ManualControlsProps {
  sensorStates: SensorStates;
  toggleManualOverride: () => void;
  manuallySetBarrier: (position: number) => void;
  resetCrossingStates: () => void;
}

export default function ManualControls({
  sensorStates,
  toggleManualOverride,
  manuallySetBarrier,
  resetCrossingStates,
}: ManualControlsProps) {
  const isClosed = sensorStates.barrierPosition === 0;

  // Web Audio state and effects for the Vietnamese railway bell sound simulator
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (audioEnabled && sensorStates.buzzerActive) {
      // Metallic crossing bell ringing synthesizer using AudioContext
      const playBellDing = () => {
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioContextRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // Pitch A5 (High bell tone)
          
          // Sound envelope mimicking physical impact of Vietnamese crossing gongs
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.015);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.25);
        } catch (e) {
          console.error('AudioContext error:', e);
        }
      };

      // Play initially and on repeat interval
      playBellDing();
      intervalRef.current = setInterval(playBellDing, 450);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [audioEnabled, sensorStates.buzzerActive]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-150 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🔘</span>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-wide">GIÁM SÁT THIẾT BỊ PHẦN CỨNG</h3>
            <p className="text-[10px] text-slate-500 font-mono">2x HALL • 2x LED • 1x BUZZER • 1x SG90 SERVO</p>
          </div>
        </div>
        <button
          onClick={resetCrossingStates}
          className="text-slate-500 hover:text-indigo-600 transition p-1 hover:bg-slate-100 rounded-lg"
          title="Reset trạng thái"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Sensor States row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Hall Sensor 1: Tàu Đến */}
        <div className={`p-3 rounded-2xl border transition shadow-sm ${sensorStates.hallArriving ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200/80'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Cảm biến Hall 1</span>
            <Radio className={`w-4 h-4 ${sensorStates.hallArriving ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">PORT INDUCT</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${sensorStates.hallArriving ? 'bg-rose-500 shadow-glow-red' : 'bg-slate-300'}`} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
              {sensorStates.hallArriving ? 'TÀU ĐANG ĐẾN' : 'KHÔNG PHÁT HIỆN'}
            </span>
          </div>
        </div>

        {/* Hall Sensor 2: Tàu Đi */}
        <div className={`p-3 rounded-2xl border transition shadow-sm ${sensorStates.hallDeparting ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200/80'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Cảm biến Hall 2</span>
            <Radio className={`w-4 h-4 ${sensorStates.hallDeparting ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">PORT INDUCT</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${sensorStates.hallDeparting ? 'bg-emerald-500 shadow-glow-green' : 'bg-slate-300'}`} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
              {sensorStates.hallDeparting ? 'TÀU ĐÃ QUA' : 'KHÔNG PHÁT HIỆN'}
            </span>
          </div>
        </div>
      </div>

      {/* LEDs monitoring row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Red LED Indicator */}
        <div className={`p-3 rounded-2xl flex items-center justify-between border shadow-sm ${sensorStates.ledRed ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-xl ${sensorStates.ledRed ? 'bg-rose-500/10' : 'bg-slate-200'}`}>
              <Lightbulb className={`w-4 h-4 ${sensorStates.ledRed ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-[10px] text-slate-600 font-bold font-mono">LED ĐỎ</p>
              <p className="text-xs font-bold text-slate-800 uppercase">{sensorStates.ledRed ? 'ĐANG NHẤP NHÁY' : 'TẮT'}</p>
            </div>
          </div>
          <span className={`w-3 h-3 rounded-full ${sensorStates.ledRed ? 'bg-red-500 animate-ping' : 'bg-slate-300'}`} />
        </div>

        {/* Green LED Indicator */}
        <div className={`p-3 rounded-2xl flex items-center justify-between border shadow-sm ${sensorStates.ledGreen ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-xl ${sensorStates.ledGreen ? 'bg-emerald-500/10' : 'bg-slate-200'}`}>
              <Lightbulb className={`w-4 h-4 ${sensorStates.ledGreen ? 'text-emerald-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-[10px] text-slate-600 font-bold font-mono">LED XANH</p>
              <p className="text-xs font-bold text-slate-800 uppercase">{sensorStates.ledGreen ? 'SÁNG' : 'TẮT'}</p>
            </div>
          </div>
          <span className={`w-3 h-3 rounded-full ${sensorStates.ledGreen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        </div>
      </div>

      {/* Real-time Speaker Buzzer Monitoring Panel */}
      <div className={`p-3.5 rounded-2xl border mb-4 shadow-sm transition-all duration-200 ${
        sensorStates.buzzerActive 
          ? 'bg-amber-50/65 border-amber-300' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl transition-colors duration-200 ${
              sensorStates.buzzerActive 
                ? 'bg-amber-100 text-amber-700 animate-bounce' 
                : 'bg-slate-200 text-slate-400'
            }`}>
              {sensorStates.buzzerActive ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-slate-600 font-bold font-mono">CÒI HOẢ LIÊN ĐỚI</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`text-xs font-bold ${sensorStates.buzzerActive ? 'text-amber-800' : 'text-slate-700'}`}>
                  {sensorStates.buzzerActive ? 'CHUÔNG ĐANG REO' : 'YÊN LẶNG'}
                </span>
                {sensorStates.buzzerActive && (
                  <span className="flex space-x-0.5 items-end h-3">
                    <span className="w-0.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-0.5 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <span className="w-0.5 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all duration-200 flex items-center space-x-1.5 shadow-sm cursor-pointer ${
              audioEnabled
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Nghe thử âm thanh thực tế trong trình duyệt"
          >
            <span>{audioEnabled ? '🔔 Bật loa' : '🔇 Tắt loa'}</span>
          </button>
        </div>
      </div>

      {/* LCD Alphanumeric Simulator Display */}
      <div className="bg-slate-900 border-2 border-slate-300 rounded-2xl p-3.5 mb-5 font-mono relative shadow-inner">
        <div className="absolute top-1.5 right-1.5 text-[8.5px] uppercase tracking-wider text-green-500/55 animate-pulse">
          LCD 1602 SHIELD
        </div>
        <div className="text-[10px] text-slate-400 font-bold mb-1">MÀN HÌNH THÔNG TIN:</div>
        <div className="text-green-400 bg-black/60 p-2.5 rounded-lg text-sm border border-slate-800 min-h-[44px] flex items-center tracking-wide leading-relaxed shadow-inner">
         {sensorStates.lcdMessage}
        </div>
      </div>

      {/* Manual Actuator Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800">BẢNG PHÍM ĐIỀU KHIỂN THỦ CÔNG</span>
          {sensorStates.barrierManualOverride ? (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full text-[9px] font-bold animate-pulse">
              GhI ĐÈ ĐANG KÍCH HOẠT
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
              TỰ ĐỘNG
            </span>
          )}
        </div>

        {/* Override Toggle Big Switch Button */}
        <button
          onClick={toggleManualOverride}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 border shadow-sm cursor-pointer ${
            sensorStates.barrierManualOverride
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>
            {sensorStates.barrierManualOverride ? 'HUỶ QUYỀN GHI ĐÈ THỦ CÔNG' : 'GHI ĐÈ TAY CHẮN'}
          </span>
        </button>

        {/* Servo SG90 commands */}
        <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono block text-slate-500">SERVO SG90 ANGLE</span>
            <span className="text-xs font-bold text-slate-700">
              Góc chắn: {sensorStates.barrierPosition}° ({isClosed ? 'ĐÃ HẠ' : 'ĐÃ MỞ'})
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              disabled={!sensorStates.barrierManualOverride}
              onClick={() => manuallySetBarrier(90)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                !sensorStates.barrierManualOverride
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isClosed
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              MỞ (90°)
            </button>
            <button
              disabled={!sensorStates.barrierManualOverride}
              onClick={() => manuallySetBarrier(0)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                !sensorStates.barrierManualOverride
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : !isClosed
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              HẠ (0°)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
