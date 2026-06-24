import { Link, useLocation } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";

export default function TopNav() {
  const location = useLocation();
  const path = location.pathname;
  const { language, news } = useGameStore();
  const t = useTranslation();

  return (
    <nav className="fixed top-[44px] left-0 w-full z-40 flex justify-start md:justify-center gap-2 sm:gap-6 items-center h-16 bg-black border-b-2 border-on-background shadow-[0_4px_0_0_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide px-4">
      <Link
        to="/clubhouse"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/clubhouse"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={path === "/clubhouse" ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          home
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {t("home", language)}
        </span>
      </Link>

      <Link
        to="/conquistas"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/conquistas"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/conquistas" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          military_tech
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? 'Conquistas' : 'Trophies'}
        </span>
      </Link>

      <Link
        to="/treinamento"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/treinamento"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/treinamento" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          fitness_center
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? 'Treino' : 'Train'}
        </span>
      </Link>

      <Link
        to="/busca"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/busca"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/busca" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          search
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? 'Busca' : 'Search'}
        </span>
      </Link>

      <Link
        to="/times"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/times"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/times" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          shield
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? 'Times' : 'Teams'}
        </span>
      </Link>

      <Link
        to="/dashboard"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/dashboard"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
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
          {language === 'pt' ? "Tabela" : "Table"}
        </span>
      </Link>

      <Link
        to="/calendario"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/calendario"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/calendario" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          calendar_month
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Jogos" : "Fixtures"}
        </span>
      </Link>

      <Link
        to="/trofeus"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/trofeus"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
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
          {language === 'pt' ? "Troféus" : language === 'es' ? "Trofeos" : "Trophies"}
        </span>
      </Link>

      <Link
        to="/inbox"
        className={`relative flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/inbox"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/inbox" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          mail
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Mensagens" : language === 'es' ? "Mensajes" : "Messages"}
        </span>
        {news.filter(m => !m.isRead).length > 0 && (
          <span className="absolute top-1 right-2 w-3 h-3 bg-red-600 rounded-full border border-black"></span>
        )}
      </Link>

      <Link
        to="/contratos"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/contratos"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/contratos" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          group
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Contratos" : "Contracts"}
        </span>
      </Link>

      <Link
        to="/financas"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/financas"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/financas" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          account_balance
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Finanças" : "Finances"}
        </span>
      </Link>
      <Link
        to="/infraestrutura"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/infraestrutura"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/infraestrutura" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          stadium
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Estádio" : "Stadium"}
        </span>
      </Link>

      <Link
        to="/base"
        className={`flex flex-col items-center justify-center p-1 w-16 sm:w-20 hover:text-white transition-colors ${
          path === "/base"
            ? "text-white border-b-2 border-primary"
            : "text-white/50 border-b-2 border-transparent"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            path === "/base" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          child_care
        </span>
        <span className="font-label-caps text-[10px] uppercase">
          {language === 'pt' ? "Base" : "Youth"}
        </span>
      </Link>
    </nav>
  );
}
