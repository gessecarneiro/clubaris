import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import type { Player } from "../store/gameStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../utils/i18n";
import teamsData from "../data/teams.json";
import { simulateDetailedMatch } from "../engine/MatchEngine";
import type { MatchResult, MatchEvent } from "../engine/MatchEngine";
import { simulateAIMatch } from "../engine/TournamentEngine";
import { supabase } from "../lib/supabase";

type AIMatchStatus = {
  fixtureId: string;
  homeTeamName: string;
  awayTeamName: string;
  currentHomeScore: number;
  currentAwayScore: number;
  finalHomeScore: number;
  finalAwayScore: number;
  homeGoalsMins: number[];
  awayGoalsMins: number[];
};

type GoalScorer = { time: number; name: string; isHome: boolean };

export default function SimulacaoPartida() {
  const { teamName, playerTeamId, startingXI, tactic, language, seasonData, simulateRound, lastSimulatedGlobalMatches } = useGameStore();
  const t = useTranslation();
  const navigate = useNavigate();

  const [matchTime, setMatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchFinished, setMatchFinished] = useState(false);
  const [showGlobalResults, setShowGlobalResults] = useState(false);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('all');
  const [simSpeed, setSimSpeed] = useState(100);

  const [score, setScore] = useState({ home: 0, away: 0 });
  const [eventsLog, setEventsLog] = useState<{time: number, text: string, type: string}[]>([]);
  
  const [aiMatches, setAiMatches] = useState<AIMatchStatus[]>([]);
  const [aiFinalScores, setAiFinalScores] = useState<Record<string, {homeScore: number, awayScore: number}>>({});

  // The complete pre-calculated match
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  
  // Get Next Match
  let nextMatch = null;
  if (seasonData) {
    const unplayedMatches = seasonData.playerSchedule.filter(f => !f.played);
    if (unplayedMatches.length > 0) {
      nextMatch = unplayedMatches[0];
    }
  }

  const isHome = nextMatch ? nextMatch.homeTeamId === playerTeamId : true;
  const oppId = nextMatch ? (isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId) : "titans";
  const oppTeam = teamsData.find(t => t.id === oppId);
  const opponentName = oppTeam ? oppTeam.name : "TITANS FC";
  const tournamentName = nextMatch && seasonData ? seasonData.tournaments[nextMatch.tournamentId]?.name || "Friendly" : "Friendly";

  const handleStartMatch = () => {
    // Generate opponent squad dummy
    const oppSquad: Player[] = oppTeam ? oppTeam.squad.map((p: any) => ({
      ...p,
      status: 'OK',
      energy: 100,
      morale: 100
    })) : [];

    const homeSquad = isHome ? startingXI : oppSquad;
    const awaySquad = !isHome ? startingXI : oppSquad;
    
    const homeTactic = isHome ? tactic : null;
    const awayTactic = !isHome ? tactic : null; // Dummy opponent has no tactic

    // Pre-simulate other matches
    if (seasonData && nextMatch) {
       const tournament = seasonData.tournaments[nextMatch.tournamentId];
       if (tournament) {
          const otherFixtures = tournament.fixtures.filter(f => f.round === nextMatch!.round && f.id !== nextMatch!.id && !f.played);
          const aiM: AIMatchStatus[] = [];
          const aiS: Record<string, {homeScore: number, awayScore: number}> = {};

          otherFixtures.forEach(f => {
             const hTeam = teamsData.find(t => t.id === f.homeTeamId);
             const aTeam = teamsData.find(t => t.id === f.awayTeamId);
             const hRating = hTeam ? hTeam.rating : 75;
             const aRating = aTeam ? aTeam.rating : 75;
             
             const { homeScore, awayScore } = simulateAIMatch(hRating, aRating);
             aiS[f.id] = { homeScore, awayScore };
             
             // Generate random minutes for goals
             const homeMins = Array.from({length: homeScore}).map(() => Math.floor(Math.random() * 90) + 1).sort((a,b) => a-b);
             const awayMins = Array.from({length: awayScore}).map(() => Math.floor(Math.random() * 90) + 1).sort((a,b) => a-b);

             aiM.push({
               fixtureId: f.id,
               homeTeamName: hTeam?.name || "Time Casa",
               awayTeamName: aTeam?.name || "Time Fora",
               currentHomeScore: 0,
               currentAwayScore: 0,
               finalHomeScore: homeScore,
               finalAwayScore: awayScore,
               homeGoalsMins: homeMins,
               awayGoalsMins: awayMins
             });
          });
          setAiMatches(aiM);
          setAiFinalScores(aiS);
       }
    }

    const result = simulateDetailedMatch(homeSquad, homeTactic, awaySquad, awayTactic);
    setMatchResult(result);
    setIsPlaying(true);
  };

  useEffect(() => {
    let interval: number;
    if (isPlaying && matchResult && !matchFinished) {
      interval = window.setInterval(() => {
        setMatchTime(prev => {
          if (prev >= 90) return 90;
          return prev + 1;
        });
      }, simSpeed); // use dynamic speed
    }
    return () => clearInterval(interval);
  }, [isPlaying, matchResult, matchFinished, simSpeed]);

  useEffect(() => {
    if (!matchResult || matchTime === 0) return;

    // Check for events in this minute
    const currentEvents = matchResult.events.filter(e => e.minute === matchTime);
    
    currentEvents.forEach(ev => {
      let icon = '';
      let text = '';
      
      if (ev.type === 'goal') {
        if (ev.team === 'home') setScore(s => ({ ...s, home: s.home + 1 }));
        else setScore(s => ({ ...s, away: s.away + 1 }));
        
        icon = '⚽';
        text = `GOL! ${ev.player.name} (${ev.team === 'home' ? (isHome ? teamName : opponentName) : (!isHome ? teamName : opponentName)})`;
        if (ev.assist) text += ` - Ast: ${ev.assist.name}`;
      } else if (ev.type === 'yellow_card') {
        icon = '🟨';
        text = `Cartão Amarelo para ${ev.player.name}`;
      } else if (ev.type === 'red_card') {
        icon = '🟥';
        text = `Cartão VERMELHO para ${ev.player.name}`;
      } else if (ev.type === 'injury') {
        icon = '✚';
        text = `${ev.player.name} se machucou!`;
      } else if (ev.type === 'miss') {
        icon = '💨';
        text = `Pra fora! ${ev.player.name} mandou longe.`;
      } else if (ev.type === 'save') {
        icon = '🧤';
        text = `Defesa! O goleiro impediu o gol de ${ev.player.name}.`;
      } else if (ev.type === 'woodwork') {
        icon = '🥅';
        text = `Na trave! Quase gol de ${ev.player.name}!`;
      }

      setEventsLog(old => [{ time: matchTime, text: `${icon} ${text}`, type: ev.type }, ...old]);
    });

    // Check AI Matches for this minute
    aiMatches.forEach(m => {
       const newHomeGoals = m.homeGoalsMins.filter(min => min === matchTime).length;
       const newAwayGoals = m.awayGoalsMins.filter(min => min === matchTime).length;

       if (newHomeGoals > 0 || newAwayGoals > 0) {
          setAiMatches(prev => prev.map(pm => pm.fixtureId === m.fixtureId ? 
            {...pm, currentHomeScore: pm.currentHomeScore + newHomeGoals, currentAwayScore: pm.currentAwayScore + newAwayGoals} 
            : pm
          ));

          const newH = m.currentHomeScore + newHomeGoals;
          const newA = m.currentAwayScore + newAwayGoals;

          setEventsLog(old => [{
            time: matchTime, 
            text: `⚽ Placares Simultâneos: ${m.homeTeamName} ${newH} x ${newA} ${m.awayTeamName}`, 
            type: 'ai_goal'
          }, ...old]);
       }
    });

    if (matchTime >= 90) {
      setIsPlaying(false);
      setMatchFinished(true);
    }
  }, [matchTime, matchResult, isHome, teamName, opponentName]);

  const handleFinishMatch = async () => {
    // Process injuries, cards, stats for Player Team only
    if (matchResult) {
      const playerTeamEvents = matchResult.events.filter(e => (isHome && e.team === 'home') || (!isHome && e.team === 'away'));
      
      const statsUpdate: Record<string, any> = {};
      
      // Update Matches Played
      startingXI.forEach(p => {
        statsUpdate[p.id] = { matches_played: (p.matches_played || 0) + 1 };
      });

      // Update from events
      playerTeamEvents.forEach(ev => {
        if (!statsUpdate[ev.player.id]) statsUpdate[ev.player.id] = {};
        
        if (ev.type === 'goal') {
          statsUpdate[ev.player.id].goals = (statsUpdate[ev.player.id].goals || 0) + 1;
        } else if (ev.type === 'yellow_card') {
          statsUpdate[ev.player.id].yellow_cards = (statsUpdate[ev.player.id].yellow_cards || 0) + 1;
        } else if (ev.type === 'red_card') {
          statsUpdate[ev.player.id].red_cards = (statsUpdate[ev.player.id].red_cards || 0) + 1;
          statsUpdate[ev.player.id].suspension_games = 1; // Suspend for 1 game
        } else if (ev.type === 'injury') {
          statsUpdate[ev.player.id].injury_days = Math.floor(Math.random() * 14) + 3; // 3 to 17 days
        }

        if (ev.assist) {
          if (!statsUpdate[ev.assist.id]) statsUpdate[ev.assist.id] = {};
          statsUpdate[ev.assist.id].assists = (statsUpdate[ev.assist.id].assists || 0) + 1;
        }
      });

      // Add goals conceded for GK
      const gk = startingXI.find(p => p.position === 'GK');
      if (gk) {
         if (!statsUpdate[gk.id]) statsUpdate[gk.id] = {};
         statsUpdate[gk.id].goalsConceded = isHome ? score.away : score.home;
      }

      // We should ideally sync this with the database (Supabase) and local store.
      // This will be done properly via gameStore update loop. For now, it will apply on DB.
      for (const [pId, updates] of Object.entries(statsUpdate)) {
         try {
           await supabase.from('players').update(updates).eq('id', pId);
         } catch(e) {
           console.error("Failed to update stats", e);
         }
      }
      
      simulateRound(score.home, score.away, aiFinalScores, statsUpdate);
    } else {
      simulateRound(score.home, score.away, aiFinalScores);
    }

    setShowGlobalResults(true);
  };

  const handleReturnToClub = () => {
    navigate('/clubhouse');
  };

  if (showGlobalResults) {
    const globalMatches = lastSimulatedGlobalMatches || [];
    
    // Group matches by tournament
    const matchesByLeague: Record<string, any[]> = {};
    globalMatches.forEach(m => {
       if (!matchesByLeague[m.tournamentId]) matchesByLeague[m.tournamentId] = [];
       matchesByLeague[m.tournamentId].push(m);
    });

    const leagues = Object.keys(matchesByLeague);

    return (
      <main className="mt-20 pb-20 px-4 max-w-4xl mx-auto flex flex-col gap-4">
         <div className="bg-white dark:bg-gray-800 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-6">
            <h2 className="text-2xl font-black uppercase text-center mb-6 dark:text-white border-b-4 border-black pb-4">
              🗞️ Resumo da Semana pelo Mundo
            </h2>
            
            <div className="mb-4">
               <label className="font-bold text-sm uppercase mr-2 dark:text-gray-300">Filtrar por Liga:</label>
               <select 
                 className="border-2 border-black p-2 font-bold bg-gray-100 dark:bg-gray-900 dark:text-white"
                 value={selectedLeagueFilter}
                 onChange={e => setSelectedLeagueFilter(e.target.value)}
               >
                 <option value="all">Todas as Ligas Simuladas</option>
                 {leagues.map(l => {
                    const tourName = seasonData?.tournaments[l]?.name || l;
                    return <option key={l} value={l}>{tourName}</option>;
                 })}
               </select>
            </div>

            <div className="flex flex-col gap-8 max-h-[60vh] overflow-y-auto pr-2">
               {leagues.filter(l => selectedLeagueFilter === 'all' || selectedLeagueFilter === l).map(leagueId => (
                 <div key={leagueId}>
                    <h3 className="font-black uppercase bg-green-800 text-white p-2 mb-2">
                      {seasonData?.tournaments[leagueId]?.name || leagueId}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {matchesByLeague[leagueId].map(m => {
                          const hTeam = teamsData.find(t => t.id === m.homeTeamId)?.name || 'Casa';
                          const aTeam = teamsData.find(t => t.id === m.awayTeamId)?.name || 'Fora';
                          const isPlayerMatch = (m.homeTeamId === playerTeamId || m.awayTeamId === playerTeamId);
                          return (
                            <div key={m.id} className={`flex justify-between items-center text-sm font-bold p-2 border-2 ${isPlayerMatch ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' : 'border-gray-300 dark:border-gray-700'} rounded`}>
                               <span className="truncate w-2/5 text-right dark:text-gray-200">{hTeam}</span>
                               <span className="w-1/5 text-center bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded dark:text-white border border-gray-400">
                                  {m.homeScore} - {m.awayScore}
                               </span>
                               <span className="truncate w-2/5 text-left dark:text-gray-200">{aTeam}</span>
                            </div>
                          );
                       })}
                    </div>
                 </div>
               ))}
               
               {globalMatches.length === 0 && (
                 <p className="text-center text-gray-500 font-bold uppercase">Nenhuma outra partida importante ocorreu nesta semana.</p>
               )}
            </div>

            <div className="mt-8 flex justify-center">
               <button onClick={handleReturnToClub} className="bg-blue-700 hover:bg-blue-600 text-white font-black text-xl px-12 py-4 uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
                  Voltar ao Clube
               </button>
            </div>
         </div>
      </main>
    );
  }

  return (
    <main className="mt-20 pb-20 px-4 max-w-6xl mx-auto flex flex-col gap-4">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Main Match Column */}
        <div className="md:col-span-8 flex flex-col gap-4">
          {/* Match Header */}
          <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 shadow flex flex-col items-center p-6 transition-colors">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{tournamentName}</h2>
        <div className="flex justify-between items-center w-full mt-4">
           {/* Home */}
           <div className="flex flex-col items-center w-1/3">
              <span className="font-bold text-lg dark:text-white">{isHome ? teamName : opponentName}</span>
           </div>
           
           {/* Score */}
           <div className="flex flex-col items-center">
              <div className="text-4xl font-black bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-gray-600 px-6 py-2 shadow flex gap-2 dark:text-white">
                <span>{score.home}</span>
                <span>-</span>
                <span>{score.away}</span>
              </div>
              <span className="text-sm font-bold mt-2 bg-yellow-400 text-black px-2 py-1 uppercase">{matchTime}'</span>
           </div>

           {/* Away */}
           <div className="flex flex-col items-center w-1/3">
              <span className="font-bold text-lg dark:text-white">{!isHome ? teamName : opponentName}</span>
           </div>
        </div>
      </section>

      {/* Events Log */}
      <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 shadow p-4 transition-colors">
        <h3 className="font-bold uppercase border-b pb-2 mb-2 dark:text-white text-sm">Acontecimentos da Partida</h3>
        <div className="h-64 overflow-y-auto flex flex-col gap-2">
           {eventsLog.length === 0 && <span className="text-gray-500 text-sm">O jogo ainda não começou...</span>}
           {eventsLog.map((ev, idx) => (
             <div key={idx} className="flex gap-2 items-center text-sm dark:text-gray-200 border-b dark:border-gray-700 pb-1">
               <span className="font-bold text-gray-500 w-8">{ev.time}'</span>
               <span className={ev.type === 'goal' ? 'font-bold text-green-600 dark:text-green-400' : ''}>{ev.text}</span>
             </div>
           ))}
        </div>
      </section>

          {matchFinished && matchResult && (
            <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 shadow p-4 transition-colors">
              <h3 className="font-bold uppercase border-b pb-2 mb-2 dark:text-white text-sm">Avaliação dos Jogadores (Notas)</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="font-bold text-[10px] text-gray-500 uppercase">{isHome ? teamName : opponentName}</span>
                    {startingXI.map(p => (
                       <div key={p.id} className="flex justify-between text-xs dark:text-gray-300">
                          <span>{p.name}</span>
                          <span className={`font-bold ${matchResult.ratings[p.id] >= 7.0 ? 'text-green-500' : matchResult.ratings[p.id] < 5.0 ? 'text-red-500' : ''}`}>
                            {matchResult.ratings[p.id]?.toFixed(1) || "6.0"}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>
            </section>
          )}

          {/* Controls */}
          <section className="flex justify-center gap-4">
             {!isPlaying && !matchFinished && (
                <button onClick={handleStartMatch} className="bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3 uppercase shadow">
                  Apitar o Início
                </button>
             )}
             
             {isPlaying && !matchFinished && (
                <div className="flex flex-col items-center gap-2">
                   <span className="text-xs font-bold uppercase text-gray-500">Velocidade</span>
                   <div className="flex gap-2">
                      <button onClick={() => setSimSpeed(300)} className={`px-3 py-1 text-sm font-bold border-2 border-black dark:border-gray-500 ${simSpeed === 300 ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 dark:text-white text-black'}`}>Lenta</button>
                      <button onClick={() => setSimSpeed(100)} className={`px-3 py-1 text-sm font-bold border-2 border-black dark:border-gray-500 ${simSpeed === 100 ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 dark:text-white text-black'}`}>Normal</button>
                      <button onClick={() => setSimSpeed(30)} className={`px-3 py-1 text-sm font-bold border-2 border-black dark:border-gray-500 ${simSpeed === 30 ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 dark:text-white text-black'}`}>Rápida</button>
                      <button onClick={() => setSimSpeed(5)} className={`px-3 py-1 text-sm font-bold border-2 border-black dark:border-gray-500 ${simSpeed === 5 ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 dark:text-white text-black'}`}>Super</button>
                   </div>
                </div>
             )}
             {matchFinished && (
                <button onClick={handleFinishMatch} className="bg-blue-700 hover:bg-blue-600 text-white font-bold px-8 py-3 uppercase shadow animate-pulse">
                  Continuar
                </button>
             )}
          </section>
        </div>

        {/* Other Matches Column (Live Scores) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 shadow flex flex-col h-full transition-colors">
            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 p-2 flex items-center justify-between">
              <h3 className="font-bold uppercase dark:text-white text-sm">Placares Simultâneos</h3>
              {isPlaying && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            </div>
            
            <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto max-h-[500px]">
              {aiMatches.length === 0 && !isPlaying && !matchFinished && (
                <div className="text-gray-500 text-sm text-center mt-4">Inicie a partida para ver os outros jogos.</div>
              )}
              {aiMatches.map(m => (
                <div key={m.fixtureId} className="flex flex-col bg-gray-50 dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                   <div className="flex justify-between items-center text-xs font-bold dark:text-white">
                      <span className="truncate w-2/5 text-right">{m.homeTeamName}</span>
                      <span className="w-1/5 text-center bg-gray-200 dark:bg-gray-900 px-1 py-1 rounded">
                         {m.currentHomeScore} - {m.currentAwayScore}
                      </span>
                      <span className="truncate w-2/5 text-left">{m.awayTeamName}</span>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
