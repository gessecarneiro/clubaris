import { useGameStore } from "../store/gameStore";
import teamsData from "../data/teams.json";

export default function Calendar() {
  const { playerTeamId, teamName, seasonData, language } = useGameStore();

  if (!seasonData) {
    return (
      <main className="mt-20 px-4 flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-[14px] font-bold tracking-[1px] text-gray-500 dark:text-gray-400">
          {language === 'pt' ? 'Calendário indisponível.' : language === 'es' ? 'Calendario no disponible.' : 'Calendar unavailable.'}
        </p>
      </main>
    );
  }

  return (
    <main className="font-sans text-black dark:text-white bg-white dark:bg-gray-900 min-h-[70vh] px-4 py-6 max-w-4xl mx-auto flex flex-col gap-6 transition-colors">
      <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="bg-green-800 dark:bg-green-900 text-white font-bold text-[12px] uppercase px-3 py-2 border-b-2 border-black dark:border-gray-900 flex justify-between items-center">
          <span>{language === 'pt' ? 'Calendário' : language === 'es' ? 'Calendario' : 'Calendar'}</span>
        </div>
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900">
          {seasonData.playerSchedule.map((match, index) => {
            const isHome = match.homeTeamId === playerTeamId;
            const oppId = isHome ? match.awayTeamId : match.homeTeamId;
            const oppTeam = teamsData.find(t => t.id === oppId);
            const oppName = oppTeam ? oppTeam.name : oppId;
            
            const isEven = index % 2 === 0;

            return (
              <div 
                key={match.id} 
                className={`flex items-center justify-between p-3 border-b border-gray-300 dark:border-gray-700 transition-colors ${
                  match.played 
                    ? 'opacity-60 bg-gray-200 dark:bg-gray-800' 
                    : isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="flex flex-col w-1/4">
                  <span className="text-[11px] font-black tracking-[1px] text-gray-700 dark:text-gray-300 uppercase">
                    {new Date(match.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase truncate">
                    {seasonData.tournaments[match.tournamentId]?.name.substring(0, 15)}
                    {match.isKnockout ? ` - ${match.knockoutPhase} ${match.isSecondLeg ? '(Volta)' : '(Ida)'}` : ''}
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-2 flex-1 font-bold text-[12px]">
                  <span className={`truncate w-32 text-right uppercase flex justify-end items-center gap-1 ${isHome ? 'text-green-700 dark:text-green-400 font-black' : 'text-gray-800 dark:text-gray-200'}`}>
                    {isHome && <span className="bg-green-600 text-white text-[9px] px-1 rounded" title="Seu Time">★</span>}
                    {isHome ? teamName : oppName}
                  </span>
                  
                  {match.played ? (
                    <div className="bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-900 px-3 py-1 flex gap-1 items-center shadow-inner">
                      <span className="text-black dark:text-white">{match.homeScore}</span>
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                      <span className="text-black dark:text-white">{match.awayScore}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-2 py-1 font-mono">
                      VS
                    </span>
                  )}

                  <span className={`truncate w-32 text-left uppercase flex items-center gap-1 ${!isHome ? 'text-green-700 dark:text-green-400 font-black' : 'text-gray-800 dark:text-gray-200'}`}>
                    {!isHome ? teamName : oppName}
                    {!isHome && <span className="bg-green-600 text-white text-[9px] px-1 rounded" title="Seu Time">★</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
