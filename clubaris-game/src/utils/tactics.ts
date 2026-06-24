import type { Player } from "../store/gameStore";

export const formationsMap: Record<string, string[]> = {
  "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
  "4-3-3": ["GK", "LB", "CB", "CB", "RB", "CM", "CDM", "CM", "LW", "ST", "RW"],
  "3-5-2": ["GK", "CB", "CB", "CB", "LM", "CDM", "CAM", "CDM", "RM", "ST", "ST"],
  "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LM", "CAM", "RM", "ST"],
  "5-3-2": ["GK", "LWB", "CB", "CB", "CB", "RWB", "CM", "CDM", "CM", "ST", "ST"]
};

const positionEquivalents: Record<string, string[]> = {
  "GK": ["GK"],
  "CB": ["CB", "CDM", "RB", "LB"],
  "LB": ["LB", "LWB", "LM", "CB"],
  "RB": ["RB", "RWB", "RM", "CB"],
  "LWB": ["LWB", "LB", "LM"],
  "RWB": ["RWB", "RB", "RM"],
  "CDM": ["CDM", "CM", "CB"],
  "CM": ["CM", "CDM", "CAM", "LM", "RM"],
  "CAM": ["CAM", "CM", "CF", "ST", "LW", "RW"],
  "LM": ["LM", "LW", "LWB", "CM"],
  "RM": ["RM", "RW", "RWB", "CM"],
  "LW": ["LW", "LM", "ST", "CF", "RW"],
  "RW": ["RW", "RM", "ST", "CF", "LW"],
  "ST": ["ST", "CF", "LW", "RW", "CAM"],
  "CF": ["CF", "ST", "CAM", "LW", "RW"]
};

// AutoPick Inteligente
export function autoPickPositional(squad: Player[], formation: string): { startingXI: Player[], bench: Player[] } {
  const requirements = formationsMap[formation] || formationsMap["4-4-2"];
  const availablePlayers = [...squad].sort((a, b) => b.rating - a.rating);
  
  const startingXI: Player[] = [];
  
  // 1. Prioridade: Quem tem isStarter marcado pelo script real da API
  const apiStarters = availablePlayers.filter(p => p.isStarter);
  if (apiStarters.length === 11) {
     const bench = getBench(availablePlayers.filter(p => !p.isStarter));
     return { startingXI: apiStarters, bench };
  }

  // 2. Se não houver dados reais suficientes da API, usar AutoPick Posicional
  requirements.forEach((reqPos) => {
    let bestFitIdx = availablePlayers.findIndex(p => p.position === reqPos);
    
    if (bestFitIdx === -1) {
      const equivalents = positionEquivalents[reqPos] || [];
      for (const eqPos of equivalents) {
        bestFitIdx = availablePlayers.findIndex(p => p.position === eqPos);
        if (bestFitIdx !== -1) break;
      }
    }
    
    if (bestFitIdx === -1) {
      bestFitIdx = 0;
    }

    if (bestFitIdx !== -1) {
      startingXI.push(availablePlayers[bestFitIdx]);
      availablePlayers.splice(bestFitIdx, 1);
    }
  });

  return { startingXI, bench: getBench(availablePlayers) };
}

function getBench(remainingSquad: Player[]): Player[] {
  const maxBenchSize = 12; // Reservas max
  const bench: Player[] = [];
  
  const gkIdx = remainingSquad.findIndex(p => p.position === "GK");
  if (gkIdx !== -1) {
     bench.push(remainingSquad[gkIdx]);
     remainingSquad.splice(gkIdx, 1);
  }

  while (bench.length < maxBenchSize && remainingSquad.length > 0) {
     bench.push(remainingSquad[0]);
     remainingSquad.splice(0, 1);
  }

  return bench;
}
