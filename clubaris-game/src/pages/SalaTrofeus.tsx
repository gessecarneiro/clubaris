import { useGameStore } from "../store/gameStore";
import BottomNav from "../components/BottomNav";

export default function SalaTrofeus() {
  const { language, trophies, teamName, badgeUrl } = useGameStore();

  return (
    <>
      <main className="mt-20 mb-24 px-4 lg:px-8 max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold tracking-[2px] mb-6 flex items-center gap-2 uppercase">
          <span className="material-symbols-outlined text-3xl text-primary">emoji_events</span> 
          {language === 'pt' ? "Sala de Troféus" : "Trophy Room"}
        </h1>

        <div className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] p-6 md:p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-surface-variant border-4 border-on-background overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] mb-4 p-2">
              {badgeUrl ? <img src={badgeUrl} alt={teamName} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-4xl">shield</span>}
            </div>
            <h2 className="text-xl font-bold tracking-[2px] uppercase text-center bg-primary text-on-primary px-4 py-1 border-2 border-on-background">{teamName || "LEGENDARY CLUB"}</h2>
          </div>

          <div className="bg-surface-variant border-2 border-on-background p-6 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5)] min-h-[300px]">
            {trophies.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-6xl mb-4">shelves</span>
                <p className="text-[14px] font-bold tracking-[2px] uppercase text-center">
                  {language === 'pt' ? "A estante de troféus está vazia." : "The trophy cabinet is empty."}
                </p>
                <p className="text-[10px] font-bold tracking-[1px] uppercase text-center mt-2">
                  {language === 'pt' ? "Jogue temporadas e vença campeonatos para preenchê-la!" : "Play seasons and win championships to fill it!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {trophies.map((trophy, i) => (
                  <div key={i} className="flex flex-col items-center group cursor-pointer">
                    <div className="w-20 h-24 flex items-end justify-center relative mb-2 transition-transform group-hover:-translate-y-2">
                      <div className="absolute bottom-0 w-16 h-4 bg-on-background rounded-[50%] blur-sm opacity-20"></div>
                      <span className="material-symbols-outlined text-[80px] text-[#FFD700] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        emoji_events
                      </span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[1px] bg-background border-2 border-on-background px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                      {trophy.year}
                    </span>
                    <span className="text-[10px] font-bold tracking-[1px] text-center mt-2 uppercase">
                      {trophy.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
