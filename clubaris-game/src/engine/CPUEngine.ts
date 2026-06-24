import { useGameStore } from '../store/gameStore';
import teamsData from '../data/teams.json';

const REAL_MANAGERS = [
  "Pep Guardiola", "Carlo Ancelotti", "Jürgen Klopp", "Mikel Arteta", "Xabi Alonso",
  "Diego Simeone", "Thomas Tuchel", "Unai Emery", "Abel Ferreira", "Tite",
  "Jorge Sampaoli", "Fernando Diniz", "Dorival Júnior", "Renato Gaúcho", "Luis Enrique",
  "Simone Inzaghi", "Stefano Pioli", "Massimiliano Allegri", "José Mourinho", "Antonio Conte",
  "Zinedine Zidane", "Roberto De Zerbi", "Mauricio Pochettino", "Erik ten Hag", "Xavi",
  "Thiago Motta", "Ruben Amorim", "Roger Schmidt", "Sérgio Conceição", "Marcelo Gallardo",
  "Jorge Jesus", "Cuca", "Vojvoda", "Eduardo Coudet", "Rogério Ceni", "Mano Menezes",
  "Vanderlei Luxemburgo", "Felipão", "Ramón Díaz", "António Oliveira", "Thiago Carpini",
  "Artur Jorge", "Pedro Caixinha", "Zubeldía", "Gabriel Milito", "Léo Condé", "Jair Ventura"
];

// In a full DB setup, managers would be saved per team. Here we simulate the dynamic nature.
// We keep a transient state of CPU managers for the session to avoid DB spam.
const cpuManagers: Record<string, { name: string, confidence: number }> = {};

export function initializeCPUManagers() {
  const available = [...REAL_MANAGERS];
  // Sort teams by rating to give top managers to top teams
  const sortedTeams = [...teamsData].sort((a, b) => b.rating - a.rating);
  
  for (const team of sortedTeams) {
     if (useGameStore.getState().playerTeamId === (team as any).original_id) continue;
     
     let managerName = "Técnico Genérico";
     if (available.length > 0) {
       const idx = Math.floor(Math.random() * Math.min(10, available.length)); // Pick from top available
       managerName = available[idx];
       available.splice(idx, 1);
     } else {
       managerName = `Técnico ${team.name.split(' ')[0]}`;
     }

     cpuManagers[team.id] = {
       name: managerName,
       confidence: 50 + Math.floor(Math.random() * 30) // 50-80
     };
  }
}

export function simulateCPU() {
  const store = useGameStore.getState();
  
  if (Object.keys(cpuManagers).length === 0) {
    initializeCPUManagers();
  }

  // Pick 1-2 random teams to make a transfer
  const numTransfers = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < numTransfers; i++) {
     const buyer = teamsData[Math.floor(Math.random() * teamsData.length)];
     const seller = teamsData[Math.floor(Math.random() * teamsData.length)];
     
     if (buyer.id === seller.id) continue;
     if ((buyer as any).original_id === store.playerTeamId || (seller as any).original_id === store.playerTeamId) continue;

     if (seller.squad.length > 15) {
       // CPU buys a random player
       const player = seller.squad[Math.floor(Math.random() * seller.squad.length)];
       const marketValue = 2000000 + ((player.rating - 60) * 1000000);
       if (marketValue > 0) {
         store.generateNews('info', 'MERCADO DA BOLA', `O ${buyer.name} acertou a contratação de ${player.name} (${player.position}) junto ao ${seller.name} por um valor não revelado.`);
       }
     }
  }

  // Manager Firings
  // In a real game, this evaluates recent match results. Here we just randomly decay confidence and fire if < 20
  const teamKeys = Object.keys(cpuManagers);
  const unluckyTeams = [
    teamKeys[Math.floor(Math.random() * teamKeys.length)],
    teamKeys[Math.floor(Math.random() * teamKeys.length)]
  ];

  for (const tId of unluckyTeams) {
    if (cpuManagers[tId]) {
       cpuManagers[tId].confidence -= (Math.floor(Math.random() * 15) + 5);
       if (cpuManagers[tId].confidence < 20) {
          const team = teamsData.find(t => t.id === tId);
          if (team) {
             store.generateNews('danger', 'DEMISSÃO', `O técnico ${cpuManagers[tId].name} não resistiu aos maus resultados e foi demitido do comando do ${team.name}.`);
             // Hire a new generic one
             cpuManagers[tId] = {
               name: REAL_MANAGERS[Math.floor(Math.random() * REAL_MANAGERS.length)] || "Novo Técnico",
               confidence: 80
             };
          }
       }
    }
  }
}
