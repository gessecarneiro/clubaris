import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Player } from "../store/gameStore";
import { useGameStore } from "../store/gameStore";
import { fetchClubs, fetchSquad, buyPlayerDb, loanPlayerDb } from "../lib/supabaseServices";
import { getTeamRelevance, getRelevanceLevel } from "../utils/relevance";
import { calculateMarketValue, translatePosition } from '../utils/playerUtils';
import allLeaguesData from '../data/leagues.json';

export default function VerTimes() {
  const location = useLocation();
  const { language, balance, buyPlayer, saveId, playerTeamId } = useGameStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("all");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(location.state?.teamId || null);
  const [offerPlayer, setOfferPlayer] = useState<Player | null>(null);
  const [offerType, setOfferType] = useState<'buy' | 'loan' | 'sell' | 'loan_out' | null>(null);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [generatedOffer, setGeneratedOffer] = useState<number | null>(null);
  
  const [clubsData, setClubsData] = useState<any[]>([]);
  const [leaguesData, setLeaguesData] = useState<any[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['Brasil']);
  const [selectedTeamSquad, setSelectedTeamSquad] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!saveId) return;
      try {
        const clubs = await fetchClubs(saveId);
        setClubsData(clubs);
        
        // Rebuild league structures from data
        const uniqueLeagues = Array.from(new Set(clubs.map((c: any) => c.league_id)));
        
        // Legacy support for older saves
        const legacyMap: Record<string, string> = {
           'brazil': 'brazil_a',
           'spain': 'spain_a',
           'england': 'england_a',
           'italy': 'italy_a'
        };
        
        const availableLeagues = allLeaguesData.filter((l: any) => 
            uniqueLeagues.includes(l.id) || 
            uniqueLeagues.some(ul => legacyMap[ul as string] === l.id)
        );
        setLeaguesData(availableLeagues);
      } catch (err) {
        console.error("Error loading clubs from DB", err);
      }
    }
    loadData();
  }, [saveId]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]);
  };

  const groupedLeagues = leaguesData.reduce((acc, league) => {
    if (!acc[league.folder]) acc[league.folder] = [];
    acc[league.folder].push(league);
    return acc;
  }, {} as Record<string, any[]>);

  useEffect(() => {
    async function loadSquad() {
      if (!selectedTeamId) {
        setSelectedTeamSquad([]);
        return;
      }
      try {
        const squad = await fetchSquad(selectedTeamId);
        setSelectedTeamSquad(squad);
      } catch (err) {
        console.error("Error loading squad from DB", err);
      }
    }
    loadSquad();
  }, [selectedTeamId]);

  const filteredTeams = clubsData.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = selectedLeagueId === "all" || team.league_id === selectedLeagueId;
    return matchesSearch && matchesLeague;
  });

  const selectedTeam = clubsData.find(t => t.id === selectedTeamId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: language === "pt" ? "BRL" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleMakeOffer = (player: Player, type: 'buy' | 'loan' | 'sell' | 'loan_out') => {
    setOfferPlayer(player);
    setOfferType(type);
    setGeneratedOffer(null);
    if (type === 'buy') {
      setOfferAmount(calculateMarketValue(player).toString());
    } else if (type === 'sell' || type === 'loan_out') {
      // Brasfoot style: immediate random offer
      const baseValue = calculateMarketValue(player);
      // Random offer between 70% and 130% of market value for sale
      // For loan, random salary % between 20% and 100%
      if (type === 'sell') {
         const offer = Math.floor(baseValue * (0.7 + Math.random() * 0.6));
         setGeneratedOffer(offer);
         setOfferAmount(offer.toString());
      } else {
         const offer = Math.floor(20 + Math.random() * 80);
         setGeneratedOffer(offer);
         setOfferAmount(offer.toString());
      }
    } else {
      setOfferAmount('');
    }
  };

  const submitOffer = async () => {
    if (!offerPlayer || !saveId) return;
    const amount = parseInt(offerAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (offerType === 'sell') {
       setIsProcessing(true);
       try {
         // Add money to balance
         const newBalance = balance + generatedOffer!;
         // We remove player from current team in DB. For now, since buyPlayerDb requires a target team, we can mock it by setting target team to a generic ID or just use supabase.
         // Actually, supabaseServices doesn't have a direct "sell to generic" function yet, let's use a workaround or update gameStore.
         if (offerPlayer) {
          useGameStore.getState().sellPlayer(offerPlayer.id, generatedOffer!);
          useGameStore.getState().unlockAchievement("first_sale");
        }
         alert(language === "pt" ? `Jogador vendido por ${formatCurrency(generatedOffer!)}!` : `Player sold for ${formatCurrency(generatedOffer!)}!`);
         setSelectedTeamSquad(prev => prev.filter(p => p.id !== offerPlayer.id));
       } finally {
         setIsProcessing(false);
       }
       setOfferPlayer(null);
       return;
    }

    if (offerType === 'loan_out') {
       alert(language === "pt" ? `Jogador emprestado! Clube pagará ${generatedOffer}% do salário.` : `Player loaned out! Club will pay ${generatedOffer}% of salary.`);
       setSelectedTeamSquad(prev => prev.filter(p => p.id !== offerPlayer.id));
       setOfferPlayer(null);
       return;
    }

    if (amount > balance) {
      alert(language === "pt" ? "Você não tem fundos suficientes!" : "You don't have enough funds!");
      return;
    }

    const userClub = clubsData.find(c => c.original_id === playerTeamId);
    if (!userClub) return;

    const targetTeam = clubsData.find(c => c.id === selectedTeamId);
    if (!targetTeam) return;

    const userRelevanceLevel = getRelevanceLevel(getTeamRelevance(userClub.rating));
    const targetRelevanceLevel = getRelevanceLevel(getTeamRelevance(targetTeam.rating));

    // Restriction Logic
    if (targetRelevanceLevel > userRelevanceLevel + 1) {
       alert(language === "pt" ? `O jogador recusou a oferta. O ${targetTeam.name} tem uma reputação muito maior que a nossa e ele não tem interesse em jogar aqui no momento.` : `The player rejected the offer. ${targetTeam.name} has a much higher reputation and he has no interest in joining us right now.`);
       setOfferPlayer(null);
       return;
    }

    const marketValue = calculateMarketValue(offerPlayer);
    if (amount >= marketValue * 0.9) {
      setIsProcessing(true);
      try {
        const newBalance = balance - amount;
        
        if (offerType === 'buy') {
           await buyPlayerDb(saveId, offerPlayer.id, selectedTeamId!, userClub.id, amount, newBalance);
           const success = await buyPlayer(offerPlayer, amount);
           if (success) {
              useGameStore.getState().unlockAchievement("first_signing");
              alert(language === "pt" ? `Proposta aceita! ${offerPlayer.name} agora é do seu time.` : `Offer accepted! ${offerPlayer.name} has joined your team.`);
              setSelectedTeamSquad(prev => prev.filter(p => p.id !== offerPlayer.id));
           }
        } else {
           await loanPlayerDb(saveId, offerPlayer.id, selectedTeamId!, userClub.id, 12, amount);
           alert(language === "pt" ? `Empréstimo aceito! ${offerPlayer.name} ficará 1 ano no clube pagando ${amount}% do salário.` : `Loan accepted! ${offerPlayer.name} joined for 1 year paying ${amount}% of salary.`);
           setSelectedTeamSquad(prev => prev.filter(p => p.id !== offerPlayer.id));
        }
      } catch (err) {
        console.error("Purchase failed", err);
        alert("Erro ao efetuar a compra no banco de dados.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert(language === "pt" ? `A diretoria recusou sua oferta de ${formatCurrency(amount)}.` : `The board rejected your offer of ${formatCurrency(amount)}.`);
    }
    setOfferPlayer(null);
  };

  return (
    <main className="font-sans bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen px-4 py-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-4 transition-colors">
      {/* Left Column: Search & Teams List */}
      <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
        <section className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          <div className="bg-green-800 dark:bg-green-900 text-white font-bold text-[12px] uppercase px-3 py-2 border-b-2 border-black dark:border-gray-900 mb-3">
            {language === 'pt' ? 'Busca de Clubes' : 'Club Search'}
          </div>

          <div className="mb-3">
            <input
              type="text"
              placeholder={language === 'pt' ? 'Nome do time...' : 'Team name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.replace(/<\/?[^>]+(>|$)/g, ""))}
              className="w-full bg-gray-100 dark:bg-gray-900 border border-black dark:border-gray-600 px-2 py-1 text-[12px] font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-800"
            />
          </div>

          <div className="mb-3">
            <div className="bg-white dark:bg-gray-900 border border-black dark:border-gray-600 max-h-[150px] overflow-y-auto">
              {Object.entries(groupedLeagues).map(([folder, leagues]) => (
                <div key={folder}>
                  <div 
                    onClick={() => toggleFolder(folder)}
                    className="flex p-1 text-[12px] cursor-pointer bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 font-bold hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    <span className="w-6 text-center font-mono">
                      {expandedFolders.includes(folder) ? '[-]' : '[+]'}
                    </span>
                    <span className="flex-1 text-black dark:text-white">{folder}</span>
                  </div>
                  {expandedFolders.includes(folder) && (leagues as any[]).map((league: any) => (
                    <div 
                      key={league.id} 
                      onClick={() => {
                         setSelectedLeagueId(league.id);
                         setSelectedTeamId(null);
                      }}
                      className={`flex p-1 pl-4 text-[12px] cursor-pointer border-b border-gray-300 dark:border-gray-700 ${selectedLeagueId === league.id ? 'bf-select' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-gray-300'}`}
                    >
                      <span className="text-gray-500 mr-2">|--</span>
                      <div className="flex-1 flex items-center font-bold">
                        {league.name}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="h-[400px] overflow-y-auto border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900">
            {filteredTeams.length === 0 ? (
              <p className="text-[10px] text-center mt-4 text-gray-500">
                {language === 'pt' ? 'Nenhum time encontrado.' : 'No teams found.'}
              </p>
            ) : (
              <div className="flex flex-col">
                {filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`flex items-center gap-2 p-1 text-left border-b border-gray-200 dark:border-gray-700 transition-colors ${selectedTeamId === team.id ? 'bg-green-800 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white'}`}
                  >
                    <div className="w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center p-0.5 shrink-0">
                      {team.badgeUrl ? (
                        <img src={team.badgeUrl} alt={team.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-[10px] text-gray-400">shield</span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold truncate">
                      {team.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Selected Team Squad */}
      <div className="flex-1 flex flex-col border border-black dark:border-gray-600 bg-white dark:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
        {selectedTeam ? (
          <>
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 border-b-2 border-black dark:border-gray-900 flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 flex items-center justify-center p-1 shrink-0 border border-gray-400 dark:border-gray-600 shadow-sm">
                {selectedTeam.badgeUrl ? (
                  <img src={selectedTeam.badgeUrl} alt={selectedTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-gray-400">shield</span>
                )}
              </div>
              <div>
                <h2 className="text-[16px] font-black text-green-800 dark:text-green-400 uppercase tracking-tight">
                  {selectedTeam.name}
                </h2>
                <div className="flex gap-2 items-center">
                  <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                    OVR: {selectedTeam.rating} | {selectedTeamSquad.length} {language === 'pt' ? 'jogadores' : 'players'}
                  </p>
                  <span className="text-[10px] bg-purple-700 text-white px-2 rounded-full uppercase">
                    {getTeamRelevance(selectedTeam.rating)}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-auto flex-1 bg-gray-50 dark:bg-gray-900">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700 z-10">
                  <tr className="border-b-2 border-black dark:border-gray-900">
                    <th className="p-1 px-2 text-[11px] font-bold w-12 text-center border-r border-gray-400 dark:border-gray-600">P</th>
                    <th className="p-1 px-2 text-[11px] font-bold border-r border-gray-400 dark:border-gray-600">{language === 'pt' ? 'Nome' : 'Name'}</th>
                    <th className="p-1 px-2 text-[11px] font-bold w-12 text-center border-r border-gray-400 dark:border-gray-600">Id.</th>
                    <th className="p-1 px-2 text-[11px] font-bold w-16 text-center border-r border-gray-400 dark:border-gray-600">Força</th>
                    <th className="p-1 px-2 text-[11px] font-bold w-12 text-center border-r border-gray-400 dark:border-gray-600" title="Gols">G</th>
                    <th className="p-1 px-2 text-[11px] font-bold w-12 text-center border-r border-gray-400 dark:border-gray-600" title="Assistências">A</th>
                    <th className="p-1 px-2 text-[11px] font-bold w-24 text-right border-r border-gray-400 dark:border-gray-600">Valor (Est.)</th>
                    <th className="p-1 px-2 text-[11px] font-bold w-20 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] font-bold">
                  {selectedTeamSquad.map((player: any) => {
                    const estValue = calculateMarketValue(player);
                    
                    let rowClass = 'bg-white dark:bg-gray-800';
                    if (player.position === 'GK') rowClass = 'bf-gk';
                    else if (['CB', 'LB', 'RB'].includes(player.position)) rowClass = 'bf-def';
                    else if (['CM', 'CDM', 'CAM', 'RM', 'LM'].includes(player.position)) rowClass = 'bf-mid';
                    else rowClass = 'bf-atk';

                    const isMyTeam = selectedTeam?.original_id === playerTeamId;

                    return (
                      <tr key={player.id} className={`border-b border-black/10 dark:border-black/30 hover:brightness-95 transition-all ${rowClass}`}>
                        <td className="p-1 px-2 text-center border-r border-black/20 dark:border-black/40">
                          {player.position.charAt(0)}
                        </td>
                        <td className="p-1 px-2 truncate border-r border-black/20 dark:border-black/40">{player.name}</td>
                        <td className={`p-1 px-2 text-center border-r border-black/20 dark:border-black/40 ${(player.age && player.age >= 33) ? 'text-red-600 font-black' : ''}`}>{player.age || '-'}</td>
                        <td className="p-1 px-2 text-center border-r border-black/20 dark:border-black/40 text-black/80">{player.rating}</td>
                        <td className="p-1 px-2 text-center border-r border-black/20 dark:border-black/40 font-black text-black/70">{player.goals || 0}</td>
                        <td className="p-1 px-2 text-center border-r border-black/20 dark:border-black/40 font-black text-black/70">{player.assists || 0}</td>
                        <td className="p-1 px-2 text-right border-r border-black/20 dark:border-black/40 bg-black/5">
                          {formatCurrency(estValue)}
                        </td>
                        <td className="p-1 px-2 text-center bg-black/5 flex gap-1 justify-center">
                          {isMyTeam ? (
                            <>
                              <button
                                onClick={() => handleMakeOffer(player, 'sell')}
                                className="bg-red-700 text-white px-2 py-0.5 text-[9px] uppercase border border-black shadow-sm hover:bg-red-600 active:translate-y-[1px] active:shadow-none transition-all"
                                title={language === 'pt' ? 'Vender' : 'Sell'}
                              >
                                <span className="material-symbols-outlined text-[12px]">sell</span>
                              </button>
                              <button
                                onClick={() => handleMakeOffer(player, 'loan_out')}
                                className="bg-orange-700 text-white px-2 py-0.5 text-[9px] uppercase border border-black shadow-sm hover:bg-orange-600 active:translate-y-[1px] active:shadow-none transition-all"
                                title={language === 'pt' ? 'Emprestar' : 'Loan Out'}
                              >
                                <span className="material-symbols-outlined text-[12px]">flight_takeoff</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleMakeOffer(player, 'buy')}
                                className="bg-green-700 text-white px-2 py-0.5 text-[9px] uppercase border border-black shadow-sm hover:bg-green-600 active:translate-y-[1px] active:shadow-none transition-all"
                                title={language === 'pt' ? 'Comprar' : 'Buy'}
                              >
                                <span className="material-symbols-outlined text-[12px]">payments</span>
                              </button>
                              <button
                                onClick={() => handleMakeOffer(player, 'loan')}
                                className="bg-blue-700 text-white px-2 py-0.5 text-[9px] uppercase border border-black shadow-sm hover:bg-blue-600 active:translate-y-[1px] active:shadow-none transition-all"
                                title={language === 'pt' ? 'Empréstimo' : 'Loan'}
                              >
                                <span className="material-symbols-outlined text-[12px]">handshake</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">search</span>
              <p className="text-[12px] font-bold uppercase tracking-widest">
                {language === 'pt' ? 'Selecione um clube para ver o elenco' : 'Select a club to view squad'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {offerPlayer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-200 dark:bg-gray-800 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] max-w-sm w-full">
            <div className="bg-green-800 dark:bg-green-900 text-white px-4 py-2 border-b-2 border-black dark:border-gray-900 flex justify-between items-center font-bold">
              <span className="text-[14px] uppercase tracking-wide">
                {offerType === 'buy' ? (language === 'pt' ? 'Comprar Jogador' : 'Buy Player') : 
                 offerType === 'sell' ? (language === 'pt' ? 'Proposta Recebida' : 'Offer Received') :
                 offerType === 'loan_out' ? (language === 'pt' ? 'Proposta de Empréstimo' : 'Loan Offer') :
                 (language === 'pt' ? 'Empréstimo' : 'Loan Player')}
              </span>
              <button onClick={() => setOfferPlayer(null)} className="hover:text-red-300">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4 font-sans text-black dark:text-white font-bold">
              <div className="flex justify-between font-bold text-sm bg-gray-100 dark:bg-gray-900 p-2 mb-2">
                  <span className="truncate max-w-[200px]">{offerPlayer.name}</span>
                  <span>OVR: {offerPlayer.rating}</span>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-4 text-center">
                  Est. Market Value: {formatCurrency(calculateMarketValue(offerPlayer))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase text-gray-600 dark:text-gray-400">
                  {offerType === 'buy' ? (language === 'pt' ? 'Valor da Oferta ($)' : 'Offer Amount ($)') :
                   offerType === 'sell' ? (language === 'pt' ? 'Valor Oferecido pelo Clube ($)' : 'Offered Amount ($)') :
                   offerType === 'loan_out' ? (language === 'pt' ? 'Porcentagem de Salário que irão pagar (%)' : 'Salary % they will pay') :
                   (language === 'pt' ? 'Porcentagem de Salário a pagar (%)' : 'Salary % to pay')}
                </label>
                <div className="flex">
                   <span className="bg-gray-300 dark:bg-gray-600 border border-black dark:border-gray-500 border-r-0 px-2 py-1 flex items-center justify-center font-mono">
                     {offerType === 'buy' || offerType === 'sell' ? '$' : '%'}
                   </span>
                   <input
                     type="number"
                     value={offerAmount}
                     onChange={(e) => setOfferAmount(e.target.value)}
                     disabled={offerType === 'sell' || offerType === 'loan_out'}
                     className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-black dark:border-gray-500 px-3 py-1 focus:outline-none font-mono disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                   />
                </div>
                <p className="text-[9px] text-green-700 dark:text-green-400 mt-1">
                  Your Balance: {formatCurrency(balance)}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={submitOffer}
                  disabled={isProcessing}
                  className="flex-1 bg-green-700 text-white font-bold text-[12px] py-2 uppercase border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {isProcessing ? "..." : (offerType === 'sell' || offerType === 'loan_out' ? (language === 'pt' ? 'Aceitar' : 'Accept') : (language === 'pt' ? 'Enviar' : 'Submit'))}
                </button>
                <button 
                  onClick={() => setOfferPlayer(null)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 text-black font-bold text-[12px] py-2 uppercase border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  {language === 'pt' ? (offerType === 'sell' || offerType === 'loan_out' ? 'Recusar' : 'Cancelar') : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
