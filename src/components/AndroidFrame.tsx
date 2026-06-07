import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMockFrame: boolean;
  setIsMockFrame: (val: boolean) => void;
}

export default function AndroidFrame({
  children,
  activeTab,
  setActiveTab,
  isMockFrame,
  setIsMockFrame,
}: AndroidFrameProps) {
  const [timeStr, setTimeStr] = useState('16:07');
  const [isRealMobile, setIsRealMobile] = useState(false);

  // Sync clock for simulated mobile view
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Screen size & Capacitor platform detection
  useEffect(() => {
    const checkMobile = () => {
      const isNative = Capacitor.isNativePlatform();
      setIsRealMobile(isNative || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { id: 'map', label: 'Bản Đồ', icon: '🗺️' },
    { id: 'barrier', label: 'Thanh Chắn', icon: '🚧' },
    { id: 'config', label: 'Cài Đặt', icon: '⚙️' },
  ];

  // 1. Native Mobile or Mobile Viewport View (FULLSCREEN EDGE-TO-EDGE)
  if (isRealMobile) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
        {/* Main Content Area with Bottom Padding to prevent overlapping with fixed navbar */}
        <div className="flex-1 flex flex-col pb-[90px] pt-[env(safe-area-inset-top)]">
          {children}
        </div>

        {/* Floating Glassmorphism Mobile Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => {
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center w-20 py-1 transition relative rounded-xl"
              >
                <span
                  className={`text-2xl transition-transform duration-200 ${
                    isSel ? 'scale-120 -translate-y-0.5' : 'opacity-60'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] mt-1 font-semibold tracking-wide ${
                    isSel ? 'text-indigo-600 font-bold' : 'text-slate-505'
                  }`}
                >
                  {item.label}
                </span>
                {isSel && (
                  <div className="w-4 h-1 bg-indigo-600 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Desktop PC View - Full Screen Mode (with Header Navigation Tabs)
  if (!isMockFrame) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {/* Premium Desktop Header with tabs */}
        <header className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚉</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Smart Rail Crossing Monitor</h1>
              <p className="text-xs text-slate-500 font-medium">Hệ thống Giám sát & Quản lý Đường sắt Đô thị</p>
            </div>
          </div>

          {/* Tab navigation inside PC header */}
          <nav className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === item.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => setIsMockFrame(true)}
            className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 font-semibold shadow-sm hover:shadow"
          >
            <Smartphone className="w-4 h-4" />
            <span>Xem ở chế độ Mobile Simulator</span>
          </button>
        </header>
        
        {/* Main content viewport */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6">
          {children}
        </div>
      </div>
    );
  }

  // 3. Desktop PC View - Mobile Frame Simulator Style
  return (
    <div className="min-h-screen bg-slate-100 bg-gradient-to-tr from-slate-150 via-slate-50 to-indigo-50/40 flex flex-col items-center justify-center py-6 px-4 select-none">
      {/* Desktop Helper Toggle */}
      <div className="mb-4 text-center">
        <button
          onClick={() => setIsMockFrame(false)}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer"
        >
          <Monitor className="w-4 h-4 text-indigo-500" />
          <span>Xem chế độ Toàn Màn Hình (PC)</span>
        </button>
      </div>

      {/* Realistic Mobile Device Container */}
      <div className="relative w-full max-w-[410px] h-[840px] bg-slate-50 rounded-[48px] border-8 border-slate-800 shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-200">
        
        {/* Dynamic Punch-hole / Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-850 ml-auto mr-3"></div>
        </div>

        {/* Android Status Bar */}
        <div className="bg-slate-50 text-slate-800 h-10 pt-2 px-6 flex justify-between items-center text-xs font-bold z-40 select-none border-b border-slate-100">
          <span className="text-[11px] tracking-wide mt-1 text-slate-700">{timeStr}</span>
          <div className="flex items-center space-x-2 mt-1 text-slate-700">
            <Signal className="w-3.5 h-3.5 text-slate-700" />
            <Wifi className="w-3.5 h-3.5 text-slate-700" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[9px] mr-0.5 text-indigo-650 font-extrabold">5G</span>
              <Battery className="w-4 h-4 text-slate-700" />
            </div>
          </div>
        </div>

        {/* Mobile Viewport Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 flex flex-col relative">
          {children}
        </div>

        {/* Android Navigation Action Bar (Bottom Tab Navigation Bar) */}
        <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex justify-around items-center z-40 shadow-lg">
          {navItems.map((item) => {
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center w-20 py-1 transition group rounded-xl cursor-pointer"
              >
                <span
                  className={`text-xl transition-transform duration-200 ${
                    isSel ? 'scale-125 -translate-y-0.5' : 'group-hover:scale-110 opacity-70'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] mt-1 font-semibold tracking-wide ${
                    isSel ? 'text-indigo-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
                {isSel && (
                  <div className="w-3 h-1 bg-indigo-600 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Thick Android Bottom gesture pill indicator */}
        <div className="bg-white pb-2 flex justify-center items-center">
          <div className="w-28 h-1 bg-slate-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
