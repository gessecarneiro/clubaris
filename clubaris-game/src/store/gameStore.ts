import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SeasonData } from "../engine/SeasonGenerator";
import { startNewSeason } from "../engine/SeasonGenerator";
import { simulatePlayerTraining } from "../engine/TrainingEngine";
import { simulateAIMatch, updateLeagueTable, resolveKnockoutPhase } from "../engine/TournamentEngine";
import { simulateCPU } from '../engine/CPUEngine';
import teamsData from "../data/teams.json";

export type Language = "pt" | "en" | "es";
export type Theme = "light" | "dark";

export interface NewsEvent {
  id: string;
  date: string;
  title: string;
  content: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Infrastructure {
  stadiumLevel: number;
  trainingLevel: number;
  medicalLevel: number;
}

export interface Message {
  id: string;
  sender: string;
  subject: string;
  body: string;
  read: boolean;
  date: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  rating: number;
  form?: string;
  status?: string;
  energy?: number; // added energy/morale for Brasfoot feel
  morale?: number;
  photoUrl?: string;
  isStarter?: boolean;
  isBench?: boolean;

  // New Contract/Loan properties
  age?: number;
  contract_salary?: number;
  contract_years?: number;
  // Empréstimos
  loaned_from_club_id?: string | null;
  loan_end_date?: string | null;
  loan_salary_percentage?: number;

  // Estatísticas In-game (simulação)
  matches_played?: number;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  injury_days?: number; // >0 means injured
  suspension_games?: number; // >0 means suspended

  // Training & Evolution
  attr_finishing?: number;
  attr_passing?: number;
  attr_crossing?: number;
  attr_marking?: number;
  attr_tackling?: number;
  attr_pace?: number;
  attr_stamina?: number;
  attr_reflexes?: number;
  attr_positioning?: number;
  potential?: number;
}

export interface Tactic {
  formation: string; // "4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "5-3-2"
  mentality: "muito_defensiva" | "defensiva" | "equilibrada" | "ofensiva" | "muito_ofensiva";
  playstyle: "posse" | "contra_ataque" | "direto" | "pressao";
  intensity: "baixa" | "media" | "alta";
  captainId?: string;
  penaltyTakerId?: string;
  freeKickTakerId?: string;
  cornerTakerId?: string;
}

interface GameState {
  user: any | null;
  saveId: string | null;
  managerName: string;
  managerStyle: "retranqueiro" | "pressao" | "desenvolvimento" | "posse" | "";
  managerAvatar: string;
  teamName: string; // for display
  playerTeamId: string;
  balance: number;
  infrastructure: Infrastructure;
  news: NewsEvent[];
  squad: Player[];
  startingXI: Player[];
  bench: Player[];
  tactic: Tactic;
  trainingFocus: "ataque" | "defesa" | "fisico" | "goleiro" | "equilibrado";
  language: Language;
  theme: Theme;
  inbox: Message[];

  // Confidence
  boardConfidence: number; // 0 to 100
  fanConfidence: number; // 0 to 100

  // Season Data
  currentDate: Date;
  seasonData: SeasonData | null;

  // Missing properties from old implementation to make other components happy
  hasSeenTutorial: boolean;
  isTourRunning: boolean;
  trophies: any[];
  badgeUrl: string;
  teamColor1: string;
  teamColor2: string;
  playerSquad: any[];
  unlockedAchievements: string[];

