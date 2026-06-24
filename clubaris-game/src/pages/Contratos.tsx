import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { fetchSquad, renewContractDb, releasePlayerDb, promoteYouthDb } from "../lib/supabaseServices";

export default function Contratos() {
  const { language, saveId, playerTeamId, balance } = useGameStore();
  
  const [squad, setSquad] = useState<any[]>([]);
  const [userClub, setUserClub] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [youthModal, setYouthModal] = useState(false);

  useEffect(() => {
    async function loadSquad() {
      if (!saveId || !playerTeamId) return;
      try {
        // We fetch the club to get its real UUID and rating
        const { fetchClubs } = await import("../lib/supabaseServices");
        const clubs = await fetchClubs(saveId);
        const myClub = clubs.find((c: any) => c.original_id === playerTeamId);
        if (myClub) {
          setUserClub(myClub);
          const sq = await fetchSquad(myClub.id);
          setSquad(sq);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSquad();
  }, [saveId, playerTeamId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: language === "pt" ? "BRL" : "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleRenew = async (player: any) => {
    if (isProcessing) return;
    const confirmMsg = language === "pt" 
      ? `Deseja renovar o contrato de ${player.name} por +1 ano? O salário aumentará 10%.`
      : `Renew ${player.name} contract for +1 year? Salary will increase by 10%.`;
      
    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      const newSalary = Math.floor(player.contract_salary * 1.1);
      await renewContractDb(player.id, 1, newSalary);
      alert(language === "pt" ? "Contrato renovado com sucesso!" : "Contract renewed!");
      setSquad(prev => prev.map(p => p.id === player.id ? { ...p, contract_years: p.contract_years + 1, contract_salary: newSalary } : p));
    } catch (e) {
      alert("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRelease = async (player: any) => {
    if (isProcessing) return;
    const penalty = (player.contract_salary || 100000) * 10;
    const confirmMsg = language === "pt"
      ? `Liberar ${player.name} custará uma multa rescisória de ${formatCurrency(penalty)}. Confirmar?`
      : `Releasing ${player.name} costs a penalty fee of ${formatCurrency(penalty)}. Confirm?`;

    if (!window.confirm(confirmMsg)) return;
    
    if (balance < penalty) {
      alert(language === "pt" ? "Saldo insuficiente para pagar a multa!" : "Insufficient funds for penalty!");
      return;
    }

    setIsProcessing(true);
    try {
      const newBalance = balance - penalty;
      await releasePlayerDb(saveId!, player.id, userClub.id, penalty, newBalance);
      useGameStore.setState({ balance: newBalance });
      setSquad(prev => prev.filter(p => p.id !== player.id));
      alert(language === "pt" ? "Jogador liberado!" : "Player released!");
    } catch(e) {
      alert("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromoteYouth = async () => {
    if (isProcessing) return;
    setYouthModal(true);
  };

  const confirmPromote = async (position: string) => {
    setIsProcessing(true);
    setYouthModal(false);
    try {
      const baseRating = userClub.rating - 15; // youth is weaker than club average
      const newYouth = await promoteYouthDb(saveId!, userClub.id, position, baseRating, 0, useGameStore.getState().balance);
      setSquad(prev => [...prev, newYouth]);
      alert(language === "pt" ? `Jovem ${newYouth.name} promovido!` : `Youth ${newYouth.name} promoted!`);
    } catch(e) {
      alert("Error promoting youth");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="font-sans bg-gray-50 dark:bg-gray-900 text-black dark:text-white min-h-screen px-4 py-6 max-w-7xl mx-auto flex flex-col gap-4">
      <div className="bg-green-800 dark:bg-green-900 text-white p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
        <h1 className="font-black text-xl uppercase tracking-widest">
          {language === 'pt' ? 'Gestão de Elenco & Contratos' : 'Squad & Contracts'}
        </h1>
        <div className="text-right">
           <div className="text-[10px] uppercase font-bold text-green-300">Caixa Atual</div>
           <div className="font-bold text-lg">{formatCurrency(balance)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
           onClick={handlePromoteYouth}
           className="bg-yellow-500 text-black px-4 py-2 font-bold uppercase text-[12px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] border-2 border-black hover:bg-yellow-400 active:translate-y-[2px] active:shadow-none transition-all"
        >
          {language === 'pt' ? 'Promover Jovem da Base' : 'Promote Youth Player'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr className="border-b-2 border-black">
                <th className="p-2 text-[12px] font-black border-r border-gray-400 w-12 text-center">POS</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400">{language === 'pt' ? 'Nome' : 'Name'}</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400 w-12 text-center">IDD</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400 w-12 text-center">OVR</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400 text-right">Salário Mensal</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400 text-center w-24">Tempo (Anos)</th>
                <th className="p-2 text-[12px] font-black text-center w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {squad.map(player => (
                <tr key={player.id} className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                  <td className="p-2 text-[12px] font-bold text-center border-r border-gray-300 dark:border-gray-700">{player.position}</td>
                  <td className="p-2 text-[12px] font-bold border-r border-gray-300 dark:border-gray-700">{player.name}</td>
                  <td className="p-2 text-[12px] text-center border-r border-gray-300 dark:border-gray-700">{player.age || '?'}</td>
                  <td className="p-2 text-[12px] font-bold text-center border-r border-gray-300 dark:border-gray-700">{player.rating}</td>
                  <td className="p-2 text-[12px] text-right font-mono border-r border-gray-300 dark:border-gray-700">{formatCurrency(player.contract_salary)}</td>
                  <td className={`p-2 text-[12px] text-center font-bold border-r border-gray-300 dark:border-gray-700 ${player.contract_years === 1 ? 'text-red-500' : ''}`}>
                    {player.contract_years}
                  </td>
                  <td className="p-1 px-2 text-center flex gap-1 justify-center items-center">
                    <button 
                      onClick={() => handleRenew(player)}
                      title={language === 'pt' ? 'Renovar Contrato' : 'Renew'}
                      className="bg-blue-600 text-white p-1 px-2 text-[10px] uppercase font-bold hover:bg-blue-500 transition-colors border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none"
                    >
                       <span className="material-symbols-outlined text-[14px]">edit_document</span>
                    </button>
                    <button 
                      onClick={() => handleRelease(player)}
                      title={language === 'pt' ? 'Liberar Jogador (Multa)' : 'Release Player (Penalty)'}
                      className="bg-red-600 text-white p-1 px-2 text-[10px] uppercase font-bold hover:bg-red-500 transition-colors border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none"
                    >
                       <span className="material-symbols-outlined text-[14px]">person_remove</span>
                    </button>
                  </td>
                </tr>
              ))}
              {squad.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500 font-bold text-[12px] uppercase">
                    Carregando elenco...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {youthModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-200 dark:bg-gray-800 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] max-w-sm w-full">
            <div className="bg-green-800 dark:bg-green-900 text-white px-4 py-2 border-b-2 border-black flex justify-between items-center font-bold">
              <span className="text-[14px] uppercase tracking-wide">
                Promover da Base
              </span>
              <button onClick={() => setYouthModal(false)} className="hover:text-red-300">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4 font-sans text-black dark:text-white font-bold text-[12px]">
               <p className="text-center text-gray-600 dark:text-gray-300">Escolha a posição do novo jogador revelado pela categoria de base.</p>
               <div className="grid grid-cols-2 gap-2">
                 {['GK', 'CB', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'RM', 'LM', 'ST', 'RW', 'LW'].map(pos => (
                    <button 
                      key={pos} 
                      onClick={() => confirmPromote(pos)}
                      className="bg-white dark:bg-gray-700 border-2 border-black shadow-sm p-2 text-center hover:bg-green-100 dark:hover:bg-green-900 transition-colors active:translate-y-[1px]"
                    >
                      {pos}
                    </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
