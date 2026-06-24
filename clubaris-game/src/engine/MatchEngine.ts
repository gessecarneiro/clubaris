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
  ratings: Record<string, number>; // playerId -> match rating (0-10)
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTeamOVR(squad: Player[], tactic: Tactic | null) {
  if (squad.length === 0) return 50;
  
  let total = 0;
  let penalty = 0;
  
  // Base rating
  squad.slice(0, 11).forEach(p => {
    total += p.rating;
    
    // Quick improvisation penalty if we know the formation (very simple approximation)
    // Real implementation would compare specific roles.
    const isAttacker = p.position === 'ST' || p.position === 'LW' || p.position === 'RW';
    const isDefender = p.position === 'CB' || p.position === 'LB' || p.position === 'RB';
    
    // Penalize if an attacker is in a defensive formation slot (if we assume array index 0-4 are def)
    // We skip exact mapping here to keep the engine fast, but we apply a small penalty if energy is low
    if (p.energy && p.energy < 70) penalty += 2;
    if (p.morale && p.morale < 50) penalty += 1;
  });
  
  let ovr = (total / Math.min(11, squad.length)) - penalty;
  
  if (tactic) {
    if (tactic.captainId) {
      const cap = squad.find(p => p.id === tactic.captainId);
      if (cap && cap.morale && cap.morale > 80) ovr += 1; // Good captain bonus
    }
  }

  return Math.max(1, ovr);
}

function simulateTeamStats(squad: Player[], tactic: Tactic | null, isHome: boolean, opponentOvr: number): { attack: number, defense: number, aggression: number } {
  let ovr = getTeamOVR(squad, tactic);
  if (isHome) ovr += 3; // Home advantage

  let attack = ovr;
  let defense = ovr;
  let aggression = 50; // Base chance for cards/injuries

  if (tactic) {
    // Mentality
    switch (tactic.mentality) {
      case 'muito_ofensiva': attack += 5; defense -= 5; break;
      case 'ofensiva': attack += 3; defense -= 3; break;
      case 'defensiva': attack -= 3; defense += 3; break;
      case 'muito_defensiva': attack -= 5; defense += 5; break;
    }

    // Playstyle (Rock Paper Scissors effect could be added here later)
    switch (tactic.playstyle) {
      case 'posse': defense += 1; attack += 1; break; // Balanced
      case 'contra_ataque': defense += 2; attack += 1; break;
      case 'pressao': attack += 2; aggression += 10; break;
    }

    // Intensity
    switch (tactic.intensity) {
      case 'alta': attack += 2; defense += 2; aggression += 20; break;
      case 'baixa': attack -= 2; defense -= 2; aggression -= 20; break;
    }
  }

  return { attack, defense, aggression };
}

