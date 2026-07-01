"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();

  useEffect(() => {
    if (!document.querySelector('#google-fonts')) {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    
    if (!document.querySelector('#font-awesome')) {
      const link = document.createElement('link');
      link.id = 'font-awesome';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white sm:bg-slate-50 flex flex-col justify-center items-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Viewport container on mobile, centered card on desktop */}
      <div className="w-full max-w-md min-h-screen sm:min-h-0 bg-white flex flex-col justify-between p-6 sm:p-10 sm:rounded-[32px] sm:border sm:border-gray-200/80 sm:shadow-xl sm:my-8">
        
        <div className="flex-grow flex flex-col justify-center py-6 sm:py-0">
          {/* Minimalist Mobile App Brand Header */}
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fa-solid fa-cloud text-lg text-white"></i>
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">CloudSync Mobile</span>
            </div>
          </div>
          
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Selamat Datang</h1>
            <p className="text-gray-500 text-sm mt-2">Masuk untuk mengelola dan mengakses file Anda di mana saja.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
                <input 
                  type="email" 
                  placeholder="nama@email.com" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-11 pr-4 py-4 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400/80 text-sm font-medium" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-11 pr-4 py-4 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400/80 text-sm font-medium" 
                  required 
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                <span className="font-semibold">Ingat saya</span>
              </label>
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Lupa Password?</span>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 mt-2 flex items-center justify-center space-x-2">
              <span>Masuk Sekarang</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </form>

          {/* Social Login Options */}
          <div className="mt-8">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Atau masuk dengan</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button type="button" className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                <i className="fa-brands fa-google text-red-500"></i>
                <span>Google</span>
              </button>
              <button type="button" className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                <i className="fa-brands fa-apple text-black"></i>
                <span>Apple</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 shrink-0">
          Belum punya akun? <span className="text-blue-600 font-bold hover:underline cursor-pointer">Daftar</span>
        </div>
        
      </div>
    </div>
  );
}