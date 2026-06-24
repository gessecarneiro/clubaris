import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function DevLogin() {
  const { setUser } = useGameStore();
  const navigate = useNavigate();

  const handleDevMode = () => {
    setUser({ id: 'dev-user-1234', email: 'dev@local.host' });
    navigate("/");
  };

  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001f3f] to-[#000a14] flex flex-col items-center justify-center p-4">
        <h1 className="text-white">Not Available in Production</h1>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-[#001f3f] to-[#000a14] flex flex-col items-center justify-center p-4 relative"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 2px, transparent 2px)', backgroundSize: '64px 64px' }}></div>

      <div className="z-10 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.8)] p-8 max-w-sm w-full text-black flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-[32px] font-black text-[#003366] uppercase tracking-tighter">Dev Mode</h1>
          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mt-1">Acesso Direto</p>
        </div>

        <button 
          type="button"
          onClick={handleDevMode}
          className="w-full bg-purple-700 text-white font-bold text-[14px] p-3 uppercase tracking-widest hover:bg-purple-600 transition-colors border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none mt-4"
        >
          Entrar (Dev Mode)
        </button>
      </div>
    </motion.div>
  );
}
