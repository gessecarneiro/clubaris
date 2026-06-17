import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";

export default function HelpTooltip({ textKey }: { textKey: string }) {
  const [show, setShow] = useState(false);
  const { language } = useGameStore();
  const t = useTranslation();

  return (
    <div className="relative inline-flex items-center ml-2">
      <button 
        className="w-4 h-4 rounded-full bg-surface-variant border border-on-background flex items-center justify-center text-[10px] font-bold text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        ?
      </button>
      
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-surface-container-highest border-2 border-on-background p-2 text-[10px] font-bold text-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] z-50 animate-[fade-in_0.2s_ease-out]">
          {t(textKey, language)}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-on-background"></div>
        </div>
      )}
    </div>
  );
}
