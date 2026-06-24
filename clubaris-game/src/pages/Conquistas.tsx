import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { ACHIEVEMENTS } from "../data/achievements";

export default function Conquistas() {
  const { language, unlockedAchievements } = useGameStore();

  const total = ACHIEVEMENTS.length;
  const unlocked = unlockedAchievements.length;
  const percentage = Math.round((unlocked / total) * 100) || 0;

  return (
    <main className="px-4 pb-20 max-w-[900px] mx-auto mt-4 font-sans min-h-screen text-black dark:text-white transition-colors">
      <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-black text-white p-6 flex flex-col md:flex-row items-center gap-6 border-b-2 border-yellow-500">
           <div className="w-24 h-24 bg-gray-900 rounded-full border-4 border-yellow-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.5)]">
              <span className="material-symbols-outlined text-[48px] text-yellow-500">workspace_premium</span>
           </div>
           <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-black uppercase tracking-widest text-yellow-500">
                {language === 'pt' ? 'Conquistas' : 'Achievements'}
              </h1>
              <p className="text-[12px] font-bold text-gray-400 mt-1 uppercase">
                {language === 'pt' ? 'Sua jornada lendária' : 'Your legendary journey'}
              </p>
           </div>
           <div className="flex flex-col items-center md:items-end w-full md:w-auto mt-4 md:mt-0">
              <div className="text-[32px] font-black text-white leading-none">
                {unlocked}<span className="text-[16px] text-gray-500">/{total}</span>
              </div>
              <div className="w-full md:w-32 h-3 bg-gray-800 rounded-full mt-2 border border-gray-600 overflow-hidden">
                 <div className="h-full bg-yellow-500" style={{ width: `${percentage}%` }}></div>
              </div>
           </div>
        </div>

        {/* List */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-900">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <div key={ach.id} className={`relative flex items-center gap-4 p-4 border-2 transition-all ${isUnlocked ? 'bg-green-50 dark:bg-green-900/20 border-green-600 shadow-[2px_2px_0_0_rgba(22,163,74,1)]' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60 grayscale'}`}>
                 <div className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 border-2 ${isUnlocked ? 'bg-green-600 border-green-800 text-white' : 'bg-gray-200 dark:bg-gray-700 border-gray-400 text-gray-500'}`}>
                    <span className="material-symbols-outlined text-[24px]">{isUnlocked ? ach.icon : 'lock'}</span>
                 </div>
                 <div className="flex-1">
                    <h3 className={`text-[12px] font-black uppercase tracking-wide ${isUnlocked ? 'text-green-800 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {ach.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-500 mt-1">
                      {isUnlocked ? ach.description : '???'}
                    </p>
                 </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
