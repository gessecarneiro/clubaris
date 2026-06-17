import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../utils/i18n";
import teamsData from "../data/teams.json";

type MatchEvent = { time: number; text: string; type: "info" | "goal" | "card" | "injury" };
type GoalScorer = { time: number; name: string; isHome: boolean };

export default function SimulacaoPartida() {
  const { teamName, teamId, startingXI, language, finishMatch, updatePlayerStatus, schedule, tournaments } = useGameStore();
  const t = useTranslation();
  const navigate = useNavigate();

  const [matchTime, setMatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchFinished, setMatchFinished] = useState(false);

  const [score, setScore] = useState({ home: 0, away: 0 });
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [goalScorers, setGoalScorers] = useState<GoalScorer[]>([]);

  const [stats, setStats] = useState({
    home: { possession: 50, shots: 0, fouls: 0, yellows: 0, reds: 0 },
    away: { possession: 50, shots: 0, fouls: 0, yellows: 0, reds: 0 },
  });

  // Get Next Match
  const unplayedMatches = schedule.filter(f => !f.played);
  const nextMatch = unplayedMatches.length > 0 ? unplayedMatches[0] : null;
  const isHome = nextMatch ? nextMatch.homeTeamId === teamId : true;
  
  const oppId = nextMatch ? (isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId) : "titans";
  const oppTeam = teamsData.find(t => t.id === oppId);
  const opponentName = oppTeam ? oppTeam.name : "TITANS FC";
  const tournamentName = nextMatch ? tournaments[nextMatch.tournamentId]?.name || "Friendly" : "Friendly";

  // Strength calc
  const getPlayerStrength = () => {
    const validXI = startingXI.filter(p => p.status !== 'red_card' && p.status !== 'injured');
    if (validXI.length === 0) return 10;
    const avg = validXI.reduce((acc, p) => acc + p.rating, 0) / validXI.length;
    return avg; 
  };
  
  const playerStrength = getPlayerStrength();
  const opponentStrength = oppTeam?.rating || 82;
  
  const homeStrength = isHome ? playerStrength : opponentStrength;
  const awayStrength = !isHome ? playerStrength : opponentStrength;

  const getRandomPlayer = (positionTypes: string[]) => {
    const valid = startingXI.filter(p => positionTypes.some(pos => p.position.includes(pos)) && p.status !== 'red_card' && p.status !== 'injured');
    if (valid.length === 0) return startingXI[0];
    return valid[Math.floor(Math.random() * valid.length)];
  };

  useEffect(() => {
    let interval: number;
    if (isPlaying && matchTime < 90) {
      interval = window.setInterval(() => {
        setMatchTime((prev) => {
          const newTime = prev + 1;
          
          const totalStrength = homeStrength + awayStrength;
          const homeAdvantage = homeStrength / totalStrength; // ~0.5

          // Update possession slightly towards the stronger team
          setStats(s => {
             const basePossession = homeAdvantage * 100;
             const fluctuation = (Math.random() * 10) - 5;
             const homePossession = Math.max(20, Math.min(80, Math.round(basePossession + fluctuation)));
             return {
               ...s,
               home: { ...s.home, possession: homePossession },
               away: { ...s.away, possession: 100 - homePossession },
             };
          });

          // Event generation
          const eventChance = 0.08; // 8% chance of something happening every minute
          if (Math.random() < eventChance) {
            const isHomeAttacking = Math.random() < homeAdvantage;
            const attacker = isHomeAttacking ? getRandomPlayer(['ST', 'FW', 'RW', 'LW', 'CAM', 'CM', 'RM', 'LM']) : null;
            const defender = !isHomeAttacking ? getRandomPlayer(['CB', 'LB', 'RB', 'CDM']) : null;

            const chanceType = Math.random();
            if (chanceType < 0.25) {
              // Goal
              setScore(s => ({ home: s.home + (isHomeAttacking ? 1 : 0), away: s.away + (!isHomeAttacking ? 1 : 0) }));
              setStats(s => ({
                ...s,
                home: { ...s.home, shots: s.home.shots + (isHomeAttacking ? 1 : 0) },
                away: { ...s.away, shots: s.away.shots + (!isHomeAttacking ? 1 : 0) }
              }));
              
              const scorerName = isHomeAttacking && attacker ? attacker.name : "Titans Player";
              setGoalScorers(g => [...g, { time: newTime, name: scorerName, isHome: isHomeAttacking }]);
              
              setEvents(e => [
                { time: newTime, text: `${t('goal', language)}! ${scorerName}`, type: "goal" },
                ...e
              ]);
            } else if (chanceType < 0.5) {
              // Save / Miss
              setStats(s => ({
                ...s,
                home: { ...s.home, shots: s.home.shots + (isHomeAttacking ? 1 : 0) },
                away: { ...s.away, shots: s.away.shots + (!isHomeAttacking ? 1 : 0) }
              }));
              const shooterName = isHomeAttacking && attacker ? attacker.name : "Titans Player";
              setEvents(e => [
                { time: newTime, text: Math.random() < 0.5 ? `${t('save_event', language)} ${shooterName}` : `${t('missed_chance', language)} ${shooterName}`, type: "info" },
                ...e
              ]);
            } else if (chanceType < 0.8) {
              // Foul & Card
              const foulByHome = !isHomeAttacking;
              setStats(s => ({
                ...s,
                home: { ...s.home, fouls: s.home.fouls + (foulByHome ? 1 : 0) },
                away: { ...s.away, fouls: s.away.fouls + (!foulByHome ? 1 : 0) }
              }));
              
              if (Math.random() < 0.3) {
                 const isRed = Math.random() < 0.1;
                 const offender = foulByHome && defender ? defender.name : "Titans Player";
                 if (isRed) {
                    setStats(s => ({
                      ...s,
                      home: { ...s.home, reds: s.home.reds + (foulByHome ? 1 : 0) },
                      away: { ...s.away, reds: s.away.reds + (!foulByHome ? 1 : 0) }
                    }));
                    setEvents(e => [
                      { time: newTime, text: `${t('red_card_event', language)} ${offender}`, type: "card" },
                      ...e
                    ]);
                    if (foulByHome && defender) updatePlayerStatus(defender.id, "red_card");
                 } else {
                    setStats(s => ({
                      ...s,
                      home: { ...s.home, yellows: s.home.yellows + (foulByHome ? 1 : 0) },
                      away: { ...s.away, yellows: s.away.yellows + (!foulByHome ? 1 : 0) }
                    }));
                    setEvents(e => [
                      { time: newTime, text: `${t('yellow_card_event', language)} ${offender}`, type: "card" },
                      ...e
                    ]);
                 }
              }
            } else {
              // Injury
              if (Math.random() < 0.1) {
                 const injuredTeamHome = Math.random() < 0.5;
                 const injuredPlayer = injuredTeamHome ? getRandomPlayer(['ST', 'CM', 'CB', 'RB', 'LB', 'GK']) : null;
                 const pName = injuredTeamHome && injuredPlayer ? injuredPlayer.name : "Titans Player";
                 setEvents(e => [
                    { time: newTime, text: `${t('injury_event', language)} ${pName}`, type: "injury" },
                    ...e
                 ]);
                 if (injuredTeamHome && injuredPlayer) updatePlayerStatus(injuredPlayer.id, "injured");
              }
            }
          }

          if (newTime >= 90) {
            setIsPlaying(false);
            setMatchFinished(true);
          }
          return newTime;
        });
      }, 100); // 100ms real time = 1 minute game time (faster simulation)
    }
    return () => clearInterval(interval);
  }, [isPlaying, matchTime, language, t, homeStrength, awayStrength, startingXI, updatePlayerStatus, isHome, opponentName]);

  const handleFinishMatch = () => {
    const playerScore = isHome ? score.home : score.away;
    const oppScore = isHome ? score.away : score.home;
    
    let result: 'win' | 'draw' | 'loss' = 'draw';
    if (playerScore > oppScore) result = 'win';
    if (playerScore < oppScore) result = 'loss';
    
    finishMatch(result, score.home, score.away);
    navigate('/dashboard');
  };

  return (
    <main className="mt-20 pb-20 px-4 max-w-[1200px] mx-auto flex flex-col xl:flex-row gap-4">
      {/* Left Column: Match & Events */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Match Header */}
        <section className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="bg-primary-container px-3 py-2 border-b-2 border-on-background flex justify-between items-center">
            <h2 className="text-[12px] font-bold tracking-[1px] text-on-primary-container flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">sports_soccer</span> {tournamentName} - {t('matchday', language)}
            </h2>
            <span className="text-[12px] font-bold tracking-[1px] text-primary-fixed">{matchTime}'</span>
          </div>

          <div className="p-6 relative bg-surface-container-lowest">
             {/* Pitch bg */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
               <div className="flex justify-between items-center w-full">
                  {/* Home */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] p-2">
                      {isHome ? <span className="material-symbols-outlined text-4xl text-primary">shield</span> : (oppTeam?.badgeUrl ? <img src={oppTeam.badgeUrl} alt="Opponent" className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-4xl text-error">swords</span>)}
                    </div>
                    <span className="text-[12px] font-bold tracking-[1px] text-center uppercase">{isHome ? teamName : opponentName}</span>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 bg-background border-2 border-on-background px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                      <span className="text-[32px] font-bold text-primary">{score.home}</span>
                      <span className="text-[20px] font-bold text-on-surface-variant">-</span>
                      <span className="text-[32px] font-bold text-error">{score.away}</span>
                    </div>
                    <span className={`mt-2 text-[10px] font-bold tracking-[1px] px-2 py-1 border-2 border-on-background ${isPlaying ? "bg-secondary-container text-on-secondary-container animate-pulse" : "bg-surface-variant text-on-surface-variant"}`}>
                      {matchTime === 0 ? t('not_started', language) : matchTime >= 90 ? t('full_time', language) : t('live', language)}
                    </span>
                  </div>

                  {/* Away */}
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="w-16 h-16 bg-surface-variant border-2 border-on-background flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] p-2">
                      {!isHome ? <span className="material-symbols-outlined text-4xl text-primary">shield</span> : (oppTeam?.badgeUrl ? <img src={oppTeam.badgeUrl} alt="Opponent" className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-4xl text-error">swords</span>)}
                    </div>
                    <span className="text-[12px] font-bold tracking-[1px] text-center uppercase">{!isHome ? teamName : opponentName}</span>
                  </div>
               </div>

               {/* Goal Scorers list under score */}
               <div className="mt-6 flex w-full justify-between px-4 text-[10px] font-bold text-on-surface-variant tracking-[1px]">
                  <div className="flex flex-col items-start w-1/2">
                    {goalScorers.filter(g => g.isHome).map((g, i) => (
                      <span key={i} className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px] text-primary">sports_soccer</span> {g.name} {g.time}'</span>
                    ))}
                  </div>
                  <div className="flex flex-col items-end w-1/2">
                     {goalScorers.filter(g => !g.isHome).map((g, i) => (
                      <span key={i} className="flex items-center gap-1">{g.time}' {g.name} <span className="material-symbols-outlined text-[10px] text-error">sports_soccer</span></span>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-surface-container-high p-2 flex gap-2 border-t-2 border-on-background">
            {!isPlaying && !matchFinished && (
              <button onClick={() => setIsPlaying(true)} className="flex-1 bg-primary-container text-on-primary-container py-2 text-[12px] font-bold tracking-[1px] border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">play_arrow</span> {matchTime === 0 ? t('kick_off', language) : t('resume', language)}
              </button>
            )}
            {isPlaying && (
              <button onClick={() => setIsPlaying(false)} className="flex-1 bg-error-container text-on-error-container py-2 text-[12px] font-bold tracking-[1px] border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">pause</span> {t('pause', language)}
              </button>
            )}
            {matchFinished && (
              <button onClick={handleFinishMatch} className="flex-1 bg-secondary-container text-on-secondary-container py-2 text-[12px] font-bold tracking-[1px] border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 text-center">
                {t('finish_match', language)}
              </button>
            )}
          </div>
        </section>

        {/* Match Events */}
        <section className="flex flex-col gap-1 flex-1">
          <h3 className="bg-surface-variant text-on-surface-variant px-2 py-1 text-[10px] font-bold tracking-[1px] border-2 border-on-background inline-block self-start">
            {t('match_log', language)}
          </h3>
          <div className="bg-surface-container border-2 border-on-background p-2 h-[200px] xl:h-full overflow-y-auto flex flex-col gap-2 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            {events.length === 0 ? (
              <div className="text-center text-on-surface-variant text-[12px] font-bold tracking-[1px] mt-4 opacity-50">
                {t('awaiting_kickoff', language)}
              </div>
            ) : (
              events.map((ev, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 border-2 border-on-background ${ev.type === "goal" ? "bg-primary-container/20 border-primary" : ev.type === "card" ? "bg-error-container/20 border-error" : ev.type === "injury" ? "bg-error-container/50 border-error" : "bg-surface-container-high border-on-background/20"}`}>
                  <span className={`text-[12px] font-bold ${ev.type === "goal" ? "text-primary" : ev.type === "card" || ev.type === "injury" ? "text-error" : "text-on-surface-variant"}`}>
                    {ev.time}'
                  </span>
                  <span className={`text-[12px] font-bold tracking-[1px] ${ev.type === "goal" ? "text-primary-fixed" : "text-on-surface"}`}>
                    {ev.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Match Stats */}
      <aside className="w-full xl:w-80 flex flex-col gap-1 shrink-0">
         <h3 className="bg-surface-variant text-on-surface-variant px-2 py-1 text-[10px] font-bold tracking-[1px] border-2 border-on-background inline-block self-start">
            {t('match_stats', language)}
         </h3>
         <div className="bg-surface-container border-2 border-on-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col gap-4">
            
            {/* Possession */}
            <div className="flex flex-col gap-1">
               <div className="flex justify-between text-[10px] font-bold tracking-[1px] text-on-surface">
                  <span>{stats.home.possession}%</span>
                  <span className="text-on-surface-variant">{t('possession', language)}</span>
                  <span>{stats.away.possession}%</span>
               </div>
               <div className="flex h-3 border-2 border-on-background w-full">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${stats.home.possession}%` }}></div>
                  <div className="bg-error h-full transition-all duration-300" style={{ width: `${stats.away.possession}%` }}></div>
               </div>
            </div>

            {/* Shots */}
            <div className="flex justify-between items-center border-b-2 border-on-background/20 pb-2">
               <span className="text-[16px] font-bold text-primary">{stats.home.shots}</span>
               <span className="text-[10px] font-bold tracking-[1px] text-on-surface-variant">{t('shots', language)}</span>
               <span className="text-[16px] font-bold text-error">{stats.away.shots}</span>
            </div>

            {/* Fouls */}
            <div className="flex justify-between items-center border-b-2 border-on-background/20 pb-2">
               <span className="text-[16px] font-bold text-primary">{stats.home.fouls}</span>
               <span className="text-[10px] font-bold tracking-[1px] text-on-surface-variant">{t('fouls', language)}</span>
               <span className="text-[16px] font-bold text-error">{stats.away.fouls}</span>
            </div>

            {/* Yellow Cards */}
            <div className="flex justify-between items-center border-b-2 border-on-background/20 pb-2">
               <span className="text-[16px] font-bold text-primary">{stats.home.yellows}</span>
               <span className="text-[10px] font-bold tracking-[1px] text-on-surface-variant">{t('yellow_cards', language)}</span>
               <span className="text-[16px] font-bold text-error">{stats.away.yellows}</span>
            </div>

             {/* Red Cards */}
             <div className="flex justify-between items-center">
               <span className="text-[16px] font-bold text-primary">{stats.home.reds}</span>
               <span className="text-[10px] font-bold tracking-[1px] text-on-surface-variant">{t('red_cards', language)}</span>
               <span className="text-[16px] font-bold text-error">{stats.away.reds}</span>
            </div>

         </div>
      </aside>

    </main>
  );
}
