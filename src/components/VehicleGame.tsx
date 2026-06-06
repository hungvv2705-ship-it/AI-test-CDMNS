import React, { useState, useEffect, useRef } from 'react';
import { speakVietnamese, playSuccessSound, playFailSound, playClickSound } from '../utils/audio';
import { ArrowLeft, Volume2, Landmark, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleGameProps {
  onBackToMenu: () => void;
  onGameComplete?: (starsEarned: number) => void;
  isAdventureMode?: boolean;
}

interface VehicleDef {
  id: string;
  name: string;
  emoji: string;
  category: 'road' | 'water' | 'air';
  description: string;
}

const VEHICLES: VehicleDef[] = [
  { id: 'oto', name: 'Ô tô', emoji: '🚗', category: 'road', description: 'chạy bon bon trên đường bộ' },
  { id: 'xemay', name: 'Xe máy', emoji: '🏍️', category: 'road', description: 'chạy trên đường bộ vèo vèo' },
  { id: 'tauthuy', name: 'Tàu thủy', emoji: '🚢', category: 'water', description: 'rẽ sóng ra khơi trên đường thủy' },
  { id: 'cano', name: 'Ca nô', emoji: '🚤', category: 'water', description: 'lướt nhanh trên mặt nước đường thủy' },
  { id: 'maybay', name: 'Máy bay', emoji: '✈️', category: 'air', description: 'bay cao vút trên đường hàng không' },
  { id: 'tructhang', name: 'Trực thăng', emoji: '🚁', category: 'air', description: 'bay đứng lơ lửng trên đường hàng không' },
  { id: 'xedap', name: 'Xe đạp', emoji: '🚲', category: 'road', description: 'kính coong chạy trên đường bộ' },
  { id: 'taucanhngam', name: 'Thuyền buồm', emoji: '⛵', category: 'water', description: 'giăng buồm xuôi gió trên đường thủy' },
];

export default function VehicleGame({ onBackToMenu, onGameComplete, isAdventureMode = false }: VehicleGameProps) {
  const [currentVehicle, setCurrentVehicle] = useState<VehicleDef | null>(null);
  const [placedVehicles, setPlacedVehicles] = useState<{ [category: string]: VehicleDef[] }>({
    road: [],
    water: [],
    air: [],
  });
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Drag coordinates for manual tracking
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const zoneRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const selectNextVehicle = () => {
    setIsLocked(false);
    setDragOffset({ x: 0, y: 0 });
    setFeedback({ text: '', isCorrect: null });

    // Pick a vehicle that is not yet fully populated in placedVehicles, or just pick randomly
    const unplaced = VEHICLES.filter(
      v => !placedVehicles.road.some(p => p.id === v.id) &&
           !placedVehicles.water.some(p => p.id === v.id) &&
           !placedVehicles.air.some(p => p.id === v.id)
    );

    if (unplaced.length > 0) {
      setCurrentVehicle(unplaced[Math.floor(Math.random() * unplaced.length)]);
    } else {
      // Replaced everything, reset
      setPlacedVehicles({ road: [], water: [], air: [] });
      setCurrentVehicle(VEHICLES[Math.floor(Math.random() * VEHICLES.length)]);
    }
  };

  useEffect(() => {
    selectNextVehicle();
  }, []);

  // Vocalize instructions
  useEffect(() => {
    if (currentVehicle) {
      const timer = setTimeout(() => {
        speakInstruction();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentVehicle]);

  const speakInstruction = () => {
    if (currentVehicle) {
      speakVietnamese(`Bé ơi, chiếc xe ${currentVehicle.name} đi ở đường nào đường bộ, đường thủy hay đường hàng không thế nhỉ?`);
    }
  };

  const handleClassification = (category: 'road' | 'water' | 'air') => {
    if (isLocked || !currentVehicle) return;

    if (currentVehicle.category === category) {
      // Correct match!
      setIsLocked(true);
      setScore((prev) => prev + 1);
      playSuccessSound();

      // Add to list of placed items to render visually in the zones
      setPlacedVehicles((prev) => ({
        ...prev,
        [category]: [...prev[category], currentVehicle],
      }));

      const explainText = `Hoan hô! Chiếc ${currentVehicle.name} ${currentVehicle.description}!`;
      setFeedback({ text: explainText, isCorrect: true });
      speakVietnamese(explainText);

      setTimeout(() => {
        if (isAdventureMode) {
          if (onGameComplete) {
            onGameComplete(3); // 3 stars
          }
        } else {
          selectNextVehicle();
        }
      }, 3000);
    } else {
      // WRONG! Encourage child
      playFailSound();
      setDragOffset({ x: 0, y: 0 }); // Snap back
      const categoryNames = {
        road: 'Đường bộ chạy dưới mặt đất',
        water: 'Đường thủy bơi dưới biển nước',
        air: 'Đường hàng không bay trên bầu trời',
      };
      
      setFeedback({
        text: `Ồ! Chiếc ${currentVehicle.name} đi trên ${categoryNames[currentVehicle.category]} cơ mà! Bé thử xếp lại nhé!`,
        isCorrect: false,
      });

      speakVietnamese(`Không đúng rồi bé ơi! Xe ${currentVehicle.name} không hoạt động ở ${category === 'road' ? 'đường bộ' : category === 'water' ? 'đường thủy' : 'đường hàng không'} đâu nhé, bé thử lại xem!`);
    }
  };

  // Pointer tracking events for drag and drop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked) return;
    setIsDragging(true);
    if (dragRef.current) {
      dragRef.current.setPointerCapture(e.pointerId);
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
    if (dragRef.current) {
      dragRef.current.releasePointerCapture(e.pointerId);
    }

    // Inspect collisions
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let targetCategory: 'road' | 'water' | 'air' | null = null;

      Object.entries(zoneRefs.current).forEach(([cat, el]) => {
        if (el) {
          const zRect = (el as HTMLDivElement).getBoundingClientRect();
          if (
            centerX >= zRect.left &&
            centerX <= zRect.right &&
            centerY >= zRect.top &&
            centerY <= zRect.bottom
          ) {
            targetCategory = cat as 'road' | 'water' | 'air';
          }
        }
      });

      if (targetCategory) {
        handleClassification(targetCategory);
      } else {
        // Snap back
        setDragOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleRestart = () => {
    setPlacedVehicles({ road: [], water: [], air: [] });
    setScore(0);
    selectNextVehicle();
  };

  return (
    <div id="game-vehicles-root" className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-sky-50 rounded-3xl border-4 border-sky-300 shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b-2 border-sky-200 pb-4">
        <button
          id="btn-vehicles-back"
          onClick={() => { playClickSound(); onBackToMenu(); }}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
        >
          <ArrowLeft size={18} /> Về thực đơn
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-800">✈️ Bé Xếp Phương Tiện Giao Thông 🚢</h2>
          <p className="text-xs text-sky-600 font-medium">Lĩnh vực: Phát triển Nhận thức & Khoa học xã học</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border-2 border-sky-200">
          <span className="text-sky-700 font-bold text-base">⭐ Điểm: {score}</span>
        </div>
      </div>

      {/* Guide label and voice */}
      {currentVehicle && (
        <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-sky-200 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
          <span className="text-sky-950 font-extrabold text-lg md:text-xl">
            🚚 "Xe <span className="text-red-500 underline font-black">{currentVehicle.name}</span> đi qua con đường nào tương ứng nhỉ?"
          </span>
          <p className="text-xs text-slate-500 font-medium">Ba mẹ hướng dẫn bé kéo phương tiện sang khu vực đúng, hoặc chạm vào phương tiện rồi chạm cốc đích nha!</p>
          <button
            id="btn-vehicles-voice"
            onClick={() => { playClickSound(); speakInstruction(); }}
            className="flex items-center gap-1 bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Volume2 size={14} /> Nghe loa đọc giọng
          </button>
        </div>
      )}

      {/* Canvas Zones and draggable container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        
        {/* Play Areas - Left side (9 cols) */}
        <div className="col-span-12 md:col-span-8 grid grid-rows-3 gap-4">
          
          {/* Air Zone */}
          <div
            id="zone-category-air"
            ref={(el) => { zoneRefs.current.air = el; }}
            onClick={() => handleClassification('air')}
            className="rounded-2xl border-4 border-dashed border-sky-300 bg-sky-100/60 hover:bg-sky-100 p-4 min-h-[100px] relative flex md:flex-row flex-col items-center justify-between gap-4 transition-all cursor-pointer overflow-hidden shadow-inner"
          >
            {/* Background Clouds */}
            <div className="absolute top-2 left-4 text-3xl opacity-30 select-none pointer-events-none">☁️☁️</div>
            <div className="absolute bottom-2 right-8 text-2xl opacity-40 select-none pointer-events-none">☁️</div>

            <div className="flex items-center gap-2 z-10">
              <span className="text-4xl">☁️</span>
              <div>
                <h4 className="font-extrabold text-sky-800 text-base md:text-lg">ĐƯỜNG HÀNG KHÔNG</h4>
                <p className="text-xs text-sky-600/90 font-medium uppercase tracking-wider">Bầu trời xanh trong lành</p>
              </div>
            </div>

            {/* Already placed items showcase inside container */}
            <div className="flex gap-2 flex-wrap min-h-12 items-center justify-end z-10 pr-2">
              {placedVehicles.air.map((item, idx) => (
                <motion.div
                  id={`placed-air-${item.id}`}
                  key={idx}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-white/80 p-1.5 rounded-full text-2xl w-10 h-10 flex items-center justify-center shadow-sm border border-sky-200 animate-float"
                  title={item.name}
                >
                  {item.emoji}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Water Zone */}
          <div
            id="zone-category-water"
            ref={(el) => { zoneRefs.current.water = el; }}
            onClick={() => handleClassification('water')}
            className="rounded-2xl border-4 border-dashed border-cyan-300 bg-cyan-100/60 hover:bg-cyan-100 p-4 min-h-[100px] relative flex md:flex-row flex-col items-center justify-between gap-4 transition-all cursor-pointer overflow-hidden shadow-inner"
          >
            {/* Background waves */}
            <div className="absolute top-1 right-20 text-3xl opacity-30 select-none pointer-events-none">🐟🏝️</div>
            <div className="absolute bottom-1 left-2 text-2xl opacity-25 select-none pointer-events-none">🌊🌊</div>

            <div className="flex items-center gap-2 z-10">
              <span className="text-4xl">🌊</span>
              <div>
                <h4 className="font-extrabold text-cyan-800 text-base md:text-lg">ĐƯỜNG THỦY</h4>
                <p className="text-xs text-cyan-600/90 font-medium uppercase tracking-wider">Kênh rạch, biển cả sóng vỗ</p>
              </div>
            </div>

            {/* Placed items */}
            <div className="flex gap-2 flex-wrap min-h-12 items-center justify-end z-10 pr-2">
              {placedVehicles.water.map((item, idx) => (
                <motion.div
                  id={`placed-water-${item.id}`}
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/80 p-1.5 rounded-full text-2xl w-10 h-10 flex items-center justify-center shadow-sm border border-cyan-200 animate-bouncer"
                  title={item.name}
                >
                  {item.emoji}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Road Zone */}
          <div
            id="zone-category-road"
            ref={(el) => { zoneRefs.current.road = el; }}
            onClick={() => handleClassification('road')}
            className="rounded-2xl border-4 border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 p-4 min-h-[100px] relative flex md:flex-row flex-col items-center justify-between gap-4 transition-all cursor-pointer overflow-hidden shadow-inner"
          >
            {/* Road lines background */}
            <div className="absolute inset-x-0 h-1 bg-amber-200/50 border-dashed border-amber-300 top-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="flex items-center gap-2 z-10">
              <span className="text-4xl">🛣️</span>
              <div>
                <h4 className="font-extrabold text-amber-800 text-base md:text-lg">ĐƯỜNG BỘ</h4>
                <p className="text-xs text-amber-600/90 font-medium uppercase tracking-wider">Đường nhựa chạy xe bon bon</p>
              </div>
            </div>

            {/* Placed items */}
            <div className="flex gap-2 flex-wrap min-h-12 items-center justify-end z-10 pr-2">
              {placedVehicles.road.map((item, idx) => (
                <motion.div
                  id={`placed-road-${item.id}`}
                  key={idx}
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white/80 p-1.5 rounded-full text-2xl w-10 h-10 flex items-center justify-center shadow-sm border border-amber-200"
                  title={item.name}
                >
                  {item.emoji}
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Action Panel - Right side (4 cols) */}
        <div className="col-span-12 md:col-span-4 flex flex-col justify-center items-center p-4 bg-white border-2 border-sky-100 rounded-2xl relative shadow-md min-h-[220px]">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Món Đồ Đang Đợi Bé</h4>
          
          <AnimatePresence mode="wait">
            {currentVehicle ? (
              <motion.div
                id="draggable-vehicle"
                key={currentVehicle.id}
                ref={dragRef}
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
                className={`w-28 h-28 bg-sky-100 border-4 border-sky-300 rounded-full flex flex-col items-center justify-center p-2 relative shadow-lg hover:shadow-xl hover:border-sky-400 select-none z-30 transition-transform ${
                  isDragging ? 'rotate-3 scale-110 shadow-sky-200' : 'animate-float'
                }`}
              >
                <span className="text-6xl pointer-events-none select-none filter drop-shadow-md">{currentVehicle.emoji}</span>
                <span className="text-xs bg-sky-500 text-white font-extrabold px-2 py-0.5 rounded-full absolute -bottom-1 shadow-sm select-none pointer-events-none uppercase">
                  {currentVehicle.name}
                </span>
              </motion.div>
            ) : (
              <div className="text-center text-slate-400 text-sm py-8 font-bold">
                Có chuyện gì xảy ra rồi... Xin hãy bấm Khởi động lại nhé!
              </div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-[11px] font-medium text-slate-400 text-center max-w-xs leading-relaxed">
            👆 Kéo hình tròn này thả vào vùng bên trái, hoặc chạm rồi chạm trực tiếp vào dòng đường nhé!
          </div>
        </div>

      </div>

      {/* Feedbacks Panel */}
      <AnimatePresence mode="wait">
        {feedback.text && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-xl text-center font-bold text-base md:text-lg border-2 shadow-sm mb-4 ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex justify-center items-center gap-1">
              <span>{feedback.isCorrect ? '✅' : '💡'}</span>
              <span>{feedback.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete or Reset states */}
      {score >= 6 && !isAdventureMode && (
        <div className="mt-4 bg-emerald-100 border-2 border-emerald-200 p-5 rounded-2xl text-center">
          <h4 className="text-lg font-bold text-emerald-950 flex items-center justify-center gap-2">
            🏆 Bé Làm Sạch Sân Ga Rồi! 🏆
          </h4>
          <p className="text-xs text-slate-600 mt-1">Bé phân biệt phương tiện giao thông chuẩn cơm mẹ nấu luôn đó!</p>
          <button
            id="btn-vehicles-reset"
            onClick={() => { playClickSound(); handleRestart(); }}
            className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 px-5 rounded-full flex mx-auto items-center gap-2 text-sm shadow transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw size={14} /> Chơi lại thật vui!
          </button>
        </div>
      )}

      {/* Parent helper tips */}
      <div className="text-center text-xs text-sky-700/80 mt-4 italic">
        * Ba mẹ có thể mở rộng đố bé xe cứu thương, cứu hỏa chạy ở làn đường nào để kích thích sáng tạo nha!
      </div>

    </div>
  );
}
