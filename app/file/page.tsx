"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FileItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'document';
  size: string;
  modified: string;
  isStarred: boolean;
  thumbnailColor?: string;
}

const MOCK_FILES: Record<string, FileItem[]> = {
  f1: [
    { id: 'm1', name: 'Sunset di Canggu.jpg', type: 'image', size: '4.2 MB', modified: '28 Sep 2026', isStarred: true, thumbnailColor: 'bg-orange-50 text-orange-500' },
    { id: 'm2', name: 'Vlog Pantai Pandawa.mp4', type: 'video', size: '84.5 MB', modified: '28 Sep 2026', isStarred: false, thumbnailColor: 'bg-blue-50 text-blue-500' },
    { id: 'm3', name: 'Koleksi Kuliner Bali.jpg', type: 'image', size: '3.1 MB', modified: '27 Sep 2026', isStarred: false, thumbnailColor: 'bg-orange-50 text-orange-500' },
    { id: 'm4', name: 'Video Tari Kecak.mp4', type: 'video', size: '120.3 MB', modified: '26 Sep 2026', isStarred: true, thumbnailColor: 'bg-blue-50 text-blue-500' },
  ],
  f2: [
    { id: 'm5', name: 'Brosur CloudSync.pdf', type: 'document', size: '8.4 MB', modified: '15 Sep 2026', isStarred: true, thumbnailColor: 'bg-red-50 text-red-500' },
    { id: 'm6', name: 'Teaser Product Launch.mp4', type: 'video', size: '45.1 MB', modified: '14 Sep 2026', isStarred: false, thumbnailColor: 'bg-blue-50 text-blue-500' },
    { id: 'm7', name: 'Banner Promo Instagram.png', type: 'image', size: '2.3 MB', modified: '10 Sep 2026', isStarred: false, thumbnailColor: 'bg-orange-50 text-orange-500' },
  ],
  f3: [
    { id: 'm8', name: 'Laporan Keuangan Q1.xlsx', type: 'document', size: '1.2 MB', modified: '1 Okt 2026', isStarred: false, thumbnailColor: 'bg-emerald-50 text-emerald-500' },
    { id: 'm9', name: 'Evaluasi Kinerja Bulanan.pdf', type: 'document', size: '3.5 MB', modified: '30 Sep 2026', isStarred: true, thumbnailColor: 'bg-red-50 text-red-500' },
  ],
  f4: [
    { id: 'm10', name: 'Mockup UI/UX App.fig', type: 'document', size: '18.2 MB', modified: '20 Sep 2026', isStarred: true, thumbnailColor: 'bg-purple-50 text-purple-500' },
    { id: 'm11', name: 'Video Feedback Klien.mp4', type: 'video', size: '62.0 MB', modified: '18 Sep 2026', isStarred: false, thumbnailColor: 'bg-blue-50 text-blue-500' },
  ],
  f5: [
    { id: 'm12', name: 'KTP & KK Scan.pdf', type: 'document', size: '2.0 MB', modified: '10 Sep 2026', isStarred: false, thumbnailColor: 'bg-red-50 text-red-500' },
    { id: 'm13', name: 'Sertifikat Kelulusan.pdf', type: 'document', size: '1.5 MB', modified: '8 Sep 2026', isStarred: false, thumbnailColor: 'bg-red-50 text-red-500' },
  ],
};

function FileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get('id') || 'f1';
  const folderName = searchParams.get('name') || 'Folder';

  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    // Load google fonts and font awesome if not loaded
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

    // Set files list based on folderId
    setFiles(MOCK_FILES[folderId] || []);
  }, [folderId]);

  const toggleStarFile = (id: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, isStarred: !f.isStarred } : f));
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-8 z-20 shrink-0">
        <button 
          onClick={() => router.push('/dashboard')}
          className="mr-3 sm:mr-4 text-gray-500 hover:bg-gray-100 hover:text-gray-700 p-2 rounded-full transition-colors flex items-center justify-center"
        >
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <div className="flex items-center shrink-0 mr-4 sm:mr-8">
          <span className="text-base sm:text-xl font-bold text-gray-800 tracking-tight truncate max-w-[120px] sm:max-w-none">{folderName}</span>
        </div>
        
        {/* Search bar */}
        <div className="flex-1 max-w-3xl relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          <input 
            type="text" 
            placeholder="Telusuri file..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 hover:bg-gray-200/80 focus:bg-white text-gray-700 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm font-medium border border-transparent focus:border-blue-300 shadow-sm"
          />
        </div>

        <div className="flex items-center ml-4 shrink-0">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm border-2 border-white ring-2 ring-transparent hover:ring-blue-100 transition-all">
            US
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
        <div className="max-w-screen-2xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Semua File</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Daftar file di dalam folder {folderName}</p>
            </div>
            <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {filteredFiles.length} file
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="p-12 mt-10 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-file-circle-exclamation text-4xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak ada file</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Belum ada file yang cocok dengan pencarian Anda di folder ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredFiles.map(file => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  onToggleStar={() => toggleStarFile(file.id)} 
                  onPlay={() => {
                    if (file.type === 'video') {
                      router.push(`/file/play/${file.id}?name=${encodeURIComponent(file.name)}&folderId=${folderId}&folderName=${encodeURIComponent(folderName)}`);
                    } else {
                      alert(`Membuka file: ${file.name}`);
                    }
                  }}
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

function FileCard({ file, onToggleStar, onPlay }: { file: FileItem; onToggleStar: () => void; onPlay: () => void }) {
  const iconMap = {
    video: 'fa-regular fa-circle-play text-3xl sm:text-4xl text-blue-500',
    image: 'fa-regular fa-image text-3xl sm:text-4xl text-orange-500',
    document: 'fa-regular fa-file-lines text-3xl sm:text-4xl text-red-500'
  };

  return (
    <div 
      onClick={onPlay} 
      className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-full relative"
    >
      {/* Star button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleStar(); }} 
        className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 text-gray-300 hover:text-yellow-400 p-1.5 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm shadow-sm"
      >
        <i className={`fa-star ${file.isStarred ? 'fa-solid text-yellow-400' : 'fa-regular'}`}></i>
      </button>

      {/* Thumbnail Area */}
      <div className={`aspect-[4/3] rounded-lg sm:rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-[1.02] ${file.thumbnailColor || 'bg-gray-50'}`}>
        <div className="relative">
          <i className={iconMap[file.type] || 'fa-regular fa-file text-3xl sm:text-4xl text-gray-500'}></i>
          {file.type === 'video' && (
            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-play text-[8px]"></i>
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors" title={file.name}>
          {file.name}
        </h3>
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50 text-[10px] sm:text-xs text-gray-500">
          <span>{file.size}</span>
          <span className="hidden sm:inline">{file.modified}</span>
        </div>
      </div>
    </div>
  );
}

export default function FilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Memuat file...</p>
      </div>
    }>
      <FileContent />
    </Suspense>
  );
}
