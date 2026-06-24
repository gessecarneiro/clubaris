import teamsData from "../data/teams.json";
import { generateRoundRobinSchedule, initializeLeagueTable, generateKnockoutStage } from "./TournamentEngine";
import type { Fixture, LeagueTableEntry } from "./TournamentEngine";

export type TournamentInfo = {
  id: string;
  name: string;
  type: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_AND_KNOCKOUT';
  table: LeagueTableEntry[];
  fixtures: Fixture[];
  currentRound: number;
};

export type SeasonData = {
  tournaments: Record<string, TournamentInfo>;
  playerSchedule: Fixture[];
};

export function startNewSeason(playerTeamId: string, seasonYear: number): SeasonData {
  const tournaments: Record<string, TournamentInfo> = {};
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
    type: 'LEAGUE',
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
    type: 'LEAGUE',
    table: initializeLeagueTable(serieBTeams),
    fixtures: serieBFixtures,
    currentRound: 1
  };

  // 3. Estadual (Generic 8-team tournament for the player if they are Brazilian)
  if (isBrazilian) {
    const allBR = [...serieATeams, ...serieBTeams].filter(id => id !== playerTeamId);
    const shuffled = allBR.sort(() => 0.5 - Math.random());
    const estadualTeams = [playerTeamId, ...shuffled.slice(0, 7)];
    const estadualStart = new Date(`${seasonYear}-01-20T12:00:00Z`);
    const estadualFixtures = generateRoundRobinSchedule(estadualTeams, estadualStart, 7, "estadual").filter(f => f.round <= 7);
    
    tournaments["estadual"] = {
      id: "estadual",
      name: "Campeonato Estadual",
      type: 'LEAGUE',
      table: initializeLeagueTable(estadualTeams),
      fixtures: estadualFixtures,
      currentRound: 1
    };
  } else if (playerTeam) {
    const leagueTeams = teamsData.filter(t => t.leagueId === playerTeam.leagueId).map(t => t.id);
    if (leagueTeams.length > 0) {
      const leagueStart = new Date(`${seasonYear}-08-15T12:00:00Z`);
      const leagueFixtures = generateRoundRobinSchedule(leagueTeams, leagueStart, 7, playerTeam.leagueId);
      tournaments[playerTeam.leagueId] = {
        id: playerTeam.leagueId,
        name: "National League",
        type: 'LEAGUE',
        table: initializeLeagueTable(leagueTeams),
        fixtures: leagueFixtures,
        currentRound: 1
      };
    }
  }

  // 4. Copa Nacional (Knockout - 32 teams)
  if (isBrazilian) {
    const allBR = [...serieATeams, ...serieBTeams];
    let copaTeams = allBR.sort(() => 0.5 - Math.random()).slice(0, 32);
    if (!copaTeams.includes(playerTeamId)) {
       copaTeams[31] = playerTeamId; // Ensure player is in
    }
    const copaStart = new Date(`${seasonYear}-03-01T12:00:00Z`);
    // Create Round of 32 (Dezesseis Avos)
    const copaFixtures = generateKnockoutStage(copaTeams, copaStart, "16 Avos", "copa_nacional", 1, true);
    
    tournaments["copa_nacional"] = {
      id: "copa_nacional",
      name: "Copa Nacional",
      type: 'KNOCKOUT',
      table: [], // No table for knockout
      fixtures: copaFixtures,
      currentRound: 1
    };
  }

  // 5. Competições Continentais
  if (isBrazilian) {
    // Libertadores (Knockout for now - 16 teams)
    // Only Brazilian teams for now since there are no other South American leagues in the DB yet
    const libTeams = [...serieATeams.slice(0, 16)];
    if (!libTeams.includes(playerTeamId)) {
      libTeams[15] = playerTeamId; 
    }
    const libStart = new Date(`${seasonYear}-02-15T12:00:00Z`);
    const libFixtures = generateKnockoutStage(libTeams, libStart, "Oitavas", "libertadores", 1, true);
    
    tournaments["libertadores"] = {
      id: "libertadores",
      name: "Copa Libertadores",
      type: 'KNOCKOUT',
      table: [],
      fixtures: libFixtures,
      currentRound: 1
    };
  } else if (playerTeam) {
    // Champions League (Knockout - 16 teams)
    // Mix of European teams
    const europeanLeagues = ["england", "spain", "italy"];
    let championsTeams = teamsData
      .filter(t => europeanLeagues.includes(t.leagueId))
      .map(t => t.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 16);
      
    if (!championsTeams.includes(playerTeamId)) {
      championsTeams[15] = playerTeamId; 
    }
    const champStart = new Date(`${seasonYear}-09-15T12:00:00Z`);
    const champFixtures = generateKnockoutStage(championsTeams, champStart, "Oitavas", "champions_league", 1, true);
    
    tournaments["champions_league"] = {
      id: "champions_league",
      name: "Liga dos Campeões",
      type: 'KNOCKOUT',
      table: [],
      fixtures: champFixtures,
      currentRound: 1
    };
  }

  // Compile Player Schedule
  Object.values(tournaments).forEach(t => {
    const playerFix = t.fixtures.filter((f: Fixture) => f.homeTeamId === playerTeamId || f.awayTeamId === playerTeamId);
    playerSchedule.push(...playerFix);
  });

  // Sort schedule by date
  playerSchedule.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { tournaments, playerSchedule };
}
