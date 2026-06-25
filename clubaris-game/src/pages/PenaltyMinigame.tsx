import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, type Player } from '../store/gameStore';
import { usePenaltyShootout } from '../engine/penalty/usePenaltyShootout';
import type { PenaltyDirection, PenaltyHeight } from '../engine/penalty/PenaltyMath';
import { soundEngine } from '../utils/SoundEngine';

const generateDummyTeam = (prefix: string, isHome: boolean): Player[] => {
  return Array.from({length: 5}, (_, i) => ({
    id: `dummy_${prefix}_${i}`,
    name: `${prefix} ${i+1}`,
    position: 'ST',
    number: 9 + i,
    rating: 80,
    attr_finishing: 75 + Math.random() * 15,
    attr_reflexes: 50,
    energy: 100,
    morale: 80,
    age: 25,
  } as Player));
};

const dummyGK = (prefix: string): Player => ({
  id: `dummy_gk_${prefix}`,
  name: `GK ${prefix}`,
  position: 'GK',
  number: 1,
  rating: 85,
  attr_reflexes: 80 + Math.random() * 10,
  attr_positioning: 80,
  energy: 100,
  morale: 80,
  age: 28,
} as Player);

export default function PenaltyMinigame() {
  const navigate = useNavigate();
  const { squad } = useGameStore();

  const isRealSquad = squad && squad.length >= 5;
  const playerTeam = isRealSquad ? squad.slice(0, 5) : generateDummyTeam('Man Utd', true);
  const playerKeeper = isRealSquad ? (squad.find(p => p.position === 'GK') || squad[0]) : dummyGK('Man Utd');
  
  const opponentTeam = isRealSquad ? (squad.slice(5, 10).length === 5 ? squad.slice(5, 10) : squad.slice(0, 5)) : generateDummyTeam('Sparta P.', false);
  const opponentKeeper = isRealSquad ? (squad.find(p => p.position === 'GK') || squad[0]) : dummyGK('Sparta P.');

  const {
    history, playerScore, opponentScore, currentTurnTeam,
    currentTaker, currentKeeper, isFinished, winner, handleShot,
    playerAttempts, opponentAttempts
  } = usePenaltyShootout({ playerTeam, opponentTeam, playerKeeper, opponentKeeper });

  // For Shooter: AIMING_X -> AIMING_Y -> SHOOTING
  // For Keeper: KEEPER_WAIT -> SHOOTING
  type GameState = 'START_TURN' | 'AIMING_X' | 'AIMING_Y' | 'KEEPER_WAIT' | 'SHOOTING' | 'RESULT';
  const [gameState, setGameState] = useState<GameState>('START_TURN');
  
  const [aimPos, setAimPos] = useState<{x: number, y: number}>({ x: 50, y: 50 });
  const [ballPos, setBallPos] = useState<{x: number, y: number, scale: number, rot: number}>({ x: 50, y: 100, scale: 1, rot: 0 });
  const [keeperPos, setKeeperPos] = useState<{x: number, y: number, rotate: number}>({ x: 50, y: 60, rotate: 0 });
  const [shooterPos, setShooterPos] = useState<{y: number, scale: number}>({ y: 0, scale: 1 });
  const [resultText, setResultText] = useState("");
  const [isBallFlying, setIsBallFlying] = useState(false);

  const reqRef = useRef<number>(0);
  const animDirRef = useRef<number>(1);
  const isPlayerDefending = currentTurnTeam === 'OPPONENT';

  useEffect(() => {
     if (gameState === 'START_TURN') {
        soundEngine.playWhistle();
        setTimeout(() => {
           if (isPlayerDefending) {
              setGameState('KEEPER_WAIT');
           } else {
              setGameState('AIMING_X');
              animDirRef.current = 1;
              setAimPos({ x: 50, y: 50 });
           }
        }, 1000);
     }
  }, [gameState, isPlayerDefending]);

  // Sweeping logic for AIMING_X and AIMING_Y
  useEffect(() => {
    if (gameState === 'AIMING_X' || gameState === 'AIMING_Y') {
      let currentVal = gameState === 'AIMING_X' ? aimPos.x : aimPos.y;
      
      const updateAim = () => {
        currentVal += animDirRef.current * 1.5; // speed
        if (currentVal >= 100) {
           currentVal = 100;
           animDirRef.current = -1;
        } else if (currentVal <= 0) {
           currentVal = 0;
           animDirRef.current = 1;
        }
        
        setAimPos(prev => ({
           x: gameState === 'AIMING_X' ? currentVal : prev.x,
           y: gameState === 'AIMING_Y' ? currentVal : prev.y
        }));
        
        reqRef.current = requestAnimationFrame(updateAim);
      };
      reqRef.current = requestAnimationFrame(updateAim);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [gameState]);

  // For AI turn, simulate AI thinking then shooting
  useEffect(() => {
     if (gameState === 'KEEPER_WAIT') {
        // AI will shoot after 1.5-3 seconds
        const delay = 1500 + Math.random() * 1500;
        const timer = setTimeout(() => {
            // AI random aim
            takeShot(Math.random() * 100, Math.random() * 100);
        }, delay);
        return () => clearTimeout(timer);
     }
  }, [gameState]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlayerDefending) {
       // Keeper diving
       if (gameState === 'KEEPER_WAIT') {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setAimPos({ x, y }); // store dive pos
       }
       return;
    }

    if (gameState === 'AIMING_X') {
       setGameState('AIMING_Y');
       animDirRef.current = 1;
    } else if (gameState === 'AIMING_Y') {
       takeShot(aimPos.x, aimPos.y);
    }
  };

  const getDirAndHeight = (x: number, y: number): { dir: PenaltyDirection, h: PenaltyHeight } => {
     let dir: PenaltyDirection = 'CENTER';
     let h: PenaltyHeight = 'LOW';
     if (x < 33) dir = 'LEFT';
     else if (x > 66) dir = 'RIGHT';
     if (y < 50) h = 'HIGH';
     return { dir, h };
  };

  const takeShot = (x: number, y: number) => {
     setGameState('SHOOTING');
     
     // Animate Shooter running
     setShooterPos({ y: -150, scale: 0.8 });
     
     setTimeout(() => {
        soundEngine.playKick();
        
        const accuracy = 1.0; 
        const { dir, h } = getDirAndHeight(x, y);
        
        const result = handleShot(dir, h, accuracy);

        if (result) {
           setIsBallFlying(true);
           
           let finalX = x;
           let finalY = y;

           if (isPlayerDefending) {
              // AI shot goes to its intended target
              if (result.shotTargetDirection === 'LEFT') finalX = 15;
              else if (result.shotTargetDirection === 'RIGHT') finalX = 85;
              else finalX = 50;

              if (result.shotTargetHeight === 'HIGH') finalY = 20;
              else finalY = 80;
           } else {
              // Player shot goes to X,Y unless it's a miss
              if (!result.isGoal && result.eventDescription.includes('fora')) {
                  finalX = finalX > 50 ? finalX + 30 : finalX - 30;
                  finalY = finalY - 30;
              }
           }

           // Ball 3D scale and translation
           setBallPos({ x: finalX, y: finalY, scale: 0.3, rot: 720 });
           
           // Animate Keeper
           let kX = 50; let kY = 60; let kRot = 0;
           if (result.keeperJumpDirection === 'LEFT') { kX = 10; kRot = -75; kY = result.keeperJumpHeight === 'HIGH' ? 30 : 80; }
           if (result.keeperJumpDirection === 'RIGHT') { kX = 90; kRot = 75; kY = result.keeperJumpHeight === 'HIGH' ? 30 : 80; }
           
           setKeeperPos({ x: kX, y: kY, rotate: kRot });

           setTimeout(() => {
              setIsBallFlying(false);
              setResultText(result.eventDescription);
              setGameState('RESULT');
              
              if (result.isGoal) soundEngine.playGoalCheer();
              else soundEngine.playMissGroan();

              setTimeout(() => {
                 resetPositions();
                 setGameState('START_TURN');
                 setResultText("");
              }, 3000);

           }, 600); // ball travel time
        }
     }, 400); // runner travel time
  };

  const resetPositions = () => {
     setBallPos({ x: 50, y: 100, scale: 1, rot: 0 });
     setKeeperPos({ x: 50, y: 60, rotate: 0 });
     setShooterPos({ y: 0, scale: 1 });
     setAimPos({ x: 50, y: 50 });
  };
  
  // Personagens
  const ShooterAvatar = () => (
     <div 
        className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-32 h-40 z-30 pointer-events-none drop-shadow-2xl transition-all duration-400 ease-in"
        style={{ transform: `translate(-50%, ${shooterPos.y}px) scale(${shooterPos.scale})`, transformOrigin: 'bottom' }}
     >
        {/* Sombra */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black/50 rounded-full blur-md"></div>
        
        {/* Cabeça */}
        <div className="w-12 h-12 bg-[#ffb686] rounded-full mx-auto border-2 border-black/80 shadow-inner"></div>
        {/* Corpo */}
        <div className={`w-20 h-20 ${isPlayerDefending ? 'bg-blue-600' : 'bg-red-600'} mx-auto mt-1 rounded-t-2xl border-2 border-black/80 flex items-center justify-center text-white font-black text-2xl shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)]`}>
           {currentTaker.number}
        </div>
        <div className="flex justify-center gap-3 relative z-10">
           <div className="w-6 h-12 bg-white border-2 border-black/80 rounded-b-md"></div>
           <div className="w-6 h-12 bg-white border-2 border-black/80 rounded-b-md"></div>
        </div>
     </div>
  );

  const KeeperAvatar = () => (
     <div 
         className="absolute w-24 h-28 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-20 drop-shadow-2xl transform scale-75 origin-bottom"
         style={{ 
            left: `${keeperPos.x}%`, 
            top: `${keeperPos.y}%`,
            transform: `translate(-50%, -50%) rotate(${keeperPos.rotate}deg)`
         }}
      >
         <div className="w-10 h-10 bg-[#ffb686] rounded-full mx-auto border-2 border-black/80 shadow-inner"></div>
         <div className={`w-20 h-14 ${isPlayerDefending ? 'bg-yellow-400' : 'bg-green-500'} mx-auto mt-1 rounded-t-3xl border-2 border-black/80 flex justify-between px-1 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)]`}>
            <div className="w-4 h-12 bg-gray-200 border border-black/80 -mt-6 rounded-t-md origin-bottom transform -rotate-12"></div>
            <div className="w-4 h-12 bg-gray-200 border border-black/80 -mt-6 rounded-t-md origin-bottom transform rotate-12"></div>
         </div>
         <div className="flex justify-center gap-3">
            <div className="w-5 h-12 bg-black border-2 border-white/20 rounded-b-md"></div>
            <div className="w-5 h-12 bg-black border-2 border-white/20 rounded-b-md"></div>
         </div>
      </div>
  );

  if (playerTeam.length < 5) return null;

  return (
    <div className="min-h-screen bg-[#87CEEB] flex flex-col items-center justify-center font-sans overflow-hidden select-none relative" onClick={handleScreenClick}>
      
      {/* CÉU e Arquibancada (Fundo) */}
      <div className="absolute top-0 w-full h-[40%] bg-gradient-to-b from-blue-600 to-blue-300">
         <div className="absolute bottom-0 w-full h-[30%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxZTFlIiBvcGFjaXR5PSIwLjUiLz48cmVjdCB4PSIyMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFlMWUxZSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-20"></div>
      </div>

      {/* GRAMADO Pseudo-3D */}
      <div className="absolute top-[40%] w-full h-[60%] flex flex-col" style={{ perspective: '800px' }}>
         <div className="w-full h-[150%]" style={{ 
            backgroundImage: 'repeating-linear-gradient(to bottom, #4caf50 0%, #4caf50 5%, #388e3c 5%, #388e3c 10%)',
            transform: 'rotateX(75deg)',
            transformOrigin: 'top'
          }}></div>
      </div>

      {/* PLACAR */}
      <div className="absolute top-4 w-full max-w-2xl px-6 flex justify-between items-center bg-black/60 backdrop-blur-md p-4 rounded-full border-2 border-white/20 shadow-2xl z-50 pointer-events-none">
         <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-white">{playerScore}</div>
            <div className="text-sm font-bold text-gray-300 leading-tight">SEU<br/>TIME</div>
         </div>
         <div className="flex flex-col items-center">
            <div className="text-xl font-black text-yellow-400 tracking-widest uppercase">
               Turno {Math.max(playerAttempts, opponentAttempts) + 1}
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-gray-300 leading-tight text-right">ADV</div>
            <div className="text-4xl font-black text-white">{opponentScore}</div>
         </div>
      </div>

      {/* MENSAGEM DE TURNO */}
      {gameState === 'START_TURN' && (
         <div className="absolute top-[25%] z-50 pointer-events-none">
            <div className={`px-8 py-4 rounded-xl font-black text-3xl uppercase tracking-widest shadow-2xl animate-pulse ${isPlayerDefending ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
               {isPlayerDefending ? 'SUA VEZ DE DEFENDER!' : 'SUA VEZ DE CHUTAR!'}
            </div>
         </div>
      )}

      {/* ÁREA DE JOGO (O GOL) */}
      <div className="relative w-[90%] max-w-3xl aspect-[2/1] mt-[5%] z-10 flex items-end justify-center pointer-events-none">
         
         <div 
           className="relative w-full h-[90%] border-t-[12px] border-l-[12px] border-r-[12px] border-white z-20 mb-8"
           style={{
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
              boxShadow: 'inset 0 20px 50px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.3)'
           }}
         >
            {/* Linha do gol no chão */}
            <div className="absolute -bottom-3 left-0 w-full h-3 bg-white/90"></div>
            
            {/* Mira dinâmica Penalty Fever */}
            {!isPlayerDefending && (gameState === 'AIMING_X' || gameState === 'AIMING_Y') && (
               <>
                  {gameState === 'AIMING_X' && <div className="absolute top-0 bottom-0 w-1 bg-yellow-400 shadow-[0_0_10px_yellow]" style={{ left: `${aimPos.x}%` }}></div>}
                  {gameState === 'AIMING_Y' && <div className="absolute left-0 right-0 h-1 bg-yellow-400 shadow-[0_0_10px_yellow]" style={{ top: `${aimPos.y}%` }}></div>}
                  {gameState === 'AIMING_Y' && <div className="absolute top-0 bottom-0 w-1 bg-white/50" style={{ left: `${aimPos.x}%` }}></div>}
               </>
            )}

            {/* Guia de pulo para o goleiro */}
            {isPlayerDefending && gameState === 'KEEPER_WAIT' && (
               <div className="absolute w-12 h-12 border-4 border-yellow-400 rounded-full shadow-[0_0_15px_yellow] -translate-x-1/2 -translate-y-1/2 transition-all duration-75" style={{ left: `${aimPos.x}%`, top: `${aimPos.y}%` }}></div>
            )}
            
            <KeeperAvatar />
         </div>

         {/* A BOLA */}
         <div 
            className="absolute z-40 transition-all drop-shadow-[0_20px_15px_rgba(0,0,0,0.6)]"
            style={{ 
               left: `calc(0% + ${ballPos.x}%)`,
               top: `calc(10% + ${ballPos.y * 0.9}%)`,
               transform: `translate(-50%, -50%) scale(${ballPos.scale})`,
               transitionTimingFunction: isBallFlying ? 'cubic-bezier(0.2, 0.8, 0.3, 1)' : 'ease-out',
               transitionDuration: isBallFlying ? '600ms' : '0ms'
            }}
         >
            <div 
               className="w-14 h-14 bg-white rounded-full border-2 border-black flex items-center justify-center overflow-hidden shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.5)]"
               style={{
                  transform: `rotate(${ballPos.rot}deg)`,
                  transition: isBallFlying ? 'transform 600ms linear' : 'none'
               }}
            >
               <div className="w-7 h-7 bg-black clip-path-polygon-[50%_0%,_100%_38%,_82%_100%,_18%_100%,_0%_38%]"></div>
               <div className="absolute top-1 left-2 w-3 h-3 bg-black rounded-sm"></div>
               <div className="absolute bottom-2 right-1 w-3 h-3 bg-black rounded-sm"></div>
            </div>
         </div>
      </div>

      <ShooterAvatar />

      {/* EVENT RESULT POPUP */}
      {gameState === 'RESULT' && (
         <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm pointer-events-none">
            <div className="bg-black/90 border-4 border-white/20 p-8 rounded-3xl transform scale-125 animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(0,0,0,1)]">
               <h1 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter text-center drop-shadow-2xl ${resultText.includes('Golaço') ? 'text-green-400' : 'text-red-500'}`}>
                  {resultText}
               </h1>
            </div>
         </div>
      )}

      {/* GAME OVER */}
      {isFinished && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-8 backdrop-blur-md">
            <h1 className="text-6xl font-black text-yellow-400 mb-6 uppercase drop-shadow-[0_0_30px_rgba(255,200,0,0.8)] animate-pulse">Fim de Jogo!</h1>
            <p className="text-4xl font-bold text-white mb-12 flex items-center gap-4 bg-white/10 px-8 py-4 rounded-2xl border border-white/20">
               Vencedor: <span className={winner === 'PLAYER' ? 'text-green-400 drop-shadow-[0_0_10px_green]' : 'text-red-500 drop-shadow-[0_0_10px_red]'}>{winner === 'PLAYER' ? 'SEU TIME' : 'ADVERSÁRIO'}</span>
            </p>
            <button onClick={() => { soundEngine.playWhistle(); navigate('/clubhouse'); }} className="bg-gradient-to-b from-blue-500 to-blue-800 text-white font-black text-3xl px-16 py-6 rounded-full border-4 border-blue-400/50 hover:scale-105 transition-all shadow-[0_0_40px_rgba(59,130,246,0.6)] uppercase tracking-widest z-50 pointer-events-auto">
               Voltar
            </button>
         </div>
      )}

    </div>
  );
}
