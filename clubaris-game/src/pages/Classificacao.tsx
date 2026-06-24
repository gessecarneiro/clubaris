import { useState, useMemo } from "react";
import { useGameStore } from "../store/gameStore";
import teamsData from "../data/teams.json";

export default function Classificacao() {
  const { language, seasonData } = useGameStore();

  const [activeTab, setActiveTab] = useState<"Nacional" | "Copa" | "Continental" | "Estadual">("Nacional");
  
  // Group tournaments
  const groups = useMemo(() => {
    const g: Record<string, any[]> = { Nacional: [], Copa: [], Continental: [], Estadual: [] };
    if (!seasonData) return g;

    Object.values(seasonData.tournaments).forEach(t => {
      if (t.id === "estadual") g.Estadual.push(t);
      else if (t.id === "libertadores" || t.id === "champions_league") g.Continental.push(t);
      else if (t.id.includes("copa_")) g.Copa.push(t);
      else g.Nacional.push(t);
    });
    return g;
  }, [seasonData]);

  const currentGroup = groups[activeTab];
  const [selectedTourId, setSelectedTourId] = useState<string>(
    currentGroup.length > 0 ? currentGroup[0].id : ""
  );

  // When changing tab, auto select first tournament
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    const newGroup = groups[tab];
    if (newGroup.length > 0) setSelectedTourId(newGroup[0].id);
    else setSelectedTourId("");
  };

  const selectedTournament = seasonData?.tournaments[selectedTourId];
  
  // Calculate top scorers and best ratings globally
  // In a real simulation, we would use player stats. 
  // Let's mock a sorted list based on player 'goals' if available, otherwise just use their rating to simulate "Melhores".
  const topScorers = useMemo(() => {
      const allPlayers = teamsData.flatMap(t => t.squad);
      return allPlayers.map(p => ({
          name: p.name,
          goals: Math.floor((p.rating - 60) / 5) + Math.floor(Math.random() * 5),
          team: teamsData.find(t => t.squad.some(sq => sq.id === p.id))?.name
      })).sort((a, b) => b.goals - a.goals).slice(0, 5);
  }, []);

  const bestAvg = useMemo(() => {
      const allPlayers = teamsData.flatMap(t => t.squad);
      return allPlayers.map(p => ({
          name: p.name,
          avg: (Math.random() * 2 + 7).toFixed(1),
          team: teamsData.find(t => t.squad.some(sq => sq.id === p.id))?.name
      })).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg)).slice(0, 5);
  }, []);

  if (!seasonData) {
    return (
      <main className="px-4 pb-20 max-w-7xl mx-auto mt-4 min-h-screen text-center pt-20">
        <h2 className="text-2xl font-bold uppercase">{language === 'pt' ? "Temporada não iniciada" : "Season not started"}</h2>
      </main>
    );
  }

  return (
    <main className="px-4 pb-20 max-w-[1200px] mx-auto mt-4 font-sans text-black dark:text-white min-h-screen transition-colors">
      
      {/* Brasfoot-style header tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap bg-[#1a1a1a] text-white text-[12px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] border-2 border-black dark:border-gray-700">
        {(["Nacional", "Copa", "Continental", "Estadual"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-3 border-r border-[#333] transition-colors hover:bg-[#333] ${activeTab === tab ? "bg-[#333] border-b-4 border-b-white" : ""}`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1 flex justify-end items-center pr-4 text-[#ffd700]">
          {seasonData && Object.values(seasonData.tournaments)[0]?.fixtures[0]?.date ? new Date(Object.values(seasonData.tournaments)[0].fixtures[0].date).getFullYear() : 2026}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        
        {/* Left Side: Table Area */}
        <div className="flex-1 flex flex-col gap-2">
           <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <select 
                className="w-full max-w-sm bg-gray-100 dark:bg-gray-900 border border-black dark:border-gray-500 p-1 text-[12px] font-bold uppercase focus:outline-none"
                value={selectedTourId}
                onChange={(e) => setSelectedTourId(e.target.value)}
              >
                 {currentGroup.map(t => (
                   <option key={t.id} value={t.id}>{t.name}</option>
                 ))}
                 {currentGroup.length === 0 && (
                   <option value="">- Nenhuma competição nesta aba -</option>
                 )}
              </select>
           </div>

           {selectedTournament ? (
             <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] overflow-hidden">
                {selectedTournament.type === 'LEAGUE' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-bold min-w-[600px]">
                      <thead className="bg-black text-white">
                        <tr>
                          <th className="p-1 px-2 text-center w-8">#</th>
                          <th className="p-1 px-2">Equipe</th>
                          <th className="p-1 px-2 text-center w-8">PG</th>
                          <th className="p-1 px-2 text-center w-8">J</th>
                          <th className="p-1 px-2 text-center w-8">V</th>
                          <th className="p-1 px-2 text-center w-8">E</th>
                          <th className="p-1 px-2 text-center w-8">D</th>
                          <th className="p-1 px-2 text-center w-8">GP</th>
                          <th className="p-1 px-2 text-center w-8">GC</th>
                          <th className="p-1 px-2 text-center w-8">SG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...selectedTournament.table]
                          .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
                          .map((entry, index) => {
                            const team = teamsData.find(t => t.id === entry.teamId);
                            // Highlight zones
                            let rowClass = "border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
                            if (index < 4) rowClass += " border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20"; // Libertadores / Champions
                            else if (index > selectedTournament.table.length - 5) rowClass += " border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/20"; // Relegation

                            return (
                              <tr key={entry.teamId} className={`${rowClass} hover:brightness-95`}>
                                <td className="p-1 px-2 text-center border-r border-gray-200 dark:border-gray-700">{index + 1}</td>
                                <td className="p-1 px-2 border-r border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                   <div className="w-7 h-7 flex items-center justify-center">
                                      {team?.badgeUrl ? <img src={team.badgeUrl} alt="" className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-[16px]">shield</span>}
                                   </div>
                                   <span className="truncate max-w-[120px]">{team?.name || entry.teamId}</span>
                                </td>
                                <td className="p-1 px-2 text-center bg-gray-100 dark:bg-gray-900">{entry.points}</td>
                                <td className="p-1 px-2 text-center">{entry.played}</td>
                                <td className="p-1 px-2 text-center text-green-700 dark:text-green-400">{entry.wins}</td>
                                <td className="p-1 px-2 text-center text-gray-600 dark:text-gray-400">{entry.draws}</td>
                                <td className="p-1 px-2 text-center text-red-700 dark:text-red-400">{entry.losses}</td>
                                <td className="p-1 px-2 text-center">{entry.goalsFor}</td>
                                <td className="p-1 px-2 text-center">{entry.goalsAgainst}</td>
                                <td className="p-1 px-2 text-center bg-gray-100 dark:bg-gray-900">{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-[12px] font-bold uppercase tracking-widest flex flex-col items-center gap-4">
                     <span className="material-symbols-outlined text-4xl">account_tree</span>
                     Visualização de chaves de mata-mata em breve!
                     <p className="mt-4 opacity-50">Rodada atual: {selectedTournament.currentRound}</p>
                  </div>
                )}
             </div>
           ) : (
             <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] text-center text-[12px] font-bold uppercase">
               Nenhuma competição selecionada.
             </div>
           )}
        </div>

        {/* Right Side: Sidebar Stats */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
           {/* Artilheiros */}
           <div className="bg-[#002f5c] text-white border-2 border-black dark:border-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]">
              <div className="bg-black text-white p-2 flex justify-between text-[11px] font-bold uppercase tracking-widest border-b-2 border-white/20">
                 <span>Artilheiros</span>
                 <span>G</span>
              </div>
              <ul className="p-2 flex flex-col gap-1 text-[10px] font-bold uppercase">
                 {topScorers.map((scorer, i) => (
                    <li key={i} className="flex justify-between items-center py-1 border-b border-white/10 last:border-0">
                       <span className="truncate max-w-[150px]">{scorer.name} <span className="text-[8px] text-gray-400">({scorer.team})</span></span>
                       <span className="text-yellow-400">{scorer.goals}</span>
                    </li>
                 ))}
              </ul>
           </div>

           {/* Melhores Notas */}
           <div className="bg-[#002f5c] text-white border-2 border-black dark:border-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]">
              <div className="bg-black text-white p-2 flex justify-between text-[11px] font-bold uppercase tracking-widest border-b-2 border-white/20">
                 <span>Melhores Notas</span>
                 <span>N</span>
              </div>
              <ul className="p-2 flex flex-col gap-1 text-[10px] font-bold uppercase">
                 {bestAvg.map((p, i) => (
                    <li key={i} className="flex justify-between items-center py-1 border-b border-white/10 last:border-0">
                       <span className="truncate max-w-[150px]">{p.name} <span className="text-[8px] text-gray-400">({p.team})</span></span>
                       <span className="text-green-400">{p.avg}</span>
                    </li>
                 ))}
              </ul>
           </div>

           {/* Estatísticas e História */}
           <div className="bg-[#f4f4f4] text-black border-2 border-black dark:bg-gray-800 dark:text-white dark:border-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]">
              <div className="bg-black text-white p-2 text-[11px] font-bold uppercase tracking-widest">
                 Estatísticas e História
              </div>
              <div className="p-3 text-[10px] font-bold uppercase flex flex-col gap-2">
                 <div className="flex justify-between border-b border-gray-300 dark:border-gray-600 pb-1">
                    <span className="text-gray-600 dark:text-gray-400">Rodada Atual:</span>
                    <span>{selectedTournament?.currentRound || 0}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-300 dark:border-gray-600 pb-1">
                    <span className="text-gray-600 dark:text-gray-400">Jogos Simulados:</span>
                    <span>{(selectedTournament?.table?.reduce((acc, curr) => acc + curr.played, 0) || 0) / 2}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-300 dark:border-gray-600 pb-1">
                    <span className="text-gray-600 dark:text-gray-400">Gols Totais:</span>
                    <span>{selectedTournament?.table?.reduce((acc, curr) => acc + curr.goalsFor, 0) || 0}</span>
                 </div>
                 
                 <div className="mt-4 flex flex-col items-center justify-center gap-2">
                    <div className="w-16 h-16 opacity-80">
                        {selectedTournament && (
                            <img src={`/trophies/${selectedTournament.id}.png`} alt="Trophy" 
                                 className="w-full h-full object-contain drop-shadow-md"
                                 onError={(e) => (e.target as HTMLImageElement).src = '/trophies/generic.png'} />
                        )}
                    </div>
                    <span className="text-[9px] text-center max-w-[120px]">{selectedTournament?.name}</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </main>
  );
}
