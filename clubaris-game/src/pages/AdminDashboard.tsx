import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  email: string;
  role: string;
  playtime_seconds: number;
  last_active: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useGameStore();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [totalSaves, setTotalSaves] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin
    if (!user || user.email !== "carneiro.gesse@gmail.com") {
      navigate("/");
      return;
    }

    async function loadStats() {
      try {
        // Fetch Profiles
        const { data: pData } = await supabase.from('profiles').select('*').order('last_active', { ascending: false });
        if (pData) setProfiles(pData);

        // Fetch Total Saves
        const { count: sCount } = await supabase.from('saves').select('*', { count: 'exact', head: true });
        setTotalSaves(sCount || 0);

      } catch (err) {
        console.error("Error loading admin stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [user, navigate]);

  const formatPlaytime = (seconds: number) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const isActiveNow = (lastActiveIso: string) => {
    const last = new Date(lastActiveIso).getTime();
    const now = new Date().getTime();
    const diffMins = (now - last) / 1000 / 60;
    return diffMins < 5; // active in the last 5 minutes
  };

  const activePlayersCount = profiles.filter(p => isActiveNow(p.last_active)).length;
  const totalPlaytime = profiles.reduce((acc, p) => acc + (p.playtime_seconds || 0), 0);

  if (isLoading) return <div className="text-white text-center p-10">Carregando painel admin...</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-black uppercase text-blue-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            Painel Administrativo
          </h1>
          <button onClick={() => navigate("/")} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 font-bold rounded">
            Voltar ao Jogo
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col gap-1">
            <span className="text-gray-400 text-xs uppercase font-bold">Total de Usuários</span>
            <span className="text-3xl font-black">{profiles.length}</span>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-blue-900 flex flex-col gap-1">
            <span className="text-blue-400 text-xs uppercase font-bold">Jogadores Online (5 min)</span>
            <span className="text-3xl font-black text-blue-400 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              {activePlayersCount}
            </span>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col gap-1">
            <span className="text-gray-400 text-xs uppercase font-bold">Saves Criados</span>
            <span className="text-3xl font-black text-green-400">{totalSaves}</span>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700 flex flex-col gap-1">
            <span className="text-gray-400 text-xs uppercase font-bold">Tempo Total Jogado (Global)</span>
            <span className="text-3xl font-black text-purple-400">{formatPlaytime(totalPlaytime)}</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-850 border-b border-gray-700">
            <h2 className="font-bold uppercase text-sm">Lista de Usuários</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">Email</th>
                  <th className="px-4 py-3 font-bold">Cargo</th>
                  <th className="px-4 py-3 font-bold">Tempo Jogado</th>
                  <th className="px-4 py-3 font-bold">Última Atividade</th>
                  <th className="px-4 py-3 font-bold">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3 font-bold flex items-center gap-2">
                      {isActiveNow(p.last_active) && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      {p.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${p.role === 'admin' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{formatPlaytime(p.playtime_seconds)}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(p.last_active).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
