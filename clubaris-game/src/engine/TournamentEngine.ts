// TournamentEngine.ts

export type Fixture = {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  date: Date;
  tournamentId: string;
  isKnockout?: boolean;
  knockoutPhase?: string; // e.g. "Oitavas de Final", "Quartas de Final", "Semifinal", "Final"
  isSecondLeg?: boolean;
  firstLegHomeId?: string;
  firstLegAwayId?: string;
  firstLegHomeScore?: number;
  firstLegAwayScore?: number;
  penaltiesHomeScore?: number;
  penaltiesAwayScore?: number;
};

export type LeagueTableEntry = {
  teamId: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

// Generates a double round-robin schedule
export function generateRoundRobinSchedule(
  teamIds: string[],
  startDate: Date,
  daysBetweenRounds: number,
  tournamentId: string
): Fixture[] {
  const fixtures: Fixture[] = [];
  if (teamIds.length % 2 !== 0) {
    teamIds.push("BYE");
  }

  const numTeams = teamIds.length;
  const numRounds = numTeams - 1;
  const halfSize = numTeams / 2;

  const teams = [...teamIds];

  let currentDate = new Date(startDate);

  // First half of the season
  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < halfSize; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];

      if (home !== "BYE" && away !== "BYE") {
        // Swap home/away based on round to balance
        const isEvenRound = round % 2 === 0;
        fixtures.push({
          id: `f_${tournamentId}_${round}_${home}_${away}`,
          round: round + 1,
          homeTeamId: isEvenRound ? home : away,
          awayTeamId: isEvenRound ? away : home,
          played: false,
          date: new Date(currentDate),
          tournamentId,
        });
      }
    }
    // Rotate array
    teams.splice(1, 0, teams.pop() as string);
    currentDate.setDate(currentDate.getDate() + daysBetweenRounds);
  }

  // Second half of the season (reverse fixtures)
  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < halfSize; i++) {
      const home = teams[i];
      const away = teams[numTeams - 1 - i];

      if (home !== "BYE" && away !== "BYE") {
        const isEvenRound = round % 2 === 0;
        fixtures.push({
          id: `f_${tournamentId}_${round + numRounds}_${home}_${away}`,
          round: round + 1 + numRounds,
          homeTeamId: isEvenRound ? away : home, // Flipped
          awayTeamId: isEvenRound ? home : away,
          played: false,
          date: new Date(currentDate),
          tournamentId,
        });
      }
    }
    teams.splice(1, 0, teams.pop() as string);
    currentDate.setDate(currentDate.getDate() + daysBetweenRounds);
  }

  return fixtures;
}

// Generates a knockout stage
export function generateKnockoutStage(
  teamIds: string[],
  startDate: Date,
  phaseName: string,
  tournamentId: string,
  roundNum: number,
  isTwoLegged: boolean = true
): Fixture[] {
  const fixtures: Fixture[] = [];
  const teams = [...teamIds].sort(() => Math.random() - 0.5); // Random draw

  let currentDate = new Date(startDate);
  
  // Create matchups
  for (let i = 0; i < teams.length; i += 2) {
    const teamA = teams[i];
    const teamB = teams[i + 1];

    if (!teamB) break; // Odd number of teams shouldn't happen in knockout

    // First leg
    fixtures.push({
      id: `f_${tournamentId}_${phaseName}_leg1_${teamA}_${teamB}`,
      round: roundNum,
      homeTeamId: teamA,
      awayTeamId: teamB,
      played: false,
      date: new Date(currentDate),
      tournamentId,
      isKnockout: true,
      knockoutPhase: phaseName,
      isSecondLeg: false
    });

    if (isTwoLegged) {
      // Second leg
      const secondLegDate = new Date(currentDate);
      secondLegDate.setDate(secondLegDate.getDate() + 7);
      
      fixtures.push({
        id: `f_${tournamentId}_${phaseName}_leg2_${teamB}_${teamA}`,
        round: roundNum + 1,
        homeTeamId: teamB,
        awayTeamId: teamA,
        played: false,
        date: new Date(secondLegDate),
        tournamentId,
        isKnockout: true,
        knockoutPhase: phaseName,
        isSecondLeg: true,
        firstLegHomeId: teamA,
        firstLegAwayId: teamB
      });
    }
  }

  return fixtures;
}

// Simulates a single match between two AI teams based on rating difference
export function simulateAIMatch(homeRating: number, awayRating: number): { homeScore: number, awayScore: number } {
  // Home advantage (+4 rating effectively)
  const adjustedHome = homeRating + 4;
  
  // Base probability (e.g. if 84 vs 80, homeProb = 84/164 = 0.51)
  // We amplify the difference so a 5 point rating gap means a lot
  const diff = adjustedHome - awayRating;
  const homeProb = 0.5 + (diff * 0.02); // 5 points diff = +10% chance
  
  let homeScore = 0;
  let awayScore = 0;

  // Simulate 6 attacks per team. The better team converts more.
  for(let i=0; i<6; i++) {
    if (Math.random() < homeProb * 0.35) homeScore++;
    if (Math.random() < (1 - homeProb) * 0.35) awayScore++;
  }

  return { homeScore, awayScore };
}

