/**
 * Types and Interfaces for Preschool Learning Games
 */

export type GameId =
  | 'menu'
  | 'animals'     // Game 1: Bé tìm đúng con vật
  | 'colors'      // Game 2: Bé ghép màu
  | 'counting'    // Game 3: Bé tập đếm
  | 'vehicles'    // Game 4: Xe nào đi đâu?
  | 'alphabet'    // Game 5: Bé học chữ cái
  | 'deeds'       // Game 6: Bé làm việc tốt
  | 'emotions'    // Game 7: Bé nhận biết cảm xúc
  | 'adventure';  // Game 8: Phiêu lưu mầm non tổng hợp

export interface AnimalItem {
  id: string;
  name: string;      // "Mèo"
  emoji: string;     // "🐱"
  soundWord: string; // "Meo meo"
}

export interface ColorItem {
  id: string;
  name: string;      // "Đỏ"
  colorClass: string; // "bg-red-500 text-white"
  hex: string;        // "#ef4444"
}

export interface VehicleItem {
  id: string;
  name: string;      // "Ô tô"
  emoji: string;     // "🚗"
  category: 'road' | 'water' | 'air'; // "Đường bộ", "Đường thủy", "Đường hàng không"
}

export interface AlphabetItem {
  letter: string;    // "A"
  word: string;      // "Áo"
  emoji: string;     // "👕"
  playOptions: string[]; // List of matching emojis for play mode
}

export interface GoodDeedItem {
  id: string;
  title: string;        // "Bỏ rác đúng nơi"
  situation: string;    // "Bé ăn kẹo xong có vỏ kẹo thì bỏ vào đâu nhỉ?"
  options: {
    text: string;
    isCorrect: boolean;
    emoji: string;
  }[];
  explanation: string;  // "Đúng rồi! Bỏ rác đúng nơi quy định giúp giữ gìn trường lớp xanh sạch đẹp nhé!"
  sceneEmoji: string;   // "🍬"
}

export interface EmotionItem {
  id: string;
  name: 'vui' | 'buồn' | 'ngạc nhiên' | 'bình tĩnh';
  vietnameseName: string; // "Vui vẻ"
  emoji: string;          // "😊"
  description: string;    // "Cười tươi khi vui thích"
}

// Adventure game state
export interface AdventureState {
  currentStageIdx: number;
  completedStages: string[]; // list of completed stages keys
  stars: number;
  companion: 'bap' | 'kem'; // Companion chosen by user
}
