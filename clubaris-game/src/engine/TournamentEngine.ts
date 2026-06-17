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

// Simulates a single match between two AI teams based on rating difference
export function simulateAIMatch(homeRating: number, awayRating: number): { homeScore: number, awayScore: number } {
  // Home advantage
  const adjustedHome = homeRating + 3;
  const total = adjustedHome + awayRating;
  
  const homeProb = adjustedHome / total; // e.g. 0.55
  
  let homeScore = 0;
  let awayScore = 0;

  // Max 5 chances per team
  for(let i=0; i<5; i++) {
    if (Math.random() < homeProb * 0.4) homeScore++;
    if (Math.random() < (1 - homeProb) * 0.4) awayScore++;
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