  // Actions
  setUser: (user: any | null) => void;
  unlockAchievement: (id: string) => void;
  setTempManager: (name: string, style: any, avatar: string) => void;
  setSetup: (saveId: string, teamId: string, teamName: string, squad: Player[], seasonYear: number) => void;
  loadSave: (saveData: any, squadData: Player[]) => void;
  updateStartingXI: (newXI: Player[]) => void;
  updateBench: (newBench: Player[]) => void;
  updateTactic: (newTactic: Partial<Tactic>) => void;
  swapPlayers: (id1: string, id2: string) => void;
  autoPick: () => void;
  setLanguage: (lang: Language) => void;
  advanceDate: (days: number) => void;
  setSeasonData: (data: SeasonData) => void;
  simulateRound: (playerHomeScore: number, playerAwayScore: number, aiScores?: Record<string, {homeScore: number, awayScore: number}>) => void;
  startTour: () => void;
  stopTour: () => void;
  buyPlayer: (player: Player, cost: number) => Promise<boolean>;
  clearSave: () => void;
  setTrainingFocus: (focus: "ataque" | "defesa" | "fisico" | "goleiro" | "equilibrado") => void;
  setTheme: (theme: Theme) => void;
  addMessage: (msg: Omit<Message, 'id' | 'date'>) => void;
  markMessageRead: (id: string) => void;
  generateNews: (type: 'info' | 'warning' | 'success' | 'danger', title: string, content: string) => void;
  upgradeInfrastructure: (type: 'stadiumLevel' | 'trainingLevel' | 'medicalLevel') => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
  user: null as any | null,
  saveId: null as string | null,
  managerName: "",
  managerStyle: "",
  managerAvatar: "👨‍💼",
  teamName: "",
  playerTeamId: "",
  balance: 0,
  boardConfidence: 80,
  infrastructure: { stadiumLevel: 1, trainingLevel: 1, medicalLevel: 1 },
  news: [],
  squad: [] as Player[],
  startingXI: [] as Player[],
  bench: [] as Player[],
  tactic: {
    formation: "4-4-2",
    mentality: "equilibrada",
    playstyle: "posse",
    intensity: "media"
  },
  trainingFocus: "equilibrado",
  language: "pt", // Default to Portuguese
  theme: "light",
  inbox: [] as Message[],
  currentDate: new Date("2026-01-01T12:00:00Z"),
  seasonData: null,
  hasSeenTutorial: true,
  isTourRunning: false,
  trophies: [],
  badgeUrl: "",
  teamColor1: "#ffffff",
  teamColor2: "#000000",
  playerSquad: [],
  unlockedAchievements: [],
  fanConfidence: 80,

  setUser: (user) => set({ user }),

