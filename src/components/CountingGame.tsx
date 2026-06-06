import React, { useState, useEffect } from 'react';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound, playStarSound } from '../utils/audio';
import { ArrowLeft, Volume2, Award, RotateCcw, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CountingGameProps {
  onBackToMenu: () => void;
  onGameComplete?: (starsEarned: number) => void;
  isAdventureMode?: boolean;
}

// Fixed coordinates on an SVG tree to place apples nicely so they do not overlap
const APPLE_POSITIONS = [
  { x: 50, y: 35 },
  { x: 30, y: 45 },
  { x: 70, y: 40 },
  { x: 45, y: 55 },
  { x: 62, y: 58 },
  { x: 22, y: 65 },
  { x: 78, y: 60 },
  { x: 35, y: 75 },
  { x: 55, y: 78 },
  { x: 68, y: 76 },
];

export default function CountingGame({ onBackToMenu, onGameComplete, isAdventureMode = false }: CountingGameProps) {
  const [appleCount, setAppleCount] = useState<number>(1);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0); // Progress tracker (1-10)
  const [badgeWon, setBadgeWon] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Generate question
  const generateQuestion = (newQuestionIdx: number) => {
    setIsLocked(false);
    setSelectedChoice(null);
    setFeedback({ text: '', isCorrect: null });

    // Pick random count between 1 and 10
    const count = Math.floor(Math.random() * 10) + 1;
    setAppleCount(count);

    // Generate 4 choices including the correct count
    const possibleChoices = new Set<number>();
    possibleChoices.add(count);
    
    while (possibleChoices.size < 4) {
      const wrong = Math.floor(Math.random() * 10) + 1;
      possibleChoices.add(wrong);
    }

    // Convert to sorted array so it's clean
    setChoices(Array.from(possibleChoices).sort((a, b) => a - b));
  };

  useEffect(() => {
    generateQuestion(0);
    setQuestionCount(1);
  }, []);

  // Instruction sound
  useEffect(() => {
    if (appleCount > 0) {
      const timer = setTimeout(() => {
        speakInstruction();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [appleCount]);

  const speakInstruction = () => {
    speakVietnamese('Bé ơi, có bao nhiêu quả táo đang treo trên cây táo xanh thế nhỉ?');
  };

  const handleChoice = (num: number) => {
    if (isLocked) return;
    setSelectedChoice(num);
    setIsLocked(true);

    if (num === appleCount) {
      // Correct!
      playSuccessSound();
      setFeedback({ text: `XUẤT SẮC! Đúng rồi, có ${appleCount} quả táo! 🍎`, isCorrect: true });
      speakVietnamese(`Giỏi quá! Chính xác là có ${appleCount} quả táo đang ở trên cây học tập!`);

      // Let children wait, then update progress
      setTimeout(() => {
        if (isAdventureMode) {
          if (onGameComplete) {
            onGameComplete(3); // return 3 stars
          }
        } else if (questionCount >= 10) {
          // Trigger Studious Kid badge
          setBadgeWon(true);
          playStarSound();
          speakVietnamese("Ôi chúc mừng bé! Bé đã xuất sắc hoàn thành mười câu hỏi tập đếm quả táo và giành được Huy hiệu Bé Chăm Học rồi!");
        } else {
          setQuestionCount((prev) => prev + 1);
          generateQuestion(questionCount);
        }
      }, 3000);
    } else {
      // Incorrect -> Encorage retries
      playFailSound();
      setIsLocked(false); // Let them try again
      setFeedback({ text: 'Mình thử đếm lại xem nhé! Chúng mình đếm tỉ mỉ từ 1 xem nào!', isCorrect: false });
      speakVietnamese(`Chưa chính xác rồi. Có thể không phải là ${num} đâu, con thử nhìn kỹ lại quả táo đỏ trên cây và đếm lại xem nhé!`);
    }
  };

  const handleRestart = () => {
    setBadgeWon(false);
    setQuestionCount(1);
    generateQuestion(0);
  };

  return (
    <div id="game-counting-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-emerald-50 rounded-3xl border-4 border-emerald-300 shadow-xl relative overflow-hidden">
      
      {/* Badge Winner Screen Modal overlapping content */}
      <AnimatePresence>
        {badgeWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-white text-center"
          >
            <motion.div
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="bg-white text-slate-900 border-8 border-yellow-400 p-8 rounded-3xl max-w-md shadow-2xl relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-amber-950 p-4 rounded-full border-4 border-white shadow-lg animate-bounce">
                <Award size={48} />
              </div>

              <h3 className="text-3xl font-extrabold text-amber-600 mt-8 mb-2">🏅 BÉ CHĂM HỌC 🏅</h3>
              <p className="text-md text-slate-500 font-bold mb-4 uppercase tracking-widest bg-yellow-100 py-1.5 px-4 rounded-full inline-block">Huy Hiệu Vinh Danh</p>
              
              <div className="text-6xl my-4">🎉🍎✨👧👦👨‍👩‍👧‍👦🌟</div>
              
              <p className="text-slate-700 font-semibold text-lg leading-relaxed mb-6">
                Tuyệt vời quá bé ơi! Bé đã hoàn thành xuất sắc thử thách tập đếm **10 quả táo** rồi! Ba mẹ vô cùng tự hào về bé yêu!
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  id="btn-counting-again"
                  onClick={() => { playClickSound(); handleRestart(); }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                >
                  <RotateCcw size={20} /> Bé Đếm Lại Nhé!
                </button>
                <button
                  id="btn-counting-back-menu"
                  onClick={() => { playClickSound(); onBackToMenu(); }}
                  className="bg-slate-500 hover:bg-slate-600 text-white font-bold px-4 py-3 rounded-2xl shadow-md transition-transform hover:scale-105 active:scale-95 text-sm"
                >
                  Quay về thực đơn
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-emerald-200 pb-4">
        <button
          id="btn-counting-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={18} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">🍎 Bé Tập Đếm Số (1-10) 🍏</h2>
          <p className="text-xs text-emerald-600 font-medium">Lĩnh vực: Phát thiện Nhận thức (Toán học)</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-emerald-200 shadow-sm">
          <span className="text-emerald-700 font-extrabold text-sm uppercase tracking-wide">
            Câu {questionCount}/10
          </span>
        </div>
      </div>

      {/* Interactive voice instructions */}
      <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-emerald-200 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
        <span className="text-emerald-950 font-extrabold text-lg md:text-xl flex items-center justify-center gap-1">
          🌳 "Bé ơi, có bao nhiêu quả táo đỏ mọc trên cây thế nhỉ?" 🍎
        </span>
        <button
          id="btn-voice-counting"
          onClick={() => { playClickSound(); speakInstruction(); }}
          className="flex items-center gap-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Volume2 size={13} /> Nghe cô giáo đố bé
        </button>
      </div>

      {/* Active Garden Row */}
      <div className="grid md:grid-cols-12 gap-6 items-stretch mb-6">
        
        {/* Tree Render in svg - Left side */}
        <div className="col-span-12 md:col-span-8 bg-sky-100 border-4 border-white shadow-inner rounded-3xl p-4 flex items-center justify-center min-h-[300px] relative overflow-hidden">
          {/* Sky elements */}
          <div className="absolute top-4 left-6 text-white text-3xl opacity-70 animate-float select-none">☁️</div>
          <div className="absolute top-8 right-12 text-white text-4xl opacity-50 select-none">☁️</div>
          <div className="absolute top-4 right-1/3 text-amber-400 text-4xl opacity-80 animate-pulse select-none">🌞</div>

          {/* Svg Visual apple tree */}
          <svg className="w-full max-w-[280px] md:max-w-[340px] aspect-square" viewBox="0 0 100 100">
            {/* Trunk */}
            <path d="M44,85 L56,85 L53,60 L47,60 Z" fill="#8b5a2b" stroke="#5c3a21" strokeWidth="1" />
            <path d="M47,60 L40,50 L45,48 L48,58 Z" fill="#8b5a2b" />
            <path d="M53,60 L62,48 L57,46 L52,56 Z" fill="#8b5a2b" />
            
            {/* Leaves block */}
            <circle cx="50" cy="45" r="23" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            <circle cx="34" cy="54" r="16" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
            <circle cx="66" cy="54" r="16" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
            <circle cx="50" cy="30" r="15" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
            <circle cx="40" cy="38" r="16" fill="#22c55e" />
            <circle cx="60" cy="38" r="16" fill="#22c55e" />

            {/* Grass garden floor */}
            <path d="M5,90 Q50,85 95,90 L95,100 L5,100 Z" fill="#4ade80" />
          </svg>

          {/* Render Apples floating over tree layout using absolute coords matching APPLE_POSITIONS */}
          {APPLE_POSITIONS.slice(0, appleCount).map((pos, idx) => (
            <motion.div
              id={`apple-visual-${idx}`}
              key={idx}
              initial={{ scale: 0, y: -5 }}
              animate={{ scale: [1, 1.1, 1], y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="absolute w-10 h-10 select-none z-20 flex items-center justify-center filter drop-shadow-md cursor-pointer text-3xl animate-bouncer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => {
                playClickSound();
                speakVietnamese(`Táo số ${idx + 1}`);
                // Little audio effect
              }}
            >
              🍎
              {/* Number overlay */}
              <span className="absolute -bottom-1 -right-1 bg-white text-red-600 font-extrabold text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full shadow border border-red-200">
                {idx + 1}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Buttons choices - Right side */}
        <div className="col-span-12 md:col-span-4 flex flex-col justify-center gap-4">
          <div className="text-center font-bold text-slate-600 text-sm uppercase tracking-wide">
            👉 Chọn một đáp án nhé:
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {choices.map((num) => {
              const isSelected = selectedChoice === num;
              const isWrongChoice = isSelected && num !== appleCount;
              const isCorrectAndSelected = isSelected && num === appleCount;

              return (
                <button
                  id={`btn-counting-choice-${num}`}
                  key={num}
                  disabled={isLocked && !isSelected}
                  onClick={() => handleChoice(num)}
                  className={`py-5 px-4 rounded-3xl text-3xl font-black transition-all shadow border-4 active:scale-95 ${
                    isCorrectAndSelected
                      ? 'bg-emerald-500 border-emerald-600 text-white animate-wiggle shadow-emerald-200'
                      : isWrongChoice
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'bg-white border-emerald-100 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 justify-center">
                    <span>{num}</span>
                    <span className="text-xs uppercase font-extrabold tracking-wider opacity-80">
                      {num === 1 ? 'Một' : 
                       num === 2 ? 'Hai' : 
                       num === 3 ? 'Ba' : 
                       num === 4 ? 'Bốn' : 
                       num === 5 ? 'Năm' : 
                       num === 6 ? 'Sáu' : 
                       num === 7 ? 'Bảy' : 
                       num === 8 ? 'Tám' : 
                       num === 9 ? 'Chín' : 'Mười'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Interactive feedback */}
      <AnimatePresence mode="wait">
        {feedback.text && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-2xl text-center font-bold text-lg border-2 shadow-sm ${
              feedback.isCorrect
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              {feedback.isCorrect ? <Check className="text-emerald-600 stroke-[3px]" /> : '👋'}
              <span>{feedback.text}</span>
            </div>
            {feedback.isCorrect && (
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Ngọt lành từ đất mẹ! Bé học đếm cực kỳ điêu luyện nha!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer support */}
      <div className="text-center text-xs text-emerald-700/80 mt-4 italic">
        * Luyện tập đếm trên mô hình đồ vật thực giúp tăng liên kết tư duy cụ thể cho trẻ 3-5 tuổi.
      </div>

    </div>
  );
}
