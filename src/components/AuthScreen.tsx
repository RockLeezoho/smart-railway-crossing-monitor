import React, { useState } from 'react';
import { User, Lock, ShieldCheck, AlertCircle, ArrowRight, Smartphone, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

interface AuthScreenProps {
  onAuthSuccess: (userData: { token: string; username: string; displayName: string }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanDisplayName = displayName.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    if (isRegisterMode && !cleanDisplayName) {
      setErrorMsg('Vui lòng nhập tên hiển thị.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        // Register flow
        const res = await registerUser(cleanUsername, cleanPassword, cleanDisplayName);
        if (res.username) {
          // Auto-login or toggle back to login screen with success message
          setIsRegisterMode(false);
          setErrorMsg(null);
          // Auto log in the user using the newly registered account
          const loginRes = await loginUser(cleanUsername, cleanPassword);
          if (loginRes.token) {
            onAuthSuccess({
              token: loginRes.token,
              username: loginRes.username!,
              displayName: loginRes.displayName!,
            });
          } else {
            setErrorMsg('Đăng ký thành công! Hãy đăng nhập lại.');
          }
        } else {
          setErrorMsg(res.message || 'Đăng ký thất bại.');
        }
      } else {
        // Login flow
        const res = await loginUser(cleanUsername, cleanPassword);
        if (res.token) {
          onAuthSuccess({
            token: res.token,
            username: res.username!,
            displayName: res.displayName!,
          });
        } else {
          setErrorMsg(res.message || 'Đăng nhập thất bại.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi kết nối máy chủ API. Vui lòng kiểm tra lại địa chỉ IP của Server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-[400px] bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl z-10 flex flex-col space-y-6">

        {/* Title Block */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Smartphone className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">Smart Railway Monitor</h1>
            <p className="text-[10px] text-slate-400 font-medium">Hệ thống Giám sát & Bảo an Đường ngang Đô thị</p>
            <h2 className="text-[11px] font-extrabold text-slate-300 tracking-widest uppercase mt-3.5 bg-slate-900/40 py-1.5 px-3 rounded-full inline-block border border-slate-800/40">
              {isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
            </h2>
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className={`p-3 rounded-2xl border flex items-start space-x-2 text-[11px] font-semibold transition ${errorMsg.includes('thành công')
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
            }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Display Name Input (Only on Register Mode) */}
          {isRegisterMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">HỌ VÀ TÊN:</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 outline-none transition"
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">TÊN ĐĂNG NHẬP:</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 outline-none transition"
                placeholder="Nhập tên đăng nhập"
                autoCapitalize="none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">MẬT KHẨU:</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 outline-none transition"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-xs uppercase py-3.5 px-4 rounded-2xl transition shadow-lg shadow-indigo-600/10 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>ĐANG XỬ LÝ...</span>
            ) : (
              <>
                <span>{isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="text-center pt-1.5">
          {!isRegisterMode ? (
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMsg(null);
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
            >
              Chưa có tài khoản? <span className="underline decoration-indigo-400 font-bold">Đăng ký ngay</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMsg(null);
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
            >
              Đã có tài khoản? <span className="underline decoration-indigo-400 font-bold">Đăng nhập</span>
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center pt-2.5 border-t border-slate-900/60">
          <p className="text-[9px] text-slate-500 font-mono">PTIT HA NOI • SYSTEM HARDWARE VER 1.2</p>
        </div>
      </div>
    </div>
  );
}