  unlockAchievement: (id) => set((state) => {
    if (state.unlockedAchievements.includes(id)) return state;
    // We can dispatch a custom event to trigger the Xbox toast and sound
    setTimeout(() => window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: id })), 100);
    return { unlockedAchievements: [...state.unlockedAchievements, id] };
  }),

  setTempManager: (name, style, avatar) => set({ 
    managerName: name, 
    managerStyle: style, 
    managerAvatar: avatar 
  }),

  generateNews: (type, title, content) => {
    set((state) => {
      const newEvent: NewsEvent = {
        id: Date.now().toString(),
        date: state.currentDate.toISOString(),
        title,
        content,
        isRead: false,
        type: type === 'danger' ? 'error' : type
      };
      return { news: [newEvent, ...state.news] };
    });
  },

  upgradeInfrastructure: (type) => {
    set((state) => {
      const currentLevel = state.infrastructure[type];
      if (currentLevel >= 5) return state; // Max level 5
      
      const cost = currentLevel * 5000000; // 5M, 10M, 15M, 20M
      if (state.balance < cost) return state;

      const newInfra = { ...state.infrastructure, [type]: currentLevel + 1 };
      
      // Persist in DB asynchronously
      if (state.saveId) {
        import('../lib/supabase').then(({ supabase }) => {
          let updateObj: any = { balance: state.balance - cost };
          if (type === 'stadiumLevel') updateObj.stadium_level = currentLevel + 1;
          if (type === 'trainingLevel') updateObj.training_level = currentLevel + 1;
          if (type === 'medicalLevel') updateObj.medical_level = currentLevel + 1;
          
          supabase.from('saves').update(updateObj).eq('id', state.saveId).then(({ error }) => {
             if (error) console.error("Error upgrading infra:", error);
          });
        });
      }

      return {
        balance: state.balance - cost,
        infrastructure: newInfra
      };
    });
  },

  setSetup: (saveId, teamId, teamName, squad, seasonYear) => {
    // Generate season
      const seasonData = startNewSeason(teamId, seasonYear);
      
      // Auto-pick best 11 based on positions
      import('../utils/tactics').then(({ autoPickPositional }) => {
        const { startingXI, bench } = autoPickPositional(squad, "4-4-2");
        
      import('../utils/relevance').then(({ getTeamRelevance }) => {
        const state = useGameStore.getState();
        const managerName = state.managerName;

        const userClub = teamsData.find(t => t.id === teamId);
        const relevance = userClub ? getTeamRelevance(userClub.rating) : 'Regional';
        
        let welcomeBody = `Olá ${managerName}, bem-vindo ao ${teamName}! Esperamos grandes conquistas nesta temporada.`;
        if (relevance === 'Internacional') welcomeBody = `Olá ${managerName}, bem-vindo ao ${teamName}! Como um clube de nível Internacional, nossa prioridade absoluta é VENCER TODOS OS TÍTULOS. Não aceitaremos menos que troféus de expressão.`;
        else if (relevance === 'Continental') welcomeBody = `Olá ${managerName}, bem-vindo ao ${teamName}! Nossa diretoria espera que você lute ativamente por títulos e garanta vagas nas grandes competições.`;
        else if (relevance === 'Nacional') welcomeBody = `Olá ${managerName}, bem-vindo ao ${teamName}! Nosso objetivo é fazer uma campanha sólida, nos consolidar na elite e quem sabe beliscar uma vaga continental.`;
        else welcomeBody = `Olá ${managerName}, bem-vindo ao ${teamName}! Como um time em ascensão, nosso foco principal é conseguir o acesso e estruturar as finanças do clube. O orçamento é curto, faça milagres.`;

        const teamColor1 = userClub?.color1 || "#ffffff";
        const teamColor2 = userClub?.color2 || "#000000";
        
        // Configurar a tática baseada no estilo do treinador
        let newTactic = { ...state.tactic };
        if (state.managerStyle === 'retranqueiro') {
          newTactic = { ...newTactic, formation: "5-3-2", mentality: "defensiva", playstyle: "contra_ataque" };
        } else if (state.managerStyle === 'pressao') {
          newTactic = { ...newTactic, formation: "4-3-3", mentality: "ofensiva", playstyle: "pressao", intensity: "alta" };
        } else if (state.managerStyle === 'desenvolvimento') {
          newTactic = { ...newTactic, formation: "4-2-3-1", mentality: "equilibrada", playstyle: "posse" };
        } else if (state.managerStyle === 'posse') {
          newTactic = { ...newTactic, formation: "4-3-3", mentality: "ofensiva", playstyle: "posse", intensity: "media" };
        }

        set({ 
          saveId,
          playerTeamId: teamId, 
          teamName, 
          squad, 
          startingXI,
          bench,
          tactic: newTactic,
          seasonData,
          currentDate: new Date(`${seasonYear}-01-01T12:00:00Z`),
          balance: 50000000, // default budget
          boardConfidence: 50,
          infrastructure: { stadiumLevel: 1, trainingLevel: 1, medicalLevel: 1 },
          news: [{
            id: Date.now().toString(),
            date: new Date(`${seasonYear}-01-01T12:00:00Z`).toISOString(),
            title: "Bem-vindo ao Clube!",
            content: welcomeBody,
            isRead: false,
            type: 'info'
          }],
          teamColor1,
          teamColor2,
          inbox: [
            {
              id: `msg_${Date.now()}`,
              sender: "Diretoria",
              subject: "Expectativas da Temporada",
              body: welcomeBody,
              read: false,
              date: new Date(`${seasonYear}-01-01T12:00:00Z`).toISOString()
            }
          ],
          hasSeenTutorial: false,
          isTourRunning: false
        });
      });
      });
    },

  loadSave: (saveData, squadData) => {
    const userClub = teamsData.find(t => t.id === saveData.player_team_id);
    const teamColor1 = userClub?.color1 || "#ffffff";
    const teamColor2 = userClub?.color2 || "#000000";

    set({
       saveId: saveData.id,
       managerName: saveData.manager_name,
       managerStyle: saveData.manager_style || "",
       managerAvatar: saveData.manager_avatar || "👨‍💼",
       teamName: saveData.team_name,
       playerTeamId: saveData.player_team_id,
       balance: saveData.balance,
       boardConfidence: saveData.board_confidence ?? 50,
       infrastructure: {
         stadiumLevel: saveData.stadium_level ?? 1,
         trainingLevel: saveData.training_level ?? 1,
         medicalLevel: saveData.medical_level ?? 1,
       },
       news: saveData.news_events ? (typeof saveData.news_events === 'string' ? JSON.parse(saveData.news_events) : saveData.news_events) : [],
       unlockedAchievements: saveData.achievements ? (typeof saveData.achievements === 'string' ? JSON.parse(saveData.achievements) : saveData.achievements) : [],
       currentDate: new Date(saveData.game_date),
       fanConfidence: saveData.fan_confidence,
       squad: squadData,
       startingXI: [],
       bench: [],
       teamColor1,
       teamColor2
    });

    // After setting squad, run autoPick if startingXI is empty
    useGameStore.getState().autoPick();
  },

  updateStartingXI: (newXI) => set({ startingXI: newXI }),
  updateBench: (newBench) => set({ bench: newBench }),
  
  updateTactic: (newTactic) => set((state) => ({ 
    tactic: { ...state.tactic, ...newTactic } 
  })),

  swapPlayers: (id1, id2) => set((state) => {
    const newStartingXI = [...state.startingXI];
    const newBench = [...state.bench];
    const newSquad = [...state.squad];
    
    const p1 = newSquad.find(p => p.id === id1);
    const p2 = newSquad.find(p => p.id === id2);
    
    if (!p1 || !p2) return state;

    const idx1XI = newStartingXI.findIndex(p => p.id === id1);
    const idx2XI = newStartingXI.findIndex(p => p.id === id2);
    
    const idx1B = newBench.findIndex(p => p.id === id1);
    const idx2B = newBench.findIndex(p => p.id === id2);

    // Both in startingXI
    if (idx1XI !== -1 && idx2XI !== -1) {
      newStartingXI[idx1XI] = p2;
      newStartingXI[idx2XI] = p1;
    } 
    // Both in Bench
    else if (idx1B !== -1 && idx2B !== -1) {
      newBench[idx1B] = p2;
      newBench[idx2B] = p1;
    }
    // One in XI, One in Bench
    else if (idx1XI !== -1 && idx2B !== -1) {
      newStartingXI[idx1XI] = p2;
      newBench[idx2B] = p1;
    }
    else if (idx1B !== -1 && idx2XI !== -1) {
      newBench[idx1B] = p2;
      newStartingXI[idx2XI] = p1;
    }
    // One in XI, One in Unrelated
    else if (idx1XI !== -1) {
      newStartingXI[idx1XI] = p2;
    }
    else if (idx2XI !== -1) {
      newStartingXI[idx2XI] = p1;
    }
    // One in Bench, One in Unrelated
    else if (idx1B !== -1) {
      newBench[idx1B] = p2;
    }
    else if (idx2B !== -1) {
      newBench[idx2B] = p1;
    }

    return { startingXI: newStartingXI, bench: newBench };
  }),

  autoPick: () => {
    const state = useGameStore.getState();
    import('../utils/tactics').then(({ autoPickPositional }) => {
      const { startingXI, bench } = autoPickPositional(state.squad, state.tactic.formation);
      set({ startingXI, bench });
    });
  },

  setLanguage: (language) => set({ language }),

  advanceDate: (days) => set((state) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + days);
    return { currentDate: newDate };
  }),

  startTour: () => set({ isTourRunning: true, hasSeenTutorial: true }),
  stopTour: () => set({ isTourRunning: false }),

  setSeasonData: (data) => set({ seasonData: data }),

  simulateRound: async (playerHomeScore, playerAwayScore, aiScores) => {
    const state = useGameStore.getState();
    if (!state.seasonData || !state.saveId) return;

    const newSeasonData = { ...state.seasonData };
    const unplayedMatches = newSeasonData.playerSchedule.filter(f => !f.played);
    if (unplayedMatches.length === 0) return;

    const nextMatch = unplayedMatches[0];
    const tournamentId = nextMatch.tournamentId;
    const currentRound = nextMatch.round;

    // Simulate all matches in this tournament for this round
    const tournament = newSeasonData.tournaments[tournamentId];
    if (tournament) {
      tournament.fixtures.forEach(fixture => {
        if (fixture.round === currentRound && !fixture.played) {
           if (fixture.id === nextMatch.id) {
             fixture.played = true;
             fixture.homeScore = playerHomeScore;
             fixture.awayScore = playerAwayScore;
             
             // Also update the schedule reference
             nextMatch.played = true;
             nextMatch.homeScore = playerHomeScore;
             nextMatch.awayScore = playerAwayScore;
           } else {
             // Use pre-simulated scores if provided
             if (aiScores && aiScores[fixture.id]) {
               fixture.played = true;
               fixture.homeScore = aiScores[fixture.id].homeScore;
               fixture.awayScore = aiScores[fixture.id].awayScore;
             } else {
               // AI vs AI using real ratings
               const homeTeam = teamsData.find(t => t.id === fixture.homeTeamId);
               const awayTeam = teamsData.find(t => t.id === fixture.awayTeamId);
               const homeRating = homeTeam ? homeTeam.rating : 75;
               const awayRating = awayTeam ? awayTeam.rating : 75;
               
               const { homeScore, awayScore } = simulateAIMatch(homeRating, awayRating);
               fixture.played = true;
               fixture.homeScore = homeScore;
               fixture.awayScore = awayScore;
             }
           }
           
           // Update table
           if (tournament.type === 'LEAGUE') {
             tournament.table = updateLeagueTable(
               tournament.table, 
               fixture.homeTeamId, 
               fixture.awayTeamId, 
               fixture.homeScore!, 
               fixture.awayScore!
             );
           }
        }
      });

      // Resolve knockout phase if applicable
      if (tournament.type === 'KNOCKOUT') {
         const nextFixtures = resolveKnockoutPhase(tournament.fixtures, currentRound, tournament.id);
         if (nextFixtures) {
            tournament.fixtures.push(...nextFixtures);
            const playerFix = nextFixtures.filter((f: any) => f.homeTeamId === state.playerTeamId || f.awayTeamId === state.playerTeamId);
            newSeasonData.playerSchedule.push(...playerFix);
            newSeasonData.playerSchedule.sort((a, b) => a.date.getTime() - b.date.getTime());
         }
      }

      tournament.currentRound += 1;
    }

    // Advance date to next match or by max 7 days
    const nextUnplayed = newSeasonData.playerSchedule.find(f => !f.played);
    let newDate = new Date(state.currentDate);
    
    if (nextUnplayed) {
      const matchDate = new Date(nextUnplayed.date);
      const daysUntilMatch = (matchDate.getTime() - newDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysUntilMatch > 7) {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate = matchDate;
      }
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }

    // Check for intelligent messages for next match
    if (nextUnplayed && nextUnplayed.isKnockout && !nextUnplayed.played) {
       const isBigMatch = nextUnplayed.knockoutPhase === 'Final' || nextUnplayed.knockoutPhase === 'Semifinal';
       if (isBigMatch) {
          // Check if message was already sent for this phase
          const msgSubject = `Véspera de ${nextUnplayed.knockoutPhase}`;
          const alreadySent = state.inbox.some(m => m.subject === msgSubject && m.date.startsWith(newDate.toISOString().split('T')[0]));
          if (!alreadySent) {
             useGameStore.getState().addMessage({
                sender: "Auxiliar Técnico",
                subject: msgSubject,
                body: `Chefe, nosso próximo jogo é pela ${nextUnplayed.knockoutPhase}. Precisamos escalar força máxima e manter a moral alta. O time inteiro confia na sua tática!`,
                read: false
             });
          }
       }
    }

    // Check if tournament was won just now (Final played and won)
    if (nextMatch.isKnockout && nextMatch.knockoutPhase === 'Final' && nextMatch.played) {
       let isChampion = false;
       if (nextMatch.homeTeamId === state.playerTeamId && playerHomeScore > playerAwayScore) isChampion = true;
       if (nextMatch.awayTeamId === state.playerTeamId && playerAwayScore > playerHomeScore) isChampion = true;
       // If penalties exist, we'd check them, but simplifying to score for now.
       
       if (isChampion) {
          useGameStore.getState().addMessage({
             sender: "Diretoria",
             subject: "É CAMPEÃO!",
             body: `Parabéns, ${state.managerName}! A conquista deste título entra para a história do ${state.teamName}. A diretoria e os torcedores estão em êxtase!`,
             read: false
          });
          // Add trophy
          const year = state.currentDate.getFullYear();
          useGameStore.setState(s => ({
            trophies: [...s.trophies, { name: tournament.name, year, imageUrl: `/trophies/${tournament.id}.png` }]
          }));
       }
    }

    // Check if LEAGUE was won (last round)
    if (tournament.type === 'LEAGUE' && nextMatch.played) {
      // Find max round in this tournament
      const maxRound = Math.max(...tournament.fixtures.map(f => f.round));
      if (tournament.currentRound - 1 === maxRound) {
        // Tournament just finished! Check who is first.
        // table is already sorted inside TournamentEngine usually, but let's be sure.
        const sortedTable = [...tournament.table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
        if (sortedTable.length > 0 && sortedTable[0].teamId === state.playerTeamId) {
          // Player won the league!
          useGameStore.getState().addMessage({
             sender: "Diretoria",
             subject: "CAMPEÕES DA LIGA!",
             body: `Parabéns, ${state.managerName}! Somos os campeões da ${tournament.name}! Uma campanha irretocável que ficará para sempre na nossa memória.`,
             read: false
          });
          const year = state.currentDate.getFullYear();
          useGameStore.setState(s => ({
            trophies: [...s.trophies, { name: tournament.name, year, imageUrl: `/trophies/${tournament.id}.png` }]
          }));
        }
      }
    }

    // Reduce player energy after match and apply training
    const newSquad = state.squad.map(p => {
       const energyReduced = {
         ...p,
         energy: Math.max(50, (p.energy || 100) - (Math.floor(Math.random() * 15) + 10)) // lose 10-25 energy
       };
       return simulatePlayerTraining(energyReduced, state.trainingFocus);
    });

    // Update confidence based on result
    let confidenceDelta = 0;
    if (playerHomeScore > playerAwayScore) {
       confidenceDelta = 5; // Win
    } else if (playerHomeScore === playerAwayScore) {
       confidenceDelta = 0; // Draw
    } else {
       confidenceDelta = -5; // Loss
    }

    const newBoardConfidence = Math.max(0, Math.min(100, state.boardConfidence + confidenceDelta));
    const newFanConfidence = Math.max(0, Math.min(100, state.fanConfidence + confidenceDelta + (playerHomeScore > playerAwayScore ? 2 : -2)));

    // Sync to Cloud
    import('../lib/supabaseServices').then(({ syncMatchToCloud }) => {
      syncMatchToCloud(state.saveId!, {
        board_confidence: newBoardConfidence,
        fan_confidence: newFanConfidence,
        game_date: newDate.toISOString()
      }, newSquad).catch(err => console.error("Error syncing match", err));
    });

    // CPU Actions (Transfers, Firings)
    simulateCPU();

    set({ 
      seasonData: newSeasonData, 
      currentDate: newDate,
      squad: newSquad,
      boardConfidence: newBoardConfidence,
      fanConfidence: newFanConfidence
    });
  },

  buyPlayer: async (player: Player, cost: number) => {
    let success = false;
    const state = useGameStore.getState();
    
    if (state.balance >= cost && state.saveId && state.playerTeamId) {
      success = true;
      const existingNumbers = state.squad.map(p => p.number);
      let newNumber = player.number;
      while(existingNumbers.includes(newNumber) && newNumber < 99) {
        newNumber++;
      }
      const newPlayer = { ...player, number: newNumber };
      
      set({
        balance: state.balance - cost,
        squad: [...state.squad, newPlayer]
      });
    }
    return success;
  },

  clearSave: () => {
    set({
      saveId: null,
      managerName: "",
      managerStyle: "",
      managerAvatar: "👨‍💼",
      teamName: "",
      playerTeamId: "",
      balance: 0,
      boardConfidence: 50,
      infrastructure: { stadiumLevel: 1, trainingLevel: 1, medicalLevel: 1 },
      news: [],
      squad: [],
      startingXI: [],
      bench: [],
      currentDate: new Date("2026-01-01T12:00:00Z"),
      fanConfidence: 80,
      inbox: [],
      seasonData: null
    });
    localStorage.removeItem('clubaris-storage');
  },

  setTrainingFocus: (focus) => set({ trainingFocus: focus }),

  setTheme: (theme: Theme) => set({ theme }),

  addMessage: (msg: Omit<Message, 'id' | 'date'>) => set((state) => ({
    inbox: [{ ...msg, id: Date.now().toString(), read: false, date: state.currentDate.toISOString() }, ...state.inbox]
  })),

  markMessageRead: (id: string) => set((state) => ({
    inbox: state.inbox.map(m => m.id === id ? { ...m, read: true } : m)
  }))
    }),
    {
      name: 'clubaris-storage',
      // We can customize what is persisted if needed, but default is all state
    }
  )
);
