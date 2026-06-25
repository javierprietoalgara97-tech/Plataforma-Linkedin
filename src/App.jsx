import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/sections/Dashboard';
import { ChatIA } from './components/sections/ChatIA';
import { Calendario } from './components/sections/Calendario';
import { Investigacion } from './components/sections/Investigacion';
import { Biblioteca } from './components/sections/Biblioteca';
import { Analiticas } from './components/sections/Analiticas';
import { Configuracion } from './components/sections/Configuracion';

const SECTIONS = {
  dashboard: Dashboard,
  chat: ChatIA,
  calendario: Calendario,
  investigacion: Investigacion,
  biblioteca: Biblioteca,
  analiticas: Analiticas,
  configuracion: Configuracion,
};

function AppContent() {
  const { section } = useApp();
  const Section = SECTIONS[section] || Dashboard;

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      <main className="md:ml-56 flex-1 min-h-screen pt-14 md:pt-0 w-full overflow-x-hidden">
        <Section />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
