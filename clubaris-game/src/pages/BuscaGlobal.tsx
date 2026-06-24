import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { calculateMarketValue, translatePosition } from "../utils/playerUtils";
import { searchPlayersDb, fetchClubs, buyPlayerDb, loanPlayerDb } from "../lib/supabaseServices";
import { getTeamRelevance, getRelevanceLevel } from "../utils/relevance";

export default function BuscaGlobal() {
  const { language, balance, saveId, playerTeamId, buyPlayer } = useGameStore();

  const [filters, setFilters] = useState({
    name: "",
    position: "Qualquer",
    side: "Qualquer",
    minRating: 1,
    maxRating: 100,
    minAge: 16,
    maxAge: 45,
    char1: "Qualquer",
    char2: "Qualquer",
    nationality: "Qualquer",
    playingIn: "Qualquer",
    value: "Qualquer",
    star: false,
    worldTop: false,
    forSale: false,
    forLoan: false,
  });

  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [clubsData, setClubsData] = useState<any[]>([]);
  const [nationalities, setNationalities] = useState<string[]>([]);
  
  // Offer State
  const [offerPlayer, setOfferPlayer] = useState<any | null>(null);
  const [offerType, setOfferType] = useState<'buy' | 'loan' | null>(null);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function init() {
      if (!saveId) return;
      const clubs = await fetchClubs(saveId);
      setClubsData(clubs);

      // We should ideally fetch unique nationalities, but we can hardcode the ones we know for now
      // since the query to get all unique from DB might be heavy. 
      // For now, Brazil, England, Spain are the ones we added in the generator.
      setNationalities(["Brasil", "Inglaterra", "Espanha", "Desconhecida"]);
    }
    init();
  }, [saveId]);

  const handleSearch = async () => {
    if (!saveId) return;
    setIsSearching(true);
    try {
      const data = await searchPlayersDb(saveId, filters);
      setResults(data || []);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar jogadores.");
    } finally {
      setIsSearching(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      position: "Qualquer",
      side: "Qualquer",
      minRating: 1,
      maxRating: 100,
      minAge: 16,
      maxAge: 45,
      char1: "Qualquer",
      char2: "Qualquer",
      nationality: "Qualquer",
      playingIn: "Qualquer",
      value: "Qualquer",
      star: false,
      worldTop: false,
      forSale: false,
      forLoan: false,
    });
    setResults([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: language === "pt" ? "BRL" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleMakeOffer = (player: any, type: 'buy' | 'loan') => {
    setOfferPlayer(player);
    setOfferType(type);
    if (type === 'buy') {
      setOfferAmount(calculateMarketValue(player).toString());
    } else {
      setOfferAmount('');
    }
  };

  const submitOffer = async () => {
    if (!offerPlayer || !saveId) return;
    const amount = parseFloat(offerAmount.replace(/[^0-9.-]+/g,""));
    if (isNaN(amount) || amount <= 0) return;

    if (amount > balance) {
      alert(language === "pt" ? "Você não tem fundos suficientes!" : "You don't have enough funds!");
      return;
    }

    const userClub = clubsData.find(c => c.original_id === playerTeamId);
    if (!userClub) return;

    const targetTeamId = offerPlayer.club_id;
    const targetTeam = clubsData.find(c => c.id === targetTeamId);
    
    if (targetTeam) {
      const userRelevanceLevel = getRelevanceLevel(getTeamRelevance(userClub.rating));
      const targetRelevanceLevel = getRelevanceLevel(getTeamRelevance(targetTeam.rating));

      if (targetRelevanceLevel > userRelevanceLevel + 1) {
         alert(language === "pt" ? `O jogador recusou a oferta. O ${targetTeam.name} tem uma reputação muito maior que a nossa.` : `The player rejected the offer. ${targetTeam.name} has a much higher reputation.`);
         setOfferPlayer(null);
         return;
      }
    }

    const marketValue = calculateMarketValue(offerPlayer);
    if (amount >= marketValue * 0.9) {
      setIsProcessing(true);
      try {
        const newBalance = balance - amount;
        
        if (offerType === 'buy') {
           await buyPlayerDb(saveId, offerPlayer.id, targetTeamId, userClub.id, amount, newBalance);
           const success = await buyPlayer(offerPlayer, amount);
           if (success) {
              alert(language === "pt" ? `Proposta aceita! ${offerPlayer.name} agora é do seu time.` : `Offer accepted! ${offerPlayer.name} has joined your team.`);
              setResults(prev => prev.filter(p => p.id !== offerPlayer.id));
           }
        } else {
           await loanPlayerDb(saveId, offerPlayer.id, targetTeamId, userClub.id, 12, amount);
           alert(language === "pt" ? `Empréstimo aceito! ${offerPlayer.name} ficará 1 ano no clube pagando ${amount}% do salário.` : `Loan accepted!`);
           setResults(prev => prev.filter(p => p.id !== offerPlayer.id));
        }
      } catch (err) {
        console.error("Purchase failed", err);
        alert("Erro ao efetuar a compra.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert(language === "pt" ? `A diretoria recusou sua oferta de ${formatCurrency(amount)}.` : `The board rejected your offer of ${formatCurrency(amount)}.`);
    }
    setOfferPlayer(null);
  };

  return (
    <main className="font-sans text-black dark:text-white min-h-screen pt-4 max-w-6xl mx-auto flex flex-col gap-4">
      {/* Filters Panel - Brasfoot Style */}
      <section className="bg-[#002b47] border border-[#001f33] p-4 text-white shadow-md rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[11px] font-bold">Nome:</label>
            <input 
              type="text" 
              value={filters.name}
              onChange={e => setFilters({...filters, name: e.target.value.replace(/<\/?[^>]+(>|$)/g, "")})}
              className="w-full text-black px-2 py-1 text-[12px] border border-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold">Característica 1:</label>
            <select 
              value={filters.char1}
              onChange={e => setFilters({...filters, char1: e.target.value})}
              className="text-black px-2 py-1 text-[12px] border border-gray-400"
            >
              <option>Qualquer</option>
              <option>Velocidade</option>
              <option>Finalização</option>
              <option>Desarme</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold">Característica 2:</label>
            <select 
              value={filters.char2}
              onChange={e => setFilters({...filters, char2: e.target.value})}
              className="text-black px-2 py-1 text-[12px] border border-gray-400"
            >
              <option>Qualquer</option>
              <option>Passe</option>
              <option>Cruzamento</option>
              <option>Força</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold">Posição:</label>
            <select 
              value={filters.position}
              onChange={e => setFilters({...filters, position: e.target.value})}
              className="text-black px-2 py-1 text-[12px] border border-gray-400"
            >
              <option>Qualquer</option>
              <option>Goleiro</option>
              <option>Defensor</option>
              <option>Meio-Campo</option>
              <option>Atacante</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold">Lado:</label>
            <select 
              value={filters.side}
              onChange={e => setFilters({...filters, side: e.target.value})}
              className="text-black px-2 py-1 text-[12px] border border-gray-400"
            >
              <option>Qualquer</option>
              <option>Direito</option>
              <option>Esquerdo</option>
              <option>Centro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold">Nacionalidade:</label>
            <select 
              value={filters.nationality}
              onChange={e => setFilters({...filters, nationality: e.target.value})}
              className="text-black px-2 py-1 text-[12px] border border-gray-400"
            >
              <option>Qualquer</option>
              {nationalities.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold">Atuando no:</label>
            <select 
              value={filters.playingIn}
              onChange={e => setFilters({...filters, playingIn: e.target.value})}
              className="text-black px-2 py-1 text-[12px] border border-gray-400"
            >
              <option>Qualquer</option>
              <option>Brasil</option>
              <option>Espanha</option>
              <option>Inglaterra</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-[11px] font-bold flex justify-between">
              <span>Força:</span>
              <span>{filters.minRating} - {filters.maxRating}</span>
            </label>
            <div className="flex gap-2">
              <input type="range" min="1" max="100" value={filters.minRating} onChange={e => setFilters({...filters, minRating: parseInt(e.target.value)})} className="w-full" />
              <input type="range" min="1" max="100" value={filters.maxRating} onChange={e => setFilters({...filters, maxRating: parseInt(e.target.value)})} className="w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-[11px] font-bold flex justify-between">
              <span>Idade:</span>
              <span>{filters.minAge} - {filters.maxAge}</span>
            </label>
            <div className="flex gap-2">
              <input type="range" min="16" max="45" value={filters.minAge} onChange={e => setFilters({...filters, minAge: parseInt(e.target.value)})} className="w-full" />
              <input type="range" min="16" max="45" value={filters.maxAge} onChange={e => setFilters({...filters, maxAge: parseInt(e.target.value)})} className="w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold">Valor:</label>
            <select 
              value={filters.value}
              onChange={e => setFilters({...filters, value: e.target.value})}
              className="text-black px-2 py-1 text-[12px] border border-gray-400"
            >
              <option>Qualquer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold h-full content-center">
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={filters.star} onChange={e => setFilters({...filters, star: e.target.checked})} /> estrela</label>
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={filters.worldTop} onChange={e => setFilters({...filters, worldTop: e.target.checked})} /> Top Mundial</label>
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={filters.forSale} onChange={e => setFilters({...filters, forSale: e.target.checked})} /> À venda</label>
            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={filters.forLoan} onChange={e => setFilters({...filters, forLoan: e.target.checked})} /> Empréstimo</label>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-4 px-2">
        <button 
          onClick={resetFilters}
          className="bg-gray-100 border border-gray-400 px-6 py-1.5 text-black font-bold text-[12px] hover:bg-gray-200"
        >
          Resetar filtros
        </button>
        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-gray-100 border border-gray-400 px-10 py-1.5 text-black font-bold text-[12px] hover:bg-gray-200 mx-auto"
        >
          {isSearching ? "..." : "Procurar"}
        </button>
      </div>

      {/* Results Table */}
      <section className="bg-white border border-gray-400 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px] bg-white text-black">
            <thead className="sticky top-0 bg-gray-100 z-10 border-b border-gray-400">
              <tr>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-8 text-center">P</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300">Nome</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300">Time</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-8 text-center">L</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-8 text-center">F</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-24 text-right">Salário</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-24 text-right">Valor</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-12 text-center">Car.</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-8 text-center">Idade</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-8 text-center">Nac.</th>
                <th className="p-1 px-2 text-[11px] font-normal border-r border-gray-300 w-8 text-center">V</th>
                <th className="p-1 px-2 text-[11px] font-normal w-8 text-center">E</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {results.map((player: any, idx: number) => {
                const estValue = calculateMarketValue(player);
                const salary = player.contract_salary || estValue / 100;

                return (
                  <tr key={player.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-1 px-2 text-center border-r border-gray-300">{translatePosition(player.position, language).charAt(0)}</td>
                    <td className="p-1 px-2 truncate border-r border-gray-300">{player.name}</td>
                    <td className="p-1 px-2 truncate border-r border-gray-300 text-[11px] text-gray-700">
                      {player.clubs ? player.clubs.name : "Sem Clube"}
                    </td>
                    <td className="p-1 px-2 text-center border-r border-gray-300">-</td>
                    <td className="p-1 px-2 text-center border-r border-gray-300 font-bold">{player.rating}</td>
                    <td className="p-1 px-2 text-right border-r border-gray-300">{formatCurrency(salary)}</td>
                    <td className="p-1 px-2 text-right border-r border-gray-300">{formatCurrency(estValue)}</td>
                    <td className="p-1 px-2 text-center border-r border-gray-300 text-[10px]">-</td>
                    <td className="p-1 px-2 text-center border-r border-gray-300">{player.age}</td>
                    <td className="p-1 px-2 text-center border-r border-gray-300 text-[10px] truncate max-w-[60px]">{player.nationality || 'UNK'}</td>
                    <td className="p-1 px-2 text-center border-r border-gray-300 cursor-pointer hover:bg-gray-200" onClick={() => handleMakeOffer(player, 'buy')}>V</td>
                    <td className="p-1 px-2 text-center cursor-pointer hover:bg-gray-200" onClick={() => handleMakeOffer(player, 'loan')}>E</td>
                  </tr>
                );
              })}
              {results.length === 0 && !isSearching && (
                <tr>
                  <td colSpan={12} className="text-center p-4 text-gray-500 text-[12px]">Nenhum jogador encontrado ou realize uma busca.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Offer Modal */}
      {offerPlayer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-200 border-2 border-black max-w-sm w-full">
            <div className="bg-green-800 text-white px-4 py-2 border-b-2 border-black flex justify-between items-center font-bold">
              <span className="text-[14px] uppercase tracking-wide">
                {offerType === 'buy' ? (language === 'pt' ? 'Comprar Jogador' : 'Buy Player') : (language === 'pt' ? 'Empréstimo' : 'Loan Player')}
              </span>
              <button onClick={() => setOfferPlayer(null)} className="hover:text-red-300">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4 font-sans text-black font-bold">
              <div className="flex justify-between font-bold text-sm bg-gray-100 p-2 mb-2 border border-gray-400">
                  <span className="truncate max-w-[200px]">{offerPlayer.name} {offerPlayer.isWorldClass && '⭐'}</span>
                  <span>OVR: {offerPlayer.rating}</span>
              </div>
              <div className="text-xs text-gray-600 mb-4 text-center">
                  Est. Market Value: {formatCurrency(calculateMarketValue(offerPlayer))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase text-gray-600">
                  {offerType === 'buy' ? (language === 'pt' ? 'Valor da Oferta ($)' : 'Offer Amount ($)') : (language === 'pt' ? 'Porcentagem de Salário a pagar (%)' : 'Salary % to pay')}
                </label>
                <div className="flex">
                   <span className="bg-gray-300 border border-black border-r-0 px-2 py-1 flex items-center justify-center font-mono">
                     {offerType === 'buy' ? '$' : '%'}
                   </span>
                   <input
                     type="number"
                     value={offerAmount}
                     onChange={(e) => setOfferAmount(e.target.value)}
                     className="flex-1 bg-white text-black border border-black px-3 py-1 focus:outline-none font-mono"
                   />
                </div>
                <p className="text-[9px] text-green-700 mt-1">
                  Your Balance: {formatCurrency(balance)}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={submitOffer}
                  disabled={isProcessing}
                  className="flex-1 bg-green-700 text-white font-bold text-[12px] py-2 uppercase border border-black hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {isProcessing ? "..." : (language === 'pt' ? 'Enviar' : 'Submit')}
                </button>
                <button 
                  onClick={() => setOfferPlayer(null)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 text-black font-bold text-[12px] py-2 uppercase border border-black hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  {language === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
