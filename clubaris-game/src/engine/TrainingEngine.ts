import type { Player } from '../store/gameStore';

export const TRAINING_FOCI = ["ataque", "defesa", "fisico", "goleiro", "equilibrado"] as const;
export type TrainingFocus = typeof TRAINING_FOCI[number];

// Helper to safely give attributes to old save players
export function ensurePlayerAttributes(player: Player): Player {
  if (player.attr_finishing !== undefined) return player;

  // Generate base attributes around the player's rating
  const base = player.rating;
  const generate = (offsetMin: number, offsetMax: number) => {
    let val = base + Math.floor(Math.random() * (offsetMax - offsetMin + 1)) + offsetMin;
    return Math.max(1, Math.min(99, val));
  };

  const isGK = player.position === 'GK';
  const isDEF = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position);
  const isMID = ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player.position);
  const isATT = ['ST', 'CF', 'LW', 'RW'].includes(player.position);

  const newP: Player = {
    ...player,
    attr_finishing: generate(isATT ? 0 : -20, isATT ? 5 : -5),
    attr_passing: generate(isMID ? 0 : -10, isMID ? 5 : 0),
    attr_crossing: generate(['LM', 'RM', 'LW', 'RW', 'LB', 'RB', 'LWB', 'RWB'].includes(player.position) ? 0 : -15, 5),
    attr_marking: generate(isDEF || player.position === 'CDM' ? 0 : -20, isDEF ? 5 : -10),
    attr_tackling: generate(isDEF || player.position === 'CDM' ? 0 : -20, isDEF ? 5 : -10),
    attr_pace: generate(isGK ? -30 : -10, isGK ? -10 : 5),
    attr_stamina: generate(isGK ? -30 : -10, isGK ? -10 : 5),
    attr_reflexes: generate(isGK ? 0 : -30, isGK ? 5 : -10),
    attr_positioning: generate(-5, 5),
    // Potential is usually higher for young players
    potential: player.age && player.age <= 23 ? generate(5, 15) : base
  };

  return newP;
}

export function simulatePlayerTraining(player: Player, focus: TrainingFocus): Player {
  // Always ensure they have attributes
  let p = ensurePlayerAttributes(player);
  
  if (!p.age || !p.potential) return p;

  // Clone player to mutate safely
  p = { ...p };

  // Determine Growth Factor based on Age
  let growthFactor = 0;
  const age = p.age as number;
  if (age <= 20) growthFactor = 0.8;
  else if (age <= 23) growthFactor = 0.5;
  else if (age <= 27) growthFactor = 0.2;
  else if (age <= 30) growthFactor = 0.05;
  else growthFactor = -0.1; // Decline phase

  const tryGrow = (attr: keyof Player, boost: number = 1.0) => {
    let currentVal = p[attr] as number | undefined;
    if (currentVal === undefined) return;
    
    // Check potential limit
    const roomToGrow = p.potential! - currentVal;
    if (roomToGrow <= 0 && growthFactor > 0) return; // Reached limit

    // Chance to grow
    const chance = Math.max(0.01, growthFactor * boost);
    
    if (Math.random() < chance) {
      if (growthFactor > 0) {
         (p as any)[attr] = (p[attr] as number) + 1;
      }
    }
  };

  const tryDecline = (attr: keyof Player) => {
     if (p.age && p.age >= 31) {
        const declineChance = 0.1 + ((p.age - 30) * 0.05); // increases with age
        if (Math.random() < declineChance) {
           (p as any)[attr] = Math.max(1, (p[attr] as number) - 1);
        }
     }
  };

  // Focus Multipliers
  switch (focus) {
    case 'ataque':
      tryGrow('attr_finishing', 2.0);
      tryGrow('attr_positioning', 1.5);
      tryGrow('attr_crossing', 1.2);
      break;
    case 'defesa':
      tryGrow('attr_marking', 2.0);
      tryGrow('attr_tackling', 2.0);
      tryGrow('attr_positioning', 1.2);
      break;
    case 'fisico':
      tryGrow('attr_pace', 2.0);
      tryGrow('attr_stamina', 2.0);
      // Físico declines are fought against by this training
      break;
    case 'goleiro':
      if (p.position === 'GK') {
        tryGrow('attr_reflexes', 3.0);
        tryGrow('attr_positioning', 2.0);
      }
      break;
    case 'equilibrado':
      tryGrow('attr_finishing', 0.5);
      tryGrow('attr_passing', 0.5);
      tryGrow('attr_marking', 0.5);
      tryGrow('attr_pace', 0.5);
      tryGrow('attr_stamina', 0.5);
      break;
  }

  // Always slight chance to grow passing and stamina if playing balanced
  if (focus !== 'goleiro') {
     tryGrow('attr_passing', 0.2);
     tryGrow('attr_stamina', 0.2);
  }

  // Physical Decline applies to all older players regardless of training (unless physical focus counters it slightly)
  if (focus !== 'fisico') {
     tryDecline('attr_pace');
     tryDecline('attr_stamina');
  }

  // Recalculate OVR (Simple average of key stats based on pos, but for now just average of all + base offset)
  // To keep it simple, if any stat goes over the current rating noticeably, we bump rating.
  // Actually, proper way: recalculate rating from attributes.
  if (p.position === 'GK') {
     p.rating = Math.floor(((p.attr_reflexes||50)*2 + (p.attr_positioning||50)) / 3);
  } else {
     const sum = (p.attr_finishing||0) + (p.attr_passing||0) + (p.attr_marking||0) + (p.attr_tackling||0) + (p.attr_pace||0) + (p.attr_stamina||0) + (p.attr_crossing||0) + (p.attr_positioning||0);
     const avg = Math.floor(sum / 8);
     // We mix avg and base to prevent huge jumps
     p.rating = Math.floor((p.rating * 0.3) + (avg * 0.7));
  }

  return p;
}
