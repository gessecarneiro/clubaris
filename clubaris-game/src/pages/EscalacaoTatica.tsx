import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Player, Tactic } from '../store/gameStore';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import ShirtIcon from '../components/ShirtIcon';
import { useNavigate } from 'react-router-dom';

const formations: Record<string, any[]> = {
  "4-4-2": [
    { bottom: "2%", left: "50%", transform: "translateX(-50%)", role: "GK" },
    { bottom: "18%", left: "15%", transform: "none", role: "LB" },
    { bottom: "15%", left: "35%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "15%", left: "65%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "18%", right: "15%", transform: "none", role: "RB" },
    { top: "45%", left: "15%", transform: "translateY(-50%)", role: "LM" },
    { top: "48%", left: "35%", transform: "translate(-50%, -50%)", role: "CM" },
    { top: "48%", left: "65%", transform: "translate(-50%, -50%)", role: "CM" },
    { top: "45%", right: "15%", transform: "translateY(-50%)", role: "RM" },
    { top: "15%", left: "35%", transform: "translateX(-50%)", role: "ST" },
    { top: "15%", left: "65%", transform: "translateX(-50%)", role: "ST" },
  ],
  "4-3-3": [
    { bottom: "2%", left: "50%", transform: "translateX(-50%)", role: "GK" },
    { bottom: "18%", left: "15%", transform: "none", role: "LB" },
    { bottom: "15%", left: "35%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "15%", left: "65%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "18%", right: "15%", transform: "none", role: "RB" },
    { top: "48%", left: "35%", transform: "translate(-50%, -50%)", role: "CM" },
    { top: "52%", left: "50%", transform: "translate(-50%, -50%)", role: "CDM" },
    { top: "48%", left: "65%", transform: "translate(-50%, -50%)", role: "CM" },
    { top: "18%", left: "20%", transform: "translateX(-50%)", role: "LW" },
    { top: "12%", left: "50%", transform: "translateX(-50%)", role: "ST" },
    { top: "18%", left: "80%", transform: "translateX(-50%)", role: "RW" },
  ],
  "3-5-2": [
    { bottom: "2%", left: "50%", transform: "translateX(-50%)", role: "GK" },
    { bottom: "15%", left: "25%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "18%", left: "50%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "15%", left: "75%", transform: "translateX(-50%)", role: "CB" },
    { top: "50%", left: "15%", transform: "translateY(-50%)", role: "LM" },
    { top: "55%", left: "35%", transform: "translate(-50%, -50%)", role: "CDM" },
    { top: "45%", left: "50%", transform: "translate(-50%, -50%)", role: "CAM" },
    { top: "55%", left: "65%", transform: "translate(-50%, -50%)", role: "CDM" },
    { top: "50%", right: "15%", transform: "translateY(-50%)", role: "RM" },
    { top: "15%", left: "35%", transform: "translateX(-50%)", role: "ST" },
    { top: "15%", left: "65%", transform: "translateX(-50%)", role: "ST" },
  ],
  "4-2-3-1": [
    { bottom: "2%", left: "50%", transform: "translateX(-50%)", role: "GK" },
    { bottom: "18%", left: "15%", transform: "none", role: "LB" },
    { bottom: "15%", left: "35%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "15%", left: "65%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "18%", right: "15%", transform: "none", role: "RB" },
    { top: "55%", left: "35%", transform: "translate(-50%, -50%)", role: "CDM" },
    { top: "55%", left: "65%", transform: "translate(-50%, -50%)", role: "CDM" },
    { top: "35%", left: "20%", transform: "translateX(-50%)", role: "LM" },
    { top: "35%", left: "50%", transform: "translateX(-50%)", role: "CAM" },
    { top: "35%", left: "80%", transform: "translateX(-50%)", role: "RM" },
    { top: "15%", left: "50%", transform: "translateX(-50%)", role: "ST" },
  ],
  "5-3-2": [
    { bottom: "2%", left: "50%", transform: "translateX(-50%)", role: "GK" },
    { bottom: "25%", left: "15%", transform: "none", role: "LWB" },
    { bottom: "15%", left: "30%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "18%", left: "50%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "15%", left: "70%", transform: "translateX(-50%)", role: "CB" },
    { bottom: "25%", right: "15%", transform: "none", role: "RWB" },
    { top: "48%", left: "35%", transform: "translate(-50%, -50%)", role: "CM" },
    { top: "52%", left: "50%", transform: "translate(-50%, -50%)", role: "CDM" },
    { top: "48%", left: "65%", transform: "translate(-50%, -50%)", role: "CM" },
    { top: "15%", left: "35%", transform: "translateX(-50%)", role: "ST" },
    { top: "15%", left: "65%", transform: "translateX(-50%)", role: "ST" },
  ]
};

