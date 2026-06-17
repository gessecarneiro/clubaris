import { useState } from "react";
import teamsData from "../data/teams.json";
import { useTranslation } from "../utils/i18n";
import { useGameStore } from "../store/gameStore";
import BottomNav from "../components/BottomNav";

export default function Clubes() {
  const { language } = useGameStore();
  const t = useTranslation();
  
  const [selectedLeague, setSelectedLeague] = useState<string>("brazil_a");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const leagues = Array.from(new Set(teamsData.map(t => t.leagueId)));
  const filteredTeams = teamsData.filter(t => t.leagueId === selectedLeague);
  const teamDetails = teamsData.find(t => t.id === selectedTeam);

  return (
    <>
      <main className="mt-20 mb-24 px-4 lg:px-8 max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold tracking-[2px] mb-6 flex items-center gap-2 uppercase">
          <span className="material-symbols-outlined text-3xl text-primary">public</span> 
          {language === 'pt' ? "Clubes & Ligas" : "Clubs & Leagues"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ligas e Times */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="bg-surface-container border-2 border-on-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
              <label className="text-[10px] font-bold tracking-[1px] uppercase text-on-surface-variant block mb-2">
                {language === 'pt' ? "Selecione a Liga" : "Select League"}
              </label>
              <select 
                className="w-full bg-background border-2 border-on-background p-2 text-sm font-bold uppercase focus:outline-none focus:border-primary"
                value={selectedLeague}
                onChange={(e) => { setSelectedLeague(e.target.value); setSelectedTeam(null); }}
              >
                {leagues.map(l => (
                  <option key={l} value={l}>{l.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex-1 overflow-y-auto max-h-[500px]">
              <div className="bg-surface-variant px-3 py-2 border-b-2 border-on-background">
                <h2 className="text-[12px] font-bold tracking-[1px] uppercase">{language === 'pt' ? "Times" : "Teams"}</h2>
              </div>
              <ul className="divide-y-2 divide-on-background/10">
                {filteredTeams.map(t => (
                  <li 
                    key={t.id} 
                    className={`p-3 cursor-pointer hover:bg-primary-container/20 flex items-center gap-3 transition-colors ${selectedTeam === t.id ? 'bg-primary-container/40 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setSelectedTeam(t.id)}
                  >
                    <div className="w-8 h-8 bg-surface-variant border-2 border-on-background overflow-hidden flex items-center justify-center shrink-0">
                      {t.badgeUrl ? <img src={t.badgeUrl} alt={t.name} className="w-full h-full object-contain p-1" /> : <span className="material-symbols-outlined text-sm">shield</span>}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold tracking-[1px]">{t.name}</span>
                      <span className="text-[10px] text-on-surface-variant">OVR: {t.rating}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Elenco do Time */}
          <div className="col-span-1 lg:col-span-2">
            {teamDetails ? (
              <div className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] h-full flex flex-col">
                <div className="bg-primary-container px-6 py-4 border-b-2 border-on-background flex items-center gap-4 shrink-0">
                  <div className="w-16 h-16 bg-surface-variant border-2 border-on-background overflow-hidden flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                    {teamDetails.badgeUrl ? <img src={teamDetails.badgeUrl} alt={teamDetails.name} className="w-full h-full object-contain p-1" /> : <span className="material-symbols-outlined text-2xl">shield</span>}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-[1px] text-on-primary-container uppercase">{teamDetails.name}</h2>
                    <span className="text-[10px] font-bold tracking-[1px] bg-primary text-on-primary px-2 py-0.5 uppercase mt-1 inline-block border-2 border-on-background">OVR {teamDetails.rating}</span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                   <h3 className="text-[12px] font-bold tracking-[1px] uppercase mb-4 text-on-surface-variant border-b-2 border-on-background/20 pb-2">{language === 'pt' ? "Elenco Principal" : "First Team Squad"}</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     {teamDetails.squad.map((p: any) => (
                       <div key={p.id} className="flex items-center gap-3 bg-surface-variant border-2 border-on-background p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                         <div className={`w-8 h-8 flex items-center justify-center border-2 border-on-background text-[10px] font-bold tracking-[1px]
                            ${p.position.includes('GK') ? 'bg-secondary-container text-on-secondary-container' : 
                              p.position.includes('CB') || p.position.includes('LB') || p.position.includes('RB') ? 'bg-tertiary-container text-on-tertiary-container' :
                              p.position.includes('CM') || p.position.includes('CDM') || p.position.includes('CAM') || p.position.includes('RM') || p.position.includes('LM') ? 'bg-primary-container text-on-primary-container' :
                              'bg-error-container text-on-error-container'
                            }
                         `}>
                           {p.position}
                         </div>
                         <div className="flex-1 overflow-hidden">
                           <div className="text-[12px] font-bold truncate">{p.name}</div>
                         </div>
                         <div className="w-8 text-center text-[12px] font-bold text-primary">
                           {p.rating}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] h-full flex flex-col items-center justify-center p-8 text-on-surface-variant text-center border-dashed">
                 <span className="material-symbols-outlined text-6xl mb-4 opacity-50">travel_explore</span>
                 <p className="text-[14px] font-bold tracking-[1px] uppercase">{language === 'pt' ? "Selecione um time para ver o elenco" : "Select a team to view squad"}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
