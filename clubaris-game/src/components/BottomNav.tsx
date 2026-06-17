import { Link, useLocation } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const { language } = useGameStore();
  const t = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-surface border-t-2 border-on-background">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center p-1 ${
          path === "/"
            ? "bg-primary-container text-on-primary-container border-2 border-on-background active-press"
            : "text-on-surface-variant hover:bg-surface-container-highest transition-all"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={path === "/" ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          home
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {t("home", language)}
        </span>
      </Link>

      <Link
        to="/escalacao"
        className={`tour-step-nav-tactics flex flex-col items-center justify-center p-1 ${
          path === "/escalacao" || path === "/tatico"
            ? "bg-primary-container text-on-primary-container border-2 border-on-background active-press"
            : "text-on-surface-variant hover:bg-surface-container-highest transition-all"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/escalacao" || path === "/tatico"
              ? { fontVariationSettings: "'FILL' 1" }
              : {}
          }
        >
          strategy
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {t("tactics", language)}
        </span>
      </Link>

      <Link
        to="/mercado"
        className={`flex flex-col items-center justify-center p-1 ${
          path === "/mercado"
            ? "bg-primary-container text-on-primary-container border-2 border-on-background active-press"
            : "text-on-surface-variant hover:bg-surface-container-highest transition-all"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/mercado" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          shopping_cart
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {t("market", language)}
        </span>
      </Link>

      <Link
        to="/dashboard"
        className={`flex flex-col items-center justify-center p-1 ${
          path === "/dashboard"
            ? "bg-primary-container text-on-primary-container border-2 border-on-background active-press"
            : "text-on-surface-variant hover:bg-surface-container-highest transition-all"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/dashboard" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          table_chart
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Painel" : "Dashboard"}
        </span>
      </Link>

      <Link
        to="/clubes"
        className={`flex flex-col items-center justify-center p-1 ${
          path === "/clubes"
            ? "bg-primary-container text-on-primary-container border-2 border-on-background active-press"
            : "text-on-surface-variant hover:bg-surface-container-highest transition-all"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/clubes" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          public
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Clubes" : "Clubs"}
        </span>
      </Link>

      <Link
        to="/trofeus"
        className={`flex flex-col items-center justify-center p-1 ${
          path === "/trofeus"
            ? "bg-primary-container text-on-primary-container border-2 border-on-background active-press"
            : "text-on-surface-variant hover:bg-surface-container-highest transition-all"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/trofeus" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          emoji_events
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Troféus" : "Trophies"}
        </span>
      </Link>
    </nav>
  );
}
