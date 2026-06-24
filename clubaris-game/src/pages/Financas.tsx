import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { supabase } from "../lib/supabase";

export default function Financas() {
  const { language, saveId, playerTeamId, balance } = useGameStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [squad, setSquad] = useState<any[]>([]);

  useEffect(() => {
    async function loadFinances() {
      if (!saveId || !playerTeamId) return;
      try {
        // Fetch club id
        const { data: cData } = await supabase.from('clubs').select('id').eq('save_id', saveId).eq('original_id', playerTeamId).single();
        if (!cData) return;
        const myClubId = cData.id;

        // Fetch Squad for Payroll
        const { data: sData } = await supabase.from('players').select('contract_salary').eq('club_id', myClubId);
        setSquad(sData || []);

        // Fetch Transactions
        const { data: tData } = await supabase.from('transactions')
          .select('*, players(name)')
          .eq('save_id', saveId)
          .or(`from_club_id.eq.${myClubId},to_club_id.eq.${myClubId}`)
          .order('transaction_date', { ascending: false });
        
        setTransactions(tData || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadFinances();
  }, [saveId, playerTeamId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: language === "pt" ? "BRL" : "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const monthlyPayroll = squad.reduce((acc, p) => acc + (p.contract_salary || 0), 0);

  return (
    <main className="font-sans bg-gray-50 dark:bg-gray-900 text-black dark:text-white min-h-screen px-4 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="bg-green-800 dark:bg-green-900 text-white p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
        <h1 className="font-black text-xl uppercase tracking-widest">
          {language === 'pt' ? 'Finanças do Clube' : 'Club Finances'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <h2 className="text-[14px] font-bold uppercase border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-4">
             {language === 'pt' ? 'Resumo Financeiro' : 'Financial Summary'}
          </h2>
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-center text-[16px]">
               <span className="font-bold text-gray-600 dark:text-gray-400">Saldo Atual (Caixa):</span>
               <span className="font-mono font-black text-green-700 dark:text-green-400">{formatCurrency(balance)}</span>
             </div>
             <div className="flex justify-between items-center text-[14px]">
               <span className="font-bold text-gray-600 dark:text-gray-400">Folha Salarial Mensal:</span>
               <span className="font-mono font-bold text-red-600 dark:text-red-400">-{formatCurrency(monthlyPayroll)}</span>
             </div>
             <div className="flex justify-between items-center text-[14px]">
               <span className="font-bold text-gray-600 dark:text-gray-400">Patrocínios (Estimado):</span>
               <span className="font-mono font-bold text-green-600 dark:text-green-400">+{formatCurrency(monthlyPayroll * 1.2)}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
        <h2 className="text-[14px] font-bold uppercase border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-4">
           {language === 'pt' ? 'Histórico de Transferências' : 'Transfer History'}
        </h2>
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
              <tr className="border-b-2 border-black">
                <th className="p-2 text-[12px] font-black border-r border-gray-400">Data</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400">Tipo</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400">Jogador</th>
                <th className="p-2 text-[12px] font-black border-r border-gray-400 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                  <td className="p-2 text-[12px] font-bold border-r border-gray-300 dark:border-gray-700">
                    {new Date(t.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-[12px] font-bold uppercase border-r border-gray-300 dark:border-gray-700">
                    {t.transaction_type}
                  </td>
                  <td className="p-2 text-[12px] font-bold border-r border-gray-300 dark:border-gray-700">
                    {t.players?.name || 'Desconhecido'}
                  </td>
                  <td className={`p-2 text-[12px] text-right font-mono font-bold border-r border-gray-300 dark:border-gray-700 ${t.transaction_type === 'release' || t.transaction_type === 'buy' ? 'text-red-500' : ''}`}>
                    {formatCurrency(t.fee)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500 font-bold text-[12px] uppercase">
                    Nenhuma transação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
