import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";

export default function AssistantTip({ tipKey }: { tipKey: string }) {
  const { language } = useGameStore();
  const t = useTranslation();

  return (
    <div className="bg-primary-container/20 border-l-4 border-primary p-3 flex gap-3 items-center retro-border mb-4">
      <div className="w-10 h-10 bg-surface-variant border-2 border-on-background flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[24px] text-primary">person</span>
      </div>
      <div className="flex-1">
        <p className="text-[12px] font-bold text-on-surface leading-tight">
          {t(tipKey, language)}
        </p>
      </div>
    </div>
  );
}
