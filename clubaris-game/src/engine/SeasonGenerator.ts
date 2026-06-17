import teamsData from "../data/teams.json";
import { generateRoundRobinSchedule, initializeLeagueTable, Fixture, LeagueTableEntry } from "./TournamentEngine";

export type SeasonData = {
  tournaments: Record<string, { id: string, name: string, table: LeagueTableEntry[], fixtures: Fixture[], currentRound: number }>;
  playerSchedule: Fixture[];
};

export function startNewSeason(playerTeamId: string, seasonYear: number): SeasonData {
  const tournaments: Record<string, any> = {};
  let playerSchedule: Fixture[] = [];

  const playerTeam = teamsData.find(t => t.id === playerTeamId);
  const isBrazilian = playerTeam?.leagueId === "brazil_a" || playerTeam?.leagueId === "brazil_b";

  // 1. Brasileirão Série A (20 teams)
  const serieATeams = teamsData.filter(t => t.leagueId === "brazil_a").map(t => t.id);
  const serieAStart = new Date(`${seasonYear}-04-15T12:00:00Z`);
  const serieAFixtures = generateRoundRobinSchedule(serieATeams, serieAStart, 7, "brazil_a");
  tournaments["brazil_a"] = {
    id: "brazil_a",
    name: "Brasileirão Série A",
    table: initializeLeagueTable(serieATeams),
    fixtures: serieAFixtures,
    currentRound: 1
  };

  // 2. Brasileirão Série B (20 teams)
  const serieBTeams = teamsData.filter(t => t.leagueId === "brazil_b").map(t => t.id);
  const serieBStart = new Date(`${seasonYear}-04-16T12:00:00Z`);
  const serieBFixtures = generateRoundRobinSchedule(serieBTeams, serieBStart, 7, "brazil_b");
  tournaments["brazil_b"] = {
    id: "brazil_b",
    name: "Brasileirão Série B",
    table: initializeLeagueTable(serieBTeams),
    fixtures: serieBFixtures,
    currentRound: 1
  };

  // 3. Estadual (Generic 8-team tournament for the player if they are Brazilian)
  // For simplicity, we create a generic "Campeonato Estadual" for the player's team and 7 random Brazilian teams.
  if (isBrazilian) {
    const allBR = [...serieATeams, ...serieBTeams].filter(id => id !== playerTeamId);
    // Shuffle and pick 7
    const shuffled = allBR.sort(() => 0.5 - Math.random());
    const estadualTeams = [playerTeamId, ...shuffled.slice(0, 7)];
    const estadualStart = new Date(`${seasonYear}-01-20T12:00:00Z`);
    // Round robin just 1 leg (7 rounds)
    const estadualFixtures = generateRoundRobinSchedule(estadualTeams, estadualStart, 7, "estadual").filter(f => f.round <= 7);
    
    tournaments["estadual"] = {
      id: "estadual",
      name: "Campeonato Estadual",
      table: initializeLeagueTable(estadualTeams),
      fixtures: estadualFixtures,
      currentRound: 1
    };
  } else if (playerTeam) {
    // If European, generate their league (e.g. La Liga, Premier League)
    const leagueTeams = teamsData.filter(t => t.leagueId === playerTeam.leagueId).map(t => t.id);
    if (leagueTeams.length > 0) {
      const leagueStart = new Date(`${seasonYear}-08-15T12:00:00Z`);
      const leagueFixtures = generateRoundRobinSchedule(leagueTeams, leagueStart, 7, playerTeam.leagueId);
      tournaments[playerTeam.leagueId] = {
        id: playerTeam.leagueId,
        name: "National League",
        table: initializeLeagueTable(leagueTeams),
        fixtures: leagueFixtures,
        currentRound: 1
      };
    }
  }

  // 4. Libertadores (Simplified as a 16 team Round-Robin or Knockout, let's do a 16 team League for now for simplicity, or 8 teams)
  // Let's pick top 8 Serie A teams and 8 European teams to simulate a "World/Continental Cup"
  const libTeams = [
    ...serieATeams.slice(0, 8),
    ...teamsData.filter(t => t.leagueId !== "brazil_a" && t.leagueId !== "brazil_b").map(t => t.id).slice(0, 8)
  ];
  if (!libTeams.includes(playerTeamId)) {
    libTeams[15] = playerTeamId; // Ensure player is in it for fun
  }
  const libStart = new Date(`${seasonYear}-02-15T12:00:00Z`);
  // 15 rounds
  const libFixtures = generateRoundRobinSchedule(libTeams, libStart, 14, "libertadores").filter(f => f.round <= 15);
  tournaments["libertadores"] = {
    id: "libertadores",
    name: "Copa Libertadores",
    table: initializeLeagueTable(libTeams),
    fixtures: libFixtures,
    currentRound: 1
  };

  // Compile Player Schedule
  Object.values(tournaments).forEach(t => {
    const playerFix = t.fixtures.filter((f: Fixture) => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId);
    playerSchedule.push(...playerFix);
  });

  // Sort schedule by date
  playerSchedule.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { tournaments, playerSchedule };
}
