import React, { useState, useEffect, useRef } from 'react';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound } from '../utils/audio';
import { ArrowLeft, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorGameProps {
  onBackToMenu: () => void;
  onGameComplete?: (starsEarned: number) => void;
  isAdventureMode?: boolean;
}

interface ColorDef {
  id: string;
  name: string;
  colorClass: string;
  hex: string;
  emoji: string;
}

const COLORS: ColorDef[] = [
  { id: 'do', name: 'Đỏ', colorClass: 'bg-red-500 shadow-red-200', hex: '#ef4444', emoji: '🍎' },
  { id: 'vang', name: 'Vàng', colorClass: 'bg-yellow-400 shadow-yellow-100', hex: '#facc15', emoji: '🍌' },
  { id: 'xanhla', name: 'Xanh lá', colorClass: 'bg-green-500 shadow-green-200', hex: '#22c55e', emoji: '🍏' },
  { id: 'xanhduong', name: 'Xanh dương', colorClass: 'bg-blue-500 shadow-blue-200', hex: '#3b82f6', emoji: '🐳' },
  { id: 'cam', name: 'Cam', colorClass: 'bg-orange-500 shadow-orange-200', hex: '#f97316', emoji: '🍊' },
];

export default function ColorGame({ onBackToMenu, onGameComplete, isAdventureMode = false }: ColorGameProps) {
  const [activeBall, setActiveBall] = useState<ColorDef | null>(null);
  const [selectedBallId, setSelectedBallId] = useState<string | null>(null); // For click selection fallback
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Drag position states (for custom pointer dragging)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const ballRef = useRef<HTMLDivElement>(null);
  const bucketRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const generateNewColor = () => {
    setIsLocked(false);
    setSelectedBallId(null);
    setDragOffset({ x: 0, y: 0 });
    
    // Pick a random color that is different from current if possible
    let nextColor: ColorDef;
    do {
      nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (activeBall && nextColor.id === activeBall.id);

    setActiveBall(nextColor);
    setFeedback({ text: '', isCorrect: null });
  };

  useEffect(() => {
    generateNewColor();
  }, []);

  // Voice greeting
  useEffect(() => {
    if (activeBall) {
      const timer = setTimeout(() => {
        speakInstruction();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeBall]);

  const speakInstruction = () => {
    if (activeBall) {
      speakVietnamese(`Bé ơi, kéo quả bóng màu ${activeBall.name} vào đúng chiếc hộp màu ${activeBall.name} nhé!`);
    }
  };

  // Process a matching attempt
  const processMatch = (targetBucketId: string) => {
    if (isLocked || !activeBall) return;

    if (targetBucketId === activeBall.id) {
      // CORRECT!
      setIsLocked(true);
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      playSuccessSound();
      
      const congrats = [
        `Màu ${activeBall.name}! Bé giỏi quá!`,
        `Đúng rồi! Đây là màu ${activeBall.name}!`,
        `Thật tuyệt vời! Màu ${activeBall.name} đã được cất gọn gàng!`,
      ];
      const speech = congrats[Math.floor(Math.random() * congrats.length)];
      setFeedback({ text: speech, isCorrect: true });
      speakVietnamese(speech);

      setTimeout(() => {
        if (isAdventureMode) {
          if (onGameComplete) {
            onGameComplete(3); // 3 stars
          }
        } else if (score >= 4) {
          speakVietnamese("Tuyệt vời! Bé đã phân loại chính xác các màu sắc rồi!");
        } else {
          generateNewColor();
        }
      }, 2500);
    } else {
      // INCORRECT!
      setStreak(0);
      playFailSound();
      const bucketName = COLORS.find(c => c.id === targetBucketId)?.name || '';
      setFeedback({ 
        text: `Ồ! Đây là hộp màu ${bucketName} rồi, chúng mình thử kéo quả bóng vào chiếc hộp khác xem nào!`, 
        isCorrect: false 
      });
      speakVietnamese(`Không phải đâu bé ơi! Thử lại xem hộp màu ${activeBall.name} ở chỗ nào nhé!`);
      
      // Reset position back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Safe manual selection matching
  const handleBucketClick = (bucketId: string) => {
    playClickSound();
    if (!activeBall || isLocked) return;
    
    // Automatic match
    processMatch(bucketId);
  };

  // Custom touch/mouse dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked) return;
    setIsDragging(true);
    setSelectedBallId(activeBall?.id || null);
    if (ballRef.current) {
      ballRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (ballRef.current) {
      ballRef.current.releasePointerCapture(e.pointerId);
    }

    // Check collision with buckets
    if (ballRef.current) {
      const ballRect = ballRef.current.getBoundingClientRect();
      const ballCenterX = ballRect.left + ballRect.width / 2;
      const ballCenterY = ballRect.top + ballRect.height / 2;

      let matchedBucketId: string | null = null;

      // Check each box container collision
      Object.entries(bucketRefs.current).forEach(([id, ref]) => {
        if (ref) {
          const rect = (ref as HTMLDivElement).getBoundingClientRect();
          if (
            ballCenterX >= rect.left &&
            ballCenterX <= rect.right &&
            ballCenterY >= rect.top &&
            ballCenterY <= rect.bottom
          ) {
            matchedBucketId = id;
          }
        }
      });

      if (matchedBucketId) {
        processMatch(matchedBucketId);
      } else {
        // Snap back
        setDragOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleReset = () => {
    setScore(0);
    setStreak(0);
    generateNewColor();
  };

  return (
    <div id="game-colors-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-blue-50 rounded-3xl border-4 border-blue-300 shadow-xl relative overflow-hidden">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-blue-200 pb-4">
        <button
          id="btn-colors-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={18} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800">🍎 Bé Ghép Màu Sắc 🍊</h2>
          <p className="text-xs text-blue-600 font-medium">Lĩnh vực: Phát triển Nhận thức & Thẩm mỹ</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-blue-200">
          <span className="text-blue-700 font-bold text-base">⭐ Điểm: {score}</span>
        </div>
      </div>

      {/* Guide text voice activator */}
      {activeBall && (
        <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-blue-200 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
          <span className="text-blue-900 font-extrabold text-lg md:text-xl flex items-center gap-2">
            🎈 Bé bế quả bóng màu <span className="underline decoration-wavy px-2 rounded-lg text-white" style={{ backgroundColor: activeBall.hex }}>{activeBall.name}</span> thả vào hộp cùng màu nhé! 🎈
          </span>
          <p className="text-xs text-slate-500 font-medium">Mẹo: Bé có thể dùng ngón tay kéo quả bóng, hoặc bấm vào bóng rồi bấm vào chiếc chiếc hộp tương ứng nha!</p>
          <button
            id="btn-colors-voice"
            onClick={() => { playClickSound(); speakInstruction(); }}
            className="mt-1 flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Volume2 size={14} /> Nghe cô giáo bảo
          </button>
        </div>
      )}

      {/* Play Ground */}
      <div className="min-h-[260px] flex flex-col items-center justify-between gap-8 py-4 px-2 relative border-4 border-dashed border-blue-200 rounded-3xl bg-white/70 mb-6">
        
        {/* Top Section: Active Ball */}
        <div className="flex justify-center items-center h-32 w-full relative">
          <AnimatePresence mode="wait">
            {activeBall && (
              <motion.div
                id="draggable-color-ball"
                key={activeBall.id}
                ref={ballRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                animate={!isDragging ? { x: 0, y: 0 } : undefined}
                style={{
                  transform: isDragging 
                    ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` 
                    : 'none',
                  touchAction: 'none',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center font-bold text-white transition-shadow shadow-md select-none border-4 border-white ${activeBall.colorClass} ${
                  selectedBallId ? 'ring-4 ring-offset-2 ring-blue-400' : ''
                }`}
              >
                {/* Visual inside ball */}
                <span className="text-4xl filter drop-shadow-sm select-none pointer-events-none">{activeBall.emoji}</span>
                <span className="text-xs tracking-wider absolute bottom-2 select-none pointer-events-none mt-1 bg-black/20 px-2.5 py-0.5 rounded-full font-bold">
                  {activeBall.name}
                </span>

                {/* Sparkling aura */}
                <div className="absolute inset-0 rounded-full bg-white/10 animate-ping pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section: Color Boxes Row */}
        <div className="grid grid-cols-5 gap-1.5 md:gap-4 w-full px-1">
          {COLORS.map((color) => {
            const isTargetMatched = activeBall?.id === color.id && isLocked;
            return (
              <div
                id={`bucket-color-${color.id}`}
                key={color.id}
                ref={(el) => { bucketRefs.current[color.id] = el; }}
                onClick={() => handleBucketClick(color.id)}
                className={`relative flex flex-col items-center justify-end p-2 md:p-4 rounded-2xl border-4 transition-all cursor-pointer select-none min-h-[110px] ${
                  isTargetMatched 
                    ? 'border-emerald-400 bg-emerald-50 scale-105 animate-bouncer' 
                    : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-100/50'
                }`}
              >
                {/* Visual Opening */}
                <div className="w-full h-8 md:h-12 rounded-t-full border-2 border-b-0 border-slate-300 absolute top-0 left-0 bg-slate-200/50 flex justify-center items-center">
                  <span className="text-xs uppercase text-slate-500 font-extrabold tracking-widest hidden md:inline">Mở Hộp</span>
                </div>

                {/* Paint Bucket base design */}
                <div className="w-full h-16 md:h-20 rounded-b-xl flex flex-col items-center justify-center text-white font-black z-10 border-2 border-white relative shadow-sm" style={{ backgroundColor: color.hex }}>
                  <span className="text-sm md:text-lg tracking-wide drop-shadow-md text-nowrap select-none">{color.name}</span>
                  <div className="text-xs uppercase scale-90 opacity-80 font-bold hidden md:block">Thả Vào</div>
                </div>

                {/* Completed badge */}
                {isTargetMatched && (
                  <div className="absolute -top-3 bg-emerald-500 text-white font-bold p-1 rounded-full shadow-md z-20 animate-wiggle">
                    <Sparkles size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedbacks Box */}
      <AnimatePresence mode="wait">
        {feedback.text && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-3.5 rounded-2xl text-center font-bold text-base md:text-lg border-2 shadow-sm ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play-again when reaching points */}
      {score >= 5 && !isAdventureMode && (
        <div className="mt-4 bg-emerald-100 border-2 border-emerald-200 text-emerald-950 p-6 rounded-2xl text-center shadow-inner">
          <h4 className="text-xl font-bold">🏆 Bé Hợp Nhất Màu Sắc Thật Xuất Sắc! 🏆</h4>
          <p className="text-sm font-medium mt-1">Bé đã trả lời rất nhiều câu hỏi màu đúng rồi nha.</p>
          <button
            id="btn-colors-reset"
            onClick={() => { playClickSound(); handleReset(); }}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 font-bold py-2 px-5 rounded-full text-white inline-flex items-center gap-2 shadow transition-transform hover:scale-105 active:scale-95"
          >
            <RotateCcw size={16} /> Tiếp tục học tập!
          </button>
        </div>
      )}

      {/* Parental Tips */}
      <div className="text-center text-xs text-blue-700/80 mt-4 italic">
        * Game giúp củng cố nhận thức thị giác và độ chuẩn xác vận động ngón tay cho con.
      </div>
    </div>
  );
}
