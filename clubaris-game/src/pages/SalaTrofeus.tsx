import { useGameStore } from "../store/gameStore";

export default function SalaTrofeus() {
  const { language, trophies, teamName, badgeUrl } = useGameStore();

  return (
    <main className="font-sans text-black dark:text-white min-h-[70vh] px-4 py-6 max-w-7xl mx-auto flex flex-col gap-6 transition-colors">
      <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="bg-green-800 dark:bg-green-900 text-white font-bold text-[12px] uppercase px-3 py-2 border-b-2 border-black dark:border-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">emoji_events</span> 
            <span>{language === 'pt' ? "Sala de Troféus" : language === 'es' ? "Sala de Trofeos" : "Trophy Room"}</span>
          </div>
        </div>

        <div className="p-6 md:p-12 relative overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col items-center">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] mb-4 p-2">
              {badgeUrl ? <img src={badgeUrl} alt={teamName} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-4xl text-gray-400">shield</span>}
            </div>
            <h2 className="text-xl font-black tracking-[2px] uppercase text-center bg-green-800 dark:bg-green-900 text-white px-4 py-1 border-2 border-black dark:border-gray-900">{teamName || "LEGENDARY CLUB"}</h2>
          </div>

          <div className="w-full bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-6 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5)] min-h-[300px] relative z-10">
            {trophies.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">shelves</span>
                <p className="text-[14px] font-black tracking-[1px] uppercase text-center">
                  {language === 'pt' ? "A estante de troféus está vazia." : language === 'es' ? "El estante de trofeos está vacío." : "The trophy cabinet is empty."}
                </p>
                <p className="text-[10px] font-bold tracking-[1px] uppercase text-center mt-2 opacity-70">
                  {language === 'pt' ? "Jogue temporadas e vença campeonatos para preenchê-la!" : language === 'es' ? "¡Juega temporadas y gana campeonatos para llenarlo!" : "Play seasons and win championships to fill it!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 gap-y-12 mb-8 relative">
                {trophies.map((trophy, i) => (
                  <div key={i} className="flex flex-col items-center group cursor-pointer">
                    <div className="w-20 h-24 flex items-end justify-center relative mb-2 transition-transform group-hover:-translate-y-2">
                      <div className="absolute bottom-0 w-16 h-4 bg-black rounded-[50%] blur-sm opacity-20 dark:opacity-50"></div>
                      {trophy.imageUrl ? (
                         <img src={trophy.imageUrl} alt={trophy.name} className="relative z-10 w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                              onError={(e) => { (e.target as HTMLImageElement).src = '/trophies/generic.png'; }} />
                      ) : (
                         <img src="/trophies/generic.png" alt={trophy.name} className="relative z-10 w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
                      )}
                    </div>
                    <span className="text-[10px] font-black tracking-[1px] bg-gray-200 dark:bg-gray-700 text-black dark:text-white border border-black dark:border-gray-500 px-2 py-0.5 shadow-sm">
                      {trophy.year}
                    </span>
                    <span className="text-[10px] font-bold tracking-[1px] text-center mt-2 uppercase text-gray-800 dark:text-gray-200">
                      {trophy.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
