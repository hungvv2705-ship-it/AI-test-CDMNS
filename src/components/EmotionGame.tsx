import React, { useState, useEffect } from 'react';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound } from '../utils/audio';
import { ArrowLeft, Volume2, Smile, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmotionGameProps {
  onBackToMenu: () => void;
  onGameComplete?: (starsEarned: number) => void;
  isAdventureMode?: boolean;
}

interface EmotionDef {
  id: string;
  name: string;
  emoji: string;
  meaning: string;
  clue: string;
}

const EMOTIONS: EmotionDef[] = [
  { id: 'vui', name: 'Vui vẻ', emoji: '😊', meaning: 'Miệng cười tươi rói, mắt híp lấp lánh nụ cười', clue: 'thể hiện khi con được quà hoặc vui thích!' },
  { id: 'buon', name: 'Buồn bã', emoji: '😔', meaning: 'Miệng hơi mếu nhẹ, mắt cụp xuống lo lắng', clue: 'thể hiện khi con nhớ ba mẹ hoặc đồ chơi bị vỡ nè.' },
  { id: 'ngacnhien', name: 'Ngạc nhiên', emoji: '😮', meaning: 'Mắt tròn xoe mở to, miệng chữ O lí thú', clue: 'thể hiện khi con trông thấy một hộp quà bất ngờ khổng lồ!' },
  { id: 'binhtinh', name: 'Bình tĩnh', emoji: '😌', meaning: 'Mắt nhắm thư thả, nụ cười nhẹ êm đềm', clue: 'thể hiện khi con hít thở sâu, thư giãn trong vòng tay mẹ.' }
];

export default function EmotionGame({ onBackToMenu, onGameComplete, isAdventureMode = false }: EmotionGameProps) {
  const [target, setTarget] = useState<EmotionDef | null>(null);
  const [options, setOptions] = useState<EmotionDef[]>([]);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const generateQuestion = () => {
    setIsLocked(false);
    setFeedback({ text: '', isCorrect: null });

    // Shuffle and populate all 4 emotions
    const shuffled = [...EMOTIONS].sort(() => 0.5 - Math.random());
    setOptions(shuffled);

    // Pick target randomly
    const targetEmotion = shuffled[Math.floor(Math.random() * shuffled.length)];
    setTarget(targetEmotion);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  // Tell instructions audibly
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
      speakVietnamese(`Bé ơi! Trông xem khuôn mặt thể hiện cảm xúc ${target.name} ở đâu thế nhỉ?`);
    }
  };

  const speakEmotionDetails = (emo: EmotionDef) => {
    speakVietnamese(`Khuôn mặt ${emo.name}: ${emo.meaning}.`);
  };

  const handleSelect = (selected: EmotionDef) => {
    if (isLocked || !target) return;

    if (selected.id === target.id) {
      setIsLocked(true);
      setScore((prev) => prev + 1);
      playSuccessSound();

      const congratText = `Tuyệt đỉnh! Đây chính là cảm xúc ${target.name}! ${target.meaning} ${target.clue}`;
      setFeedback({ text: congratText, isCorrect: true });
      speakVietnamese(`Chính xác rồi bé yêu! Đây là bé mặt ${target.name}! ${target.meaning}!`);

      setTimeout(() => {
        if (isAdventureMode) {
          if (onGameComplete) {
            onGameComplete(3); // 3 stars
          }
        } else {
          generateQuestion();
        }
      }, 3500);
    } else {
      playFailSound();
      setFeedback({
        text: `Ồ! Đây là khuôn mặt ${selected.name} rồi! Con nhìn kỹ mắt cười và khoé miệng của nụ cười ${target.name} để tìm lại nhé!`,
        isCorrect: false
      });
      speakVietnamese(`Ồ chưa chính xác rồi bé yêu! Con hãy rà soát xem khuôn mặt ${target.name} bộc lộ như thế nào nha! Con bấm thử lại nào!`);
    }
  };

  const handleRestart = () => {
    setScore(0);
    generateQuestion();
  };

  return (
    <div id="game-emotions-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-orange-50 rounded-3xl border-4 border-orange-300 shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-orange-200 pb-4">
        <button
          id="btn-emotions-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={18} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-850">😊 Bé Nhận Biết Cảm Xúc 😌</h2>
          <p className="text-xs text-orange-600 font-medium">Lĩnh vực: Phát triển Tình cảm & Kỹ năng xã hội</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-orange-200">
          <span className="text-orange-700 font-bold text-base">⭐ Điểm: {score}</span>
        </div>
      </div>

      {/* Instructions bubble style card */}
      {target && (
        <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-orange-200 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
          <span className="text-orange-950 font-extrabold text-lg md:text-xl flex items-center justify-center gap-2">
            🌸 "Bé ơi, khuôn mặt biểu lộ cảm xúc <span className="bg-orange-100 text-orange-800 px-5 py-0.5 rounded-full ring-2 ring-orange-300 font-black">{target.name}</span> nằm ở đâu nhỉ?" 🌸
          </span>
          <button
            id="btn-emotions-voice"
            onClick={() => { playClickSound(); speakInstruction(); }}
            className="flex items-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Volume2 size={14} /> Nghe cô đố bé nhé
          </button>
        </div>
      )}

      {/* Grid of Emojis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        {options.map((emo) => {
          const isThisTarget = target?.id === emo.id;
          const isMatchCorrectAndSelected = isThisTarget && isLocked;

          return (
            <button
              id={`btn-emotion-choice-${emo.id}`}
              key={emo.id}
              disabled={isLocked}
              onClick={() => {
                playClickSound();
                handleSelect(emo);
              }}
              className={`aspect-square p-4 bg-white border-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow transition-all hover:scale-105 active:scale-95 relative ${
                isMatchCorrectAndSelected
                  ? 'border-emerald-500 bg-emerald-50/50 animate-wiggle ring-4 ring-emerald-100'
                  : 'border-orange-100 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <span className="text-8xl select-none filter drop-shadow-md pointer-events-none animate-float">
                {emo.emoji}
              </span>
              
              <span className="text-sm font-bold text-slate-800 bg-orange-50/50 border border-orange-100 px-4 py-1 rounded-full pointer-events-none select-none">
                {emo.name}
              </span>

              {/* Informative helper vocal play inside block */}
              <button
                id={`btn-emotion-details-${emo.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  speakEmotionDetails(emo);
                }}
                className="absolute bottom-2 right-2 p-1.5 bg-orange-100 hover:bg-orange-200 rounded-full text-orange-700 hover:scale-110 transition-transform"
                title="Nghe miêu tả cảm xúc"
              >
                <Volume2 size={12} />
              </button>
            </button>
          );
        })}
      </div>

      {/* Feedback status */}
      <AnimatePresence mode="wait">
        {feedback.text && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-center font-bold text-base md:text-lg border-2 shadow-sm mb-4 ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex justify-center items-center gap-1.5">
              <span>{feedback.isCorrect ? <Sparkles className="animate-spin text-orange-500" /> : '💡'}</span>
              <span>{feedback.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Board */}
      {score >= 5 && !isAdventureMode && (
        <div className="bg-emerald-100 border-2 border-emerald-200 p-5 rounded-2xl text-center text-emerald-950 shadow-inner">
          <h4 className="text-lg font-black">🏆 Bé Nhận Biết Cảm Xúc Tuyệt Vời Quá! 🏆</h4>
          <p className="text-xs text-slate-500">Giờ đây con có thể dâng tràn tình cảm, cảm thông chia sẻ cùng ba mẹ rồi nhé!</p>
          <button
            id="btn-emotions-restart"
            onClick={() => { playClickSound(); handleRestart(); }}
            className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-5 rounded-full inline-flex items-center gap-1 text-sm shadow transition-all"
          >
            <RefreshCw size={14} /> Học tìm hiểu lại
          </button>
        </div>
      )}

      {/* Parental Tips */}
      <div className="text-center text-xs text-orange-700/80 mt-4 italic">
        * Nhận diện và gọi tên đúng xúc cảm giúp phát triển chỉ số thông minh cảm xúc EQ vàng cho con mầm non.
      </div>

    </div>
  );
}
