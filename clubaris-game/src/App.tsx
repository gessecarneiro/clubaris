import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardClubHouse from './pages/DashboardClubHouse';
import EscalacaoTatica from './pages/EscalacaoTatica';
import GerenciamentoTatico from './pages/GerenciamentoTatico';
import HomeClubHouse from './pages/HomeClubHouse';
import BuscaGlobal from './pages/BuscaGlobal';
import VerTimes from './pages/VerTimes';
import SimulacaoPartida from './pages/SimulacaoPartida';
import Treinamento from './pages/Treinamento';
import SetupGame from './pages/SetupGame';
import LoadGame from './pages/LoadGame';
import Infraestrutura from './pages/Infraestrutura';
import CategoriasBase from './pages/CategoriasBase';
import CreateManager from './pages/CreateManager';
import MainMenu from './pages/MainMenu';
import Login from './pages/Login';
import DevLogin from './pages/DevLogin';
import Calendar from './pages/Calendar';
import SalaTrofeus from './pages/SalaTrofeus';
import CaixaMensagens from './pages/CaixaMensagens';
import Contratos from './pages/Contratos';
import Financas from './pages/Financas';
import Classificacao from './pages/Classificacao';
import PenaltyMinigame from './pages/PenaltyMinigame';
import Conquistas from './pages/Conquistas';
import AdminDashboard from './pages/AdminDashboard';
import TopBar from './components/TopBar';
import TopNav from './components/TopNav';
import GameGuide from './components/GameGuide';
import AchievementToast from './components/AchievementToast';
import { useGameStore } from './store/gameStore';
import { supabase } from './lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';

function MainGameLayout({ children }: { children: React.ReactNode }) {
  const { teamName, user } = useGameStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!teamName) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-on-background font-sans pt-32 pb-8 overflow-x-hidden"
    >
      <TopBar title={teamName} />
      <TopNav />
      <GameGuide />
      <AchievementToast />
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useGameStore();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Route */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/dev" element={user ? <Navigate to="/" replace /> : <DevLogin />} />
        <Route path="/admin" element={user && user.email === 'carneiro.gesse@gmail.com' ? <AdminDashboard /> : <Navigate to="/" replace />} />
        
        {/* Protected Menu Routes */}
        <Route path="/" element={user ? <MainMenu /> : <Navigate to="/login" replace />} />
        <Route path="/criar-treinador" element={user ? <CreateManager /> : <Navigate to="/login" replace />} />
        <Route path="/novo-jogo" element={user ? <SetupGame /> : <Navigate to="/login" replace />} />
        <Route path="/setup" element={user ? <SetupGame /> : <Navigate to="/login" replace />} />
        <Route path="/load" element={user ? <LoadGame /> : <Navigate to="/login" replace />} />
        
        {/* Game Routes wrapped in Layout */}
        <Route path="/clubhouse" element={<MainGameLayout><HomeClubHouse /></MainGameLayout>} />
        <Route path="/dashboard" element={<MainGameLayout><DashboardClubHouse /></MainGameLayout>} />
        <Route path="/infraestrutura" element={<MainGameLayout><Infraestrutura /></MainGameLayout>} />
        <Route path="/base" element={<MainGameLayout><CategoriasBase /></MainGameLayout>} />
        <Route path="/escalacao" element={<MainGameLayout><EscalacaoTatica /></MainGameLayout>} />
        <Route path="/tatico" element={<MainGameLayout><GerenciamentoTatico /></MainGameLayout>} />
        <Route path="/busca" element={<MainGameLayout><BuscaGlobal /></MainGameLayout>} />
        <Route path="/times" element={<MainGameLayout><VerTimes /></MainGameLayout>} />
        <Route path="/treinamento" element={<MainGameLayout><Treinamento /></MainGameLayout>} />
        <Route path="/partida" element={<MainGameLayout><SimulacaoPartida /></MainGameLayout>} />
        <Route path="/calendario" element={<MainGameLayout><Calendar /></MainGameLayout>} />
        <Route path="/trofeus" element={<MainGameLayout><SalaTrofeus /></MainGameLayout>} />
        <Route path="/conquistas" element={<MainGameLayout><Conquistas /></MainGameLayout>} />
        <Route path="/classificacao" element={<MainGameLayout><Classificacao /></MainGameLayout>} />
        <Route path="/inbox" element={<MainGameLayout><CaixaMensagens /></MainGameLayout>} />
        <Route path="/contratos" element={<MainGameLayout><Contratos /></MainGameLayout>} />
        <Route path="/financas" element={<MainGameLayout><Financas /></MainGameLayout>} />
        
        {/* Minigames / Extras */}
        <Route path="/penalty-training" element={<PenaltyMinigame />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { theme, user } = useGameStore();

  useEffect(() => {
    if (!user) return;
    
    // Heartbeat: update every 1 minute
    const interval = setInterval(async () => {
      try {
         await import('./lib/supabase').then(m => {
           m.supabase.rpc('update_heartbeat', { user_id: user.id, added_seconds: 60 });
         });
      } catch (err) {
         console.error('Heartbeat failed', err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Check active session on load
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      useGameStore.getState().setUser(data.session?.user || null);
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useGameStore.getState().setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
