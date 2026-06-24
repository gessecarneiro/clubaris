import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import type { Player } from "../store/gameStore";
import { promoteYouthDb } from "../lib/supabaseServices";
import { motion } from "framer-motion";
import { useTranslation } from "../utils/i18n";

const firstNames = ["João", "Pedro", "Lucas", "Gabriel", "Matheus", "Enzo", "Davi", "Miguel", "Arthur", "Heitor"];
const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"];

function generateRandomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
}

export default function CategoriasBase() {
  const { saveId, playerTeamId, balance, squad, language } = useGameStore();
  const t = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  // Mocks of available youth prospects for the season
  const [prospects, setProspects] = useState([
    { id: 'gk', pos: 'GK', name: generateRandomName(), age: 16, rating: 68, cost: 1500000, promoted: false },
    { id: 'def', pos: 'CB', name: generateRandomName(), age: 17, rating: 69, cost: 1800000, promoted: false },
    { id: 'mid', pos: 'CM', name: generateRandomName(), age: 16, rating: 71, cost: 2500000, promoted: false },
    { id: 'atk', pos: 'ST', name: generateRandomName(), age: 17, rating: 72, cost: 3000000, promoted: false },
  ]);

  const handlePromote = async (prospect: typeof prospects[0]) => {
    if (!saveId || !playerTeamId) return;
    if (balance < prospect.cost) return;
    
    setLoading(prospect.id);
    try {
      const newBalance = balance - prospect.cost;
      const newPlayer = await promoteYouthDb(saveId, playerTeamId, prospect.pos, prospect.rating, prospect.cost, newBalance);
      
      // Update local state
      useGameStore.setState(state => ({
        balance: newBalance,
        squad: [...state.squad, newPlayer as Player]
      }));

      // Mark as promoted
      setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, promoted: true } : p));
    } catch (err) {
      console.error(err);
      alert(language === 'pt' ? 'Erro ao promover jogador.' : 'Error promoting player.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="mt-20 pb-20 px-4 max-w-5xl mx-auto flex flex-col gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container border-2 border-on-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex justify-between items-center"
      >
        <h1 className="text-2xl font-black text-secondary tracking-widest uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">child_care</span>
          {language === 'pt' ? "Categorias de Base" : "Youth Academy"}
        </h1>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold tracking-[1px] text-on-surface-variant uppercase">
            {language === 'pt' ? "Saldo Atual" : "Current Balance"}
          </span>
          <span className="text-xl font-bold text-primary-fixed">
            ${(balance / 1000000).toFixed(1)}M
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {prospects.map(p => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col transition-all ${
              p.promoted ? "opacity-50 grayscale" : "bg-surface-container"
            }`}
          >
            <div className="bg-primary-container text-on-primary-container p-2 flex justify-between items-center border-b-2 border-on-background text-[10px] font-bold tracking-[1px]">
              <span className="bg-secondary-container text-on-secondary-container px-2">WONDERKID</span>
              <span>AGE {p.age}</span>
            </div>

            <div className="flex flex-col items-center p-4 gap-2">
              <div className="w-24 h-24 border-2 border-on-background bg-surface-container-lowest relative flex items-center justify-center rounded-full overflow-hidden mb-2">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                  face
                </span>
                <div className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container text-xs font-bold px-2 py-1 border-l-2 border-t-2 border-on-background">
                  {p.rating}
                </div>
              </div>

              <h3 className="text-lg font-black text-on-surface leading-tight text-center">{p.name}</h3>
              <span className="text-secondary text-sm font-bold tracking-widest">{p.pos}</span>
            </div>

            <div className="bg-surface-container-high p-3 mt-auto border-t-2 border-on-background flex flex-col gap-2">
              {p.promoted ? (
                <div className="bg-surface-variant text-on-surface-variant py-2 text-center text-xs font-bold uppercase border-2 border-on-background">
                  {language === 'pt' ? "Promovido" : "Promoted"}
                </div>
              ) : (
                <button 
                  onClick={() => handlePromote(p)}
                  disabled={loading === p.id || balance < p.cost}
                  className={`border-2 border-on-background py-2 text-xs font-black uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex flex-col items-center ${
                    balance >= p.cost 
                      ? "bg-primary text-on-primary hover:bg-primary-fixed hover:text-on-primary-fixed" 
                      : "bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed"
                  }`}
                >
                  {loading === p.id ? (
                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  ) : (
                    <>
                      <span>{language === 'pt' ? "Promover" : "Promote"}</span>
                      <span className="text-[10px] opacity-80">${(p.cost / 1000000).toFixed(1)}M</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
