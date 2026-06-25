import { useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import type { Player } from "../store/gameStore";
import { calculateMarketValue, translatePosition } from '../utils/playerUtils';
import teamsData from "../data/teams.json";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

export default function HomeClubHouse() {
  const { teamName, squad, seasonData, playerTeamId, language, balance, boardConfidence, fanConfidence, badgeUrl, sellPlayer } = useGameStore();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(squad.length > 0 ? squad[0] : null);

  const handleSellPlayer = async () => {
    if (!selectedPlayer) return;
    const value = calculateMarketValue(selectedPlayer);
    const offer = Math.floor(value * (Math.random() * 0.4 + 0.8));
    if (window.confirm(language === 'pt' ? `O clube recebeu uma proposta de $${(offer / 1000000).toFixed(1)}M por ${selectedPlayer.name}. Aceitar?` : `Received offer of $${(offer / 1000000).toFixed(1)}M for ${selectedPlayer.name}. Accept?`)) {
        await sellPlayer(selectedPlayer.id, offer);
        setSelectedPlayer(null);
    }
  };

  let nextMatch = null;
  let oppTeam = null;
  let isHome = false;
  let tournamentName = '';

  if (seasonData) {
    const upcoming = seasonData.playerSchedule.filter(f => !f.played);
    if (upcoming.length > 0) {
      nextMatch = upcoming[0];
      isHome = nextMatch.homeTeamId === playerTeamId;
      const oppId = isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId;
      oppTeam = teamsData.find((t: any) => t.id === oppId);
      tournamentName = seasonData.tournaments[nextMatch.tournamentId]?.name || 'Amistoso';
    }
  }

  const formattedBalance = `$${(balance / 1000000).toFixed(1)}M`;

  const handleAcceptNewJob = async () => {
    // Find a weak team (rating < 75)
    const weakTeams = teamsData.filter(t => t.rating < 75 && t.id !== playerTeamId);
    const randomTeam = weakTeams[Math.floor(Math.random() * weakTeams.length)] || teamsData[0];
    
    // Update local store
    useGameStore.setState({
      playerTeamId: randomTeam.id,
      teamName: randomTeam.name,
      boardConfidence: 50,
      balance: 10000000, // Reset balance
      badgeUrl: randomTeam.badgeUrl
    });

    // We should ideally sync this to DB (saves table)
    const saveId = useGameStore.getState().saveId;
    if (saveId) {
       await supabase.from('saves').update({
         player_team_id: randomTeam.id,
         team_name: randomTeam.name,
         board_confidence: 50,
         balance: 10000000
       }).eq('id', saveId);
    }
    
    // Reload page to fetch new squad (easiest way to reset)
    window.location.reload();
  };

  if (boardConfidence <= 0) {
    return (
      <main className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-surface-container border-4 border-error shadow-[8px_8px_0px_0px_rgba(255,0,0,0.5)] p-8 max-w-lg w-full flex flex-col items-center gap-6"
        >
          <span className="material-symbols-outlined text-error text-6xl">gavel</span>
          <h1 className="text-3xl font-black text-error uppercase tracking-widest text-center">Você foi demitido!</h1>
          <p className="text-on-surface text-center">
            A diretoria do <span className="font-bold text-secondary">{teamName}</span> perdeu completamente a paciência com os maus resultados. Seu contrato foi rescindido imediatamente.
          </p>
          <div className="bg-surface-container-high p-4 border border-on-background w-full">
             <h3 className="text-xs font-bold text-on-surface-variant uppercase mb-2">Propostas na Mesa:</h3>
             <p className="text-sm">Um clube de menor expressão está disposto a te dar uma nova chance para reerguer sua carreira.</p>
          </div>
          <button 
            onClick={handleAcceptNewJob}
            className="w-full bg-error text-on-error font-black uppercase py-4 border-2 border-on-background hover:bg-error-container hover:text-on-error-container transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            Assumir Novo Clube
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="px-4 flex flex-col lg:flex-row gap-6 pb-20 max-w-7xl mx-auto mt-4 font-sans bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen transition-colors">
      
      {/* LEFT SIDEBAR (Brasfoot Style) */}
      <aside className="w-full lg:w-80 flex flex-col gap-4">
        
        {/* Team Info & Finances */}
        <div className="tour-step-team bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center p-1">
              {badgeUrl ? (
                <img src={badgeUrl} alt="Badge" className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                <span className="material-symbols-outlined text-[24px]">shield</span>
              )}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-green-800 uppercase leading-tight">
                {teamName}
              </h2>
              <div className="text-[12px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">payments</span>
                <span>{formattedBalance}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-600 dark:text-gray-400 uppercase">{language === 'pt' ? 'Confianca Diretoria' : 'Board Confidence'}</span>
                <span className="text-green-800">{boardConfidence}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 border border-black dark:border-gray-600 overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${boardConfidence}%` }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-600 dark:text-gray-400 uppercase">{language === 'pt' ? 'Confianca Torcida' : 'Fan Confidence'}</span>
                <span className="text-green-800">{fanConfidence}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 border border-black dark:border-gray-600 overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${fanConfidence}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Match */}
        <div className="tour-step-next-match bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          <div className="bg-green-800 dark:bg-green-900 text-white font-bold text-[12px] px-3 py-2 border-b-2 border-black dark:border-gray-900">
            {language === 'pt' ? 'Próximo Jogo' : 'Next Match'} - {isHome ? (language === 'pt' ? 'Casa' : 'Home') : (language === 'pt' ? 'Fora' : 'Away')}
          </div>
          
          <div className="p-3">
            {nextMatch ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-16 h-16 flex items-center justify-center">
                     {oppTeam?.badgeUrl ? (
                        <img src={oppTeam.badgeUrl} alt={oppTeam.name} className="w-full h-full object-contain drop-shadow-md" />
                     ) : (
                        <span className="material-symbols-outlined text-[32px] text-gray-400">shield</span>
                     )}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-green-800 dark:text-green-400">
                        {oppTeam?.name || (isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId)}
                      </span>
                      <span className="text-[12px] font-bold text-green-700/80 dark:text-green-500/80 mt-1">
                        {tournamentName} - {nextMatch.round}ª {language === 'pt' ? 'rodada' : 'round'}
                      </span>
                   </div>
                </div>
                <Link to="/times" state={{ teamId: oppTeam?.id }} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Estatísticas/Info">
                   <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">analytics</span>
                </Link>
              </div>
            ) : (
              <div className="text-[12px] font-bold text-gray-500 text-center">
                {language === 'pt' ? 'Fim de Temporada' : 'End of Season'}
              </div>
            )}
          </div>
        </div>

        <Link
          to="/escalacao"
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-center py-3 text-[14px] font-bold border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors uppercase flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-green-800 dark:text-green-400">sports_handball</span>
          {language === 'pt' ? 'Escalar Time' : 'Tactics'}
        </Link>
        <Link
          to="/classificacao"
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-center py-3 text-[14px] font-bold border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors uppercase flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-green-800 dark:text-green-400">format_list_numbered</span>
          {language === 'pt' ? 'Classificações' : 'Standings'}
        </Link>
        <Link
          to="/partida"
          className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-center py-3 text-[14px] font-bold border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors uppercase flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-green-800 dark:text-green-400">play_arrow</span>
          {language === 'pt' ? 'Jogar Partida' : 'Play Match'}
        </Link>

        {/* Selected Player Details */}
        {selectedPlayer && (
          <div className="bg-white dark:bg-gray-800 border-2 border-green-800 dark:border-green-600 mt-4">
            <div className="bg-green-800 dark:bg-green-900 text-white p-1 px-2 flex justify-between items-center font-bold text-[12px]">
              <span className="truncate uppercase">{selectedPlayer.name}</span>
              <div className="flex items-center gap-2">
                <span>OVR: {selectedPlayer.rating}</span>
                <button onClick={handleSellPlayer} className="hover:text-red-300 flex items-center justify-center transition-colors" title={language === 'pt' ? 'Vender Jogador' : 'Sell Player'}>
                  <span className="material-symbols-outlined text-[16px]">sell</span>
                </button>
              </div>
            </div>
            <div className="p-3 flex gap-3">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 border border-black dark:border-gray-700 flex items-center justify-center overflow-hidden">
                 {selectedPlayer.photoUrl ? (
                    <img src={selectedPlayer.photoUrl} alt="Player" className="w-full h-full object-cover" />
                 ) : (
                    <span className="material-symbols-outlined text-[32px] text-gray-400">person</span>
                 )}
              </div>
              <div className="flex flex-col gap-1 text-[10px] font-bold">
                 <div className="flex gap-1">
                    <span className="text-gray-500 w-12 text-right">Pos:</span>
                    <span className="text-black dark:text-white">{translatePosition(selectedPlayer.position, language)}</span>
                 </div>
                 <div className="flex gap-1">
                    <span className="text-gray-500 dark:text-gray-400 w-12 text-right">Idade:</span>
                    <span className="text-black dark:text-white">{selectedPlayer.age || '-'}</span>
                 </div>
                 <div className="flex gap-1">
                    <span className="text-gray-500 dark:text-gray-400 w-12 text-right">Ene:</span>
                    <span className={selectedPlayer.energy && selectedPlayer.energy < 70 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>
                      {selectedPlayer.energy || 100}%
                    </span>
                 </div>
                 <div className="flex gap-1">
                    <span className="text-gray-500 dark:text-gray-400 w-12 text-right">Passe:</span>
                    <span className="text-black dark:text-white">${(calculateMarketValue(selectedPlayer) / 1000000).toFixed(1)}M</span>
                 </div>
              </div>
            </div>
          </div>
        )}

      </aside>      {/* RIGHT MAIN AREA - SQUAD Table */}
      <section className="tour-step-squad flex-1 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-black dark:text-white">
        <div className="overflow-x-auto flex-1 bg-gray-50 dark:bg-gray-900">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700 z-10">
              <tr className="border-b-2 border-black dark:border-gray-900">
                <th className="p-1 px-2 text-[11px] font-bold w-10 text-center border-r border-gray-400 dark:border-gray-600">P</th>
                <th className="p-1 px-2 text-[11px] font-bold border-r border-gray-400 dark:border-gray-600">Nome</th>
                <th className="p-1 px-2 text-[11px] font-bold w-10 text-center border-r border-gray-400 dark:border-gray-600" title="Lado (Pé)">L</th>
                <th className="p-1 px-2 text-[11px] font-bold w-12 text-center border-r border-gray-400 dark:border-gray-600" title="Força">F</th>
                <th className="p-1 px-2 text-[11px] font-bold w-16 text-center border-r border-gray-400 dark:border-gray-600">Energia</th>
                <th className="p-1 px-2 text-[11px] font-bold w-20 text-right border-r border-gray-400 dark:border-gray-600">Salário</th>
                <th className="p-1 px-2 text-[11px] font-bold w-20 text-right border-r border-gray-400 dark:border-gray-600">Passe</th>
                <th className="p-1 px-2 text-[11px] font-bold w-10 text-center border-r border-gray-400 dark:border-gray-600" title="Gols">G</th>
                <th className="p-1 px-2 text-[11px] font-bold w-24 border-r border-gray-400 dark:border-gray-600" title="Características">Car.</th>
                <th className="p-1 px-2 text-[11px] font-bold w-12 text-center border-r border-gray-400 dark:border-gray-600">Idade</th>
                <th className="p-1 px-2 text-[11px] font-bold w-10 text-center border-r border-gray-400 dark:border-gray-600" title="Gols Sofridos">GC</th>
                <th className="p-1 px-2 text-[11px] font-bold w-10 text-center border-r border-gray-400 dark:border-gray-600" title="Assistências">A</th>
                <th className="p-1 px-2 text-[11px] font-bold w-12 text-center border-r border-gray-400 dark:border-gray-600" title="Nota Média">NM</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-bold cursor-pointer">
              {squad.map((player) => {
                const isSelected = selectedPlayer?.id === player.id;
                
                // Determine Row Color Class
                let rowClass = 'bg-white dark:bg-gray-800';
                if (isSelected) rowClass = 'bf-select';
                else if (player.position === 'GK') rowClass = 'bf-gk';
                else if (['CB', 'LB', 'RB'].includes(player.position)) rowClass = 'bf-def';
                else if (['CM', 'CDM', 'CAM', 'RM', 'LM'].includes(player.position)) rowClass = 'bf-mid';
                else rowClass = 'bf-atk';

                return (
                  <tr 
                    key={player.id} 
                    onClick={() => setSelectedPlayer(player)}
                    className={`border-b border-black/10 dark:border-black/30 hover:brightness-95 transition-all ${rowClass}`}
                  >
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40">
                      {translatePosition(player.position, language)}
                    </td>
                    <td className="p-2 md:p-1 px-2 truncate border-r border-black/20 dark:border-black/40">
                       {player.name} {player.isWorldClass && <span title="Craque Mundial">⭐</span>}
                    </td>
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 text-[10px] uppercase">
                      {player.preferredFoot === 'Esquerdo' ? 'E' : 'D'}
                    </td>
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 font-black text-black/80">
                      {player.rating}
                    </td>
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 bg-black/5">
                      <span className={player.energy && player.energy < 70 ? 'text-red-700' : 'text-green-800'}>
                        {player.energy || 100}%
                      </span>
                    </td>
                    <td className="p-2 md:p-1 px-2 text-right border-r border-black/20 dark:border-black/40 text-[10px]">
                      ${(player as any).contract_salary ? ((player as any).contract_salary / 1000).toFixed(0) + 'k' : '-'}
                    </td>
                    <td className="p-2 md:p-1 px-2 text-right border-r border-black/20 dark:border-black/40 text-[10px]">
                      ${(calculateMarketValue(player) / 1000000).toFixed(1)}M
                    </td>
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 font-black text-black/70">
                      {(player as any).goals || 0}
                    </td>
                    <td className="p-2 md:p-1 px-2 truncate border-r border-black/20 dark:border-black/40 text-[9px] uppercase">
                        {player.traits ? player.traits.slice(0, 2).map(t => t.substring(0, 3)).join(', ') : '-'}
                    </td>
                    <td className={`p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 ${(player.age && player.age >= 33) ? 'text-red-600 font-black' : ''}`}>
                      {player.age || '-'}
                    </td>
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 font-black text-black/70">
                      {player.position === 'GK' ? ((player as any).goalsConceded || 0) : '-'}
                    </td>
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 font-black text-black/70">
                      {(player as any).assists || 0}
                    </td>
                    <td className="p-2 md:p-1 px-2 text-center border-r border-black/20 dark:border-black/40 font-black text-blue-800 dark:text-blue-300">
                      {(player as any).averageRating ? (player as any).averageRating.toFixed(1) : '-'}
                    </td>
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
