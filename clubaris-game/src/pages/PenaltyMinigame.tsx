import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, type Player } from '../store/gameStore';
import { usePenaltyShootout } from '../engine/penalty/usePenaltyShootout';
import type { PenaltyDirection, PenaltyHeight } from '../engine/penalty/PenaltyMath';

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

  type GameState = 'AIMING' | 'TIMING' | 'SHOOTING' | 'RESULT';
  const [gameState, setGameState] = useState<GameState>('AIMING');
  const [aimPos, setAimPos] = useState<{x: number, y: number} | null>(null);
  
  // Visual states
  const [ballPos, setBallPos] = useState<{x: number, y: number, scale: number, rot: number}>({ x: 50, y: 90, scale: 1, rot: 0 });
  const [keeperPos, setKeeperPos] = useState<{x: number, y: number, rotate: number}>({ x: 50, y: 55, rotate: 0 });
  const [timingScale, setTimingScale] = useState(1);
  const [resultText, setResultText] = useState("");
  const [isBallFlying, setIsBallFlying] = useState(false);

  const reqRef = useRef<number>(0);
  const scaleDirRef = useRef<number>(1);
  const scaleRef = useRef<number>(1);

  // Timing Animation
  useEffect(() => {
    if (gameState === 'TIMING') {
      const updateTiming = () => {
        scaleRef.current -= scaleDirRef.current * 0.04; 
        if (scaleRef.current <= 0.2) {
           scaleRef.current = 0.2;
           scaleDirRef.current = -1;
        } else if (scaleRef.current >= 1) {
           scaleRef.current = 1;
           scaleDirRef.current = 1;
        }
        setTimingScale(scaleRef.current);
        reqRef.current = requestAnimationFrame(updateTiming);
      };
      reqRef.current = requestAnimationFrame(updateTiming);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [gameState]);

  const getDirAndHeight = (x: number, y: number): { dir: PenaltyDirection, h: PenaltyHeight } => {
     let dir: PenaltyDirection = 'CENTER';
     let h: PenaltyHeight = 'LOW';
     if (x < 33) dir = 'LEFT';
     else if (x > 66) dir = 'RIGHT';
     if (y < 50) h = 'HIGH';
     return { dir, h };
  };

  const handleGoalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'AIMING' && gameState !== 'TIMING') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (gameState === 'AIMING') {
       setAimPos({ x, y });
       setGameState('TIMING');
    } else if (gameState === 'TIMING') {
       setGameState('SHOOTING');
       takeShot(x, y);
    }
  };

  const takeShot = (x: number, y: number) => {
     const accuracy = 1.0 - ((timingScale - 0.2) / 0.8);
     const { dir, h } = getDirAndHeight(aimPos!.x, aimPos!.y);
     
     const result = handleShot(dir, h, Math.max(0, accuracy));

     if (result) {
        setIsBallFlying(true);
        
        // Where should the ball fly?
        let finalX = aimPos!.x;
        let finalY = aimPos!.y;

        if (currentTurnTeam === 'OPPONENT') {
           // Se o adversário bateu, a bola voa para o alvo DELE (AI), não onde o goleiro clicou.
           if (result.shotTargetDirection === 'LEFT') finalX = 15;
           else if (result.shotTargetDirection === 'RIGHT') finalX = 85;
           else finalX = 50;

           if (result.shotTargetHeight === 'HIGH') finalY = 20;
           else finalY = 80;
        } else {
           // Se o usuário bateu e foi pra fora, desloca o alvo pra fora
           if (!result.isGoal && result.eventDescription.includes('fora')) {
               finalX = finalX > 50 ? finalX + 30 : finalX - 30;
               finalY = finalY - 30;
           }
        }

        // Apply ball translation and rotation
        setBallPos({ x: finalX, y: finalY, scale: 0.2, rot: 720 });
        
        // Animate Keeper
        let kX = 50; let kY = 55; let kRot = 0;
        if (result.keeperJumpDirection === 'LEFT') { kX = 10; kRot = -75; kY = result.keeperJumpHeight === 'HIGH' ? 30 : 70; }
        if (result.keeperJumpDirection === 'RIGHT') { kX = 90; kRot = 75; kY = result.keeperJumpHeight === 'HIGH' ? 30 : 70; }
        
        setKeeperPos({ x: kX, y: kY, rotate: kRot });

        // Delay for UI result
        setTimeout(() => {
           setIsBallFlying(false);
           setResultText(result.eventDescription);
           setGameState('RESULT');

           setTimeout(() => {
              resetPositions();
              setGameState('AIMING');
              setResultText("");
              setAimPos(null);
           }, 2500);

        }, 600);
     }
  };

  const resetPositions = () => {
     setBallPos({ x: 50, y: 95, scale: 1, rot: 0 });
     setKeeperPos({ x: 50, y: 55, rotate: 0 });
  };

  // Cores dinâmicas baseadas no turno
  const isPlayerDefending = currentTurnTeam === 'OPPONENT';
  
  // Personagens
  const ShooterAvatar = () => (
     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-28 z-30 pointer-events-none drop-shadow-2xl transform scale-75 origin-bottom">
        {/* Sombra */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/40 rounded-full blur-sm"></div>
        
        <div className="w-10 h-10 bg-[#ffb686] rounded-full mx-auto border-2 border-black/80 shadow-inner"></div>
        {/* Corpo usando as cores do time (Mockadas como Red para jogador e Blue para oponente) */}
        <div className={`w-16 h-14 ${isPlayerDefending ? 'bg-blue-600' : 'bg-red-600'} mx-auto mt-1 rounded-t-2xl border-2 border-black/80 flex items-center justify-center text-white font-black text-xl shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)]`}>
           {currentTaker.number}
        </div>
        <div className="flex justify-center gap-2 relative z-10">
           <div className="w-5 h-10 bg-white border-2 border-black/80 rounded-b-md"></div>
           <div className="w-5 h-10 bg-white border-2 border-black/80 rounded-b-md"></div>
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
            {/* Braços levantados */}
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
    <div className="min-h-screen bg-[#87CEEB] flex flex-col items-center justify-center font-sans overflow-hidden select-none relative">
      
      {/* CÉU e Arquibancada (Fundo) */}
      <div className="absolute top-0 w-full h-[40%] bg-gradient-to-b from-blue-600 to-blue-300">
         {/* Arquibancada fake */}
         <div className="absolute bottom-0 w-full h-[30%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUxZTFlIiBvcGFjaXR5PSIwLjUiLz48cmVjdCB4PSIyMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFlMWUxZSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-20"></div>
      </div>

      {/* GRAMADO Pseudo-3D */}
      <div className="absolute top-[40%] w-full h-[60%] flex flex-col" style={{ perspective: '1000px' }}>
         <div className="w-full h-full" style={{ 
            backgroundImage: 'repeating-linear-gradient(to bottom, #4caf50 0%, #4caf50 10%, #388e3c 10%, #388e3c 20%)',
            transform: 'rotateX(60deg) scaleY(2)',
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
            <div className="text-xs text-gray-400">{isRealSquad ? 'MATA-MATA' : 'TREINO'}</div>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-gray-300 leading-tight text-right">ADV</div>
            <div className="text-4xl font-black text-white">{opponentScore}</div>
         </div>
      </div>

      {/* MENSAGEM DE TURNO */}
      {!isFinished && gameState === 'AIMING' && (
         <div className="absolute top-[18%] z-50 pointer-events-none">
            <div className={`px-6 py-2 rounded-full font-black text-xl uppercase tracking-widest shadow-xl animate-bounce ${isPlayerDefending ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
               {isPlayerDefending ? 'SUA VEZ DE DEFENDER: MIRE O PULO!' : 'SUA VEZ DE CHUTAR: MIRE O GOL!'}
            </div>
         </div>
      )}

      {/* ÁREA DE JOGO (O GOL) */}
      <div className="relative w-full max-w-4xl aspect-[21/9] mt-[8%] z-10 flex items-end justify-center">
         
         <div 
           className="relative w-[85%] h-[80%] border-t-[16px] border-l-[16px] border-r-[16px] border-gray-100 cursor-crosshair z-20 mb-10"
           onClick={handleGoalClick}
           style={{
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4)), linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.4))',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
              boxShadow: 'inset 0 20px 50px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.3)'
           }}
         >
            {/* Linha do gol no chão */}
            <div className="absolute -bottom-4 left-0 w-full h-4 bg-white/80 blur-[1px]"></div>
            
            {/* Crosshair de Mira */}
            {aimPos && (
               <div 
                 className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                 style={{ left: `${aimPos.x}%`, top: `${aimPos.y}%` }}
               >
                  <div className="w-full h-full relative">
                     {/* Anel pulsante */}
                     <div 
                       className={`absolute inset-0 rounded-full border-[6px] ${timingScale < 0.3 ? 'border-green-400' : timingScale < 0.6 ? 'border-yellow-400' : 'border-red-500'} shadow-[0_0_15px_rgba(255,255,255,0.8)]`}
                       style={{ transform: `scale(${timingScale})`, opacity: gameState === 'SHOOTING' ? 0 : 1 }}
                     ></div>
                     {/* Centro */}
                     <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                  </div>
               </div>
            )}
            
            {/* Keeper Avatar */}
            <KeeperAvatar />

         </div>

         {/* Shooter Avatar */}
         {gameState !== 'SHOOTING' && gameState !== 'RESULT' && <ShooterAvatar />}

         {/* A BOLA */}
         <div 
            className="absolute z-40 transition-all pointer-events-none drop-shadow-[0_15px_10px_rgba(0,0,0,0.5)]"
            style={{ 
               left: `calc(7.5% + ${ballPos.x * 0.85}%)`, // Map the goal percentage to the container
               top: `calc(10% + ${ballPos.y * 0.8}%)`, // Same mapping vertically
               transform: `translate(-50%, -50%) scale(${ballPos.scale})`,
               transitionTimingFunction: isBallFlying ? 'cubic-bezier(0.25, 1, 0.5, 1)' : 'ease-out',
               transitionDuration: isBallFlying ? '600ms' : '0ms'
            }}
         >
            <div 
               className="w-12 h-12 bg-white rounded-full border-2 border-black flex items-center justify-center overflow-hidden shadow-inner"
               style={{
                  transform: `rotate(${ballPos.rot}deg)`,
                  transition: isBallFlying ? 'transform 600ms linear' : 'none'
               }}
            >
               {/* Pattern da bola clássico simplificado */}
               <div className="w-6 h-6 bg-black clip-path-polygon-[50%_0%,_100%_38%,_82%_100%,_18%_100%,_0%_38%]"></div>
               <div className="absolute top-1 left-1 w-3 h-3 bg-black rounded-sm"></div>
               <div className="absolute bottom-1 right-1 w-3 h-3 bg-black rounded-sm"></div>
            </div>
         </div>
      </div>

      {/* EVENT RESULT POPUP */}
      {gameState === 'RESULT' && (
         <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/40 backdrop-blur-sm">
            <div className="bg-black/80 border-4 border-white/20 p-8 rounded-2xl transform scale-110 animate-in zoom-in duration-300 shadow-2xl">
               <h1 className={`text-5xl md:text-7xl font-black uppercase tracking-tighter text-center drop-shadow-2xl ${resultText.includes('Golaço') ? 'text-green-400' : 'text-red-500'}`}>
                  {resultText}
               </h1>
            </div>
         </div>
      )}

      {/* GAME OVER */}
      {isFinished && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-8 backdrop-blur-md">
            <h1 className="text-6xl font-black text-yellow-400 mb-6 uppercase drop-shadow-[0_0_20px_rgba(255,200,0,0.5)]">Disputa Encerrada</h1>
            <p className="text-4xl font-bold text-white mb-12 flex items-center gap-4">
               Vencedor: <span className={winner === 'PLAYER' ? 'text-green-400' : 'text-red-500'}>{winner === 'PLAYER' ? 'SEU TIME' : 'ADVERSÁRIO'}</span>
            </p>
            <button onClick={() => navigate('/clubhouse')} className="bg-gradient-to-b from-blue-500 to-blue-700 text-white font-black text-2xl px-16 py-6 rounded-full border-4 border-blue-400/50 hover:scale-105 transition-all shadow-[0_0_30px_rgba(59,130,246,0.5)] uppercase tracking-widest cursor-pointer">
               Voltar ao Início
            </button>
         </div>
      )}

      {/* FOOTER INFO */}
      <div className="absolute bottom-4 left-6 text-white/70 text-sm font-bold pointer-events-none drop-shadow-md">
         <div>COBRADOR: <span className="text-white">{currentTaker.name}</span> (FIN: {currentTaker.attr_finishing?.toFixed(0)})</div>
         <div>GOLEIRO: <span className="text-white">{currentKeeper.name}</span> (REF: {currentKeeper.attr_reflexes?.toFixed(0)})</div>
      </div>

    </div>
  );
}