// Initializes an empty league table
export function initializeLeagueTable(teamIds: string[]): LeagueTableEntry[] {
  return teamIds.map(id => ({
    teamId: id,
    points: 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0
  }));
}

// Updates the league table with a match result
export function updateLeagueTable(table: LeagueTableEntry[], homeId: string, awayId: string, homeScore: number, awayScore: number): LeagueTableEntry[] {
  const newTable = [...table];
  
  const homeEntry = newTable.find(t => t.teamId === homeId);
  const awayEntry = newTable.find(t => t.teamId === awayId);

  if (homeEntry && awayEntry) {
    homeEntry.played += 1;
    awayEntry.played += 1;
    
    homeEntry.goalsFor += homeScore;
    homeEntry.goalsAgainst += awayScore;
    homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;

    awayEntry.goalsFor += awayScore;
    awayEntry.goalsAgainst += homeScore;
    awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;

    if (homeScore > awayScore) {
      homeEntry.wins += 1;
      homeEntry.points += 3;
      awayEntry.losses += 1;
    } else if (homeScore < awayScore) {
      awayEntry.wins += 1;
      awayEntry.points += 3;
      homeEntry.losses += 1;
    } else {
      homeEntry.draws += 1;
      homeEntry.points += 1;
      awayEntry.draws += 1;
      awayEntry.points += 1;
    }
  }

  // Sort by points, then GD, then GF
  return newTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

// Resolves a completed knockout phase and generates the next one if applicable
export function resolveKnockoutPhase(
  fixtures: Fixture[],
  currentRound: number,
  tournamentId: string
): Fixture[] | null {
  // Find all fixtures of the current round
  const currentFixtures = fixtures.filter(f => f.round === currentRound);
  if (currentFixtures.length === 0 || currentFixtures.some(f => !f.played)) {
    return null; // Phase not complete
  }

  // Check if we are at the end of a two-legged tie or a single leg
  const sample = currentFixtures[0];
  if (!sample.isKnockout) return null;

  // We only advance if this round concludes a phase (i.e., it's a second leg, or a single-leg tournament)
  // For our setup, isTwoLegged = true means round 1 is leg 1, round 2 is leg 2.
  if (sample.isSecondLeg === false) {
    // Check if there is a second leg scheduled in the fixtures for this phase
    const hasSecondLeg = fixtures.some(f => f.round === currentRound + 1 && f.isSecondLeg);
    if (hasSecondLeg) return null; // Wait for second leg
  }

  // Determine winners
  const winners: string[] = [];
  
  if (sample.isSecondLeg) {
    // Process two-legged ties
    for (const f2 of currentFixtures) {
      const f1 = fixtures.find(f => f.round === currentRound - 1 && f.homeTeamId === f2.awayTeamId && f.awayTeamId === f2.homeTeamId);
      if (!f1) continue;

      const teamA = f1.homeTeamId;
      const teamB = f1.awayTeamId;

      const scoreA = f1.homeScore! + f2.awayScore!;
      const scoreB = f1.awayScore! + f2.homeScore!;

      if (scoreA > scoreB) winners.push(teamA);
      else if (scoreB > scoreA) winners.push(teamB);
      else {
        // Tie! In a real game, away goals or penalties. We will use random penalty winner for simplicity here.
        winners.push(Math.random() > 0.5 ? teamA : teamB);
      }
    }
  } else {
    // Process single-leg ties
    for (const f of currentFixtures) {
      if (f.homeScore! > f.awayScore!) winners.push(f.homeTeamId);
      else if (f.awayScore! > f.homeScore!) winners.push(f.awayTeamId);
      else winners.push(Math.random() > 0.5 ? f.homeTeamId : f.awayTeamId);
    }
  }

  if (winners.length <= 1) {
    return null; // Tournament finished!
  }

  // Generate next phase
  let nextPhaseName = "Fase Seguinte";
  if (winners.length === 16) nextPhaseName = "16 Avos";
  if (winners.length === 8) nextPhaseName = "Oitavas";
  if (winners.length === 4) nextPhaseName = "Quartas";
  if (winners.length === 2) nextPhaseName = "Semifinal";
  if (winners.length === 1) nextPhaseName = "Final"; // wait, length=1 means winner.
  // Wait, if 8 winners, next phase is Oitavas? No, if 8 winners advance, they play Quartas!
  if (winners.length === 16) nextPhaseName = "Oitavas";
  else if (winners.length === 8) nextPhaseName = "Quartas";
  else if (winners.length === 4) nextPhaseName = "Semifinal";
  else if (winners.length === 2) nextPhaseName = "Final";

  // Final is single leg, others two-legged
  const isTwoLegged = winners.length > 2;
  const startDate = new Date(sample.date);
  startDate.setDate(startDate.getDate() + 14); // Next phase starts 2 weeks later

  return generateKnockoutStage(winners, startDate, nextPhaseName, tournamentId, currentRound + 1, isTwoLegged);
}

