import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";

export default function StartMenu() {
  const [managerName, setManagerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const { setSetup, language, setLanguage } = useGameStore();
  const t = useTranslation();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerName && teamName) {
      setSetup(managerName, teamName);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-background font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Background pattern */}
        <div className="w-full h-full bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="bg-surface-container-highest border-2 border-on-background px-3 py-1 text-[12px] font-bold tracking-[1px] hover:bg-primary-container hover:text-on-primary-container transition-colors pixel-shadow"
        >
          {language === "pt" ? "🇺🇸 EN" : "🇧🇷 PT"}
        </button>
      </div>

      <div className="z-10 w-full max-w-md p-6">
        <div className="text-center mb-10">
          <span
            className="material-symbols-outlined text-primary text-[64px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            sports_soccer
          </span>
          <h1
            className="text-[32px] font-bold text-secondary-container tracking-tighter uppercase mt-4"
            style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
          >
            LEGENDARY CLUB
          </h1>
          <p className="text-[12px] font-bold tracking-[1px] text-on-surface-variant mt-2">
            RETRO FOOTBALL MANAGER
          </p>
        </div>

        <form
          onSubmit={handleStart}
          className="bg-surface-container border-2 border-on-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] flex flex-col gap-6"
        >
          <h2 className="text-[14px] font-bold tracking-[1px] text-primary uppercase text-center border-b-2 border-on-background/20 pb-2">
            {t("new_career", language)}
          </h2>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-[1px] text-on-surface-variant">
              {t("manager_name", language)}
            </label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="bg-surface-container-lowest border-2 border-on-background p-3 text-[14px] font-bold focus:outline-none focus:border-primary"
              placeholder={
                language === "pt" ? "ex. Pep Guardiola" : "e.g. Pep Guardiola"
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-[1px] text-on-surface-variant">
              {t("club_name", language)}
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="bg-surface-container-lowest border-2 border-on-background p-3 text-[14px] font-bold focus:outline-none focus:border-primary"
              placeholder={
                language === "pt" ? "ex. Clube Lendário" : "e.g. Legendary FC"
              }
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-primary text-on-primary py-3 text-[14px] font-bold tracking-[1px] border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            {t("start_career", language)}
          </button>
        </form>
      </div>
    </div>
  );
}
