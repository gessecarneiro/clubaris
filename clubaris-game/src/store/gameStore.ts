import { create } from "zustand";

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
  teamName: string;
  balance: number;
  morale: number;
  fitness: number;
  squad: Player[];
  startingXI: Player[];
  language: Language;

  // Actions
  setSetup: (managerName: string, teamName: string) => void;
  updateStartingXI: (newXI: Player[]) => void;
  autoPick: () => void;
  setLanguage: (lang: Language) => void;
}

const defaultSquad: Player[] = [
  { id: "1", name: "MARTINEZ", position: "GK", number: 1, rating: 85 },
  { id: "2", name: "WALKER", position: "RB", number: 2, rating: 83 },
  { id: "3", name: "SHAW", position: "LB", number: 3, rating: 81 },
  { id: "4", name: "STONES", position: "CB", number: 5, rating: 84 },
  { id: "5", name: "MAGUIRE", position: "CB", number: 6, rating: 80 },
  { id: "6", name: "RICE", position: "CM", number: 4, rating: 86 },
  { id: "7", name: "BELLINGHAM", position: "CM", number: 8, rating: 89 },
  { id: "8", name: "SAKA", position: "RM", number: 7, rating: 87 },
  { id: "9", name: "GREALISH", position: "LM", number: 11, rating: 84 },
  { id: "10", name: "KANE", position: "ST", number: 9, rating: 91 },
  { id: "11", name: "FODEN", position: "ST", number: 10, rating: 86 },
];

export const useGameStore = create<GameState>((set) => ({
  managerName: "",
  teamName: "",
  balance: 50000000,
  morale: 85,
  fitness: 72,
  squad: defaultSquad,
  startingXI: defaultSquad,
  language: "pt", // Default to Portuguese

  setSetup: (managerName, teamName) => set({ managerName, teamName }),

  updateStartingXI: (newXI) => set({ startingXI: newXI }),

  autoPick: () =>
    set((state) => ({
      startingXI: [...state.squad]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 11),
    })),

  setLanguage: (language) => set({ language }),
}));
