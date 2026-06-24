import type { Player, Tactic } from '../store/gameStore';

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'injury' | 'miss' | 'save' | 'woodwork';
  player: Player;
  assist?: Player;
  team: 'home' | 'away';
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  ratings: Record<string, number>;
}

function getSector(position: string) {
    if (position === 'GK') return 'GK';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'DEF';
    if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position)) return 'MID';
    if (['ST', 'CF', 'LW', 'RW', 'PE', 'PD'].includes(position)) return 'ATT';
    return 'MID'; 
}

function calculateTeamSectors(squad: Player[], tactic: Tactic | null) {
   let defTotal = 0, defCount = 0;
   let midTotal = 0, midCount = 0;
   let attTotal = 0, attCount = 0;
   let gkTotal = 50;

   const starters = squad.slice(0, 11);
   starters.forEach(p => {
       let rating = p.rating;
       if (p.energy && p.energy < 70) rating -= 2;
       if (p.morale && p.morale < 50) rating -= 1;

       const sector = getSector(p.position);
       if (sector === 'GK') gkTotal = rating;
       else if (sector === 'DEF') { defTotal += rating; defCount++; }
       else if (sector === 'MID') { midTotal += rating; midCount++; }
       else if (sector === 'ATT') { attTotal += rating; attCount++; }
   });

   let defOvr = defCount > 0 ? defTotal / defCount : 50;
   let midOvr = midCount > 0 ? midTotal / midCount : 50;
   let attOvr = attCount > 0 ? attTotal / attCount : 50;

   if (tactic) {
       if (tactic.formation.startsWith('5')) defOvr += 3;
       if (tactic.formation.startsWith('3')) defOvr -= 1;
       if (tactic.formation.startsWith('4-3-3')) attOvr += 2;
       if (tactic.formation === '4-5-1' || tactic.formation === '4-2-3-1') midOvr += 2;

       switch (tactic.mentality) {
          case 'muito_ofensiva': attOvr += 6; defOvr -= 5; break;
          case 'ofensiva': attOvr += 4; defOvr -= 3; break;
          case 'defensiva': attOvr -= 3; defOvr += 4; break;
          case 'muito_defensiva': attOvr -= 5; defOvr += 6; break;
       }

       switch (tactic.playstyle) {
          case 'posse': midOvr += 4; attOvr -= 1; break; 
          case 'contra_ataque': midOvr -= 3; attOvr += 3; defOvr += 2; break; 
          case 'pressao': midOvr += 3; attOvr += 2; defOvr -= 2; break; 
          case 'direto': midOvr -= 2; attOvr += 2; break; 
       }
   }

   return { defOvr, midOvr, attOvr, gkTotal, starters };
}

export function simulateDetailedMatch(
  homeSquad: Player[], homeTactic: Tactic | null,
  awaySquad: Player[], awayTactic: Tactic | null
): MatchResult {
  const events: MatchEvent[] = [];
  const ratings: Record<string, number> = {};

  [...homeSquad, ...awaySquad].forEach(p => ratings[p.id] = 6.0);

  if (homeSquad.length === 0 || awaySquad.length === 0) {
      return { homeScore: 0, awayScore: 0, events: [], ratings: {} };
  }

  const home = calculateTeamSectors(homeSquad, homeTactic);
  const away = calculateTeamSectors(awaySquad, awayTactic);
  
  home.midOvr += 2;
  home.attOvr += 1;
  home.defOvr += 1;

  let homeScore = 0;
  let awayScore = 0;

  const totalMid = home.midOvr + away.midOvr;
  const homeMidControl = totalMid > 0 ? (home.midOvr / totalMid) : 0.5;
  
  for (let minute = 1; minute <= 90; minute++) {
      const r = Math.random();
      const homeHasBall = r < homeMidControl;
      
      const attackingTeam = homeHasBall ? home : away;
      const defendingTeam = homeHasBall ? away : home;
      const attSide = homeHasBall ? 'home' : 'away';

      if (minute > 60) {
          attackingTeam.attOvr -= 0.1;
          defendingTeam.defOvr -= 0.1;
          attackingTeam.midOvr -= 0.1;
      }

      const defForce = Math.max(1, defendingTeam.defOvr);
      let chanceCreation = (attackingTeam.attOvr / defForce) * 0.11;
      
      if (Math.random() < chanceCreation) {
          let attackers = attackingTeam.starters.filter(p => getSector(p.position) === 'ATT');
          if (attackers.length === 0) attackers = attackingTeam.starters.filter(p => getSector(p.position) === 'MID');
          if (attackers.length === 0) attackers = attackingTeam.starters;
          
          if (attackers.length > 0) {
              const shooter = attackers[Math.floor(Math.random() * attackers.length)];
              
              let shotQuality = 0.40;
              if (defendingTeam.gkTotal > 0) {
                  shotQuality = (shooter.rating / defendingTeam.gkTotal) * 0.42;
              }
              
              if (Math.random() < shotQuality) {
                  if (attSide === 'home') homeScore++; else awayScore++;
                  
                  let mids = attackingTeam.starters.filter(p => getSector(p.position) === 'MID' && p.id !== shooter.id);
                  let assist = undefined;
                  if (mids.length > 0 && Math.random() < 0.7) {
                      assist = mids[Math.floor(Math.random() * mids.length)];
                      ratings[assist.id] += 0.5;
                  }
                  
                  ratings[shooter.id] += 1.0;
                  events.push({ minute, type: 'goal', player: shooter, assist, team: attSide });
              } else {
                  const isSave = Math.random() < 0.6;
                  const type = isSave ? 'save' : (Math.random() < 0.3 ? 'woodwork' : 'miss');
                  
                  events.push({ minute, type, player: shooter, team: attSide });
                  
                  if (isSave) {
                     const gk = defendingTeam.starters.find(p => getSector(p.position) === 'GK');
                     if (gk) ratings[gk.id] += 0.2;
                  }
              }
          }
      }

      if (Math.random() < 0.02) {
         const evType = Math.random();
         const teamSquad = Math.random() < 0.5 ? home.starters : away.starters;
         
         if (teamSquad.length > 0) {
             const player = teamSquad[Math.floor(Math.random() * teamSquad.length)];
             const teamStr = (teamSquad === home.starters) ? 'home' : 'away';

             if (evType < 0.5) {
                 events.push({ minute, type: 'yellow_card', player, team: teamStr });
                 ratings[player.id] -= 0.3;
             } else if (evType < 0.55) {
                 events.push({ minute, type: 'red_card', player, team: teamStr });
                 ratings[player.id] -= 1.0;
             } else if (evType < 0.70) {
                 events.push({ minute, type: 'injury', player, team: teamStr });
                 ratings[player.id] -= 0.5;
             }
         }
      }
  }

  Object.keys(ratings).forEach(k => {
     if (ratings[k] > 10.0) ratings[k] = 10.0;
     if (ratings[k] < 3.0) ratings[k] = 3.0;
  });

  return { homeScore, awayScore, events, ratings };
}
