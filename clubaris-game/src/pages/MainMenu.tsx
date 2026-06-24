import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

export default function MainMenu() {
  const navigate = useNavigate();
  const { teamName, language, setLanguage, clearSave, user } = useGameStore();

  const handleNewGame = () => {
    clearSave();
    navigate("/criar-treinador");
  };

  const handleContinue = () => {
    navigate("/clubhouse");
  };

  const handleLoadGame = () => {
    navigate("/load");
  };

  const toggleLanguage = () => {
    if (language === "pt") setLanguage("en");
    else if (language === "en") setLanguage("es");
    else setLanguage("pt");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    useGameStore.getState().setUser(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-[#001f3f] to-[#000a14] text-[#e2e2e2] font-sans flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 2px, transparent 2px)', backgroundSize: '64px 64px' }}></div>

      <div className="z-10 flex flex-col items-center gap-12 w-full max-w-md p-8">
        <div className="text-center">
          <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[48px] md:text-[64px] font-black text-[#ffd700] tracking-tighter uppercase leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          >
            CLUBARIS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[16px] font-bold text-white tracking-[4px] uppercase mt-2 opacity-80"
          >
            {language === 'pt' ? 'O Clássico Reimaginado' : language === 'es' ? 'El Clásico Reimaginado' : 'The Classic Reimagined'}
          </motion.p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm mt-8 relative z-10">
          {user?.email === 'carneiro.gesse@gmail.com' && (
            <button
              onClick={() => navigate("/admin")}
              className="group relative flex items-center justify-center p-4 bg-purple-900 border-2 border-white/20 hover:border-white transition-all transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/10 to-purple-500/0 group-hover:translate-x-full duration-1000 ease-in-out -translate-x-full"></div>
              <span className="material-symbols-outlined absolute left-4 text-purple-300">admin_panel_settings</span>
              <span className="font-title text-xl uppercase tracking-widest text-white">Painel Admin</span>
            </button>
          )}

          {teamName && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="w-full bg-gradient-to-b from-[#2a7d2a] to-[#1e5c1e] text-white font-bold text-[18px] py-4 shadow-[0_4px_15px_rgba(42,125,42,0.4)] border-b-4 border-[#143d14] rounded-sm uppercase tracking-wide transition-all cursor-pointer"
            >
              {language === 'pt' ? 'Continuar Jogo' : language === 'es' ? 'Continuar Juego' : 'Continue Game'}
            </motion.button>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewGame}
            className="w-full bg-gradient-to-b from-[#f0f0f0] to-[#cccccc] text-[#001f3f] font-bold text-[18px] py-4 shadow-[0_4px_15px_rgba(255,255,255,0.2)] border-b-4 border-[#999999] rounded-sm uppercase tracking-wide transition-all cursor-pointer"
          >
            {language === 'pt' ? 'Novo Jogo' : language === 'es' ? 'Nuevo Juego' : 'New Game'}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoadGame}
            className="w-full bg-gradient-to-b from-[#f0f0f0] to-[#cccccc] text-[#001f3f] font-bold text-[18px] py-4 shadow-[0_4px_15px_rgba(255,255,255,0.2)] border-b-4 border-[#999999] rounded-sm uppercase tracking-wide transition-all cursor-pointer"
          >
            {language === 'pt' ? 'Carregar Jogo' : language === 'es' ? 'Cargar Juego' : 'Load Game'}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/penalty-training')}
            className="w-full mt-4 bg-gradient-to-b from-[#ff8c00] to-[#cc7000] text-white font-bold text-[18px] py-4 shadow-[0_4px_15px_rgba(255,140,0,0.4)] border-b-4 border-[#995400] rounded-sm uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">sports_soccer</span>
            {language === 'pt' ? 'Extras: Pênaltis' : 'Extras: Penalties'}
          </motion.button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex gap-4"
        >
          <button 
             onClick={toggleLanguage}
             className="bg-transparent border border-white/30 text-white/70 font-bold text-[12px] px-6 py-2 hover:bg-white/10 hover:text-white transition-colors uppercase rounded-sm cursor-pointer"
          >
             {language === 'pt' ? 'Idioma: PT' : language === 'es' ? 'Idioma: ES' : 'Language: EN'}
          </button>
          <button 
             onClick={handleLogout}
             className="bg-transparent border border-red-500/50 text-red-400 font-bold text-[12px] px-6 py-2 hover:bg-red-500/20 hover:text-red-300 transition-colors uppercase rounded-sm cursor-pointer"
          >
             {language === 'pt' ? 'Sair da Conta' : language === 'es' ? 'Cerrar Sesión' : 'Logout'}
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-4 text-white/30 text-[10px] font-bold tracking-widest">
        V 1.0.0
      </div>
    </motion.div>
  );
}
