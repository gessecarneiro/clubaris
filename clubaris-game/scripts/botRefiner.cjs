const fs = require('fs');
const path = require('path');

const teamsPath = path.join(__dirname, '../src/data/teams.json');
let teamsData = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));

// Base de conhecimento real de jogadores que vieram errados ou que são famosos
const realPlayerStats = {
  "Vini Jr": { position: "LW", rating: 89, isWorldClass: true },
  "Mbappé": { position: "ST", rating: 91, isWorldClass: true },
  "Haaland": { position: "ST", rating: 91, isWorldClass: true },
  "De Bruyne": { position: "CM", rating: 91, isWorldClass: true },
  "Felipe Alves": { position: "GK", rating: 74 },
  "Cássio": { position: "GK", rating: 78 },
  "Weverton": { position: "GK", rating: 81 },
  "Gómez": { position: "CB", rating: 82 },
  "Nino": { position: "CB", rating: 79 },
  "Arias": { position: "RW", rating: 80 },
  "Cano": { position: "ST", rating: 80 },
  "Marcelo": { position: "LB", rating: 78 },
  "Pedro": { position: "ST", rating: 81 },
  "Arrascaeta": { position: "CAM", rating: 82 },
  "Gabigol": { position: "ST", rating: 79 },
  "Everton Ribeiro": { position: "CAM", rating: 78 },
  "Kevyn": { position: "LB", rating: 71 }, // Kevyn is usually LB, not GK
  "Vitor Eudes": { position: "GK", rating: 68 }, // Fluminense reserve GK
  "Gustavo Ramalho": { position: "GK", rating: 65 },
  "Justen": { position: "CB", rating: 65 }
};

// Funções utilitárias
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function fixTeamSquad(team) {
  let squad = team.squad;

  // 1. Aplicar Base de Conhecimento Real (OVR e Posição exata do FIFA)
  squad.forEach(p => {
    // Normalização básica de nome (Fuzzy simples)
    const known = Object.keys(realPlayerStats).find(k => p.name.toLowerCase().includes(k.toLowerCase()));
    if (known) {
       p.position = realPlayerStats[known].position;
       p.rating = realPlayerStats[known].rating;
       if (realPlayerStats[known].isWorldClass !== undefined) {
          p.isWorldClass = realPlayerStats[known].isWorldClass;
       }
    }
  });

  // 2. Normalizar OVR da equipe baseado no "Tier" (Relevância)
  // Times gigantes (ex: Real Madrid) = tier 1. Times menores = tier 3.
  let targetAvgOvr = 70;
  if (team.leagueId && (team.leagueId.includes('england_a') || team.leagueId.includes('spain_a') || team.leagueId.includes('italy_a'))) {
      targetAvgOvr = 82; // Times europeus fortes
  } else if (team.leagueId && team.leagueId.includes('brazil_a')) {
      targetAvgOvr = 75; // Serie A
  } else if (team.leagueId && team.leagueId.includes('brazil_b')) {
      targetAvgOvr = 68; // Serie B
  }

  // Ajustar quem está fora da curva
  squad.forEach(p => {
    // Se não for um craque real já definido...
    const isKnown = Object.keys(realPlayerStats).some(k => p.name.toLowerCase().includes(k.toLowerCase()));
    if (!isKnown) {
       // Distribuir de forma gaussiana em torno do targetAvgOvr
       const randomVariance = Math.floor(Math.random() * 8) - 4; // -4 a +4
       const base = targetAvgOvr + randomVariance;
       p.rating = clamp(base, 50, 94);
       
       // Recalcular isWorldClass baseado no novo OVR real
       p.isWorldClass = p.rating >= 87;
    }
  });

  // 3. Balanceador de Posições
  // Garantir que o time tenha posições equilibradas
  const posCount = { GK: 0, CB: 0, LB: 0, RB: 0, CDM: 0, CM: 0, CAM: 0, LW: 0, RW: 0, ST: 0 };
  squad.forEach(p => {
    if (posCount[p.position] !== undefined) posCount[p.position]++;
    else posCount['CM']++; // Fallback
  });

  // Regra 1: Todo time precisa de no mínimo 2 Goleiros
  while (posCount.GK < 2) {
      // Pega um CB ruim e transforma em GK
      let candidate = squad.find(p => p.position === 'CB' && p.rating < targetAvgOvr);
      if (!candidate) candidate = squad.find(p => p.position !== 'GK');
      if (candidate) {
          candidate.position = 'GK';
          posCount.GK++;
          posCount[candidate.position]--;
      }
  }

  // Regra 2: Todo time precisa de laterais
  const fixPosition = (needed, fromPool, minCount) => {
      while (posCount[needed] < minCount) {
          let candidate = squad.find(p => p.position === fromPool);
          if (candidate) {
              candidate.position = needed;
              posCount[needed]++;
              posCount[fromPool]--;
          } else {
              break; // Sem candidatos
          }
      }
  };

  // Balanceando
  fixPosition('LB', 'CB', 2);
  fixPosition('RB', 'CB', 2);
  fixPosition('CDM', 'CM', 2);
  fixPosition('CAM', 'CM', 1);
  fixPosition('ST', 'CM', 2);
  fixPosition('LW', 'ST', 1);
  fixPosition('RW', 'ST', 1);

  return team;
}

teamsData = teamsData.map(team => fixTeamSquad(team));

fs.writeFileSync(teamsPath, JSON.stringify(teamsData, null, 2));
console.log("Bot Refiner: Jogadores ajustados para OVRs e Posições realistas com sucesso!");
