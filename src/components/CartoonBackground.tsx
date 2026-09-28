import React from 'react';
import { sounds } from '../utils/audio';

export const CartoonBackground: React.FC = () => {
  const handleMascotClick = () => {
    sounds.playPop();
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Friendly rich gradient ambiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950" />

      {/* Warm cheerful colorful ambient glow orbs */}
      <div className="absolute -top-24 left-1/4 w-[36vw] h-[36vw] rounded-full bg-rose-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[40vw] h-[40vw] rounded-full bg-amber-400/12 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-[42vw] h-[42vw] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[30vw] h-[30vw] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Cartoon Fluffy Clouds */}
      <div className="absolute top-4 left-6 opacity-35 animate-cartoon-cloud pointer-events-none hidden md:block">
        <svg width="180" height="70" viewBox="0 0 180 70" fill="none">
          <path
            d="M35 55h110c14 0 25-11 25-25s-11-25-25-25c-3 0-5 0.5-8 1.5C132 2.5 124 0 115 0c-15 0-27 9-31 22-3-2-7-3-11-3-12 0-22 9-23 21C47 38 41 37 35 37c-10 0-18 8-18 18s8 18 18 18z"
            fill="url(#cloudGrad1)"
          />
          <defs>
            <linearGradient id="cloudGrad1" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#93c5fd" stopOpacity="0.4" />
              <stop offset="1" stopColor="#60a5fa" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute top-16 right-12 opacity-30 animate-cartoon-cloud pointer-events-none hidden lg:block" style={{ animationDelay: '-16s' }}>
        <svg width="220" height="85" viewBox="0 0 180 70" fill="none">
          <path
            d="M35 55h110c14 0 25-11 25-25s-11-25-25-25c-3 0-5 0.5-8 1.5C132 2.5 124 0 115 0c-15 0-27 9-31 22-3-2-7-3-11-3-12 0-22 9-23 21C47 38 41 37 35 37c-10 0-18 8-18 18s8 18 18 18z"
            fill="url(#cloudGrad2)"
          />
          <defs>
            <linearGradient id="cloudGrad2" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="1" stopColor="#a855f7" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cartoon Mascots & Floating Companions */}
      {/* 1. Ruby - Smiling Happy Red Disc Mascot (Top-Left) */}
      <div
        onClick={handleMascotClick}
        className="absolute top-24 left-3 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 animate-cartoon-bob pointer-events-auto cursor-pointer transition-transform hover:scale-125 group"
        title="Hi! I'm Ruby the Red Disc! Click me!"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl filter">
          {/* Disc Body with gentle gradient */}
          <circle cx="50" cy="50" r="44" fill="url(#rubyGrad)" stroke="#f43f5e" strokeWidth="4" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#fda4af" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
          
          {/* Cute Eyes */}
          <g className="animate-cartoon-blink">
            <ellipse cx="38" cy="42" rx="4.5" ry="6.5" fill="#1e1b4b" />
            <circle cx="39.5" cy="40" r="2" fill="#ffffff" />
            <ellipse cx="62" cy="42" rx="4.5" ry="6.5" fill="#1e1b4b" />
            <circle cx="63.5" cy="40" r="2" fill="#ffffff" />
          </g>
          
          {/* Cheerful Smile */}
          <path d="M40 54 Q50 64 60 54" fill="none" stroke="#1e1b4b" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Blushing Cheeks */}
          <circle cx="30" cy="50" r="5" fill="#f43f5e" opacity="0.5" />
          <circle cx="70" cy="50" r="5" fill="#f43f5e" opacity="0.5" />
          
          {/* Top highlight shine */}
          <ellipse cx="42" cy="22" rx="14" ry="5" fill="#ffffff" opacity="0.4" transform="rotate(-15 42 22)" />
          
          <defs>
            <linearGradient id="rubyGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fb7185" />
              <stop offset="0.5" stopColor="#f43f5e" />
              <stop offset="1" stopColor="#e11d48" />
            </linearGradient>
          </defs>
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-1/2 -translate-x-1/2 bg-rose-900/90 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/50 shadow whitespace-nowrap">
          Ruby ❤️
        </span>
      </div>

      {/* 2. Sunny - Winking Playful Yellow Disc Mascot (Top-Right) */}
      <div
        onClick={handleMascotClick}
        className="absolute top-28 right-3 sm:right-12 w-16 h-16 sm:w-20 sm:h-20 animate-cartoon-bob-reverse pointer-events-auto cursor-pointer transition-transform hover:scale-125 group"
        title="Wassup! I'm Sunny the Yellow Disc! Click me!"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl filter">
          {/* Disc Body */}
          <circle cx="50" cy="50" r="44" fill="url(#sunnyGrad)" stroke="#f59e0b" strokeWidth="4" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
          
          {/* Eyes: One Open, One Winking */}
          <g className="animate-cartoon-blink">
            <ellipse cx="38" cy="42" rx="4.5" ry="6.5" fill="#451a03" />
            <circle cx="39.5" cy="40" r="2" fill="#ffffff" />
          </g>
          {/* Wink eye */}
          <path d="M57 44 Q63 36 69 44" fill="none" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Big Open Smile with Tongue */}
          <path d="M38 52 Q50 68 62 52 Z" fill="#b45309" />
          <path d="M44 58 Q50 66 56 58 Z" fill="#f43f5e" />
          
          {/* Cheeks */}
          <circle cx="28" cy="50" r="5" fill="#f97316" opacity="0.4" />
          <circle cx="72" cy="50" r="5" fill="#f97316" opacity="0.4" />
          
          {/* Shine */}
          <ellipse cx="42" cy="22" rx="14" ry="5" fill="#ffffff" opacity="0.5" transform="rotate(-15 42 22)" />
          
          <defs>
            <linearGradient id="sunnyGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#facc15" />
              <stop offset="1" stopColor="#eab308" />
            </linearGradient>
          </defs>
        </svg>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-1/2 -translate-x-1/2 bg-amber-900/90 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/50 shadow whitespace-nowrap">
          Sunny ⭐
        </span>
      </div>

      {/* 3. Crossy - Cartoon Tic-Tac-Toe "X" Companion (Bottom-Left) */}
      <div
        onClick={handleMascotClick}
        className="absolute bottom-28 left-4 sm:left-14 w-14 h-14 sm:w-16 sm:h-16 animate-cartoon-wiggle pointer-events-auto cursor-pointer transition-transform hover:scale-125 group hidden sm:block"
        title="Hey! I'm Crossy! Click me!"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/20 rounded-2xl blur-sm" />
          <div className="w-full h-full bg-gradient-to-tr from-rose-600 to-rose-400 rounded-2xl flex items-center justify-center p-2 shadow-lg border-2 border-rose-300">
            <svg viewBox="0 0 40 40" className="w-full h-full text-white">
              <line x1="8" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              <line x1="32" y1="8" x2="8" y2="32" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              {/* Cute little eyes in center */}
              <circle cx="16" cy="18" r="2.5" fill="#1e1b4b" />
              <circle cx="24" cy="18" r="2.5" fill="#1e1b4b" />
              <path d="M18 24 Q20 27 22 24" fill="none" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/50 shadow whitespace-nowrap">
          Crossy ❌
        </span>
      </div>

      {/* 4. Ringy - Cartoon Tic-Tac-Toe "O" Companion (Bottom-Right) */}
      <div
        onClick={handleMascotClick}
        className="absolute bottom-32 right-6 sm:right-16 w-14 h-14 sm:w-16 sm:h-16 animate-cartoon-bob pointer-events-auto cursor-pointer transition-transform hover:scale-125 group hidden sm:block"
        title="Yeehaw! I'm Ringy! Click me!"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm" />
          <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full flex items-center justify-center p-2 shadow-lg border-2 border-amber-200">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <circle cx="20" cy="20" r="14" fill="none" stroke="#451a03" strokeWidth="5" />
              {/* Cute Eyes inside */}
              <circle cx="16" cy="19" r="2" fill="#451a03" />
              <circle cx="24" cy="19" r="2" fill="#451a03" />
              <path d="M17 24 Q20 27 23 24" fill="none" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/50 shadow whitespace-nowrap">
          Ringy ⭕
        </span>
      </div>

      {/* 5. Twinkling Cartoon Golden Stars */}
      <div className="absolute top-1/4 left-1/6 animate-cartoon-star pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#facc15">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
        </svg>
      </div>

      <div className="absolute top-1/2 right-1/4 animate-cartoon-star pointer-events-none" style={{ animationDelay: '-1.4s' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
        </svg>
      </div>

      <div className="absolute bottom-1/4 left-1/4 animate-cartoon-star pointer-events-none" style={{ animationDelay: '-0.7s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fde047">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
        </svg>
      </div>

      {/* 6. Cartoon Floating Gamepad & Sparkle Orbs */}
      <div className="absolute top-2/3 right-10 opacity-20 pointer-events-none hidden xl:block animate-cartoon-bob">
        <span className="text-6xl filter drop-shadow">🎮</span>
      </div>
      <div className="absolute bottom-12 left-1/3 opacity-20 pointer-events-none hidden xl:block animate-cartoon-bob-reverse">
        <span className="text-5xl filter drop-shadow">🎲</span>
      </div>
      <div className="absolute top-1/3 left-12 opacity-25 pointer-events-none hidden xl:block animate-cartoon-wiggle">
        <span className="text-4xl filter drop-shadow">✨</span>
      </div>
      <div className="absolute top-44 right-1/3 opacity-20 pointer-events-none hidden xl:block animate-cartoon-bob">
        <span className="text-4xl filter drop-shadow">🏆</span>
      </div>
    </div>
  );
};