const isImprovised = (playerPos: string, slotRole: string) => {
  const defense = ['CB', 'LB', 'RB', 'LWB', 'RWB'];
  const mid = ['CM', 'CDM', 'CAM', 'LM', 'RM'];
  const attack = ['ST', 'LW', 'RW', 'CF'];
  
  if (slotRole === 'GK') return playerPos !== 'GK';
  if (playerPos === 'GK') return true;

  if (defense.includes(slotRole)) return !defense.includes(playerPos);
  if (mid.includes(slotRole)) return !mid.includes(playerPos);
  if (attack.includes(slotRole)) return !attack.includes(playerPos);
  
  return false;
};

function DraggablePlayer({ player, isStarter, styleProps, role }: { player: Player, isStarter: boolean, styleProps?: any, role?: string }) {
  const { tactic } = useGameStore();
  const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
    id: player.id,
    data: { player, isStarter }
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: player.id,
    data: { player, isStarter }
  });

  const setRef = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  const baseClass = isStarter
    ? "absolute flex flex-col items-center z-10 cursor-grab active:cursor-grabbing w-12 md:w-16"
    : "flex flex-col items-center justify-center p-1 cursor-grab active:cursor-grabbing w-16 md:w-20 relative";

  const overClass = isOver ? "brightness-150 scale-110" : "";
  const isInjured = player.injury_days && player.injury_days > 0;
  const isSuspended = player.suspension_games && player.suspension_games > 0;
  const unavailable = isInjured || isSuspended;

  // Improvised logic
  const improvised = isStarter && role ? isImprovised(player.position, role) : false;

  // Roles badges
  const isCap = tactic.captainId === player.id;
  const isPen = tactic.penaltyTakerId === player.id;
  const isFk = tactic.freeKickTakerId === player.id;
  const isCor = tactic.cornerTakerId === player.id;

  const { teamColor1, teamColor2 } = useGameStore();

  const content = (
    <>
      <div className="relative">
        <ShirtIcon player={player} size="large" color1={teamColor1} color2={teamColor2} />
        {improvised && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px] border border-black shadow" title="Improvisado">!</div>
        )}
        {unavailable && (
          <div className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[12px] border border-black shadow" title={isInjured ? "Lesionado" : "Suspenso"}>
            {isInjured ? "✚" : "🟥"}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center mt-1 text-white leading-tight">
        <span className="text-[10px] font-bold truncate w-full text-center bg-black/50 px-1 rounded">{player.name}</span>
        <div className="flex gap-1 text-[9px] font-bold mt-[2px]">
          <span className="text-yellow-400">{player.rating}</span>
          <span className="text-gray-300">{player.position}</span>
        </div>
        {isStarter && role && <span className="text-[8px] uppercase text-gray-400 mt-[1px]">{role}</span>}
        
        {/* Badges container */}
        <div className="flex gap-1 mt-1">
          {isCap && <span className="bg-yellow-600 text-[8px] px-1 rounded font-bold" title="Capitão">C</span>}
          {isPen && <span className="bg-blue-600 text-[8px] px-1 rounded font-bold" title="Pênaltis">P</span>}
          {isFk && <span className="bg-green-600 text-[8px] px-1 rounded font-bold" title="Faltas">F</span>}
          {isCor && <span className="bg-purple-600 text-[8px] px-1 rounded font-bold" title="Escanteios">E</span>}
        </div>
      </div>
    </>
  );

  if (isStarter) {
    return (
      <div
        ref={setRef}
        {...listeners}
        {...attributes}
        className={`${baseClass} ${overClass} transition-all ${unavailable ? 'opacity-50 grayscale' : ''}`}
        style={{
          ...styleProps,
          transform: transformStyle || styleProps?.transform || 'none',
          zIndex: transform ? 50 : 10,
          opacity: transform ? 0.5 : 1
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      ref={setRef}
      {...listeners}
      {...attributes}
      className={`${baseClass} ${isOver ? 'bg-white/30' : ''} hover:bg-white/10 ${unavailable ? 'opacity-50 grayscale' : ''}`}
      style={{
        transform: transformStyle,
        zIndex: transform ? 50 : 1,
        opacity: transform ? 0.5 : 1
      }}
    >
      {content}
    </div>
  );
}

export default function EscalacaoTatica() {
  const { squad, startingXI, bench, autoPick, swapPlayers, tactic, updateTactic } = useGameStore();
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActivePlayer(active.data.current?.player);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActivePlayer(null);
    if (over && active.id !== over.id) {
      swapPlayers(active.id.toString(), over.id.toString());
    }
  }

  const pitchPositions = formations[tactic.formation] || formations["4-4-2"];
  const unrelated = squad.filter(p => !startingXI.find(s => s.id === p.id) && !bench.find(b => b.id === p.id));

  // Auto-assign roles if empty
  useEffect(() => {
    if (startingXI.length > 0) {
      let updates: any = {};
      if (!tactic.captainId) updates.captainId = startingXI[0].id;
      if (!tactic.penaltyTakerId) updates.penaltyTakerId = startingXI[startingXI.length-1].id;
      if (!tactic.freeKickTakerId) updates.freeKickTakerId = startingXI[Math.floor(startingXI.length/2)].id;
      if (!tactic.cornerTakerId) updates.cornerTakerId = startingXI[Math.floor(startingXI.length/2)].id;
      
      if (Object.keys(updates).length > 0) {
        updateTactic(updates);
      }
    }
  }, [tactic.captainId, tactic.penaltyTakerId, tactic.freeKickTakerId, tactic.cornerTakerId, startingXI, updateTactic]);

  return (
    <main className="min-h-screen bg-gray-200 dark:bg-gray-900 font-sans p-4 flex flex-col items-center transition-colors pb-24">
      <div className="w-full flex justify-between items-center mb-4 max-w-6xl">
        <h1 className="text-xl font-black uppercase text-gray-800 dark:text-white">Escalação & Tática</h1>
        <button onClick={() => navigate('/partida')} className="bg-green-700 text-white font-bold px-6 py-2 rounded flex items-center gap-2 hover:bg-green-600">
          <span className="material-symbols-outlined">sports_soccer</span> Jogar Partida
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left: Pitch (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col shrink-0">
             <div className="relative w-full aspect-[3/4] bg-green-700 dark:bg-green-900 border-[6px] border-white/80 dark:border-gray-400/80 shadow-[inset_0px_0px_20px_rgba(0,0,0,0.5)] overflow-hidden transition-colors">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/60 dark:bg-gray-400/60 transition-colors"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/60 dark:border-gray-400/60 rounded-full transition-colors"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b-2 border-x-2 border-white/60 dark:border-gray-400/60 transition-colors"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t-2 border-x-2 border-white/60 dark:border-gray-400/60 transition-colors"></div>

                {startingXI.slice(0, 11).map((player, index) => {
                   const pos = pitchPositions[index] || pitchPositions[0];
                   return <DraggablePlayer key={player.id} player={player} isStarter={true} styleProps={pos} role={pos.role} />;
                })}
             </div>
             <button onClick={autoPick} className="bg-gray-800 text-white w-full py-2 mt-2 font-bold uppercase text-sm hover:bg-gray-700">
               Força Máxima (Auto)
             </button>
          </div>

          {/* Right: Tactics Panel & Reserves (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Tactics Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700 shadow flex flex-col gap-4">
              <h2 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-white uppercase text-sm">Instruções Táticas</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Formação</label>
                  <select 
                    value={tactic.formation}
                    onChange={(e) => updateTactic({ formation: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white font-bold"
                  >
                    {Object.keys(formations).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Mentalidade</label>
                  <select 
                    value={tactic.mentality}
                    onChange={(e) => updateTactic({ mentality: e.target.value as Tactic['mentality'] })}
                    className="border border-gray-300 dark:border-gray-600 p-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white font-bold"
                  >
                    <option value="muito_defensiva">Muito Defensiva</option>
                    <option value="defensiva">Defensiva</option>
                    <option value="equilibrada">Equilibrada</option>
                    <option value="ofensiva">Ofensiva</option>
                    <option value="muito_ofensiva">Muito Ofensiva</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Estilo de Jogo</label>
                  <select 
                    value={tactic.playstyle}
                    onChange={(e) => updateTactic({ playstyle: e.target.value as Tactic['playstyle'] })}
                    className="border border-gray-300 dark:border-gray-600 p-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white font-bold"
                  >
                    <option value="posse">Posse de Bola</option>
                    <option value="contra_ataque">Contra-ataque</option>
                    <option value="direto">Jogo Direto (Lançamentos)</option>
                    <option value="pressao">Pressão Alta</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Intensidade</label>
                  <select 
                    value={tactic.intensity}
                    onChange={(e) => updateTactic({ intensity: e.target.value as Tactic['intensity'] })}
                    className="border border-gray-300 dark:border-gray-600 p-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white font-bold"
                  >
                    <option value="baixa">Baixa (Poupança)</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta (Mais lesões/cartões)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Roles Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700 shadow flex flex-col gap-4">
              <h2 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-white uppercase text-sm">Funções</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Capitão", key: "captainId" },
                  { label: "Pênaltis", key: "penaltyTakerId" },
                  { label: "Faltas", key: "freeKickTakerId" },
                  { label: "Escanteios", key: "cornerTakerId" }
                ].map(role => (
                  <div key={role.key} className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{role.label}</label>
                    <select 
                      value={(tactic as any)[role.key] || ""}
                      onChange={(e) => updateTactic({ [role.key]: e.target.value })}
                      className="border border-gray-300 dark:border-gray-600 p-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white font-bold truncate"
                    >
                      <option value="">Selecione</option>
                      {startingXI.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Banco e Restantes */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 h-full min-h-[300px]">
              
              {/* Banco de Reservas */}
              <div className="flex-1 flex flex-col border border-gray-300 dark:border-gray-700 shadow bg-white dark:bg-gray-800 h-full">
                 <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white text-[12px] font-bold px-3 py-2 border-b border-gray-300 dark:border-gray-700 uppercase tracking-widest flex justify-between">
                    <span>Reservas ({bench.length}/12)</span>
                 </div>
                 <div className="flex-1 p-2 flex flex-wrap content-start gap-x-2 gap-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 max-h-[400px]">
                    {bench.map((player) => (
                       <DraggablePlayer key={player.id} player={player} isStarter={false} />
                    ))}
                 </div>
              </div>

              {/* Não Relacionados */}
              <div className="flex-1 flex flex-col border border-gray-300 dark:border-gray-700 shadow bg-white dark:bg-gray-800 h-full">
                 <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white text-[12px] font-bold px-3 py-2 border-b border-gray-300 dark:border-gray-700 uppercase tracking-widest flex justify-between">
                    <span>Não Relacionados ({unrelated.length})</span>
                    <span className="text-red-500 text-[10px] flex gap-2">
                      <span title="Lesionados">✚</span>
                      <span title="Suspensos">🟥</span>
                    </span>
                 </div>
                 <div className="flex-1 p-2 flex flex-wrap content-start gap-x-2 gap-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 max-h-[400px]">
                    {unrelated.map((player) => (
                       <DraggablePlayer key={player.id} player={player} isStarter={false} />
                    ))}
                 </div>
              </div>

            </div>

          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activePlayer ? (
            <div className="scale-125 opacity-90 drop-shadow-xl cursor-grabbing flex flex-col items-center">
              <ShirtIcon player={activePlayer} size="large" color1={useGameStore.getState().teamColor1} color2={useGameStore.getState().teamColor2} />
              <span className="text-[10px] font-bold text-white bg-black/50 px-1 mt-1 rounded">{activePlayer.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
