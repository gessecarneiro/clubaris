import type { Player } from "../../store/gameStore";

export type PenaltyDirection = 'LEFT' | 'CENTER' | 'RIGHT';
export type PenaltyHeight = 'LOW' | 'HIGH';

export interface PenaltyShotParams {
  mode: 'USER_SHOOTING' | 'USER_SAVING' | 'AI_ONLY';
  taker: Player;
  keeper: Player;
  targetDirection?: PenaltyDirection; // chosen by user or AI
  targetHeight?: PenaltyHeight;       // chosen by user or AI
  keeperJumpDirection?: PenaltyDirection; // chosen by user or AI
  keeperJumpHeight?: PenaltyHeight;       // chosen by user or AI
  timingAccuracy: number; // For user shooting or saving (0.0 to 1.0)
}

export interface PenaltyResult {
  isGoal: boolean;
  shotTargetDirection: PenaltyDirection;
  shotTargetHeight: PenaltyHeight;
  keeperJumpDirection: PenaltyDirection;
  keeperJumpHeight: PenaltyHeight;
  eventDescription: string;
  shotQuality: number; // 0-100
  keeperQuality: number; // 0-100
}

function calculateFrieza(p: Player) {
  const ageFactor = Math.min((p.age || 20) * 1.5, 50);
  return Math.min(99, ageFactor + ((p.morale || 80) * 0.5));
}

function calculateTecnica(p: Player) {
  return Math.floor(((p.attr_passing || 50) + p.rating) / 2);
}

function calculateElasticidade(p: Player) {
  return Math.floor(((p.attr_reflexes || 50) + p.rating) / 2);
}

