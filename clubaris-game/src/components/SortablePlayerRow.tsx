import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Player } from '../store/gameStore';

interface SortablePlayerRowProps {
  player: Player;
  index: number;
}

export function SortablePlayerRow({ player, index }: SortablePlayerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isStarter = index < 11;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center justify-between p-2 border-b-2 border-on-background/20 last:border-b-0 cursor-grab active:cursor-grabbing hover:bg-surface-container-highest ${index % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container-high'} ${!isStarter ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="material-symbols-outlined text-on-surface-variant cursor-grab active:cursor-grabbing hover:text-primary">drag_indicator</div>
        <span className={`font-bold text-[18px] w-6 ${isStarter ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>{String(player.number).padStart(2, '0')}</span>
        <span className="text-[16px] text-on-background">{player.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold tracking-[1px] text-outline">{player.position}</span>
        <span className={`text-[12px] font-bold tracking-[1px] ${isStarter ? 'text-primary' : 'text-on-surface-variant'}`}>{player.rating}</span>
      </div>
    </div>
  );
}