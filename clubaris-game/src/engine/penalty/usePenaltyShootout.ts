import { useState } from 'react';
import type { Player } from '../../store/gameStore';
import { simulatePenaltyShot, type PenaltyDirection, type PenaltyHeight, type PenaltyResult } from './PenaltyMath';

export type TeamType = 'PLAYER' | 'OPPONENT';

export interface PenaltyRecord {
  team: TeamType;
  taker: Player;
  isGoal: boolean;
  resultDetails?: PenaltyResult;
}

interface UsePenaltyShootoutProps {
  playerTeam: Player[]; // Top 5 takers (or more if sudden death)
  opponentTeam: Player[];
  playerKeeper: Player;
  opponentKeeper: Player;
  onFinish?: (winner: TeamType) => void;
}

export function usePenaltyShootout({ playerTeam, opponentTeam, playerKeeper, opponentKeeper, onFinish }: UsePenaltyShootoutProps) {
  const [history, setHistory] = useState<PenaltyRecord[]>([]);
  const [currentTurnTeam, setCurrentTurnTeam] = useState<TeamType>('PLAYER');
  const [playerIndex, setPlayerIndex] = useState(0);
  const [opponentIndex, setOpponentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [winner, setWinner] = useState<TeamType | null>(null);

  const playerScore = history.filter(h => h.team === 'PLAYER' && h.isGoal).length;
  const opponentScore = history.filter(h => h.team === 'OPPONENT' && h.isGoal).length;
  
  const playerAttempts = history.filter(h => h.team === 'PLAYER').length;
  const opponentAttempts = history.filter(h => h.team === 'OPPONENT').length;

  const currentTaker = currentTurnTeam === 'PLAYER' 
    ? playerTeam[playerIndex % playerTeam.length] 
    : opponentTeam[opponentIndex % opponentTeam.length];
    
  const currentKeeper = currentTurnTeam === 'PLAYER' ? opponentKeeper : playerKeeper;

  const checkWinner = (newPlayerAttempts: number, newOpponentAttempts: number, newPlayerScore: number, newOpponentScore: number) => {
    // Normal 5 shots phase
    if (newPlayerAttempts <= 5 && newOpponentAttempts <= 5) {
      const playerRemaining = 5 - newPlayerAttempts;
      const opponentRemaining = 5 - newOpponentAttempts;
      
      // Se a diferença de pontos é maior que o número de chutes restantes, acabou.
      if (newPlayerScore > newOpponentScore + opponentRemaining) return 'PLAYER';
      if (newOpponentScore > newPlayerScore + playerRemaining) return 'OPPONENT';
    } else {
      // Sudden Death (Alternadas)
      if (newPlayerAttempts === newOpponentAttempts) {
        if (newPlayerScore > newOpponentScore) return 'PLAYER';
        if (newOpponentScore > newPlayerScore) return 'OPPONENT';
      }
    }
    return null;
  };

  const handleShot = (direction: PenaltyDirection, height: PenaltyHeight, timingAccuracy: number) => {
    if (isFinished) return null;

    const mode = currentTurnTeam === 'PLAYER' ? 'USER_SHOOTING' : 'USER_SAVING';

    const result = simulatePenaltyShot({
      mode,
      taker: currentTaker,
      keeper: currentKeeper,
      targetDirection: mode === 'USER_SHOOTING' ? direction : undefined,
      targetHeight: mode === 'USER_SHOOTING' ? height : undefined,
      keeperJumpDirection: mode === 'USER_SAVING' ? direction : undefined,
      keeperJumpHeight: mode === 'USER_SAVING' ? height : undefined,
      timingAccuracy
    });

    const newRecord: PenaltyRecord = {
      team: currentTurnTeam,
      taker: currentTaker,
      isGoal: result.isGoal,
      resultDetails: result
    };

    const newHistory = [...history, newRecord];
    setHistory(newHistory);

    const newPlayerScore = newHistory.filter(h => h.team === 'PLAYER' && h.isGoal).length;
    const newOpponentScore = newHistory.filter(h => h.team === 'OPPONENT' && h.isGoal).length;
    const newPlayerAttempts = newHistory.filter(h => h.team === 'PLAYER').length;
    const newOpponentAttempts = newHistory.filter(h => h.team === 'OPPONENT').length;

    const matchWinner = checkWinner(newPlayerAttempts, newOpponentAttempts, newPlayerScore, newOpponentScore);
    
    if (matchWinner) {
      setIsFinished(true);
      setWinner(matchWinner);
      if (onFinish) onFinish(matchWinner);
    } else {
      // Advance turn
      if (currentTurnTeam === 'PLAYER') {
        setCurrentTurnTeam('OPPONENT');
        setPlayerIndex(i => i + 1);
      } else {
        setCurrentTurnTeam('PLAYER');
        setOpponentIndex(i => i + 1);
      }
    }

    return result;
  };

  return {
    history,
    playerScore,
    opponentScore,
    currentTurnTeam,
    currentTaker,
    currentKeeper,
    isFinished,
    winner,
    handleShot,
    playerAttempts,
    opponentAttempts
  };
}
