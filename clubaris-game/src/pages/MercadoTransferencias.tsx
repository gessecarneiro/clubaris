import { useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function MercadoTransferencias() {
  const [filterPos, setFilterPos] = useState("ALL");

  const marketPlayers = [
    {
      id: "m1",
      name: "ERLING B.",
      position: "ST",
      rating: 91,
      age: 23,
      value: 42500000,
      tier: "GOLD ELITE",
    },
    {
      id: "m2",
      name: "KEVIN D. B.",
      position: "CAM",
      rating: 89,
      age: 32,
      value: 38000000,
      tier: "GOLD ELITE",
    },
    {
      id: "m3",
      name: "KYLE W.",
      position: "RB",
      rating: 78,
      age: 33,
      value: 12200000,
      tier: "SILVER PRO",
    },
    {
      id: "m4",
      name: "EDERSON M.",
      position: "GK",
      rating: 85,
      age: 30,
      value: 22500000,
      tier: "IN NEGOTIATION",
      locked: true,
    },
  ];

  return (
    <main className="mt-20 pb-20 px-4 max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4">
      {/* Sidebar Filter */}
      <aside className="w-full md:w-64 flex flex-col gap-4 shrink-0">
        <div className="border-2 border-on-background bg-surface-container p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <h2 className="text-[20px] font-bold mb-2 text-secondary">FILTERS</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-bold tracking-[1px] text-on-surface-variant block mb-1">
                POSITION
              </label>
              <select
                className="w-full bg-surface-container-lowest border-2 border-on-background p-1 text-on-surface focus:outline-none"
                value={filterPos}
                onChange={(e) => setFilterPos(e.target.value)}
              >
                <option value="ALL">ALL POSITIONS</option>
                <option value="FWD">FORWARD</option>
                <option value="MID">MIDFIELDER</option>
                <option value="DEF">DEFENDER</option>
                <option value="GK">GOALKEEPER</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-bold tracking-[1px] text-on-surface-variant block mb-1">
                MAX PRICE
              </label>
              <input
                className="w-full accent-primary bg-surface-container-high h-2"
                max="100"
                min="0"
                type="range"
                defaultValue="50"
              />
              <div className="flex justify-between mt-1 text-[12px] font-bold text-primary">
                <span>$0M</span>
                <span>$100M</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 bg-secondary-container text-on-secondary-fixed py-2 text-[16px] font-bold border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            APPLY
          </button>
        </div>
      </aside>

      {/* Search and Results */}
      <section className="flex-1 flex flex-col gap-4">
        <div className="border-2 border-on-background bg-surface-container-high p-2 flex gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <div className="flex-1 flex items-center gap-2 px-2">
            <span className="material-symbols-outlined text-on-surface-variant">
              search
            </span>
            <input
              className="bg-transparent border-none focus:outline-none w-full text-on-surface placeholder:text-outline"
              placeholder="SEARCH PLAYER NAME..."
              type="text"
            />
          </div>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {marketPlayers.map((player) => (
            <article
              key={player.id}
              className={`border-2 border-on-background bg-surface-container shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col ${
                player.locked ? "opacity-60" : ""
              }`}
            >
              <div
                className={`${
                  player.locked
                    ? "bg-error-container text-on-error-container"
                    : "bg-primary-container text-on-primary-container"
                } p-1 px-2 flex justify-between items-center border-b-2 border-on-background text-[10px] font-bold tracking-[1px]`}
              >
                <span
                  className={
                    player.locked
                      ? "bg-error px-1"
                      : "bg-secondary-container text-on-secondary-container px-1"
                  }
                >
                  {player.tier}
                </span>
                <span>ID: {player.id.replace("m", "00")}</span>
              </div>

              <div className="flex flex-1 p-3 gap-3">
                <div className="w-20 h-20 border-2 border-on-background bg-surface-container-lowest shrink-0 relative flex items-center justify-center">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant">
                    person
                  </span>
                  <div className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container text-[14px] font-bold px-1 border-l-2 border-t-2 border-on-background">
                    {player.rating}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[20px] font-bold text-on-surface leading-none">
                      {player.name}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-secondary text-[10px] font-bold tracking-[1px]">
                        {player.position}
                      </span>
                      <span className="text-on-surface-variant text-[10px] font-bold tracking-[1px]">
                        AGE {player.age}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-high p-2 flex justify-between items-center border-t-2 border-on-background">
                <div className="flex flex-col pl-1">
                  <span className="text-[10px] font-bold tracking-[1px] text-on-surface-variant">
                    MARKET VALUE
                  </span>
                  <span className="text-[18px] font-bold text-secondary-fixed">
                    ${(player.value / 1000000).toFixed(1)}M
                  </span>
                </div>
                <button
                  disabled={player.locked}
                  className={`${
                    player.locked
                      ? "bg-outline text-surface-variant cursor-not-allowed"
                      : "bg-primary-container text-on-primary-container active:translate-x-[2px] active:translate-y-[2px] hover:bg-primary-fixed hover:text-on-primary-fixed shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none"
                  } px-3 py-1 border-2 border-on-background text-[12px] font-bold tracking-[1px] transition-all flex items-center gap-1`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {player.locked ? "lock" : "shopping_basket"}
                  </span>
                  {player.locked ? "LOCKED" : "BUY NOW"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
