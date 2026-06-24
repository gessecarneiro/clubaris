import { useGameStore } from "../store/gameStore";
import { useTranslation } from "../utils/i18n";
import teamsData from "../data/teams.json";

export default function DashboardClubHouse() {
  const { playerTeamId, seasonData, language } = useGameStore();
  const t = useTranslation();

  // Find the tournament the player is currently in
  let currentTournament = null;
  if (seasonData && playerTeamId) {
    // Determine the league ID for the player's team
    const playerTeam = teamsData.find(t => t.id === playerTeamId);
    if (playerTeam && seasonData.tournaments[playerTeam.leagueId]) {
      currentTournament = seasonData.tournaments[playerTeam.leagueId];
    } else {
      // Fallback to first available tournament
      currentTournament = Object.values(seasonData.tournaments)[0];
    }
  }

  if (!currentTournament) {
    return (
      <main className="font-sans px-4 flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-[14px] font-bold tracking-[1px] text-gray-500 dark:text-gray-400">
          {language === 'pt' ? 'Nenhum torneio encontrado.' : language === 'es' ? 'Ningún torneo encontrado.' : 'No tournament found.'}
        </p>
      </main>
    );
  }

  return (
    <main className="font-sans text-black dark:text-white min-h-[70vh] px-4 py-6 max-w-7xl mx-auto flex flex-col gap-6 transition-colors">
      <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="bg-green-800 dark:bg-green-900 text-white font-bold text-[12px] uppercase px-3 py-2 border-b-2 border-black dark:border-gray-900 flex justify-between items-center">
          <span>{currentTournament.name}</span>
          <span className="bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 px-2 py-0.5 border border-black dark:border-gray-900">
            {language === 'pt' ? 'TABELA' : language === 'es' ? 'TABLA' : 'TABLE'}
          </span>
        </div>
        <div className="overflow-x-auto bg-gray-50 dark:bg-gray-900">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 border-b-2 border-black dark:border-gray-900">
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">{t('pos', language)}</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] border-r border-gray-400 dark:border-gray-600">{t('club', language)}</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">P</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">V</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">E</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">D</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">GP</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">GC</th>
                <th className="p-2 text-[10px] font-black tracking-[1px] w-8 text-center border-r border-gray-400 dark:border-gray-600">SG</th>
                <th className="p-2 text-[11px] font-black tracking-[1px] w-12 text-center">{t('pts', language)}</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-bold">
              {currentTournament.table.map((entry: any, index: number) => {
                const oppTeam = teamsData.find(t => t.id === entry.teamId);
                const name = oppTeam ? oppTeam.name : entry.teamId;
                const isPlayer = entry.teamId === playerTeamId;
                const isEven = index % 2 === 0;
                
                return (
                  <tr key={entry.teamId} className={`border-b border-gray-300 dark:border-gray-700 transition-colors ${
                    isPlayer 
                      ? 'bg-green-200 dark:bg-green-800' 
                      : isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <td className="p-2 text-center text-gray-500 dark:text-gray-400 border-r border-black/10 dark:border-white/10">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className={`p-2 uppercase truncate max-w-[120px] border-r border-black/10 dark:border-white/10 ${isPlayer ? 'font-black text-green-900 dark:text-green-100' : ''}`}>
                      {name}
                    </td>
                    <td className="p-2 text-center border-r border-black/10 dark:border-white/10">{entry.played}</td>
                    <td className="p-2 text-center text-green-700 dark:text-green-400 border-r border-black/10 dark:border-white/10">{entry.wins}</td>
                    <td className="p-2 text-center text-yellow-600 dark:text-yellow-500 border-r border-black/10 dark:border-white/10">{entry.draws}</td>
                    <td className="p-2 text-center text-red-600 dark:text-red-400 border-r border-black/10 dark:border-white/10">{entry.losses}</td>
                    <td className="p-2 text-center border-r border-black/10 dark:border-white/10">{entry.goalsFor}</td>
                    <td className="p-2 text-center border-r border-black/10 dark:border-white/10">{entry.goalsAgainst}</td>
                    <td className={`p-2 text-center border-r border-black/10 dark:border-white/10 ${entry.goalDifference > 0 ? "text-green-700 dark:text-green-400" : entry.goalDifference < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                      {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                    </td>
                    <td className={`p-2 text-center text-[13px] ${isPlayer ? 'font-black' : ''}`}>{entry.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
