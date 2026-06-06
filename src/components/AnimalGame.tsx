import React, { useState, useEffect } from 'react';
import { GameId, AnimalItem } from '../types';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound } from '../utils/audio';
import { Sparkles, HelpCircle, Volume2, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimalGameProps {
  onBackToMenu: () => void;
  onGameComplete?: (starsEarned: number) => void;
  isAdventureMode?: boolean;
}

const ALL_ANIMALS: AnimalItem[] = [
  { id: 'meo', name: 'Mèo', emoji: '🐱', soundWord: 'meo meo' },
  { id: 'cho', name: 'Chó', emoji: '🐶', soundWord: 'gâu gâu' },
  { id: 'ga', name: 'Gà', emoji: '🐔', soundWord: 'ò ó o' },
  { id: 'vit', name: 'Vịt', emoji: '🦆', soundWord: 'quác quác' },
  { id: 'ca', name: 'Cá', emoji: '🐟', soundWord: 'bơi bơi' },
  { id: 'tho', name: 'Thỏ', emoji: '🐰', soundWord: 'nhảy nhảy' },
];

export default function AnimalGame({ onBackToMenu, onGameComplete, isAdventureMode = false }: AnimalGameProps) {
  const [options, setOptions] = useState<AnimalItem[]>([]);
  const [target, setTarget] = useState<AnimalItem | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Generate a new question
  const generateQuestion = () => {
    setFeedback({ text: '', isCorrect: null });
    setShowConfetti(false);
    setIsLocked(false);

    // Shuffle and pick 4 unique animals
    const shuffled = [...ALL_ANIMALS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    
    // Pick one of the 4 as target
    const targetIdx = Math.floor(Math.random() * 4);
    const targetAnimal = selected[targetIdx];

    setOptions(selected);
    setTarget(targetAnimal);
  };

  // On mount, generate first question and play voice
  useEffect(() => {
    generateQuestion();
  }, []);

  // Voice output when target changes
  useEffect(() => {
    if (target) {
      const timer = setTimeout(() => {
        speakInstruction();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [target]);

  const speakInstruction = () => {
    if (target) {
      speakVietnamese(`Bé hãy tìm con ${target.name} đâu rồi?`);
    }
  };

  const speakAnimalName = (animal: AnimalItem) => {
    speakVietnamese(`Con ${animal.name} bêu kêu ${animal.soundWord}`);
  };

  const handleSelect = (selected: AnimalItem) => {
    if (isLocked || !target) return;

    if (selected.id === target.id) {
      // Correct!
      setIsLocked(true);
      setScore((prev) => prev + 1);
      setTotalQuestions((prev) => prev + 1);
      setFeedback({
        text: `Đúng rồi! Đây là con ${target.name} nè! ${target.emoji}`,
        isCorrect: true,
      });
      setShowConfetti(true);
      playSuccessSound();

      const congratulationTexts = [
        `Giỏi quá! Đúng rồi, đây chính là con ${target.name}!`,
        `Bé thông minh quá! Con ${target.name} dễ thương ghê!`,
        `Ôi bé tìm đúng rồi! Hoan hô bé!`,
      ];
      const randomCongrats = congratulationTexts[Math.floor(Math.random() * congratulationTexts.length)];
      speakVietnamese(randomCongrats);

      // Wait then next question or check completion
      setTimeout(() => {
        if (isAdventureMode) {
          // In adventure mode, completing one is enough or maybe 3
          if (onGameComplete) {
            onGameComplete(3); // return stars
          }
        } else if (score >= 4) {
          // complete game
          setShowConfetti(true);
          speakVietnamese("Bé đã hoàn thành trò chơi Nhận biết động vật rồi! Bé xuất sắc lắm!");
        } else {
          generateQuestion();
        }
      }, 3000);
    } else {
      // Incorrect side
      setFeedback({
        text: 'Nên tìm lại thử xem! Chúng mình cố lên nào!',
        isCorrect: false,
      });
      playFailSound();
      speakVietnamese('Ồ! Chưa đúng rồi, bé hãy thử lại xem nào!');
    }
  };

  const handleResetGame = () => {
    setScore(0);
    setTotalQuestions(0);
    generateQuestion();
  };

  return (
    <div id="game-animals-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-amber-50 rounded-3xl border-4 border-amber-300 shadow-xl relative overflow-hidden">
      {/* Sparkly Confetti Animation Overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎇🎉🌟🦁🦊🐶✨</div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-amber-200 pb-4">
        <button
          id="btn-animals-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-2xl shadow-md transition-all active:scale-95"
        >
          <ArrowLeft size={20} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-amber-800 flex items-center justify-center gap-2">
            🐱 Bé Tìm Đúng Con Vật 🐶
          </h2>
          <p className="text-sm text-amber-600 font-medium">Lĩnh vực: Phát triển Nhận thức & Ngôn ngữ</p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border-2 border-amber-200">
          <span className="text-amber-700 font-bold text-lg">⭐ Điểm: {score}</span>
        </div>
      </div>

      {/* Dynamic Instruction panel */}
      {target && (
        <motion.div 
          key={target.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 mb-6 border-2 border-amber-300 shadow-sm text-center flex flex-col items-center justify-center gap-3"
        >
          <span className="bg-amber-100 text-amber-800 font-extrabold text-xl md:text-2xl px-6 py-2 rounded-full border border-amber-300 flex items-center gap-2 animate-pulse">
            <HelpCircle className="text-amber-600" /> "Bé hãy tìm con {target.name} đâu rồi?"
          </span>
          
          <button
            id="btn-voice-replay"
            onClick={() => { playClickSound(); speakInstruction(); }}
            className="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Volume2 size={16} /> Nghe lại giọng đọc
          </button>
        </motion.div>
      )}

      {/* Game Board - Animal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <AnimatePresence mode="popLayout">
          {options.map((animal) => {
            const isThisTarget = target?.id === animal.id;
            const isClickWrong = feedback.isCorrect === false && feedback.text.includes(animal.name);

            return (
              <motion.button
                id={`btn-animal-option-${animal.id}`}
                key={animal.id}
                whileHover={{ scale: isLocked ? 1 : 1.05 }}
                whileTap={{ scale: isLocked ? 1 : 0.95 }}
                onClick={() => {
                  playClickSound();
                  handleSelect(animal);
                }}
                disabled={isLocked}
                className={`aspect-square flex flex-col items-center justify-center p-4 rounded-3xl border-4 shadow-md transition-all relative ${
                  isLocked && isThisTarget
                    ? 'bg-emerald-100 border-emerald-400 shadow-emerald-200 animate-wiggle'
                    : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-lg'
                }`}
              >
                {/* Animal Emoji */}
                <span className="text-7xl md:text-8xl select-none animate-float filter drop-shadow-md">
                  {animal.emoji}
                </span>

                {/* Animal Name label */}
                <span className="mt-3 bg-amber-100 text-amber-900 font-bold px-4 py-1 rounded-full text-base md:text-lg border border-amber-200">
                  {animal.name}
                </span>

                {/* Mini audio activator icon inside tile */}
                <button
                  id={`btn-animal-sound-${animal.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    speakAnimalName(animal);
                  }}
                  className="absolute bottom-2 right-2 bg-amber-200 hover:bg-amber-300 text-amber-800 p-1.5 rounded-full"
                  title="Nghe tiếng kêu"
                >
                  <Volume2 size={14} />
                </button>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Interaction Feedbacks */}
      <AnimatePresence mode="wait">
        {feedback.text && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-2xl text-center font-bold text-lg md:text-xl border-2 shadow-sm mb-6 ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800 animate-wiggle'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {feedback.isCorrect ? <Sparkles className="animate-spin text-amber-500" /> : '💡'}
              <span>{feedback.text}</span>
            </div>
            {!feedback.isCorrect && (
              <p className="text-sm text-amber-600 font-normal mt-1">
                Con hãy xem kĩ từng hình vẽ và bấm lại nhé!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score and Congratulations */}
      {score >= 5 && !isAdventureMode && (
        <div className="bg-emerald-100 text-emerald-900 border-2 border-emerald-300 rounded-2xl p-6 text-center shadow-inner mb-4">
          <h3 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
            🏆 Bé Đã Thắng Cuộc Rồi! 🏆
          </h3>
          <p className="mt-2 font-medium">Bé nhận biết động vật cực kỳ thông minh luôn nhé!</p>
          <button
            id="btn-play-again"
            onClick={() => { playClickSound(); handleResetGame(); }}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 font-bold py-2.5 px-6 rounded-full text-white shadow-md active:scale-95 transition-all"
          >
            <RotateCcw size={18} /> Chơi lại lần nữa!
          </button>
        </div>
      )}

      {/* Footer Instructions for Parents */}
      <div className="text-center text-xs text-amber-700/80 mt-4 italic">
        * Ba mẹ nên bật loa lớn để bé nghe trọn vẹn giọng đọc câu hỏi từ ứng dụng nhé!
      </div>
    </div>
  );
}
