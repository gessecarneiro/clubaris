import { useGameStore } from "../store/gameStore";

export default function TopBar({
  title = "LEGENDARY CLUB",
}: {
  title?: string;
}) {
  const { balance } = useGameStore();

  // Format balance to millions
  const formattedBalance = `$${(balance / 1000000).toFixed(1)}M`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 py-2 border-b-2 border-on-background bg-surface-container-high shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          sports_soccer
        </span>
        <h1 className="text-[20px] leading-[28px] font-bold text-secondary-container tracking-tighter uppercase">
          {title}
        </h1>
      </div>
      <div className="bg-primary-container px-3 py-1 border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
        <span className="text-[18px] font-bold text-primary-fixed">
          {formattedBalance}
        </span>
      </div>
    </header>
  );
}
