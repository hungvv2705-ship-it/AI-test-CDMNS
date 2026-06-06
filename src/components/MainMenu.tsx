import React, { useState } from 'react';
import { GameId } from '../types';
import { speakVietnamese, playClickSound } from '../utils/audio';
import { Sparkles, Info, Heart, LayoutGrid, Award, Volume2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MainMenuProps {
  onSelectGame: (gameId: GameId) => void;
}

interface MenuCardDef {
  id: GameId;
  title: string;
  subtitle: string;
  emoji: string;
  colorClass: string;
  field: string;
  speech: string;
}

const MENU_ITEMS: MenuCardDef[] = [
  {
    id: 'animals',
    title: 'Bé tìm đúng con vật',
    subtitle: 'Nhận biết động vật & lắng nghe tiếng kêu',
    emoji: '🦁🐱🐔',
    colorClass: 'from-amber-100 to-amber-200 border-amber-300 text-amber-900',
    field: 'Phát triển Nhận thức & Ngôn ngữ',
    speech: 'Bé ơi, bấm vào đây để tìm đúng con vật đáng yêu nhé!'
  },
  {
    id: 'colors',
    title: 'Bé ghép màu sắc',
    subtitle: 'Nhận biết, cất dọn bóng màu vào hộp sơn',
    emoji: '🍎🌈🎨',
    colorClass: 'from-blue-100 to-blue-200 border-blue-300 text-blue-900',
    field: 'Phát triển Nhận thức & Thẩm mỹ',
    speech: 'Bé ơi, bấm vào đây để gắp thả các quả bóng sặc sỡ sắc màu nào!'
  },
  {
    id: 'counting',
    title: 'Bé tập đếm táo',
    subtitle: 'Luyện đếm táo trên cây từ 1 đến 10',
    emoji: '🌳🍎⭐',
    colorClass: 'from-emerald-100 to-emerald-200 border-emerald-300 text-emerald-900',
    field: 'Phát triển Nhận thức (Toán học)',
    speech: 'Bé ơi, bấm vào đây để củng cố tập đếm táo đỏ mọng trên cây học tập!'
  },
  {
    id: 'vehicles',
    title: 'Phân loại phương tiện',
    subtitle: 'Phân loại xe đi bộ, đi biển hay đi trời',
    emoji: '🚗🚢✈️',
    colorClass: 'from-sky-100 to-sky-200 border-sky-300 text-sky-900',
    field: 'Phát triển Nhận thức & Xã hội',
    speech: 'Bé ơi, cùng xe cộ phân biệt phương tiện giao thông đường nào nha!'
  },
  {
    id: 'alphabet',
    title: 'Bé học chữ cái',
    subtitle: 'Phát âm tiếng Việt & chọn hình tương ứng',
    emoji: '🅰️👕🐝',
    colorClass: 'from-pink-100 to-pink-200 border-pink-300 text-pink-900',
    field: 'Phát triển Ngôn ngữ & Giao tiếp',
    speech: 'Bé ơi, cùng cô giáo tập đọc chữ cái tiếng Việt thật lí thú lôi cuốn nhé!'
  },
  {
    id: 'deeds',
    title: 'Bé làm việc tốt và kỹ năng',
    subtitle: 'Giáo dục hành vi rửa tay, dọn đồ chơi',
    emoji: '🧼🧸🙇‍♂️',
    colorClass: 'from-teal-100 to-teal-200 border-teal-300 text-teal-905',
    field: 'Phát triển Tình cảm & Kỹ năng xã hội',
    speech: 'Bé ơi, cùng nhau học cách dọn dẹp, rửa tay, khoanh tay chào ông bà thưa gửi cô nhé!'
  },
  {
    id: 'emotions',
    title: 'Nhận biết cảm xúc',
    subtitle: 'Tìm khuôn mặt vui cười, buồn hay bất ngờ',
    emoji: '😊😌😮',
    colorClass: 'from-orange-100 to-orange-200 border-orange-300 text-orange-900',
    field: 'Phát triển Tình cảm & Chỉ số EQ',
    speech: 'Bé ơi, bấm đây để rà soát cảm xúc của gương mặt dễ thương kháu khỉnh nào!'
  },
  {
    id: 'adventure',
    title: 'Phiêu lưu cùng Bé Tí',
    subtitle: 'Kính viễn vọng thám hiểm dành tặng bé thông thái',
    emoji: '🎒⛺🌟',
    colorClass: 'from-purple-100 to-purple-200 border-purple-300 text-purple-900 border-2 shadow-purple-100 shadow-md animate-pulse',
    field: 'Trải nghiệm mầm non tổng hợp',
    speech: 'Bé dũng mãnh ơi, hãy cùng Bé Tí và bạn bè thám hiểm rinh năm ngôi sao vàng danh giá nè!'
  }
];

export default function MainMenu({ onSelectGame }: MainMenuProps) {
  const [showParentDrawer, setShowParentDrawer] = useState<boolean>(false);

  const handleLaunch = (item: MenuCardDef) => {
    playClickSound();
    speakVietnamese(item.speech);
    setTimeout(() => {
      onSelectGame(item.id);
    }, 200);
  };

  const handleToggleParent = () => {
    playClickSound();
    setShowParentDrawer(!showParentDrawer);
    if (!showParentDrawer) {
      speakVietnamese('Kính chào quý vị Phụ huynh và các thầy cô giáo! Đây là góc tư vấn giáo dục mầm non.');
    }
  };

  return (
    <div id="main-menu-container" className="w-full max-w-5xl mx-auto px-4 md:px-0">
      
      {/* Dynamic Jumbotron Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 p-8 rounded-3xl border-4 border-white shadow-xl text-center text-white mb-8 relative overflow-hidden">
        {/* Floating background blobs */}
        <div className="absolute top-2 left-6 text-4xl opacity-45 select-none animate-float">🍭</div>
        <div className="absolute bottom-3 right-8 text-5xl opacity-45 select-none animate-bounce">🎈</div>
        <div className="absolute bottom-2 left-10 text-4xl opacity-45 select-none animate-wiggle">🧸</div>
        <div className="absolute top-4 right-1/4 text-3xl opacity-40 select-none animate-float">☁️</div>

        <h1 className="text-4xl md:text-5xl font-black tracking-wide filter drop-shadow-md select-none">
          🏰 SÂN CHƠI MẦM NON 🏰
        </h1>
        <p className="mt-2 text-md md:text-lg font-bold select-none text-emerald-950">
          Chơi Mà Học - Học Mà Chơi Thật Vui Trọn Vẹn!
        </p>

        <p className="mt-4 text-xs md:text-sm bg-white/20 px-4 py-1.5 rounded-full inline-block font-black select-none uppercase tracking-widest text-[#155e75]">
          Thiết kế theo chuẩn chương trình giáo dục mầm non Việt Nam (3-6 tuổi)
        </p>
      </div>

      {/* Grid of Launcher Bento cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {MENU_ITEMS.map((item) => (
          <motion.div
            id={`launch-card-${item.id}`}
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLaunch(item)}
            className={`cursor-pointer rounded-3xl p-5 border-4 flex flex-col justify-between min-h-[225px] transition-shadow shadow-md hover:shadow-xl bg-gradient-to-b ${item.colorClass}`}
          >
            {/* Emoji display */}
            <div className="flex justify-between items-start mb-2 select-none">
              <span className="text-4xl filter drop-shadow-sm select-auto animate-float pointer-events-none">
                {item.emoji}
              </span>
              <span className="bg-white/50 text-[10px] font-extrabold px-3 py-1 rounded-full border border-black/5 select-none pointer-events-none">
                3-6 tuổi
              </span>
            </div>

            {/* Titles segment */}
            <div className="text-left mt-3">
              <h3 className="text-lg font-black leading-tight tracking-tight select-none">
                {item.title}
              </h3>
              <p className="text-[11px] font-medium leading-relaxed opacity-85 mt-1 select-none">
                {item.subtitle}
              </p>
            </div>

            {/* Bottom curricular alignment track info */}
            <div className="mt-4 border-t border-black/5 pt-3 flex items-center justify-between">
              <span className="text-[9px] font-black tracking-wider uppercase opacity-75 truncate max-w-[150px] select-none">
                {item.field}
              </span>
              <div className="bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white text-xs select-none">
                👉
              </div>
            </div>

          </motion.div>
        ))}
      </div>

      {/* Toggle button for Parents Section */}
      <div className="flex justify-center mb-10">
        <button
          id="btn-parent-toggle"
          onClick={handleToggleParent}
          className="flex items-center gap-2 bg-white text-teal-850 border-2 border-teal-200 hover:bg-teal-50 font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 text-sm cursor-pointer"
        >
          <Info size={18} /> {showParentDrawer ? 'Đóng góc tư vấn sư phạm' : 'Góc sư phạm & Phụ huynh mầm non'}
        </button>
      </div>

      {/* Drawer Section matching curriculum alignment */}
      <AnimatePresence>
        {showParentDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl border-4 border-teal-100 p-6 md:p-8 shadow-inner text-left max-w-4xl mx-auto mb-10 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-teal-600 animate-pulse" size={24} />
              <h3 className="text-xl md:text-2xl font-black text-teal-900 border-b-2 border-teal-100 pb-1">
                Tự hào định hướng theo 5 lĩnh vực phát triển trẻ mầm non
              </h3>
            </div>

            <p className="text-slate-600 font-medium text-xs md:text-sm mb-6 leading-relaxed">
              Các trò chơi trong ứng dụng này đã được biên soạn tỉ mỉ theo cấu trúc phân bố phát triển của Bộ Giáo dục & Đào tạo Việt Nam dành cho độ tuổi 3-6 tuổi, hỗ trợ cả trẻ và cha mẹ trải nghiệm học tập an toàn tâm lý:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <span className="text-3xl">🏃‍♂️</span>
                <h4 className="font-extrabold text-sm text-red-900 mt-2">1. THỂ CHẤT</h4>
                <p className="text-[10px] text-red-700/90 leading-relaxed mt-1">
                  Phát triển vận động tinh thông qua thao tác vuốt kéo, bấm chính xác bong bóng, giữ phối hợp tay và mắt.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="text-3xl">🧩</span>
                <h4 className="font-extrabold text-sm text-emerald-900 mt-2">2. NHẬN THỨC</h4>
                <p className="text-[10px] text-emerald-700/90 leading-relaxed mt-1">
                  Đếm số táo 1-10, phân biệt nhóm phương tiện giao thông (không gian), đối chiếu kết hợp thẻ toán học.
                </p>
              </div>

              <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl">
                <span className="text-3xl">🗣️</span>
                <h4 className="font-extrabold text-sm text-pink-900 mt-2">3. NGÔN NGỮ</h4>
                <p className="text-[10px] text-pink-700/90 leading-relaxed mt-1">
                  Học phát âm chuẩn chữ cái Việt Nam, làm giàu vốn từ vựng tên loài động vật, đồ vật bằng phương pháp nhắc âm.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                <span className="text-3xl">🎨</span>
                <h4 className="font-extrabold text-sm text-purple-900 mt-2">4. THẨM MỸ</h4>
                <p className="text-[10px] text-purple-700/90 leading-relaxed mt-1">
                  Lọc ghép các sắc màu tươi tắn, ngắm nhìn bố cục hoa kỳ sinh động rực rỡ, cảm thụ thanh âm trong trẻo.
                </p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <span className="text-3xl">🤝</span>
                <h4 className="font-extrabold text-sm text-orange-900 mt-2">5. TÌNH CẢM - XÃ HỘI</h4>
                <p className="text-[10px] text-orange-700/90 leading-relaxed mt-1">
                  Nhận diện các biểu sắc vui, trầm lặng, biết ứng xử văn minh lịch hiệp chào thưa cất giữ gọn đồ kẹo rác.
                </p>
              </div>

            </div>

            <div className="mt-6 bg-slate-50 p-4 rounded-2xl text-[11px] text-slate-500 text-center font-bold">
              🛡️ Không có quảng cáo độc hại • Trực quan hóa âm thanh thân thiện • Vô cùng an toàn bảo mật cho sự phát triển lành mạnh của trẻ thơ Việt Nam.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
