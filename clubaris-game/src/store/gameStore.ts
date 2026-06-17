import { create } from "zustand";
import teamsData from "../data/teams.json";

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

  // Actions
  setSetup: (managerName: string, teamId: string) => void;
  updateStartingXI: (newXI: Player[]) => void;
  autoPick: () => void;
  setLanguage: (lang: Language) => void;
  finishMatch: (result: "win" | "draw" | "loss") => void;
  updatePlayerStatus: (id: string, status?: string) => void;
  completeTutorial: () => void;
  startTour: () => void;
  stopTour: () => void;
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

  completeTutorial: () => set({ hasSeenTutorial: true }),
  startTour: () => set({ isTourRunning: true, hasSeenTutorial: true }),
  stopTour: () => set({ isTourRunning: false }),

  setSetup: (managerName, teamId) => {
    const team = teamsData.find((t) => t.id === teamId);
    if (team) {
      const squad = team.squad;
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

  finishMatch: (result) =>
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

      return {
        morale: newMorale,
        balance: state.balance + balanceChange,
        fitness: newFitness,
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
}));
