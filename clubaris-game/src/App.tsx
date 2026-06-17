import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardClubHouse from './pages/DashboardClubHouse';
import EscalacaoTatica from './pages/EscalacaoTatica';
import GerenciamentoTatico from './pages/GerenciamentoTatico';
import HomeClubHouse from './pages/HomeClubHouse';
import MercadoTransferencias from './pages/MercadoTransferencias';
import SimulacaoPartida from './pages/SimulacaoPartida';
import StartMenu from './pages/StartMenu';
import Clubes from './pages/Clubes';
import SalaTrofeus from './pages/SalaTrofeus';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import GameGuide from './components/GameGuide';
import { useGameStore } from './store/gameStore';

function AppContent() {
  const { teamName } = useGameStore();

  if (!teamName) {
    return <StartMenu />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans pb-24 overflow-x-hidden">
      <TopBar title={teamName} />
      <GameGuide />
      <Routes>
        <Route path="/" element={<HomeClubHouse />} />
        <Route path="/dashboard" element={<DashboardClubHouse />} />
        <Route path="/escalacao" element={<EscalacaoTatica />} />
        <Route path="/tatico" element={<GerenciamentoTatico />} />
        <Route path="/mercado" element={<MercadoTransferencias />} />
        <Route path="/partida" element={<SimulacaoPartida />} />
        <Route path="/clubes" element={<Clubes />} />
        <Route path="/trofeus" element={<SalaTrofeus />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
