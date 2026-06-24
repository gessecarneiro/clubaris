import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { sanitizeText } from "../utils/sanitize";

export default function CreateManager() {
  const [managerName, setManagerName] = useState("");
  const [managerStyle, setManagerStyle] = useState<"retranqueiro" | "pressao" | "desenvolvimento" | "posse" | "">("");
  const [avatar, setAvatar] = useState("👨‍💼");
  const navigate = useNavigate();
  const { setTempManager, language } = useGameStore();

  const handleNext = () => {
    const cleanName = sanitizeText(managerName);
    if (cleanName && managerStyle && avatar) {
      setTempManager(cleanName, managerStyle, avatar);
      navigate("/novo-jogo");
    }
  };

  const avatars = ["👨‍💼", "👩‍💼", "🧔‍♂️", "👱‍♂️", "👴", "👦", "😎", "🎩"];

  const styles = [
    {
      id: "retranqueiro",
      title: "O Retranqueiro",
      icon: "🛡️",
      desc: "Especialista em defesa e contra-ataques rápidos. Seus times tomam poucos gols.",
      color: "from-blue-600 to-blue-900"
    },
    {
      id: "pressao",
      title: "Pressão Total",
      icon: "⚡",
      desc: "Futebol intenso, marcação alta e sufocante. Rouba a bola no campo de ataque.",
      color: "from-red-600 to-red-900"
    },
    {
      id: "desenvolvimento",
      title: "Formador",
      icon: "🌱",
      desc: "Trabalha com jovens e valoriza o elenco. Os jogadores evoluem mais rápido com você.",
      color: "from-green-600 to-green-900"
    },
    {
      id: "posse",
      title: "Mestre da Posse",
      icon: "⚽",
      desc: "Estilo Tiki-Taka. Seu time dita o ritmo do jogo controlando totalmente a bola.",
      color: "from-yellow-500 to-yellow-700"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#111] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-[#111] to-black opacity-50 z-0 pointer-events-none"></div>
      
      <div className="z-10 max-w-4xl w-full bg-gray-900/80 p-8 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Criar Treinador
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Nome e Avatar */}
          <div className="flex flex-col gap-6 bg-black/40 p-6 rounded-lg border border-gray-700">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Nome do Treinador</label>
              <input 
                type="text" 
                value={managerName}
                onChange={e => setManagerName(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))}
                placeholder="Ex: Pep Guardiola"
                className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-3 text-white font-bold focus:border-yellow-500 focus:outline-none transition-colors"
                maxLength={20}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Seu Avatar</label>
              <div className="flex flex-wrap gap-3">
                {avatars.map(av => (
                  <button 
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`text-3xl w-14 h-14 rounded-full flex items-center justify-center transition-all ${avatar === av ? 'bg-yellow-500 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-gray-800 hover:bg-gray-700 opacity-70 hover:opacity-100'}`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cartões de Estilo */}
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">Estilo de Jogo</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
              {styles.map(s => (
                <div 
                  key={s.id}
                  onClick={() => setManagerStyle(s.id as any)}
                  className={`cursor-pointer rounded-lg p-4 border-2 transition-all flex flex-col gap-2 relative overflow-hidden group ${managerStyle === s.id ? 'border-yellow-400 scale-[1.02] shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-gray-700 hover:border-gray-500 opacity-80 hover:opacity-100'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-20 group-hover:opacity-40 transition-opacity z-0`}></div>
                  <div className="z-10 flex items-center justify-between">
                    <span className="text-3xl">{s.icon}</span>
                    {managerStyle === s.id && <span className="text-yellow-400 material-symbols-outlined font-bold">check_circle</span>}
                  </div>
                  <h3 className="z-10 font-bold text-md text-white mt-1 uppercase">{s.title}</h3>
                  <p className="z-10 text-xs text-gray-300 leading-tight">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-800">
           <button 
             onClick={handleNext}
             disabled={!managerName || !managerStyle}
             className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black px-10 py-4 rounded-lg uppercase tracking-widest shadow-lg shadow-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-95"
           >
             Avançar <span className="material-symbols-outlined">arrow_forward</span>
           </button>
        </div>

      </div>
    </motion.div>
  );
}
