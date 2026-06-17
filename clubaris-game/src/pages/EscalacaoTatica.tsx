import { useGameStore } from '../store/gameStore';
import { SortablePlayerRow } from '../components/SortablePlayerRow';
import { useTranslation } from '../utils/i18n';
import { Link } from 'react-router-dom';
import AssistantTip from '../components/AssistantTip';
import HelpTooltip from '../components/HelpTooltip';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';"@dnd-kit/sortable";

export default function EscalacaoTatica() {
  const { startingXI, autoPick, updateStartingXI, language } = useGameStore();
  const t = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = startingXI.findIndex((p) => p.id === active.id);
      const newIndex = startingXI.findIndex((p) => p.id === over.id);

      const newXI = arrayMove(startingXI, oldIndex, newIndex);
      updateStartingXI(newXI);
    }
  }

  // Position mapping on the pitch
  const pitchPositions = [
    { bottom: "1rem", left: "50%", transform: "translateX(-50%)" }, // GK (0)
    { bottom: "6rem", left: "1rem", transform: "none" }, // LB (1)
    { bottom: "5rem", left: "33%", transform: "translateX(-50%)" }, // CB (2)
    { bottom: "5rem", left: "66%", transform: "translateX(-50%)" }, // CB (3)
    { bottom: "6rem", right: "1rem", transform: "none" }, // RB (4)
    { top: "50%", left: "1rem", transform: "translateY(-50%)" }, // LM (5)
    { top: "50%", left: "33%", transform: "translate(-50%, -50%)" }, // CM (6)
    { top: "50%", left: "66%", transform: "translate(-50%, -50%)" }, // CM (7)
    { top: "50%", right: "1rem", transform: "translateY(-50%)" }, // RM (8)
    { top: "5rem", left: "33%", transform: "translateX(-50%)" }, // ST (9)
    { top: "5rem", left: "66%", transform: "translateX(-50%)" }, // ST (10)
  ];

  const hasInvalidStartingXI = startingXI.slice(0, 11).some(p => p.status === 'injured' || p.status === 'red_card');

  return (
    <main className="mt-20 px-4 flex flex-col gap-4 max-w-lg mx-auto pb-8">
      <AssistantTip tipKey="tip_rest_players" />
      {/* Pitch Container */}
      <section className="relative w-full aspect-[3/4] bg-primary-container border-2 border-on-background overflow-hidden pixel-shadow">
        {/* Pixel Art Pitch Lines */}
        <div className="pitch-grid absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        {/* Halfway line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-on-background/30"></div>
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-on-background/30 rounded-full"></div>
        {/* Penalty Box (Top) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-on-background/30"></div>
        {/* Penalty Box (Bottom) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-on-background/30"></div>

        {/* Player Icons (Mapped from Starting XI) */}
        {startingXI.slice(0, 11).map((player, index) => {
          const pos = pitchPositions[index] || pitchPositions[0];
          return (
            <div
              key={player.id}
              className="absolute flex flex-col items-center z-10"
              style={pos}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 border-on-background flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] ${
                  index === 0
                    ? "bg-secondary-container text-on-secondary"
                    : "bg-primary-fixed text-on-primary"
                }`}
              >
                {player.number}
              </div>
              <span className="bg-surface-container-lowest font-bold tracking-[1px] px-1 mt-1 text-[10px] border border-on-background whitespace-nowrap">
                {player.name}
              </span>
            </div>
          );
        })}
      </section>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={autoPick}
          className="flex-1 bg-surface-container border-2 border-on-background py-3 text-[12px] font-bold tracking-[1px] text-on-surface hover:bg-surface-container-highest active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all pixel-shadow"
        >
          {t('auto_pick', language)}
        </button>
        <button className="flex-1 bg-secondary-container border-2 border-on-background py-3 text-[12px] font-bold tracking-[1px] text-on-secondary hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all pixel-shadow">
          {t('save_tactics', language)}
        </button>
      </div>

      {hasInvalidStartingXI ? (
        <div className="w-full text-center bg-error-container text-on-error-container py-3 text-[12px] font-bold tracking-[1px] border-2 border-error shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] block mt-2 mb-2">
          {t('cant_play_injured', language)}
        </div>
      ) : (
        <Link
          to="/partida"
          className="w-full text-center bg-primary text-on-primary py-3 text-[14px] font-bold tracking-[1px] border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all block mt-2 mb-2"
        >
          {t('play_match', language)}
        </Link>
      )}

      {/* Starting XI List (Drag and Drop) */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <h2 className="bg-primary-container text-on-primary-container px-2 py-1 text-[12px] font-bold tracking-[1px] border-2 border-on-background inline-flex items-center">
            {t('squad_list', language)}
            <HelpTooltip textKey="tooltip_drag" />
          </h2>
          <span className="text-[10px] text-on-surface-variant font-bold tracking-[1px]">
            {t('drag_reorder', language)}
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col border-2 border-on-background overflow-hidden pixel-shadow">
            <SortableContext
              items={startingXI.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {startingXI.map((player, index) => (
                <SortablePlayerRow
                  key={player.id}
                  player={player}
                  index={index}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </section>
    </main>
  );
}
