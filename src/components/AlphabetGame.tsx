import React, { useState, useEffect } from 'react';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound } from '../utils/audio';
import { ArrowLeft, Volume2, Sparkles, BookOpen, Gamepad2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlphabetGameProps {
  onBackToMenu: () => void;
  onGameComplete?: (starsEarned: number) => void;
  isAdventureMode?: boolean;
}

interface AlphabetDef {
  letter: string;
  word: string;
  emoji: string;
  options: { emoji: string; word: string; isCorrect: boolean }[];
}

const ALPHABET_ITEMS: AlphabetDef[] = [
  { 
    letter: 'A', word: 'Áo', emoji: '👕', 
    options: [
      { emoji: '👕', word: 'Áo', isCorrect: true },
      { emoji: '🐱', word: 'Mèo', isCorrect: false },
      { emoji: '🐟', word: 'Cá', isCorrect: false }
    ]
  },
  { 
    letter: 'B', word: 'Bóng', emoji: '🎈', 
    options: [
      { emoji: '🐶', word: 'Chó', isCorrect: false },
      { emoji: '🎈', word: 'Bóng', isCorrect: true },
      { emoji: '🍎', word: 'Táo', isCorrect: false }
    ]
  },
  { 
    letter: 'C', word: 'Cá', emoji: '🐟', 
    options: [
      { emoji: '🐟', word: 'Cá', isCorrect: true },
      { emoji: '🐯', word: 'Hổ', isCorrect: false },
      { emoji: '✈️', word: 'Máy bay', isCorrect: false }
    ]
  },
  { 
    letter: 'D', word: 'Dê', emoji: '🐐', 
    options: [
      { emoji: '⛵', word: 'Thuyền', isCorrect: false },
      { emoji: '🐐', word: 'Dê', isCorrect: true },
      { emoji: '🍏', word: 'Quả táo xanh', isCorrect: false }
    ]
  },
  { 
    letter: 'G', word: 'Gà', emoji: '🐔', 
    options: [
      { emoji: '🐔', word: 'Gà', isCorrect: true },
      { emoji: '🐰', word: 'Thỏ', isCorrect: false },
      { emoji: '🚂', word: 'Tàu hỏa', isCorrect: false }
    ]
  },
  { 
    letter: 'H', word: 'Hổ', emoji: '🐯', 
    options: [
      { emoji: '🐝', word: 'Ong', isCorrect: false },
      { emoji: '🌊', word: 'Nước', isCorrect: false },
      { emoji: '🐯', word: 'Hổ', isCorrect: true }
    ]
  },
  { 
    letter: 'M', word: 'Mèo', emoji: '🐱', 
    options: [
      { emoji: '🐱', word: 'Mèo', isCorrect: true },
      { emoji: '🍌', word: 'Chuối', isCorrect: false },
      { emoji: '🦆', word: 'Vịt', isCorrect: false }
    ]
  },
  { 
    letter: 'O', word: 'Ong', emoji: '🐝', 
    options: [
      { emoji: '🍎', word: 'Táo', isCorrect: false },
      { emoji: '🐝', word: 'Ong', isCorrect: true },
      { emoji: '🚗', word: 'Ô tô', isCorrect: false }
    ]
  },
  { 
    letter: 'T', word: 'Táo', emoji: '🍎', 
    options: [
      { emoji: '🎈', word: 'Bóng', isCorrect: false },
      { emoji: '🍎', word: 'Táo', isCorrect: true },
      { emoji: '🦆', word: 'Vịt', isCorrect: false }
    ]
  }
];

export default function AlphabetGame({ onBackToMenu, onGameComplete, isAdventureMode = false }: AlphabetGameProps) {
  const [mode, setMode] = useState<'learn' | 'play'>('learn');
  const [selectedLetter, setSelectedLetter] = useState<AlphabetDef | null>(null);
  
  // Play Mode active question states
  const [currentPlayItem, setCurrentPlayItem] = useState<AlphabetDef | null>(null);
  const [playFeedback, setPlayFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
  const [score, setScore] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Setup initial active details
  useEffect(() => {
    setSelectedLetter(ALPHABET_ITEMS[0]);
    generatePlayQuestion();
  }, []);

  const generatePlayQuestion = () => {
    setIsLocked(false);
    setPlayFeedback({ text: '', isCorrect: null });
    
    // Pick standard item
    let nextItem: AlphabetDef;
    do {
      nextItem = ALPHABET_ITEMS[Math.floor(Math.random() * ALPHABET_ITEMS.length)];
    } while (currentPlayItem && nextItem.letter === currentPlayItem.letter);

    setCurrentPlayItem(nextItem);
  };

  // Instruction speaking triggers
  useEffect(() => {
    if (mode === 'play' && currentPlayItem) {
      const timer = setTimeout(() => {
        speakPlayQuestion();
      }, 500);
      return () => clearTimeout(timer);
    } else if (mode === 'learn' && selectedLetter) {
      speakLearnLetter(selectedLetter);
    }
  }, [mode, currentPlayItem]);

  const speakLearnLetter = (item: AlphabetDef) => {
    speakVietnamese(`Chữ ${item.letter}. Chữ ${item.letter} trong từ con ${item.word}.`);
  };

  const speakPlayQuestion = () => {
    if (currentPlayItem) {
      speakVietnamese(`Bé ơi! Hình vẽ nào bắt đầu bằng chữ ${currentPlayItem.letter} thế nhỉ?`);
    }
  };

  const handleLearnClick = (item: AlphabetDef) => {
    playClickSound();
    setSelectedLetter(item);
    speakLearnLetter(item);
  };

  const handlePlaySelect = (option: { emoji: string; word: string; isCorrect: boolean }) => {
    if (isLocked || !currentPlayItem) return;

    if (option.isCorrect) {
      setIsLocked(true);
      setScore((prev) => prev + 1);
      playSuccessSound();

      const explanation = `Đúng rồi! Chữ ${currentPlayItem.letter} bắt đầu từ tiếng ${currentPlayItem.word}! Bé siêu quá!`;
      setPlayFeedback({ text: explanation, isCorrect: true });
      speakVietnamese(`Ỏ giỏi quá! Chữ ${currentPlayItem.letter} cho ${currentPlayItem.word}!`);

      setTimeout(() => {
        if (isAdventureMode) {
          if (onGameComplete) {
            onGameComplete(3); // 3 stars
          }
        } else {
          generatePlayQuestion();
        }
      }, 3000);
    } else {
      playFailSound();
      setPlayFeedback({
        text: `Ồ! ${option.emoji} là từ ${option.word}, không bắt đầu bằng chữ ${currentPlayItem.letter} đâu bé ơi! Chúng mình cùng bấm lại nhé!`,
        isCorrect: false
      });
      speakVietnamese(`Chưa chính xác rồi bé yêu! Đây là hình ${option.word}, con hãy đếm và nhìn lại để tìm hình bắt đầu bằng chữ ${currentPlayItem.letter} nhé!`);
    }
  };

  return (
    <div id="game-alphabet-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-pink-50 rounded-3xl border-4 border-pink-300 shadow-xl relative overflow-hidden">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-pink-200 pb-4">
        <button
          id="btn-alphabet-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={18} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-pink-800">🅰️ Bé Tập Học Chữ Cái 🅱️</h2>
          <p className="text-xs text-pink-600 font-medium">Lĩnh vực: Phát triển Ngôn ngữ & Giao tiếp</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-pink-200">
          <span className="text-pink-700 font-bold text-base">⭐ Điểm: {score}</span>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          id="btn-mode-learn"
          onClick={() => { playClickSound(); setMode('learn'); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-base shadow-sm transition-transform active:scale-95 ${
            mode === 'learn'
              ? 'bg-pink-500 text-white ring-4 ring-pink-200'
              : 'bg-white text-pink-800 hover:bg-pink-100 border border-pink-200'
          }`}
        >
          <BookOpen size={18} /> Chế độ học chữ
        </button>
        <button
          id="btn-mode-play"
          onClick={() => { playClickSound(); setMode('play'); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-base shadow-sm transition-transform active:scale-95 ${
            mode === 'play'
              ? 'bg-pink-500 text-white ring-4 ring-pink-200'
              : 'bg-white text-pink-800 hover:bg-pink-100 border border-pink-200'
          }`}
        >
          <Gamepad2 size={18} /> Chế độ chơi game
        </button>
      </div>

      {/* Main Mode Containers */}
      <div className="min-h-[300px]">
        {mode === 'learn' ? (
          /* LEARN MODE */
          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Letters Grid - Left (7 cols) */}
            <div className="col-span-11 md:col-span-7 grid grid-cols-3 gap-3">
              {ALPHABET_ITEMS.map((item) => (
                <button
                  id={`btn-learn-letter-${item.letter}`}
                  key={item.letter}
                  onClick={() => handleLearnClick(item)}
                  className={`py-6 px-4 rounded-3xl border-4 text-4xl font-extrabold shadow flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 ${
                    selectedLetter?.letter === item.letter
                      ? 'bg-pink-400 border-pink-500 text-white animate-wiggle'
                      : 'bg-white border-pink-100 text-pink-800 hover:border-pink-300'
                  }`}
                >
                  <span>{item.letter}</span>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 select-none uppercase">
                    phát âm
                  </span>
                </button>
              ))}
            </div>

            {/* Letter Showcase - Right (5 cols) */}
            <div className="col-span-11 md:col-span-5 bg-white rounded-3xl border-4 border-pink-100 p-6 flex flex-col items-center justify-center text-center shadow-inner">
              <AnimatePresence mode="wait">
                {selectedLetter && (
                  <motion.div
                    key={selectedLetter.letter}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-5xl font-black text-pink-500 select-none mb-1">
                      CHỮ CHỮ {selectedLetter.letter}
                    </div>

                    <div className="text-8xl select-none my-4 animate-float filter drop-shadow-md">
                      {selectedLetter.emoji}
                    </div>

                    <p className="text-2xl font-black text-slate-800">
                      Từ: <span className="text-pink-600 underline decoration-wavy px-2 font-bold">{selectedLetter.word}</span>
                    </p>

                    <button
                      id="btn-learn-speak"
                      onClick={() => { playClickSound(); speakLearnLetter(selectedLetter); }}
                      className="mt-6 flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-800 px-5 py-2 rounded-full font-bold shadow-sm transition-all text-sm"
                    >
                      <Volume2 size={16} /> Phát âm giọng nói
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        ) : (
          /* PLAY QUIZ MODE */
          <div className="flex flex-col items-center justify-center">
            
            {/* Guide speaker bubble */}
            {currentPlayItem && (
              <div className="w-full bg-pink-100/60 p-4 rounded-2xl border-4 border-dashed border-pink-200 mb-6 text-center shadow-inner">
                <span className="text-pink-950 font-black text-xl flex items-center justify-center gap-2">
                  🎨 "Hình nào có tên bắt đầu bằng chữ cái <span className="text-3xl text-pink-600 bg-white shadow-sm font-extrabold px-5 py-0.5 rounded-full ring-2 ring-pink-300">{currentPlayItem.letter}</span> hả bé?" 🎨
                </span>
                
                <button
                  id="btn-play-voice"
                  onClick={() => { playClickSound(); speakPlayQuestion(); }}
                  className="mt-3 inline-flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold transition-all shadow-sm active:scale-95"
                >
                  <Volume2 size={13} /> Nghe lại lặp âm
                </button>
              </div>
            )}

            {/* Match choices */}
            {currentPlayItem && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-6">
                {currentPlayItem.options.map((option, idx) => {
                  return (
                    <button
                      id={`btn-play-option-${idx}`}
                      key={idx}
                      disabled={isLocked}
                      onClick={() => {
                        playClickSound();
                        handlePlaySelect(option);
                      }}
                      className="bg-white border-4 border-pink-100 hover:border-pink-300 hover:bg-pink-50 flex flex-col items-center justify-center p-6 rounded-3xl shadow-md transition-transform hover:scale-105 active:scale-95 relative"
                    >
                      <span className="text-8xl select-none filter drop-shadow-sm pointer-events-none mb-4 animate-float">
                        {option.emoji}
                      </span>
                      <span className="text-lg font-black text-pink-800 bg-pink-50 pb-1.5 pt-1.5 px-6 rounded-full border border-pink-100 pointer-events-none">
                        {option.word}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Play Mode Feedbacks */}
            <AnimatePresence mode="wait">
              {playFeedback.text && (
                <motion.div
                  key={playFeedback.text}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className={`w-full p-4 rounded-2xl text-center font-bold text-base border-2 shadow-sm ${
                    playFeedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-100 text-rose-800'
                  }`}
                >
                  <div className="flex justify-center items-center gap-2">
                    {playFeedback.isCorrect ? <Check size={18} className="text-emerald-600 stroke-[3px]" /> : '💡'}
                    <span>{playFeedback.text}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>

      {/* Parental Tips */}
      <div className="text-center text-xs text-pink-700/80 mt-6 italic">
        * Nhận diện chữ cái qua hình ảnh cụ thể giúp nâng cao khả năng ghi nhớ biểu tượng mặt chữ cho bé 4-6 tuổi.
      </div>

    </div>
  );
}
