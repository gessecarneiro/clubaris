import { Link } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";

export default function HomeClubHouse() {
  const { teamName, morale, fitness, language } = useGameStore();
  const t = useTranslation();

  return (
    <main className="mt-20 px-4 flex flex-col gap-6">
      {/* Next Match Section */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <h2 className="text-[12px] font-bold tracking-[1px] text-primary uppercase">
            {t('next_match', language)}
          </h2>
          <span className="text-[14px] text-on-surface-variant text-[10px]">
            GW 14 / SAT 15:00
          </span>
        </div>
        <div className="relative bg-surface-container border-2 border-on-background p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active-press transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <div className="flex items-center justify-between py-2">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2 w-1/3">
              <div className="w-16 h-16 bg-surface-container-high border-2 border-on-background flex items-center justify-center p-2">
                <img
                  alt="Home Team Logo"
                  className="w-full h-full [image-rendering:pixelated]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnim_q40K5jSCAiVOAriSjhV6Lj_s6y11BZM9LDoKfjOqGVrnxoHGCiJPUrKb6mA_So-t3Jr9t3j3VB7a68Z_ps0zfTnc1Grx-ulKpOEKOUd--hwePfJ_xHGEWzNQp2iiMIfqCjWrsGbds9VtsV33G_JBXdYdTADrlbedEFFV-QnGZCZKm8L3AYNtge8PN4htM3jwXQoHLCUqnSY4jBVUqdz1hNaFrNRbKPTghmpJvWMRVwB09Utjs3oxgKZ-WSOG-sT0zOolesn0U"
                />
              </div>
              <span className="text-[10px] font-bold tracking-[1px] text-center leading-tight uppercase">
                {teamName || "LEGENDARY CLUB"}
              </span>
            </div>
            {/* VS Divider */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[24px] font-bold text-secondary-container italic">
                VS
              </span>
              <div className="px-2 py-0.5 bg-error-container border border-on-background">
                <span className="text-[10px] font-bold tracking-[1px] text-on-error-container">
                  AWAY
                </span>
              </div>
            </div>
            {/* Away Team */}
            <div className="flex flex-col items-center gap-2 w-1/3">
              <div className="w-16 h-16 bg-surface-container-high border-2 border-on-background flex items-center justify-center p-2">
                <img
                  alt="Away Team Logo"
                  className="w-full h-full [image-rendering:pixelated]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzxwkCj_SlhLIs2jM1nVbzS9sw4kFr7LDIph8Vt8MZNYd6kZcu8KeIUhunDBVFee6b7ThTyd8iEVN4OLo202OTThNxwg0nt4aMFxgPJMpm5i2laP9AvCVgFfOZN_PBGSB20Ls5W6O0qUSl_C5DlTxcPqc5uct1aQZwN1Q9BaaT1Uv45X11Pybphh0FTxj5sjJBy6TF6J_HRhaNUALoHLNuB6gF5yQZG8OXvKCmB8XvvzMhAqdgtrfB6NCz_dCKzHh48CPF3gtukybS"
                />
              </div>
              <span className="text-[10px] font-bold tracking-[1px] text-center leading-tight">
                TITANS FC
              </span>
            </div>
          </div>
          <Link
            to="/escalacao"
            className="block text-center w-full mt-4 bg-secondary-container text-on-secondary text-[12px] font-bold tracking-[1px] py-2 border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active-press"
          >
            {t('manage_squad', language)}
          </Link>
        </div>
      </section>

      {/* Club Status Bento Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container border-2 border-on-background p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">
              sentiment_satisfied
            </span>
            <h3 className="text-[10px] font-bold tracking-[1px] uppercase">
              {t('morale', language)}
            </h3>
          </div>
          <div className="h-4 w-full bg-surface-container-lowest border-2 border-on-background relative">
            <div
              className="h-full bg-primary"
              style={{ width: `${morale}%` }}
            ></div>
          </div>
          <span className="text-[18px] font-bold text-primary">{morale}%</span>
        </div>
        <div className="bg-surface-container border-2 border-on-background p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-error">
              exercise
            </span>
            <h3 className="text-[10px] font-bold tracking-[1px] uppercase">
              {t('fitness', language)}
            </h3>
          </div>
          <div className="h-4 w-full bg-surface-container-lowest border-2 border-on-background relative">
            <div
              className="h-full bg-error"
              style={{ width: `${fitness}%` }}
            ></div>
          </div>
          <span className="text-[18px] font-bold text-error">{fitness}%</span>
        </div>
      </section>

      {/* League Table Preview */}
      <section className="flex flex-col gap-1">
        <h2 className="text-[12px] font-bold tracking-[1px] text-primary uppercase">
          {t('league_table', language)}
        </h2>
        <div className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest border-b-2 border-on-background">
                <th className="p-2 text-[10px] font-bold tracking-[1px]">
                  {t('pos', language)}
                </th>
                <th className="p-2 text-[10px] font-bold tracking-[1px]">
                  {t('club', language)}
                </th>
                <th className="p-2 text-[10px] font-bold tracking-[1px] text-right">
                  {t('pts', language)}
                </th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              <tr className="border-b-2 border-on-background/10 bg-primary-container/20">
                <td className="p-2 text-[18px] font-bold text-primary">01</td>
                <td className="p-2">METRO UNITED</td>
                <td className="p-2 text-[18px] font-bold text-right">58</td>
              </tr>
              <tr className="border-b-2 border-on-background/10 bg-surface-container-low">
                <td className="p-2 text-[18px] font-bold">02</td>
                <td className="p-2">SHADOW ATHLETIC</td>
                <td className="p-2 text-[18px] font-bold text-right">55</td>
              </tr>
              <tr className="bg-secondary-container text-on-secondary-container">
                <td className="p-2 text-[18px] font-bold">03</td>
                <td className="p-2 font-bold uppercase">{teamName || 'LEGENDARY CLUB'}</td>
                <td className="p-2 text-[18px] font-bold text-right">52</td>
              </tr>
            </tbody>
          </table>
          <div className="p-2 bg-surface-container-high text-center border-t-2 border-on-background">
            <Link
              to="/dashboard"
              className="text-[10px] font-bold tracking-[1px] text-on-surface-variant hover:text-primary cursor-pointer block w-full"
            >
              {t('view_full_standings', language)}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-2 gap-4">
        <Link
          to="/mercado"
          className="bg-surface-container border-2 border-on-background p-4 flex flex-col items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active-press"
        >
          <span className="material-symbols-outlined text-[32px] text-tertiary">
            group
          </span>
          <span className="text-[10px] font-bold tracking-[1px]">{t('scouting', language)}</span>
        </Link>
        <Link
          to="/tatico"
          className="bg-surface-container border-2 border-on-background p-4 flex flex-col items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active-press"
        >
          <span className="material-symbols-outlined text-[32px] text-secondary-container">
            stadium
          </span>
          <span className="text-[10px] font-bold tracking-[1px]">
            {t('facilities', language)}
          </span>
        </Link>
      </section>
    </main>
  );
}
