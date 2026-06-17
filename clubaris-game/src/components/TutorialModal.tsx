import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";

export default function TutorialModal() {
  const { hasSeenTutorial, startTour, language } = useGameStore();
  const t = useTranslation();

  if (hasSeenTutorial) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-surface-container border-2 border-on-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] max-w-md w-full relative animate-[slide-up_0.3s_ease-out]">
        <div className="absolute -top-10 -left-6 w-24 h-24 bg-surface-variant border-2 border-on-background flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <span className="material-symbols-outlined text-[64px] text-primary">person</span>
        </div>
        
        <div className="pl-16">
          <h2 className="text-[18px] font-bold tracking-[1px] text-secondary mb-4 uppercase">
            {t('tutorial_title', language)}
          </h2>
          
          <div className="space-y-3 text-[12px] font-bold text-on-surface leading-relaxed">
            <p className="flex gap-2 items-start">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">sports_soccer</span>
              {t('tutorial_p1', language)}
            </p>
            <p className="flex gap-2 items-start">
              <span className="material-symbols-outlined text-error text-[16px] shrink-0 mt-0.5">monitor_heart</span>
              {t('tutorial_p2', language)}
            </p>
            <p className="flex gap-2 items-start">
              <span className="material-symbols-outlined text-tertiary text-[16px] shrink-0 mt-0.5">shopping_cart</span>
              {t('tutorial_p3', language)}
            </p>
          </div>

          <button 
            onClick={startTour}
            className="w-full mt-6 bg-primary text-on-primary py-3 text-[14px] font-bold tracking-[1px] border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            {t('tutorial_btn', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
