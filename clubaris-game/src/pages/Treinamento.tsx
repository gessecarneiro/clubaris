import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import type { Player } from "../store/gameStore";
import { TRAINING_FOCI, ensurePlayerAttributes } from "../engine/TrainingEngine";
import { useNavigate } from "react-router-dom";
import ShirtIcon from "../components/ShirtIcon";

export default function Treinamento() {
  const { squad, trainingFocus, setTrainingFocus, language } = useGameStore();
  const navigate = useNavigate();
  
  // Ensure all displayed players have attributes
  const [displaySquad, setDisplaySquad] = useState<Player[]>([]);

  useEffect(() => {
    const updated = squad.map(p => ensurePlayerAttributes(p));
    setDisplaySquad(updated);
  }, [squad]);

  const t = (key: string) => {
     const dict: Record<string, Record<string, string>> = {
        'pt': {
           'ataque': 'Ataque (Foco Ofensivo)',
           'defesa': 'Defesa (Foco Defensivo)',
           'fisico': 'Físico (Resistência e Velocidade)',
           'goleiro': 'Goleiros (Reflexo)',
           'equilibrado': 'Treino Equilibrado',
           'potential': 'Potencial',
           'age': 'Idade',
           'finishing': 'Finalização',
           'passing': 'Passe',
           'crossing': 'Cruzamento',
           'marking': 'Marcação',
           'tackling': 'Desarme',
           'pace': 'Velocidade',
           'stamina': 'Resistência',
           'reflexes': 'Reflexo',
           'positioning': 'Posicionamento'
        },
        'en': {
           'ataque': 'Attack (Offensive Focus)',
           'defesa': 'Defense (Defensive Focus)',
           'fisico': 'Physical (Pace & Stamina)',
           'goleiro': 'Goalkeepers (Reflexes)',
           'equilibrado': 'Balanced Training',
           'potential': 'Potential',
           'age': 'Age',
           'finishing': 'Finishing',
           'passing': 'Passing',
           'crossing': 'Crossing',
           'marking': 'Marking',
           'tackling': 'Tackling',
           'pace': 'Pace',
           'stamina': 'Stamina',
           'reflexes': 'Reflexes',
           'positioning': 'Positioning'
        }
     };
     return dict[language]?.[key] || key;
  };

  const getAttrColor = (val: number | undefined) => {
     if (!val) return 'text-gray-400';
     if (val >= 85) return 'text-green-500 font-black';
     if (val >= 75) return 'text-green-400 font-bold';
     if (val >= 60) return 'text-yellow-500';
     if (val >= 50) return 'text-orange-400';
     return 'text-red-500';
  };

  return (
    <main className="min-h-screen bg-gray-200 dark:bg-gray-900 font-sans p-4 flex flex-col items-center transition-colors pb-24">
      <div className="w-full flex justify-between items-center mb-4 max-w-6xl">
        <h1 className="text-xl font-black uppercase text-gray-800 dark:text-white">Centro de Treinamento</h1>
        <button onClick={() => navigate('/clubhouse')} className="bg-blue-800 text-white font-bold px-4 py-2 hover:bg-blue-700">
          Voltar
        </button>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Painel Esquerdo: Controle */}
        <div className="lg:col-span-1 flex flex-col gap-4">
           <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 p-4 shadow">
             <h2 className="font-bold border-b border-black dark:border-gray-600 pb-2 mb-4 dark:text-white uppercase text-sm">
                Foco Semanal
             </h2>
             <div className="flex flex-col gap-2">
                {TRAINING_FOCI.map(foco => (
                   <label key={foco} className={`p-3 border-2 cursor-pointer flex items-center gap-2 transition-all ${trainingFocus === foco ? 'border-green-600 bg-green-50 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <input 
                         type="radio" 
                         name="trainingFocus" 
                         value={foco} 
                         checked={trainingFocus === foco} 
                         onChange={() => setTrainingFocus(foco)}
                         className="w-4 h-4 text-green-600"
                      />
                      <span className={`text-xs font-bold uppercase ${trainingFocus === foco ? 'text-green-800 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                         {t(foco)}
                      </span>
                   </label>
                ))}
             </div>
             
             <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-400 text-[10px] text-yellow-800 dark:text-yellow-300 font-bold leading-tight">
               💡 O treinamento é aplicado automaticamente ao final de cada rodada simulada. Jogadores jovens evoluem mais rápido até atingirem seu Potencial.
             </div>
           </div>
        </div>

        {/* Painel Direito: Atributos do Elenco */}
        <div className="lg:col-span-3">
           <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 shadow overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-100 dark:bg-gray-900 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b-2 border-black dark:border-gray-700">
                     <th className="p-2">Jogador</th>
                     <th className="p-2 text-center">Idd</th>
                     <th className="p-2 text-center">OVR</th>
                     <th className="p-2 text-center text-purple-600 dark:text-purple-400">POT</th>
                     <th className="p-2 text-center" title="Finalização">FIN</th>
                     <th className="p-2 text-center" title="Passe">PAS</th>
                     <th className="p-2 text-center" title="Velocidade">VEL</th>
                     <th className="p-2 text-center" title="Resistência">RES</th>
                     <th className="p-2 text-center" title="Marcação">MAR</th>
                     <th className="p-2 text-center" title="Reflexo">REF</th>
                   </tr>
                 </thead>
                 <tbody>
                   {displaySquad.map((player, idx) => (
                      <tr key={player.id} className={`border-b border-gray-200 dark:border-gray-700 text-xs font-bold dark:text-gray-200 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-green-50 dark:hover:bg-green-900/20`}>
                        <td className="p-2 flex items-center gap-2 w-48">
                           <ShirtIcon player={player} size="small" />
                           <span className="truncate w-full">{player.name}</span>
                        </td>
                        <td className="p-2 text-center text-gray-500">{player.age}</td>
                        <td className="p-2 text-center text-green-700 dark:text-green-400">{player.rating}</td>
                        <td className="p-2 text-center text-purple-700 dark:text-purple-300">
                          {player.potential && player.potential > player.rating ? player.potential : '-'}
                        </td>
                        <td className={`p-2 text-center ${getAttrColor(player.attr_finishing)}`}>{player.attr_finishing || '-'}</td>
                        <td className={`p-2 text-center ${getAttrColor(player.attr_passing)}`}>{player.attr_passing || '-'}</td>
                        <td className={`p-2 text-center ${getAttrColor(player.attr_pace)}`}>{player.attr_pace || '-'}</td>
                        <td className={`p-2 text-center ${getAttrColor(player.attr_stamina)}`}>{player.attr_stamina || '-'}</td>
                        <td className={`p-2 text-center ${getAttrColor(player.attr_marking)}`}>{player.attr_marking || '-'}</td>
                        <td className={`p-2 text-center ${getAttrColor(player.attr_reflexes)}`}>{player.attr_reflexes || '-'}</td>
                      </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

      </div>
    </main>
  );
}
