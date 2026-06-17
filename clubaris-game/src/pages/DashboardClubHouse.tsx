import { Link } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";
import TutorialModal from "../components/TutorialModal";
import AssistantTip from "../components/AssistantTip";
import HelpTooltip from "../components/HelpTooltip";
import teamsData from "../data/teams.json";

export default function DashboardClubHouse() {
  const { teamName, morale, fitness, language, startingXI, schedule, currentDate, advanceDay, teamId, tournaments } = useGameStore();
  const t = useTranslation();

  const hasInvalidStartingXI = startingXI.slice(0, 11).some(p => p.status === 'injured' || p.status === 'red_card');

  const unplayedMatches = schedule.filter(f => !f.played);
  const nextMatch = unplayedMatches.length > 0 ? unplayedMatches[0] : null;
  const isMatchDay = nextMatch && new Date(nextMatch.date).toDateString() === new Date(currentDate).toDateString();
  
  let opponentName = "N/A";
  let opponentBadge = "";
  let isHome = true;
  let tournamentName = "N/A";

  if (nextMatch) {
    isHome = nextMatch.homeTeamId === teamId;
    const oppId = isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId;
    const oppTeam = teamsData.find(t => t.id === oppId);
    opponentName = oppTeam ? oppTeam.name : oppId;
    opponentBadge = oppTeam?.badgeUrl || "";
    tournamentName = tournaments[nextMatch.tournamentId]?.name || nextMatch.tournamentId;
  }

  const formattedDate = new Date(currentDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <TutorialModal />
      <main className="mt-20 mb-8 px-4 lg:px-8 grid grid-cols-12 gap-2 max-w-screen-2xl mx-auto">
        <div className="col-span-12 flex justify-between items-end">
          <AssistantTip tipKey="tip_dashboard" />
          <div className="bg-primary text-on-primary px-4 py-2 font-bold tracking-[2px] border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] mb-4">
            {formattedDate}
          </div>
        </div>
        {/* Column 1: Match & Squad */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 tour-step-dashboard">
        {/* Next Match Preview */}
        <section className="bg-surface-container border-2 border-on-background retro-border overflow-hidden">
          <div className="bg-primary-container px-3 py-2 border-b-2 border-on-background">
            <h2 className="text-[12px] font-bold tracking-[1px] text-on-primary-container flex items-center justify-between gap-2">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined">event</span> {t('next_match', language)}</span>
              <span className="text-[10px] text-primary-fixed">{tournamentName}</span>
            </h2>
          </div>
          <div className="p-6 flex flex-col items-center gap-6 relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGxw-pYndU-rd9iMmZNRwX1WTxyLRZUDE1rxP-ixbjeR9OoushH-BfLb5t9RDWf29o2ID2EmewVwSd0MnYDs_6PX0DTq7bFrQsrU52gkJaoRsmoAdYubrfpJX4WGzHmzCcl9pjH-rJhAJCt9hRKhFCF-XnwTa_XuNd64h5v7TXEtlmlXy-ibeWD-1usvF9Qv8dvVvodxbmflTCsbukjJCOnVEFHNqYmQu29BHD78A4HheQKZ4jI7U9C8FTBSz3U0_e2Wbsa8prQST1"
                alt="Stadium background"
              />
            </div>
            
            {nextMatch ? (
              <div className="flex justify-between items-center w-full relative z-10">
                {/* Home Team */}
                <div className="text-center w-1/3">
                  <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center mx-auto mb-2 overflow-hidden p-2">
                    {isHome ? <span className="material-symbols-outlined text-4xl text-primary">shield</span> : (opponentBadge ? <img src={opponentBadge} alt={opponentName} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-4xl text-error">swords</span>)}
                  </div>
                  <p className="text-[10px] font-bold tracking-[1px] uppercase">
                    {isHome ? teamName : opponentName}
                  </p>
                </div>
                
                {/* VS */}
                <div className="text-center w-1/3">
                  <span className="text-[24px] font-bold tracking-[-1px] text-primary">
                    VS
                  </span>
                  <p className="text-[10px] font-bold tracking-[1px] text-on-surface-variant mt-2">
                    {new Date(nextMatch.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                
                {/* Away Team */}
                <div className="text-center w-1/3">
                  <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center mx-auto mb-2 overflow-hidden p-2">
                    {!isHome ? <span className="material-symbols-outlined text-4xl text-primary">shield</span> : (opponentBadge ? <img src={opponentBadge} alt={opponentName} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-4xl text-error">swords</span>)}
                  </div>
                  <p className="text-[10px] font-bold tracking-[1px] uppercase">
                    {!isHome ? teamName : opponentName}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 relative z-10 font-bold tracking-[1px] text-on-surface-variant">
                No upcoming matches. Season ended.
              </div>
            )}

            {hasInvalidStartingXI ? (
              <div className="block text-center w-full bg-error-container text-on-error-container border-2 border-error py-3 text-[12px] font-bold tracking-[1px] relative z-10">
                {t('cant_play_injured', language)}
              </div>
            ) : nextMatch ? (
              isMatchDay ? (
                <Link
                  to="/partida"
                  className="block text-center w-full bg-secondary-container text-on-secondary-container border-2 border-on-background py-3 text-[12px] font-bold tracking-[1px] retro-btn-press retro-border relative z-10"
                >
                  {t('match_center', language)}
                </Link>
              ) : (
                <button
                  onClick={advanceDay}
                  className="block text-center w-full bg-surface-variant text-on-surface-variant border-2 border-on-background py-3 text-[12px] font-bold tracking-[1px] retro-btn-press retro-border relative z-10 hover:bg-surface-container-highest"
                >
                  {language === 'pt' ? "AVANÇAR DIA" : "ADVANCE DAY"}
                </button>
              )
            ) : null}
          </div>
        </section>
        {/* Squad Status Widgets */}
        <div className="grid grid-cols-2 gap-2">
          {/* Morale */}
          <div className="bg-surface-container border-2 border-on-background retro-border">
            <div className="bg-surface-variant px-3 py-1 border-b-2 border-on-background flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[1px] flex items-center">
                {t('morale', language)}
                <HelpTooltip textKey="tooltip_morale" />
              </span>
              <span className="material-symbols-outlined text-sm">
                sentiment_very_satisfied
              </span>
            </div>
            <div className="p-4">
              <div className="h-4 bg-background border-2 border-on-background p-0.5">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${morale}%` }}
                ></div>
              </div>
              <p className="text-[18px] font-bold mt-2 text-primary">
                {morale}%
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold tracking-[1px]">
                {t('excellent', language)}
              </p>
            </div>
          </div>
          {/* Fitness */}
          <div className="bg-surface-container border-2 border-on-background retro-border">
            <div className="bg-surface-variant px-3 py-1 border-b-2 border-on-background flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[1px] flex items-center">
                {t('fitness', language)}
                <HelpTooltip textKey="tooltip_fitness" />
              </span>
              <span className="material-symbols-outlined text-sm">bolt</span>
            </div>
            <div className="p-4">
              <div className="h-4 bg-background border-2 border-on-background p-0.5">
                <div
                  className={`h-full ${fitness < 50 ? 'bg-error' : 'bg-secondary-container'}`}
                  style={{ width: `${fitness}%` }}
                ></div>
              </div>
              <p className={`text-[18px] font-bold mt-2 ${fitness < 50 ? 'text-error' : 'text-secondary-container'}`}>
                {fitness}%
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold tracking-[1px]">
                {fitness < 50 ? t('tired', language) || "TIRED" : t('stable', language)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Column 2: League Table */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-2 tour-step-league">
        <section className="bg-surface-container border-2 border-on-background retro-border h-full flex flex-col max-h-[600px]">
          <div className="bg-primary-container px-3 py-2 border-b-2 border-on-background flex justify-between items-center shrink-0">
            <h2 className="text-[12px] font-bold tracking-[1px] text-on-primary-container flex items-center gap-2">
              <span className="material-symbols-outlined">table_chart</span>{" "}
              {tournamentName}
            </h2>
            <span className="text-[10px] font-bold tracking-[1px] bg-on-primary-container text-primary-container px-2">
              LATEST
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-[12px] font-bold tracking-[1px]">
              <thead className="bg-surface-variant border-b-2 border-on-background sticky top-0 z-10">
                <tr>
                  <th className="p-2 border-r-2 border-on-background">{t('pos', language)}</th>
                  <th className="p-2 border-r-2 border-on-background">{t('club', language)}</th>
                  <th className="p-2 border-r-2 border-on-background">P</th>
                  <th className="p-2 border-r-2 border-on-background">GD</th>
                  <th className="p-2">{t('pts', language)}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-on-background/20">
                {(tournaments[nextMatch?.tournamentId || ""]?.table || Object.values(tournaments)[0]?.table || []).map((entry, index) => {
                  const oppTeam = teamsData.find(t => t.id === entry.teamId);
                  const name = oppTeam ? oppTeam.name : entry.teamId;
                  const isPlayer = entry.teamId === teamId;
                  return (
                    <tr key={entry.teamId} className={isPlayer ? "bg-secondary-container text-on-secondary-container" : (index < 4 ? "bg-primary-container/20" : "")}>
                      <td className="p-2 border-r-2 border-on-background text-[14px]">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-2 border-r-2 border-on-background flex items-center gap-2 whitespace-nowrap">
                        {isPlayer && <span className="material-symbols-outlined text-sm">play_arrow</span>}
                        <span className="uppercase truncate max-w-[120px]" title={name}>{name}</span>
                      </td>
                      <td className="p-2 border-r-2 border-on-background text-center">
                        {entry.played}
                      </td>
                      <td className={`p-2 border-r-2 border-on-background text-center ${entry.goalDifference > 0 ? "text-primary" : entry.goalDifference < 0 ? "text-error" : ""}`}>
                        {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                      </td>
                      <td className="p-2 text-[14px] text-primary">{entry.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {/* Column 3: News */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
        <section className="bg-surface-container border-2 border-on-background retro-border flex-grow">
          <div className="bg-surface-variant px-3 py-2 border-b-2 border-on-background flex justify-between items-center">
            <h2 className="text-[12px] font-bold tracking-[1px] flex items-center gap-2">
              <span className="material-symbols-outlined">newspaper</span> {t('news_wire', language)}
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="group cursor-pointer">
              <p className="text-[10px] text-primary font-bold tracking-[1px]">
                {t('injury_update', language)}
              </p>
              <h3 className="text-sm font-bold group-hover:underline">
                STRIKER "BULL" SMITH OUT FOR 3 WEEKS
              </h3>
            </div>
            <div className="group cursor-pointer border-t-2 border-on-background/10 pt-4">
              <p className="text-[10px] text-secondary-container font-bold tracking-[1px]">
                {t('transfer_rumor', language)}
              </p>
              <h3 className="text-sm font-bold group-hover:underline">
                CLUB LINKED WITH WINGER "ZIPPY"
              </h3>
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