export function simulateDetailedMatch(
  homeSquad: Player[], homeTactic: Tactic | null,
  awaySquad: Player[], awayTactic: Tactic | null
): MatchResult {
  const events: MatchEvent[] = [];
  const ratings: Record<string, number> = {};

  const homeOvr = getTeamOVR(homeSquad, homeTactic);
  const awayOvr = getTeamOVR(awaySquad, awayTactic);

  const homeStats = simulateTeamStats(homeSquad, homeTactic, true, awayOvr);
  const awayStats = simulateTeamStats(awaySquad, awayTactic, false, homeOvr);

  let homeScore = 0;
  let awayScore = 0;

  // Initialize ratings (base 6.0)
  [...homeSquad.slice(0, 11), ...awaySquad.slice(0, 11)].forEach(p => {
    ratings[p.id] = 6.0 + (getRandomInt(-5, 5) / 10); // 5.5 to 6.5
  });

  // Minute by minute simulation
  for (let minute = 1; minute <= 90; minute++) {
    
    // --- HOME CHANCE ---
    // Chance to score is based on home attack vs away defense
    const homeGoalChance = Math.max(1, (homeStats.attack - awayStats.defense + 20)) / 1000;
    if (Math.random() < homeGoalChance) {
      homeScore++;
      // Determine scorer
      const isPenalty = Math.random() < 0.1;
      let scorer: Player | undefined = undefined;
      
      if (isPenalty && homeTactic?.penaltyTakerId) {
        scorer = homeSquad.find(p => p.id === homeTactic.penaltyTakerId);
      }
      
      if (!scorer) {
        // Bias towards attackers
        const attackers = homeSquad.slice(0, 11).filter(p => ['ST', 'LW', 'RW', 'CF', 'CAM'].includes(p.position));
        const pool = attackers.length > 0 && Math.random() < 0.7 ? attackers : homeSquad.slice(0, 11);
        scorer = pool[getRandomInt(0, pool.length - 1)];
      }

      // Assist
      let assist: Player | undefined = undefined;
      if (!isPenalty && Math.random() < 0.6) {
        const mids = homeSquad.slice(0, 11).filter(p => ['CM', 'LM', 'RM', 'CAM', 'CDM'].includes(p.position) && p.id !== scorer.id);
        const pool = mids.length > 0 ? mids : homeSquad.slice(0, 11).filter(p => p.id !== scorer.id);
        if (pool.length > 0) assist = pool[getRandomInt(0, pool.length - 1)];
      }

      if (scorer) {
        events.push({ minute, type: 'goal', team: 'home', player: scorer, assist });
        ratings[scorer.id] += 1.0;
        if (assist) ratings[assist.id] += 0.5;
      }
    } else if (Math.random() < homeGoalChance * 2) {
      const types = ['miss', 'save', 'woodwork'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      const attackers = homeSquad.slice(0, 11).filter(p => ['ST', 'LW', 'RW', 'CF', 'CAM'].includes(p.position));
      const pool = attackers.length > 0 && Math.random() < 0.7 ? attackers : homeSquad.slice(0, 11);
      const shooter = pool[getRandomInt(0, pool.length - 1)];
      if (shooter) {
        events.push({ minute, type, team: 'home', player: shooter });
      }
    }

    // --- AWAY CHANCE ---
    const awayGoalChance = Math.max(1, (awayStats.attack - homeStats.defense + 20)) / 1000;
    if (Math.random() < awayGoalChance) {
      awayScore++;
      const isPenalty = Math.random() < 0.1;
      let scorer: Player | undefined = undefined;
      
      if (isPenalty && awayTactic?.penaltyTakerId) {
        scorer = awaySquad.find(p => p.id === awayTactic.penaltyTakerId);
      }
      
      if (!scorer) {
        const attackers = awaySquad.slice(0, 11).filter(p => ['ST', 'LW', 'RW', 'CF', 'CAM'].includes(p.position));
        const pool = attackers.length > 0 && Math.random() < 0.7 ? attackers : awaySquad.slice(0, 11);
        scorer = pool[getRandomInt(0, pool.length - 1)];
      }

      let assist: Player | undefined = undefined;
      if (!isPenalty && Math.random() < 0.6) {
        const mids = awaySquad.slice(0, 11).filter(p => ['CM', 'LM', 'RM', 'CAM', 'CDM'].includes(p.position) && p.id !== scorer.id);
        const pool = mids.length > 0 ? mids : awaySquad.slice(0, 11).filter(p => p.id !== scorer.id);
        if (pool.length > 0) assist = pool[getRandomInt(0, pool.length - 1)];
      }

      if (scorer) {
        events.push({ minute, type: 'goal', team: 'away', player: undefined as any, assist });
        ratings[scorer.id] += 1.0;
        if (assist) ratings[assist.id] += 0.5;
      }
    } else if (Math.random() < awayGoalChance * 2) {
      const types = ['miss', 'save', 'woodwork'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      const attackers = awaySquad.slice(0, 11).filter(p => ['ST', 'LW', 'RW', 'CF', 'CAM'].includes(p.position));
      const pool = attackers.length > 0 && Math.random() < 0.7 ? attackers : awaySquad.slice(0, 11);
      const shooter = pool[getRandomInt(0, pool.length - 1)];
      if (shooter) {
        events.push({ minute, type, team: 'away', player: shooter });
      }
    }

    // --- CARDS AND INJURIES (Home) ---
    const homeAggressionChance = (homeStats.aggression / 10000);
    if (Math.random() < homeAggressionChance) {
      const isRed = Math.random() < 0.05;
      const isInjury = Math.random() < 0.1;
      const victim = homeSquad.slice(0, 11)[getRandomInt(0, Math.min(10, homeSquad.length - 1))];
      
      if (isInjury) {
        events.push({ minute, type: 'injury', team: 'home', player: victim });
        ratings[victim.id] -= 0.5;
      } else {
        events.push({ minute, type: isRed ? 'red_card' : 'yellow_card', team: 'home', player: victim });
        ratings[victim.id] -= isRed ? 2.0 : 0.5;
      }
    }

    // --- CARDS AND INJURIES (Away) ---
    const awayAggressionChance = (awayStats.aggression / 10000);
    if (Math.random() < awayAggressionChance) {
      const isRed = Math.random() < 0.05;
      const isInjury = Math.random() < 0.1;
      const victim = awaySquad.slice(0, 11)[getRandomInt(0, Math.min(10, awaySquad.length - 1))];
      
      if (isInjury) {
        events.push({ minute, type: 'injury', team: 'away', player: victim });
        ratings[victim.id] -= 0.5;
      } else {
        events.push({ minute, type: isRed ? 'red_card' : 'yellow_card', team: 'away', player: victim });
        ratings[victim.id] -= isRed ? 2.0 : 0.5;
      }
    }
  }

  // Finalize ratings bounds
  Object.keys(ratings).forEach(id => {
    if (ratings[id] > 10.0) ratings[id] = 10.0;
    if (ratings[id] < 3.0) ratings[id] = 3.0;
    // Round to 1 decimal
    ratings[id] = Math.round(ratings[id] * 10) / 10;
  });

  return {
    homeScore,
    awayScore,
    events,
    ratings
  };
}
