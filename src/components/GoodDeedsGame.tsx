import React, { useState, useEffect } from 'react';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound } from '../utils/audio';
import { ArrowLeft, Volume2, ShieldCheck, ThumbsUp, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GoodDeedsGameProps {
  onBackToMenu: () => void;
  onGameComplete?: (starsEarned: number) => void;
  isAdventureMode?: boolean;
}

interface SituationDef {
  id: string;
  title: string;
  questionText: string;
  choices: {
    emoji: string;
    text: string;
    isCorrect: boolean;
    speech: string;
  }[];
  explanation: string;
  sceneEmoji: string;
  bannerColor: string;
}

const SITUATIONS: SituationDef[] = [
  {
    id: 'trash',
    title: 'Bỏ rác đúng nơi',
    questionText: 'Bé ăn bánh kẹo ngọt xong, vỏ giấy kẹo thừa thì nên vứt vào đâu thế nhỉ?',
    choices: [
      { emoji: '🗑️', text: 'Thả vào sọt rác để giữ vệ sinh', isCorrect: true, speech: 'Con bỏ rác vào thùng đựng rác nhé!' },
      { emoji: '🧹', text: 'Nhân lúc không ai nhìn thấy, vứt luôn xuống nền nhà', isCorrect: false, speech: 'Con vứt rác xuống sàn nhà luôn.' }
    ],
    explanation: 'Tuyệt vời quá bé ơi! Bỏ vỏ giấy bánh kẹo vào thùng đựng rác giúp bảo vệ môi trường, lớp học của chúng mình luôn thơm tho và sạch đẹp nhé!',
    sceneEmoji: '🍬✨🗑️',
    bannerColor: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'wash',
    title: 'Rửa tay sạch xà bông',
    questionText: 'Trước giờ ăn cơm trưa hay khi ra sân đất chơi về, đôi tay đang dính bẩn thì bé phải làm gì?',
    choices: [
      { emoji: '👖', text: 'Lau vội hai tay vào quần áo cho nhanh', isCorrect: false, speech: 'Con tự lau tay luôn vào quần đùi của con!' },
      { emoji: '🧼', text: 'Rửa tay sạch xà phòng dưới vòi nước chảy', isCorrect: true, speech: 'Con rửa tay bằng xà bông thơm dịu lành.' }
    ],
    explanation: 'Chính xác rồi bé yêu! Đôi bàn tay được rửa sạch bằng xà phòng diệt khuẩn mát sẽ cuốn bay bụi bẩn có hại, giữ cơ thể bé luôn khỏe mạnh và không đau bụng!',
    sceneEmoji: '🧼🙌🚿',
    bannerColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'toys',
    title: 'Xếp dọn gọn gàng đồ chơi',
    questionText: 'Chơi lắp ráp xếp gỗ hay búp bê xong, đồ chơi bày bừa trên thảm phòng khách thì thế nào nhỉ?',
    choices: [
      { emoji: '🧸', text: 'Cất đồ gọn vào giỏ chứa cho ngăn nắp', isCorrect: true, speech: 'Con dọn dẹp xếp đồ chơi ngăn nắp cực xinh.' },
      { emoji: '📺', text: 'Kệ đồ chơi ở đó rồi bỏ đi xem hoạt hình', isCorrect: false, speech: 'Cứ để bừa bãi đó lát nữa chơi tiếp.' }
    ],
    explanation: 'Bé cực ngoan luôn nha! Xếp gọn gối ôm gấu bông vào sọt giúp căn nhà gọn gàng, đồ chơi của bé không lo bị gãy hỏng, dẫm phải hoặc thất lạc!',
    sceneEmoji: '🧸🏀🤖',
    bannerColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'greeting',
    title: 'Lễ phép chào hỏi mọi người',
    questionText: 'Khi bước chân đi học đến lớp gặp cô giáo, bé khoanh tay chào như thế nào mới ngoan?',
    choices: [
      { emoji: '🙇‍♂️', text: 'Khoanh hai tay, mỉm cười lễ phép cúi đầu chào', isCorrect: true, speech: 'Con khoanh tay lễ phép chào thưa cô ạ!' },
      { emoji: '🏃', text: 'Cắm đầu chạy nhanh vào phòng tìm bạn nghịch luôn', isCorrect: false, speech: 'Cứ chạy thẳng vào trong không nói gì.' }
    ],
    explanation: 'Tuyệt vời yêu bé quá! Lời chào ấm áp và hành động khoanh hai tay lễ phép chào thưa thể hiện bé ngoan ngoãn lịch sự, cô giáo và bố mẹ tự hào về con lắm!',
    sceneEmoji: '🙇‍♀️🎒🏫',
    bannerColor: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

export default function GoodDeedsGame({ onBackToMenu, onGameComplete, isAdventureMode = false }: GoodDeedsGameProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const currentSit = SITUATIONS[currentIndex];

  useEffect(() => {
    // Vocalize on load
    if (currentSit) {
      const timer = setTimeout(() => {
        speakSituation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const speakSituation = () => {
    if (currentSit) {
      speakVietnamese(`Tình huống bé ${currentSit.title}. ${currentSit.questionText}`);
    }
  };

  const handleSelect = (choiceIdx: number) => {
    if (isLocked || !currentSit) return;
    const choice = currentSit.choices[choiceIdx];
    setSelectedIdx(choiceIdx);
    setIsLocked(true);

    if (choice.isCorrect) {
      playSuccessSound();
      setScore((prev) => prev + 1);
      setFeedback({ text: currentSit.explanation, isCorrect: true });
      speakVietnamese(`Chính xác rồi! ${currentSit.explanation}`);

      // Let child read and move forward after a nice 4-second delay so they can hear explanation
      setTimeout(() => {
        if (isAdventureMode) {
          if (onGameComplete) {
            onGameComplete(3); // Adventure Complete
          }
        } else if (currentIndex < SITUATIONS.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedIdx(null);
          setIsLocked(false);
          setFeedback({ text: '', isCorrect: null });
        } else {
          // Completed all situations
          speakVietnamese("Tuyệt vời! Bé đã trả lời rất hay toàn bộ các việc tốt kỹ năng sống rồi. Bé là em bé vô cùng hiền lành ngoan ngoãn nha!");
        }
      }, 4500);
    } else {
      playFailSound();
      setIsLocked(false); // Let them try again
      setFeedback({ 
        text: 'Nên xem lại chút nha! Bé ơi làm vậy không ngoan rồi, chúng mình cùng chọn lại nào!', 
        isCorrect: false 
      });
      speakVietnamese(`Ồ không phải rồi bé ơi! Bé thử nghĩ xem nếu làm thế thì phòng ốc sẽ bẩn hay cô giáo có buồn không? Chúng mình chọn hành động tích cực cẩn thận khác nhé!`);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedIdx(null);
    setScore(0);
    setIsLocked(false);
    setFeedback({ text: '', isCorrect: null });
  };

  return (
    <div id="game-deeds-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-teal-50 rounded-3xl border-4 border-teal-300 shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-teal-200 pb-4">
        <button
          id="btn-deeds-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={18} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-800">🧸 Bé Làm Việc Tốt Lịch Sự 🧼</h2>
          <p className="text-xs text-teal-600 font-medium">Lĩnh vực: Phát thiển Thẩm mỹ, Tình cảm & Kỹ năng xã hội</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-teal-200">
          <span className="text-teal-700 font-bold text-base">⭐ Điểm: {score}</span>
        </div>
      </div>

      {currentSit ? (
        <div>
          {/* Situation card */}
          <div className="bg-white rounded-3xl border-4 border-teal-100 p-6 shadow-sm mb-6 relative">
            <div className="absolute -top-5 left-6 bg-teal-500 text-white font-black px-5 py-1.5 rounded-full border-2 border-white shadow-md text-sm">
              TÌNH HUỐNG {currentIndex + 1}
            </div>

            <div className="flex flex-col items-center text-center gap-3 mt-2">
              <span className="text-5xl select-none filter drop-shadow-md py-1 animate-float">
                {currentSit.sceneEmoji}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-teal-900 border-b-2 border-dashed border-teal-100 pb-2 w-full">
                {currentSit.title}
              </h3>
              <p className="text-base md:text-lg font-bold text-slate-700 max-w-2xl leading-relaxed mt-2">
                " {currentSit.questionText} "
              </p>

              <button
                id="btn-deeds-voice"
                onClick={() => { playClickSound(); speakSituation(); }}
                className="mt-2 inline-flex items-center gap-1 bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-1 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Volume2 size={13} /> Nghe loa đọc lại
              </button>
            </div>
          </div>

          {/* Option Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {currentSit.choices.map((choice, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrectAndSelected = isSelected && choice.isCorrect;
              const isWrongAndSelected = isSelected && !choice.isCorrect;

              return (
                <button
                  id={`btn-deed-option-${idx}`}
                  key={idx}
                  disabled={isLocked && !isSelected}
                  onClick={() => {
                    playClickSound();
                    handleSelect(idx);
                  }}
                  className={`p-5 rounded-3xl border-4 flex flex-col items-center justify-center text-center gap-4 transition-all shadow-md select-none text-wrap ${
                    isCorrectAndSelected
                      ? 'bg-emerald-500 border-emerald-600 text-white animate-wiggle shadow-emerald-200'
                      : isWrongAndSelected
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'bg-white border-teal-100 hover:border-teal-300 hover:bg-teal-50/50'
                  }`}
                >
                  <span className="text-7xl filter drop-shadow hover:scale-110 transition-transform pointer-events-none select-none">
                    {choice.emoji}
                  </span>
                  <div>
                    <span className="font-extrabold text-[15px] md:text-lg block mb-1">
                      {choice.text}
                    </span>
                    <span className="text-xs uppercase font-extrabold tracking-wider opacity-60">
                      chọn cách này
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border-4 border-teal-100">
          <p className="font-bold text-slate-500 text-lg">Đã có lỗi xảy ra. Hãy làm mới!</p>
        </div>
      )}

      {/* Feedbacks explanations overlay */}
      <AnimatePresence mode="wait">
        {feedback.text && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-2xl text-center border-2 shadow-sm mb-6 ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold text-base md:text-lg'
                : 'bg-rose-50 border-rose-200 text-rose-800 font-bold text-base'
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              <span>{feedback.isCorrect ? <ThumbsUp className="text-emerald-600" /> : <AlertCircle className="text-rose-500" />}</span>
              <span>{feedback.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finishing Celebration */}
      {currentIndex === SITUATIONS.length - 1 && feedback.isCorrect && !isAdventureMode && (
        <div className="bg-emerald-100 rounded-3xl border-2 border-emerald-300 p-6 text-center mb-4 text-emerald-950 shadow-inner">
          <h4 className="text-xl md:text-2xl font-black mb-1 flex items-center justify-center gap-2">
            🏆 CÚ LIÊN THUẬN NGOAN NGOÃN HOÀN THÀNH! 🏆
          </h4>
          <p className="text-sm font-medium">Bé cực ngoan, nắm chắc kỹ năng vàng để làm việc tốt giúp đỡ bố mẹ cô giáo!</p>
          <button
            id="btn-deeds-restart"
            onClick={() => { playClickSound(); handleRestart(); }}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-full inline-flex items-center gap-2 text-sm shadow hover:scale-105 active:scale-95 transition-transform"
          >
            <RefreshCw size={15} /> Học lại kỹ năng sống
          </button>
        </div>
      )}

      {/* Educational message */}
      <div className="text-center text-xs text-teal-700/80 mt-4 italic">
        * Rèn luyện hành vi tốt hằng ngày thông qua việc nhập vai giúp bé hình thành cảm xúc đạo đức gương mẫu.
      </div>

    </div>
  );
}
