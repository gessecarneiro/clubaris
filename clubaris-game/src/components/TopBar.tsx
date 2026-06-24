import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";

export default function TopBar({
  title = "LEGENDARY CLUB",
}: {
  title?: string;
}) {
  const { currentDate, language, theme, setTheme } = useGameStore();
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 py-2 bg-background border-b-2 border-on-background">
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          sports_soccer
        </span>
        <h1 className="text-[16px] md:text-[20px] leading-[20px] md:leading-[28px] font-bold text-secondary-container tracking-tighter uppercase">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-4 relative">
        <span className="text-[14px] font-bold text-on-background hidden sm:block">
          {new Date(currentDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
        </span>
        
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-on-background hover:text-primary transition-colors flex items-center justify-center p-1 md:p-0"
          title={theme === "light" ? "Dark Mode" : "Light Mode"}
        >
          <span className="material-symbols-outlined text-[24px] md:text-[20px]">
            {theme === "light" ? "dark_mode" : "light_mode"}
          </span>
        </button>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-on-background hover:text-primary transition-colors flex items-center justify-center p-1 md:p-0"
        >
          <span className="material-symbols-outlined text-[24px] md:text-[20px]">
            settings
          </span>
        </button>

        {showOptions && (
          <div className="absolute top-10 right-0 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-2 flex flex-col min-w-[200px]">
            <button
              onClick={() => {
                 setShowOptions(false);
                 navigate("/");
              }}
              className="text-left px-3 py-2 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
               <span className="material-symbols-outlined text-[16px]">logout</span>
               {language === 'pt' ? 'Menu Principal' : 'Main Menu'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
