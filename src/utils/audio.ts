/**
 * Sound synthesis and Text-to-Speech helpers for preschool games.
 * Completely self-contained using browser native APIs (Web Audio API & SpeechSynthesis).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play cute short clicking sound
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error('Audio synthesis failed', e);
  }
}

// 2. Play cheerful success chime
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

      gain.gain.setValueAtTime(0, startTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, startTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + idx * 0.08 + 0.3);
    });
  } catch (e) {
    console.error('Audio synthesis failed', e);
  }
}

// 3. Play gentle sad/fail sound (sliding pitch)
export function playFailSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error('Audio synthesis failed', e);
  }
}

// 4. Play glittering star sound (high chirps)
export function playStarSound() {
  try {
    const ctx = getAudioContext();
    const notes = [880, 1046.50, 1318.51, 1567.98, 2093]; // A5, C6, E6, G6, C7
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.05);

      gain.gain.setValueAtTime(0, startTime + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, startTime + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.05);
      osc.stop(startTime + idx * 0.05 + 0.2);
    });
  } catch (e) {
    console.error('Audio synthesis failed', e);
  }
}

// 5. Speech Synthesis for Vietnamese TTS
// Speaks text with a Vietnamese voice
export function speakVietnamese(text: string) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this browser.');
    return;
  }

  // Cancel any ongoing speeches
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a Vietnamese voice
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(voice => voice.lang.includes('vi') || voice.lang.toLowerCase() === 'vi-vn');
  
  if (viVoice) {
    utterance.voice = viVoice;
  }
  
  // Preschool rate: speak slowly and warmly!
  utterance.rate = 0.85; 
  utterance.pitch = 1.1; // Sightly higher pitch for child friendliness

  window.speechSynthesis.speak(utterance);
}

// Initial setup to pre-load voices in background
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
