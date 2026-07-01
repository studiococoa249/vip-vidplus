"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Data tiruan (mock data) untuk folder
const MOCK_FOLDERS = [
  { id: 'f1', name: 'Foto Liburan Bali', color: 'blue', items: 12, modified: '28 Sep 2026', isStarred: true },
  { id: 'f2', name: 'Aset Marketing', color: 'purple', items: 45, modified: '15 Sep 2026', isStarred: false },
  { id: 'f3', name: 'Laporan 2026', color: 'emerald', items: 8, modified: '1 Okt 2026', isStarred: false },
  { id: 'f4', name: 'Desain Klien', color: 'pink', items: 23, modified: '20 Sep 2026', isStarred: true },
  { id: 'f5', name: 'Dokumen Pribadi', color: 'gray', items: 5, modified: '10 Sep 2026', isStarred: false },
];

export default function App() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState(MOCK_FOLDERS);

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

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStarFolder = (id: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, isStarred: !f.isStarred } : f));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 z-20 shrink-0">
        <div className="flex items-center shrink-0 mr-4 sm:mr-8">
          <span className="text-xl font-bold text-gray-800 tracking-tight hidden md:block">CloudSync</span>
        </div>

        <div className="flex-1 max-w-3xl relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          <input 
            type="text" 
            placeholder="Telusuri folder..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 hover:bg-gray-200/80 focus:bg-white text-gray-700 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm font-medium border border-transparent focus:border-blue-300 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 ml-4 sm:ml-8 shrink-0">
          <button className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 p-2 rounded-full transition-colors relative hidden sm:block">
            <i className="fa-regular fa-bell text-lg"></i>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="h-9 w-9 ml-1 sm:ml-2 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm border-2 border-white ring-2 ring-transparent hover:ring-blue-100 transition-all">
            US
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
        <div className="max-w-screen-2xl mx-auto">
          {filteredFolders.length === 0 ? (
            <div className="p-12 mt-10 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-folder-open text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Folder kosong</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Belum ada folder di sini.
              </p>
            </div>
          ) : (
            /* Layout responsif: grid-cols-2 untuk mobile, grid-cols-4+ untuk desktop */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredFolders.map(folder => (
                <FolderCard 
                  key={folder.id} 
                  folder={folder} 
                  onToggleStar={() => toggleStarFolder(folder.id)} 
                  onOpen={() => router.push(`/file?id=${folder.id}&name=${encodeURIComponent(folder.name)}`)}
                />
              ))}
            </div>
          )}
          
          <div className="h-12"></div>
        </div>
      </main>
    </div>
  );
}

interface Folder {
  id: string;
  name: string;
  color: string;
  items: number;
  modified: string;
  isStarred: boolean;
}

function FolderCard({ folder, onToggleStar, onOpen }: { folder: Folder; onToggleStar: () => void; onOpen: () => void }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    emerald: 'text-emerald-500',
    pink: 'text-pink-500',
    gray: 'text-gray-500'
  };
  const iconColor = colorMap[folder.color] || 'text-gray-500';

  return (
    <div onClick={onOpen} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full">
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <i className={`fa-solid fa-folder text-3xl sm:text-4xl ${iconColor} group-hover:scale-110 transition-transform`}></i>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStar(); }} 
          className="text-gray-300 hover:text-yellow-400 p-1 rounded-full transition-colors"
        >
          <i className={`fa-star ${folder.isStarred ? 'fa-solid text-yellow-400' : 'fa-regular'}`}></i>
        </button>
      </div>
      <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1 truncate group-hover:text-blue-600 transition-colors" title={folder.name}>
        {folder.name}
      </h3>
      <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mt-auto pt-1 sm:pt-2">
        <span>{folder.items} file</span>
      </div>
    </div>
  );
}