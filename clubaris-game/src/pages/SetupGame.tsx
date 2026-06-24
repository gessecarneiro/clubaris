import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import leaguesData from "../data/leagues.json";
import teamsData from "../data/teams.json";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createNewSave } from "../lib/supabaseServices";

export default function SetupGame() {
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['Brasil']);
  const navigate = useNavigate();

  const { managerName, managerStyle, managerAvatar, setSetup, language, setLanguage } = useGameStore();

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]);
  };

  const groupedLeagues = leaguesData.reduce((acc, league) => {
    if (!acc[league.folder]) acc[league.folder] = [];
    acc[league.folder].push(league);
    return acc;
  }, {} as Record<string, any[]>);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (managerName && selectedTeam) {
      const team = teamsData.find((t) => t.id === selectedTeam);
      if (team) {
        setIsLoading(true);
        try {
          // Create save on Supabase (needs manager_style and manager_avatar)
          const saveId = await createNewSave(managerName, managerStyle, managerAvatar, team.name, team.id);

          // Initialize players locally with 100% energy and morale
          const squadWithStats = team.squad.map((p: any) => ({
            ...p,
            energy: 100,
            morale: 100,
            status: "OK",
          }));
          
          // Use 2026 as starting year
          setSetup(saveId, team.id, team.name, squadWithStats, 2026);
          useGameStore.getState().startTour();
          navigate("/clubhouse");
        } catch (error: any) {
          console.error("Failed to create save in Supabase:", error);
          alert(`Erro ao criar o save no banco de dados.\nDetalhes: ${error.message}\nVerifique as credenciais e tabelas do Supabase.`);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const toggleLanguage = () => {
    if (language === "pt") setLanguage("en");
    else if (language === "en") setLanguage("es");
    else setLanguage("pt");
  };

  const availableTeams = teamsData.filter((t) => t.leagueId === selectedLeague);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#c8c8c8] text-[#e2e2e2] font-sans flex flex-col p-4"
    >
      {/* Top Header */}
      <div className="text-center py-4 bg-gradient-to-b from-[#003366] to-[#001f3f] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] mb-6 max-w-6xl w-full mx-auto">
         <h1 className="text-[24px] font-black text-[#ffd700] tracking-tighter uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
           LEGENDARY CLUB
         </h1>
         <p className="text-[12px] font-bold text-white tracking-[2px] opacity-80">
           {language === 'pt' ? 'Configurações iniciais' : language === 'es' ? 'Configuraciones iniciales' : 'Initial Settings'}
         </p>
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6">
         {/* Left Column - Leagues */}
         <div className="flex-1 flex flex-col gap-2">
            <h2 className="text-[14px] font-bold text-[#ffd700] uppercase mb-2">
               {language === 'pt' ? 'Ligas Nacionais' : language === 'es' ? 'Ligas Nacionales' : 'National Leagues'}
            </h2>
            <div className="bg-[#f0f0f0] flex-1 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col text-black">
               <div className="flex bg-gray-200 border-b border-black text-[12px] font-bold p-1">
                  <div className="w-8 text-center">X</div>
                  <div className="flex-1">{language === 'pt' ? 'País' : language === 'es' ? 'País' : 'Country'}</div>
               </div>
               <div className="flex-1 min-h-[250px] overflow-y-auto bg-white">
                  {Object.entries(groupedLeagues).map(([folder, leagues]) => (
                     <div key={folder}>
                        <div 
                           onClick={() => toggleFolder(folder)}
                           className="flex p-1 text-[12px] cursor-pointer bg-gray-200 border-b border-gray-300 font-bold hover:bg-gray-300"
                        >
                           <span className="w-6 text-center font-mono">
                              {expandedFolders.includes(folder) ? '[-]' : '[+]'}
                           </span>
                           <span className="flex-1">{folder}</span>
                        </div>
                        {expandedFolders.includes(folder) && leagues.map(league => (
                           <div 
                              key={league.id} 
                              onClick={() => setSelectedLeague(league.id)}
                              className={`flex p-1 pl-4 text-[12px] cursor-pointer border-b border-gray-300 ${selectedLeague === league.id ? 'bf-select' : 'hover:bg-gray-100 text-black'}`}
                           >
                              <span className="text-gray-500 mr-2">|--</span>
                              <div className="flex-1 flex items-center font-bold">
                                 {league.name}
                              </div>
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Column - Teams */}
         <div className="flex-1 flex flex-col gap-2">
            <h2 className="text-[14px] font-bold text-[#ffd700] uppercase mb-2">
               {language === 'pt' ? 'Times Disponíveis' : language === 'es' ? 'Equipos Disponibles' : 'Available Teams'}
            </h2>
            <div className="bg-[#f0f0f0] flex-1 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col text-black">
               <div className="flex bg-gray-200 border-b border-black text-[12px] font-bold p-1">
                  <div className="flex-1 px-2">{language === 'pt' ? 'Time' : language === 'es' ? 'Equipo' : 'Team'}</div>
                  <div className="w-16 text-center">OVR</div>
               </div>
               <div className="flex-1 min-h-[250px] overflow-y-auto">
                  {availableTeams.length > 0 ? availableTeams.map((team) => (
                     <div 
                        key={team.id} 
                        onClick={() => setSelectedTeam(team.id)}
                        className={`flex p-1 text-[12px] cursor-pointer border-b border-gray-300 ${selectedTeam === team.id ? 'bf-select' : 'hover:bg-gray-100'}`}
                     >
                        <div className="flex-1 px-2 flex items-center font-bold truncate">
                           {team.name}
                        </div>
                        <div className="w-16 text-center font-bold text-gray-600">
                           {team.rating}
                        </div>
                     </div>
                  )) : (
                     <div className="p-4 text-center text-gray-500 text-[12px] font-bold">
                        {language === 'pt' ? 'Selecione uma liga.' : language === 'es' ? 'Seleccione una liga.' : 'Select a league.'}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="max-w-6xl w-full mx-auto p-4 mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
         <div className="bg-[#003366] border border-black p-4 flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] w-full md:w-1/2">
            <div className="flex items-center gap-2">
               <label className="text-[12px] font-bold text-white w-24 text-right">
                  {language === 'pt' ? 'Nome:' : language === 'es' ? 'Nombre:' : 'Name:'}
               </label>
                <div className="flex-1 bg-gray-200 border border-black px-2 py-1 text-black text-[12px] font-bold">
                   {managerName} {managerAvatar}
                </div>
             </div>
            <div className="flex items-center gap-2">
               <label className="text-[12px] font-bold text-white w-24 text-right">
                  {language === 'pt' ? 'Time:' : language === 'es' ? 'Equipo:' : 'Team:'}
               </label>
               <div className="flex-1 bg-gray-200 border border-black px-2 py-1 text-black text-[12px] font-bold truncate">
                  {teamsData.find(t => t.id === selectedTeam)?.name || '---'}
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
            <button 
               onClick={toggleLanguage}
               disabled={isLoading}
               className="bg-gray-200 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] font-bold text-black px-4 py-2 text-[12px] uppercase active:translate-y-[2px] active:shadow-none hover:bg-white disabled:opacity-50"
            >
               {language.toUpperCase()}
            </button>
            <button 
               onClick={handleStart}
               disabled={!managerName || !selectedTeam || isLoading}
               className="flex-1 md:flex-none bg-[#3a7c29] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] font-bold text-white px-8 py-3 text-[14px] uppercase active:translate-y-[2px] active:shadow-none hover:bg-[#489933] disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isLoading ? '...' : (language === 'pt' ? 'Iniciar Jogo' : language === 'es' ? 'Iniciar Juego' : 'Start Game')}
            </button>
         </div>
      </div>
    </motion.div>
  );
}
