import { create } from "zustand";
import teamsData from "../data/teams.json";
import { simulateAIMatch, updateLeagueTable } from "../engine/TournamentEngine";
import type { Fixture, LeagueTableEntry } from "../engine/TournamentEngine";
import { startNewSeason } from "../engine/SeasonGenerator";

export type Language = "pt" | "en";

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  rating: number;
  form?: string;
  status?: string;
}

export interface TournamentState {
  id: string;
  name: string;
  table: LeagueTableEntry[];
  fixtures: Fixture[];
  currentRound: number;
}

interface GameState {
  managerName: string;
  teamId: string;
  teamName: string;
  badgeUrl: string;
  balance: number;
  morale: number;
  fitness: number;
  squad: Player[];
  startingXI: Player[];
  language: Language;
  hasSeenTutorial: boolean;
  isTourRunning: boolean;

  // Season System
  currentDate: Date;
  season: number;
  trophies: { year: number; name: string }[];
  schedule: Fixture[];
  tournaments: Record<string, TournamentState>;

  // Actions
  setSetup: (managerName: string, teamId: string) => void;
  updateStartingXI: (newXI: Player[]) => void;
  autoPick: () => void;
  setLanguage: (lang: Language) => void;
  finishMatch: (result: "win" | "draw" | "loss", homeScore?: number, awayScore?: number) => void;
  updatePlayerStatus: (id: string, status?: string) => void;
  completeTutorial: () => void;
  startTour: () => void;
  stopTour: () => void;
  advanceDay: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  managerName: "",
  teamId: "",
  teamName: "",
  badgeUrl: "",
  balance: 50000000,
  morale: 85,
  fitness: 100,
  squad: [],
  startingXI: [],
  language: "pt", // Default to Portuguese
  hasSeenTutorial: false,
  isTourRunning: false,
  currentDate: new Date("2026-01-01T12:00:00Z"),
  season: 2026,
  trophies: [],
  schedule: [],
  tournaments: {},

  completeTutorial: () => set({ hasSeenTutorial: true }),
  startTour: () => set({ isTourRunning: true, hasSeenTutorial: true }),
  stopTour: () => set({ isTourRunning: false }),

  setSetup: (managerName, teamId) => {
    const team = teamsData.find((t) => t.id === teamId);
    if (team) {
      const squad = team.squad;
      const seasonData = startNewSeason(teamId, 2026);
      
      set({
        managerName,
        teamId,
        teamName: team.name,
        badgeUrl: team.badgeUrl,
        squad: squad,
        startingXI: [...squad].sort((a, b) => b.rating - a.rating).slice(0, 11),
        balance: 50000000,
        morale: 100,
        fitness: 100,
        season: 2026,
        currentDate: new Date("2026-01-01T12:00:00Z"),
        tournaments: seasonData.tournaments,
        schedule: seasonData.playerSchedule,
      });
    }
  },

  updateStartingXI: (newXI) => set({ startingXI: newXI }),

  autoPick: () =>
    set((state) => ({
      startingXI: [...state.squad]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 11),
    })),

  setLanguage: (language) => set({ language }),

  finishMatch: (result, homeScore = 0, awayScore = 0) =>
    set((state) => {
      let moraleChange = 0;
      let balanceChange = 100000; // ticket sales

      if (result === "win") {
        moraleChange = 5;
        balanceChange += 500000; // win bonus
      } else if (result === "draw") {
        moraleChange = 0;
        balanceChange += 100000;
      } else {
        moraleChange = -5;
      }

      const newMorale = Math.max(0, Math.min(100, state.morale + moraleChange));
      const newFitness = Math.max(0, state.fitness - 15); // Players get tired

      // Update league table
      const unplayedMatches = state.schedule.filter(f => !f.played);
      const nextMatch = unplayedMatches.length > 0 ? unplayedMatches[0] : null;

      let newTournaments = { ...state.tournaments };
      let newSchedule = [...state.schedule];

      if (nextMatch) {
         const tId = nextMatch.tournamentId;
         const tournament = newTournaments[tId];
         
         const newTable = updateLeagueTable(tournament.table, nextMatch.homeTeamId, nextMatch.awayTeamId, homeScore, awayScore);
         
         const newFixtures = tournament.fixtures.map(f => {
            if (f.id === nextMatch.id) {
               return { ...f, played: true, homeScore, awayScore };
            }
            return f;
         });

         newTournaments[tId] = { ...tournament, table: newTable, fixtures: newFixtures };
         
         newSchedule = newSchedule.map(f => {
            if (f.id === nextMatch.id) {
               return { ...f, played: true, homeScore, awayScore };
            }
            return f;
         });
      }

      return {
        morale: newMorale,
        balance: state.balance + balanceChange,
        fitness: newFitness,
        tournaments: newTournaments,
        schedule: newSchedule
      };
    }),

  updatePlayerStatus: (id, status) =>
    set((state) => {
      const updateList = (list: Player[]) =>
        list.map((p) => (p.id === id ? { ...p, status } : p));
      return {
        squad: updateList(state.squad),
        startingXI: updateList(state.startingXI),
      };
    }),

  advanceDay: () => set((state) => {
    // We want to advance time day by day, and simulate any AI matches that happen on the new date.
    // Wait, let's just advance 1 day.
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + 1);

    // Find AI matches on this exact day
    const newTournaments = { ...state.tournaments };
    let tableChanged = false;

    Object.keys(newTournaments).forEach(tId => {
      const tournament = newTournaments[tId];
      const fixturesToday = tournament.fixtures.filter(f => 
        !f.played && 
        f.date.getFullYear() === newDate.getFullYear() && 
        f.date.getMonth() === newDate.getMonth() && 
        f.date.getDate() === newDate.getDate()
      );

      let newTable = [...tournament.table];
      let matchPlayed = false;

      fixturesToday.forEach(f => {
        // Only simulate if neither team is the player
        if (f.homeTeamId !== state.teamId && f.awayTeamId !== state.teamId) {
           const homeTeam = teamsData.find(t => t.id === f.homeTeamId);
           const awayTeam = teamsData.find(t => t.id === f.awayTeamId);
           const homeRating = homeTeam?.rating || 75;
           const awayRating = awayTeam?.rating || 75;

           const { homeScore, awayScore } = simulateAIMatch(homeRating, awayRating);
           
           f.homeScore = homeScore;
           f.awayScore = awayScore;
           f.played = true;

           newTable = updateLeagueTable(newTable, f.homeTeamId, f.awayTeamId, homeScore, awayScore);
           matchPlayed = true;
        }
      });

      if (matchPlayed) {
        newTournaments[tId] = { ...tournament, table: newTable };
        tableChanged = true;
      }
    });

    return {
      currentDate: newDate,
      tournaments: tableChanged ? newTournaments : state.tournaments,
    };
  }),

}));
