import React, { useState, useEffect } from 'react';
import { GameId } from './types';
import { speakVietnamese, playClickSound } from './utils/audio';

// Import our modular games
import MainMenu from './components/MainMenu';
import AnimalGame from './components/AnimalGame';
import ColorGame from './components/ColorGame';
import CountingGame from './components/CountingGame';
import VehicleGame from './components/VehicleGame';
import AlphabetGame from './components/AlphabetGame';
import GoodDeedsGame from './components/GoodDeedsGame';
import EmotionGame from './components/EmotionGame';
import AdventureGame from './components/AdventureGame';

import { Volume2, Sparkles, Home, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId>('menu');

  // Welcome announcement voice over on start
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      speakVietnamese('Chào mừng bé ngoan đã đến với Sân Chơi Học Tập kỳ thú! Hãy chạm chọn một trò chơi bé yêu thích để khám phá cùng cô giáo nhé!');
    }, 1000);
    return () => clearTimeout(welcomeTimer);
  }, []);

  const handleReturnToMenu = () => {
    playClickSound();
    setActiveGame('menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-sky-50 to-purple-50 flex flex-col justify-between selection:bg-teal-200">
      
      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-sky-100 shadow-sm px-4 py-3 md:py-4 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo Brand / Sun */}
          <div 
            onClick={handleReturnToMenu}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="text-3xl md:text-4xl animate-bounce">🌞</span>
            <div className="text-left">
              <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-1">
                Sân Chơi Bé Học <span className="text-emerald-500 font-extrabold text-sm md:text-md uppercase">Mầm Non</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Chương trình giáo dục mầm non Việt Nam</p>
            </div>
          </div>

          {/* Quick Guidance Utilities */}
          <div className="flex items-center gap-3">
            {activeGame !== 'menu' && (
              <button
                id="header-btn-home"
                onClick={handleReturnToMenu}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-2xl text-xs shadow-sm transition-all active:scale-95"
              >
                <Home size={14} /> Thực Đơn Chính
              </button>
            )}

            <button
              id="header-btn-welcome"
              onClick={() => {
                playClickSound();
                speakVietnamese('Bé yêu hãy tập trung đọc to câu hỏi và rèn luyện kỹ năng hằng ngày thật chăm chỉ nha!');
              }}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-2 rounded-full transition-transform hover:scale-105 active:scale-95"
              title="Lời nhắc từ cô giáo"
            >
              <Volume2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl w-full mx-auto py-8 px-4 md:px-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {activeGame === 'menu' && (
              <MainMenu onSelectGame={(gameId) => setActiveGame(gameId)} />
            )}
            
            {activeGame === 'animals' && (
              <AnimalGame onBackToMenu={handleReturnToMenu} />
            )}

            {activeGame === 'colors' && (
              <ColorGame onBackToMenu={handleReturnToMenu} />
            )}

            {activeGame === 'counting' && (
              <CountingGame onBackToMenu={handleReturnToMenu} />
            )}

            {activeGame === 'vehicles' && (
              <VehicleGame onBackToMenu={handleReturnToMenu} />
            )}

            {activeGame === 'alphabet' && (
              <AlphabetGame onBackToMenu={handleReturnToMenu} />
            )}

            {activeGame === 'deeds' && (
              <GoodDeedsGame onBackToMenu={handleReturnToMenu} />
            )}

            {activeGame === 'emotions' && (
              <EmotionGame onBackToMenu={handleReturnToMenu} />
            )}

            {activeGame === 'adventure' && (
              <AdventureGame onBackToMenu={handleReturnToMenu} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Main Footer Guidance */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-slate-400 font-bold text-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-500">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>© 2026 Sân Chơi Học Tập Mầm Non Việt Nam</span>
          </div>

          <p className="text-[11px] text-slate-400 max-w-md font-medium leading-relaxed italic">
            "Hãy bật loa âm lượng lớn và đồng hành hỗ trợ cùng con để rèn luyện thói quen tự tin nhận biết thế giới xung quanh các bé nhé!" 🌳👪🦁
          </p>
        </div>
      </footer>

    </div>
  );
}
