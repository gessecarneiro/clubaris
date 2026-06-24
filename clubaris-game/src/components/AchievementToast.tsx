import { useEffect, useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import { motion, AnimatePresence } from 'framer-motion';

export default function AchievementToast() {
  const [activeToast, setActiveToast] = useState<{ id: string, ach: any } | null>(null);
  const [queue, setQueue] = useState<string[]>([]);

  // Simple Web Audio API synthetic sound (retro style)
  const playRetroSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Arpeggio
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
      osc.frequency.setValueAtTime(880, now + 0.3); // A5
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.setValueAtTime(0.1, now + 0.3);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      
      osc.start(now);
      osc.stop(now + 0.5);
    } catch(e) {
      console.warn("AudioContext not supported", e);
    }
  };

  useEffect(() => {
    const handleUnlock = (e: any) => {
      const achId = e.detail;
      setQueue(prev => [...prev, achId]);
    };

    window.addEventListener('achievement-unlocked', handleUnlock);
    return () => window.removeEventListener('achievement-unlocked', handleUnlock);
  }, []);

  useEffect(() => {
    if (queue.length > 0 && !activeToast) {
      const nextId = queue[0];
      const ach = ACHIEVEMENTS.find(a => a.id === nextId);
      if (ach) {
        setActiveToast({ id: nextId, ach });
        playRetroSound();
        
        setTimeout(() => {
          setActiveToast(null);
          setQueue(prev => prev.slice(1));
        }, 5000); // show for 5 seconds
      } else {
        setQueue(prev => prev.slice(1));
      }
    }
  }, [queue, activeToast]);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className="bg-[#0e0e0e] border-2 border-[#107c10] shadow-[0_0_20px_rgba(16,124,16,0.5)] rounded-full px-6 py-3 flex items-center gap-4 text-white min-w-[300px]">
             <div className="w-10 h-10 bg-[#107c10] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_#107c10]">
               <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-[#107c10] font-black uppercase tracking-widest">
                 Conquista Desbloqueada
               </span>
               <span className="text-[14px] font-bold">
                 {activeToast.ach.name}
               </span>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
