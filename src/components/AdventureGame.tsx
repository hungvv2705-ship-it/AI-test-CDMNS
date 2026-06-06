import React, { useState, useEffect } from 'react';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound, playStarSound } from '../utils/audio';
import { ArrowLeft, Star, Heart, Volume2, Sparkles, Navigation, Award, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import our games so we can launch micro-versions during the adventure!
import AnimalGame from './AnimalGame';
import ColorGame from './ColorGame';
import CountingGame from './CountingGame';
import VehicleGame from './VehicleGame'; // (Alternatively vehicle / good deeds)
import AlphabetGame from './AlphabetGame';
import GoodDeedsGame from './GoodDeedsGame';

interface AdventureGameProps {
  onBackToMenu: () => void;
}

interface AdventureStage {
  id: string;
  name: string;
  description: string;
  emoji: string;
  bgHex: string;
  borderColor: string;
}

const STAGES: AdventureStage[] = [
  { id: 'counting', name: 'Đầm lầy Đếm Số', description: 'Cùng đếm những quả táo chín mọng trên cây!', emoji: '🍎', bgHex: 'bg-emerald-100 text-emerald-800', borderColor: 'border-emerald-300' },
  { id: 'alphabet', name: 'Đồi Chữ Cái Thần Kỳ', description: 'Học ghép chữ cái tiếng Việt cực giỏi!', emoji: '🅰️', bgHex: 'bg-pink-100 text-pink-800', borderColor: 'border-pink-300' },
  { id: 'colors', name: 'Thung lũng Sắc Màu', description: 'Tuyển lựa phân chia các quả bóng sặc sỡ!', emoji: '🎨', bgHex: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-300' },
  { id: 'animals', name: 'Đảo Động Vật Nhỏ', description: 'Lắng nghe tiếng kêu của muông thú xung quanh!', emoji: '🐱', bgHex: 'bg-amber-100 text-amber-800', borderColor: 'border-amber-300' },
  { id: 'deeds', name: 'Thành phố Việc Tốt', description: 'Rèn luyện thói quen ngoan ngoãn lịch thiệp!', emoji: '🧼', bgHex: 'bg-teal-100 text-teal-800', borderColor: 'border-teal-300' },
];

export default function AdventureGame({ onBackToMenu }: AdventureGameProps) {
  const [companion, setCompanion] = useState<'bap' | 'kem' | null>(null);
  const [stars, setStars] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [adventureComplete, setAdventureComplete] = useState<boolean>(false);

  // Companion greeting voices
  useEffect(() => {
    if (!companion) {
      speakVietnamese('Bé ơi! Chọn bạn đồng hành lý tưởng Bắp hay Kem để bước vào rừng rậm phiêu lưu cùng Bé Tí nào!');
    }
  }, [companion]);

  const selectCompanion = (type: 'bap' | 'kem') => {
    playClickSound();
    setCompanion(type);
    const companionName = type === 'bap' ? 'Bạn Bắp vui vẻ hăng hái' : 'Bạn Kem ngọt ngào cẩn thận';
    setFeedback(`Chào mừng ${companionName} đã đồng hành cùng Bé Tí! Hãy đi thôi nào!`);
    speakVietnamese(`Chào mừng ${companionName} đã gia nhập toán thám hiểm của Bé Tí! Hãy dũng cảm tiến lên đảo đếm số đầu tiên nào!`);
  };

  const startMicroChallenge = (stageId: string) => {
    playClickSound();
    setFeedback('');
    // Ensure chronological ordering if requested, but for children's sandbox free exploration is usually even friendlier. Let's let them click any incomplete stage!
    setActiveStageId(stageId);
  };

  const handleMicroChallengeComplete = () => {
    // Stage completed successfully
    if (activeStageId) {
      const stageObj = STAGES.find(s => s.id === activeStageId);
      const newlyCompleted = [...completedStages, activeStageId];
      setCompletedStages(newlyCompleted);
      setStars((prev) => prev + 1);
      playStarSound();

      const congratsSpeech = `Tuyệt vời quá! Bé Tí và ${companion === 'bap' ? 'Bắp' : 'Kem'} đã hoàn thành thử thách ${stageObj?.name}! Bé nhận được 1 Ngôi sao vàng tuyệt diệu!`;
      setFeedback(congratsSpeech);
      speakVietnamese(congratsSpeech);

      setActiveStageId(null);

      // Check if all 5 completed
      if (newlyCompleted.length === STAGES.length) {
        setTimeout(() => {
          setAdventureComplete(true);
          playStarSound();
          speakVietnamese(`Hoan hô! Bé Tí và ${companion === 'bap' ? 'Bạn Bắp' : 'Bạn Kem'} đã đi trọn vẹn năm kỳ trắc của Thế giới phiêu lưu! Bé yêu nhận Huy hiệu bé tài ba thông thái mầm non rồi nha!`);
        }, 3000);
      }
    }
  };

  const handleReset = () => {
    setCompanion(null);
    setStars(0);
    setCompletedStages([]);
    setActiveStageId(null);
    setFeedback('');
    setAdventureComplete(false);
  };

  // Render current inside active game frame
  if (activeStageId) {
    return (
      <div className="relative">
        <div className="bg-amber-100 p-3 rounded-2xl mb-4 border border-amber-300 text-center text-sm font-bold text-amber-900 flex items-center justify-center gap-2">
          <span>🛡️ Thử thách Động: {STAGES.find(s => s.id === activeStageId)?.name} 🛡️</span>
          <span className="bg-white px-2 py-0.5 rounded-full text-xs">Phục vụ bởi Bé Tí & {companion === 'bap' ? '🌽 Bắp' : '🍦 Kem'}</span>
        </div>

        {activeStageId === 'counting' && (
          <CountingGame
            onBackToMenu={() => setActiveStageId(null)}
            onGameComplete={handleMicroChallengeComplete}
            isAdventureMode={true}
          />
        )}
        {activeStageId === 'alphabet' && (
          <AlphabetGame
            onBackToMenu={() => setActiveStageId(null)}
            onGameComplete={handleMicroChallengeComplete}
            isAdventureMode={true}
          />
        )}
        {activeStageId === 'colors' && (
          <ColorGame
            onBackToMenu={() => setActiveStageId(null)}
            onGameComplete={handleMicroChallengeComplete}
            isAdventureMode={true}
          />
        )}
        {activeStageId === 'animals' && (
          <AnimalGame
            onBackToMenu={() => setActiveStageId(null)}
            onGameComplete={handleMicroChallengeComplete}
            isAdventureMode={true}
          />
        )}
        {activeStageId === 'deeds' && (
          <GoodDeedsGame
            onBackToMenu={() => setActiveStageId(null)}
            onGameComplete={handleMicroChallengeComplete}
            isAdventureMode={true}
          />
        )}
      </div>
    );
  }

  return (
    <div id="game-adventure-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl border-4 border-emerald-300 shadow-xl relative overflow-hidden">
      
      {/* End of Game Award Modal */}
      <AnimatePresence>
        {adventureComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-8 rounded-3xl border-8 border-amber-400 max-w-md w-full shadow-2xl relative text-slate-800"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-amber-950 p-4 rounded-full border-4 border-white shadow-md animate-bounce">
                <Award size={48} />
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-amber-600 mt-8 mb-1">🏅 BÉ THÔNG THÁI 🏅</h3>
              <p className="text-xs uppercase bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full font-bold inline-block tracking-widest mb-4">Chiến Thắng Phiêu Lưu</p>
              
              <div className="text-6xl my-4">🏕️🦁🌽🍦✨⭐🎒</div>

              <p className="text-slate-600 font-bold mb-6 text-base leading-relaxed">
                Hoan hô! Bé Tí cùng {companion === 'bap' ? 'Bạn Bắp 🌽' : 'Bạn Kem 🍦'} đã hoàn thành xuất sắc toàn bộ 5 hòn đảo thử thách tri thức và rinh về trọn vẹn **5 Ngôi sao vàng** rồi! Bé yêu thực sự thông thái và đáng tự hào!
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  id="btn-adventure-reset"
                  onClick={() => { playClickSound(); handleReset(); }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 text-sm"
                >
                  <RotateCcw size={16} /> Phiêu lưu tiếp!
                </button>
                <button
                  id="btn-adventure-back-menu"
                  onClick={() => { playClickSound(); onBackToMenu(); }}
                  className="bg-slate-500 hover:bg-slate-600 text-white font-bold px-4 py-3 rounded-2xl shadow text-xs"
                >
                  Quay lại menu chính
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-emerald-200 pb-4">
        <button
          id="btn-adventure-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-2xl shadow transition-all active:scale-95 text-xs"
        >
          <ArrowLeft size={16} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 flex items-center justify-center gap-2">
            🎒 Phiêu Lưu Mầm Non Của Bé Tí 🏕️
          </h2>
          <p className="text-xs text-emerald-600 font-medium">Hành trình trải nghiệm tổng hợp 5 lĩnh vực mầm non</p>
        </div>

        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-2xl border-2 border-emerald-200 shadow-sm text-amber-500 font-bold">
          <Star fill="currentColor" size={16} />
          <span className="text-slate-800 text-sm">Sao: {stars}/5</span>
        </div>
      </div>

      {!companion ? (
        /* SCREEN A: CHOOSE COMPANION */
        <div className="bg-white/80 p-6 rounded-3xl border-4 border-emerald-100 flex flex-col items-center shadow-inner text-center">
          <span className="text-5xl mb-3 animate-float select-none">🎒👧🧒‍♂️⛺</span>
          
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">
            Chào mừng bé dấn thân vào chuyến phiêu lưu mầm non!
          </h3>
          <p className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed mb-6">
            Bé Tí đã thắt dây giày dã ngoại sẵn sàng rồi! Bé ngoan ơi, bé muốn chọn người bạn nào đi theo cổ vũ và cứu trợ chúng mình thế?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
            {/* Companion Bắp */}
            <button
              id="btn-choose-bap"
              onClick={() => selectCompanion('bap')}
              className="bg-gradient-to-b from-yellow-50 to-amber-100 border-4 border-yellow-300 hover:border-yellow-400 hover:shadow-lg p-5 rounded-3xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md text-slate-800"
            >
              <span className="text-7xl filter drop-shadow select-none mb-3 duration-300 transform hover:rotate-6">🌽</span>
              <span className="text-xl font-bold text-amber-900 leading-snug">Bạn Bắp Ngọt Ngào</span>
              <p className="text-xs text-amber-700/85 mt-1 max-w-xs font-medium">
                Vui tính, hay nhảy lò cò và cực kỳ yêu thích những con đố chữ cái tiêng Việt!
              </p>
              <span className="mt-4 bg-yellow-400 text-amber-950 font-black px-4 py-1 rounded-full text-xs uppercase shadow-sm">
                Đồng hành nhé
              </span>
            </button>

            {/* Companion Kem */}
            <button
              id="btn-choose-kem"
              onClick={() => selectCompanion('kem')}
              className="bg-gradient-to-b from-sky-50 to-pink-100 border-4 border-pink-300 hover:border-pink-450 hover:shadow-lg p-5 rounded-3xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md text-slate-800"
            >
              <span className="text-7xl filter drop-shadow select-none mb-3 duration-300 transform hover:scale-105">🍦</span>
              <span className="text-xl font-bold text-pink-900 leading-snug">Bạn Kem Kỳ Lân</span>
              <p className="text-xs text-pink-700/85 mt-1 max-w-xs font-medium">
                Mát dịu, yêu ca hát, có trí tuệ sắc bén đặc biệt thích thi đếm táo chín đỏ!
              </p>
              <span className="mt-4 bg-pink-400 text-white font-black px-4 py-1 rounded-full text-xs uppercase shadow-sm">
                Đồng hành nhé
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* SCREEN B: ADVENTURE MAP WITH CHECKPOINTS */
        <div>
          {/* Top Info Banner */}
          <div className="bg-white rounded-2xl p-4 border-2 border-emerald-200 mb-6 flex items-center justify-between shadow-sm flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl select-none animate-float">🎒</span>
              <div className="text-left">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đội hình thám hiểm</span>
                <p className="text-base font-black text-slate-800 flex items-center gap-1">
                  Bé Tí & {companion === 'bap' ? '🌽 Bạn Bắp Vui Vẻ' : '🍦 Bạn Kem Mát Rượi'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500 font-bold select-none text-xs text-right hidden md:block">
              {completedStages.length === 0 ? '👉 Chạm vào hòn đảo đầu tiên để học tập!' : 
               completedStages.length === STAGES.length ? '🎉 Ôi tuyệt vời! Hoàn tất trọn chuyến thám hiểm!' : '👉 Bấm vào các đảo chưa vượt qua nhé!'}
            </div>
          </div>

          {/* Feedback log message */}
          {feedback && (
            <div className="bg-emerald-50 border-2 border-emerald-200 px-4 py-2.5 rounded-xl text-center text-xs md:text-sm font-bold text-emerald-800 mb-6 flex items-center justify-center gap-2 animate-pulse shadow-sm">
              <span>🔔</span>
              <span>{feedback}</span>
            </div>
          )}

          {/* Active Interactive Scenic Parkway Grid Map */}
          <div className="grid md:grid-cols-5 gap-4 mb-6 relative">
            
            {/* Visual Parkway dotted trail link line for desktop */}
            <div className="absolute top-1/2 left-10 right-10 h-1.5 border-t-4 border-dashed border-emerald-300 -translate-y-1/2 z-0 hidden md:block" />

            {STAGES.map((stage, idx) => {
              const isCompleted = completedStages.includes(stage.id);
              return (
                <div
                  id={`adventure-stage-card-${stage.id}`}
                  key={stage.id}
                  className="z-10 relative"
                >
                  <button
                    id={`btn-adventure-stage-${stage.id}`}
                    onClick={() => startMicroChallenge(stage.id)}
                    className={`w-full p-4 rounded-3xl border-4 text-center flex flex-col justify-between min-h-[160px] cursor-pointer transition-all select-none relative ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-500 text-slate-800 grayscale-30 scale-95 shadow-sm' 
                        : 'bg-white hover:border-emerald-400 hover:shadow-lg ' + stage.borderColor
                    }`}
                  >
                    {/* Floating star for completed stage */}
                    {isCompleted && (
                      <div className="absolute -top-3 -right-3 bg-yellow-400 border-2 border-white text-white p-1 rounded-full shadow z-20 animate-wiggle">
                        <Star fill="currentColor" size={20} />
                      </div>
                    )}

                    {/* Step label index */}
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-full inline-block mx-auto uppercase tracking-wider mb-2">
                      Hòn Đảo {idx + 1}
                    </span>

                    {/* Big Icon */}
                    <span className="text-5xl filter drop-shadow select-none my-1 animate-float pointer-events-none">
                      {stage.emoji}
                    </span>

                    {/* Text values */}
                    <div className="mt-2 text-wrap pointer-events-none">
                      <h4 className="font-extrabold text-slate-850 text-sm">{stage.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{stage.description}</p>
                    </div>

                    {/* Button feedback footer */}
                    <div className="mt-3">
                      {isCompleted ? (
                        <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-100 px-3 py-0.5 rounded-full">
                          Đã Hoàn Thành ✔️
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-900 bg-emerald-50 px-3 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5">
                          Khám Phá <Navigation size={8} />
                        </span>
                      )}
                    </div>

                  </button>

                  {/* Vertical dotted pathway connector icon for mobile screen */}
                  {idx < STAGES.length - 1 && (
                    <div className="w-1 border-l-4 border-dashed border-emerald-300 h-6 mx-auto my-1 block md:hidden" />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Parental Tips */}
      <div className="text-center text-xs text-emerald-700/80 mt-4 italic">
        * Chế độ phiêu lưu kết hợp đa năng tạo môi trường tổng hòa kiểm nghiệm cả 5 bình diện năng lực cho bé.
      </div>

    </div>
  );
}