export function simulatePenaltyShot({ 
  mode, taker, keeper, 
  targetDirection: inputTargetDirection, 
  targetHeight: inputTargetHeight, 
  keeperJumpDirection: inputKeeperJumpDirection,
  keeperJumpHeight: inputKeeperJumpHeight,
  timingAccuracy 
}: PenaltyShotParams): PenaltyResult {
  
  // 1. Taker Base Attributes
  const finalizacao = taker.attr_finishing || 50;
  const tecnica = calculateTecnica(taker);
  const friezaTaker = calculateFrieza(taker);
  const cansacoTaker = 100 - (taker.energy || 100);
  const moralTaker = taker.morale || 80;

  let penaltyScore = 
    (finalizacao * 0.35) + 
    (tecnica * 0.25) + 
    (friezaTaker * 0.25) + 
    (moralTaker * 0.10) - 
    (cansacoTaker * 0.15);

  const dirs: PenaltyDirection[] = ['LEFT', 'CENTER', 'RIGHT'];
  const heights: PenaltyHeight[] = ['LOW', 'HIGH'];

  // Determinar alvo da cobrança
  let finalTargetDirection = inputTargetDirection || dirs[Math.floor(Math.random() * dirs.length)];
  let finalTargetHeight = inputTargetHeight || ((Math.random() > 0.5) ? 'HIGH' : 'LOW');

  if (mode === 'USER_SAVING' || mode === 'AI_ONLY') {
     // AI Taker Logic
     const safeShotChance = penaltyScore > 75 ? 0.8 : 0.4;
     if (Math.random() < safeShotChance) {
        // High skill players pick corners
        finalTargetDirection = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';
     }
  }

  // Taker accuracy modifier
  let takerTiming = 0.8; // AI average timing
  if (mode === 'USER_SHOOTING') {
     takerTiming = timingAccuracy;
  } else {
     // AI timing based on skill
     takerTiming = Math.min(1.0, 0.4 + (penaltyScore / 200) + (Math.random() * 0.2));
  }
  
  const timingModifier = 0.5 + (takerTiming * 0.7);
  penaltyScore = penaltyScore * timingModifier;

  let targetDifficulty = 0;
  if (finalTargetDirection !== 'CENTER') targetDifficulty += 15;
  if (finalTargetHeight === 'HIGH') targetDifficulty += 10;
  
  const missThreshold = targetDifficulty * (1 - takerTiming); 
  const isOut = (Math.random() * 100) < (missThreshold * 1.5);

  // 2. Keeper Base Attributes
  const reflexo = keeper.attr_reflexes || 50;
  const posicionamento = keeper.attr_positioning || 50;
  const elasticidade = calculateElasticidade(keeper);
  const friezaKeeper = calculateFrieza(keeper);
  const cansacoKeeper = 100 - (keeper.energy || 100);

  let keeperScore = 
    (reflexo * 0.35) + 
    (posicionamento * 0.25) + 
    (elasticidade * 0.20) + 
    (friezaKeeper * 0.15) - 
    (cansacoKeeper * 0.10);

  // Determinar pulo do goleiro
  let finalKeeperDirection = inputKeeperJumpDirection;
  let finalKeeperHeight = inputKeeperJumpHeight;

  if (mode === 'USER_SHOOTING' || mode === 'AI_ONLY') {
    const guessChance = Math.min(0.6, (keeperScore / 200)); 
    const guessedDirectionRight = Math.random() < guessChance;
    
    finalKeeperDirection = guessedDirectionRight 
      ? finalTargetDirection 
      : dirs[Math.floor(Math.random() * dirs.length)];
      
    finalKeeperHeight = (Math.random() > 0.5) ? 'HIGH' : 'LOW';
  }

  // Keeper timing/reflex modifier if user is saving
  if (mode === 'USER_SAVING') {
     keeperScore = keeperScore * (0.5 + (timingAccuracy * 0.7));
  }

  if (isOut) {
    return {
      isGoal: false,
      shotTargetDirection: finalTargetDirection,
      shotTargetHeight: finalTargetHeight,
      keeperJumpDirection: finalKeeperDirection!,
      keeperJumpHeight: finalKeeperHeight!,
      eventDescription: "Bateu pra fora! Que isolada!",
      shotQuality: Math.floor(penaltyScore),
      keeperQuality: Math.floor(keeperScore)
    };
  }

  const jumpedRightWay = (finalKeeperDirection === finalTargetDirection);
  
  if (!jumpedRightWay) {
     const luckySave = Math.random() < 0.05 && keeperScore > 80 && finalTargetDirection === 'CENTER';
     if (luckySave) {
        return {
           isGoal: false, 
           shotTargetDirection: finalTargetDirection, shotTargetHeight: finalTargetHeight,
           keeperJumpDirection: finalKeeperDirection!, keeperJumpHeight: finalKeeperHeight!,
           eventDescription: "O goleiro ficou parado e defendeu com a perna!",
           shotQuality: Math.floor(penaltyScore), keeperQuality: Math.floor(keeperScore)
        };
     }
     return {
       isGoal: true, 
       shotTargetDirection: finalTargetDirection, shotTargetHeight: finalTargetHeight,
       keeperJumpDirection: finalKeeperDirection!, keeperJumpHeight: finalKeeperHeight!,
       eventDescription: "Goleiro de um lado, bola pro outro!",
       shotQuality: Math.floor(penaltyScore), keeperQuality: Math.floor(keeperScore)
     };
  }

  if (finalTargetHeight !== finalKeeperHeight) {
    keeperScore *= 0.7; 
  }

  const saveChance = (keeperScore / (keeperScore + penaltyScore));
  const isGoal = Math.random() > saveChance;

  return {
    isGoal,
    shotTargetDirection: finalTargetDirection,
    shotTargetHeight: finalTargetHeight,
    keeperJumpDirection: finalKeeperDirection!,
    keeperJumpHeight: finalKeeperHeight!,
    eventDescription: isGoal ? "Golaço! Chute forte e no canto!" : "ESPALMA O GOLEIRO!! Defesaça!",
    shotQuality: Math.floor(penaltyScore),
    keeperQuality: Math.floor(keeperScore)
  };
}
