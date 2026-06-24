import { useGameStore } from "../store/gameStore";
import { motion } from "framer-motion";
import { useTranslation } from "../utils/i18n";

export default function Infraestrutura() {
  const { infrastructure, balance, upgradeInfrastructure, language } = useGameStore();
  const t = useTranslation();

  const getCost = (level: number) => level * 5000000;

  const facilities = [
    {
      id: "stadiumLevel" as const,
      name: language === 'pt' ? "Estádio" : "Stadium",
      icon: "stadium",
      desc: language === 'pt' ? "Aumenta a capacidade de público e a renda dos jogos em casa." : "Increases attendance capacity and home game revenue.",
      level: infrastructure.stadiumLevel,
    },
    {
      id: "trainingLevel" as const,
      name: language === 'pt' ? "Centro de Treinamento" : "Training Center",
      icon: "fitness_center",
      desc: language === 'pt' ? "Acelera a evolução de atributos dos jogadores do elenco." : "Accelerates attribute growth for players in the squad.",
      level: infrastructure.trainingLevel,
    },
    {
      id: "medicalLevel" as const,
      name: language === 'pt' ? "Departamento Médico" : "Medical Center",
      icon: "medical_services",
      desc: language === 'pt' ? "Reduz a chance de lesões graves e acelera o tempo de recuperação." : "Reduces chance of severe injuries and speeds up recovery time.",
      level: infrastructure.medicalLevel,
    }
  ];

  return (
    <main className="mt-20 pb-20 px-4 max-w-5xl mx-auto flex flex-col gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container border-2 border-on-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex justify-between items-center"
      >
        <h1 className="text-2xl font-black text-secondary tracking-widest uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">domain</span>
          {language === 'pt' ? "Infraestrutura" : "Infrastructure"}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilities.map((fac, idx) => {
          const isMax = fac.level >= 5;
          const cost = getCost(fac.level);
          const canAfford = balance >= cost;

          return (
            <motion.div 
              key={fac.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container border-2 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
            >
              <div className="bg-secondary-container p-4 flex flex-col items-center justify-center border-b-2 border-on-background relative z-10">
                <span className="material-symbols-outlined text-6xl text-on-secondary-container mb-2">
                  {fac.icon}
                </span>
                <h2 className="text-lg font-black uppercase text-on-secondary-container tracking-widest text-center">
                  {fac.name}
                </h2>
                <div className="absolute top-2 right-2 bg-primary text-on-primary font-black px-2 border-2 border-on-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                  Lvl {fac.level}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-4 z-10">
                <p className="text-xs text-on-surface-variant text-center h-12">
                  {fac.desc}
                </p>

                <div className="flex flex-col gap-1 mt-auto">
                  {isMax ? (
                    <div className="bg-surface-container-highest border-2 border-on-background p-2 text-center text-on-surface font-bold uppercase text-xs">
                      {language === 'pt' ? "Nível Máximo Alcançado" : "Maximum Level Reached"}
                    </div>
                  ) : (
                    <button 
                      onClick={() => upgradeInfrastructure(fac.id)}
                      disabled={!canAfford}
                      className={`border-2 border-on-background py-3 text-sm font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex flex-col items-center ${
                        canAfford 
                          ? "bg-primary-container text-on-primary-container hover:bg-primary-fixed" 
                          : "bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <span>{language === 'pt' ? "Evoluir" : "Upgrade"}</span>
                      <span className="text-[10px]">
                        {language === 'pt' ? "Custo:" : "Cost:"} ${(cost / 1000000).toFixed(1)}M
                      </span>
                    </button>
                  )}
                  {!canAfford && !isMax && (
                     <span className="text-[10px] text-error text-center font-bold">
                       {language === 'pt' ? "Saldo insuficiente" : "Insufficient funds"}
                     </span>
                  )}
                </div>
              </div>
              
              {/* Star Rating Visualization */}
              <div className="absolute bottom-2 left-0 w-full flex justify-center gap-1 opacity-20 pointer-events-none z-0">
                {[1,2,3,4,5].map(star => (
                   <span key={star} className={`material-symbols-outlined text-4xl ${star <= fac.level ? 'text-primary-fixed' : 'text-on-surface'}`} style={{ fontVariationSettings: star <= fac.level ? "'FILL' 1" : "'FILL' 0" }}>
                     star
                   </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
