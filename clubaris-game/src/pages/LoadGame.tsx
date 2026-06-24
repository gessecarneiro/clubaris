import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useGameStore } from "../store/gameStore";
import { loadSaveGame } from "../lib/supabaseServices";
import { motion } from "framer-motion";

export default function LoadGame() {
  const [saves, setSaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();
  const { loadSave, language } = useGameStore();

  useEffect(() => {
    async function fetchSaves() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saves")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching saves:", error);
      } else {
        setSaves(data || []);
      }
      setIsLoading(false);
    }
    fetchSaves();
  }, []);

  const handleLoadSave = async (saveId: string) => {
    setIsStarting(true);
    try {
      const { save, players, clubs } = await loadSaveGame(saveId);
      
      const playerClub = (clubs ?? []).find((c: any) => c.original_id === save.player_team_id);
      const squad = (players ?? []).filter((p: any) => p.club_id === playerClub!.id);

      loadSave(save, squad);
      navigate("/clubhouse");
    } catch (error) {
      console.error("Error loading save:", error);
      alert("Error loading save. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#c8c8c8] text-[#e2e2e2] font-sans flex flex-col p-4 items-center justify-center"
    >
      <div className="max-w-2xl w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] flex flex-col text-black">
        <div className="bg-gradient-to-b from-[#003366] to-[#001f3f] text-white p-4 border-b-2 border-black flex justify-between items-center">
          <h1 className="text-[20px] font-black tracking-tighter uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
            {language === 'pt' ? 'Carregar Jogo' : language === 'es' ? 'Cargar Juego' : 'Load Game'}
          </h1>
          <button 
            onClick={() => navigate("/")}
            className="text-[12px] font-bold uppercase hover:text-gray-300"
          >
            {language === 'pt' ? 'Voltar' : language === 'es' ? 'Volver' : 'Back'}
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-center font-bold">{language === 'pt' ? 'Carregando...' : 'Loading...'}</p>
          ) : saves.length === 0 ? (
            <p className="text-center font-bold text-gray-500">
              {language === 'pt' ? 'Nenhum jogo salvo encontrado.' : language === 'es' ? 'No se encontraron juegos guardados.' : 'No saved games found.'}
            </p>
          ) : (
            saves.map((save) => (
              <div 
                key={save.id}
                className="border border-black bg-gray-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] flex justify-between items-center hover:bg-gray-200 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-[16px] font-black uppercase tracking-tight text-[#003366]">{save.team_name}</h2>
                  <p className="text-[12px] font-bold text-gray-700">Manager: {save.manager_name}</p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(save.game_date).toLocaleDateString()} - {language === 'pt' ? 'Saldo:' : 'Balance:'} ${save.balance.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleLoadSave(save.id)}
                  disabled={isStarting}
                  className="bg-[#3a7c29] text-white font-bold text-[12px] px-6 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] uppercase hover:bg-[#489933] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                >
                  {isStarting ? '...' : (language === 'pt' ? 'Carregar' : 'Load')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
