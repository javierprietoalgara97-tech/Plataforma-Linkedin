import { useApp } from '../context/AppContext';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'chat', label: 'Chat IA', icon: '✦' },
  { id: 'calendario', label: 'Calendario', icon: '▦' },
  { id: 'investigacion', label: 'Investigación', icon: '◈' },
  { id: 'biblioteca', label: 'Biblioteca', icon: '▤' },
  { id: 'analiticas', label: 'Analíticas', icon: '◎' },
];

const BOTTOM_NAV = [
  { id: 'configuracion', label: 'Configuración', icon: '⚙' },
];

export function Sidebar() {
  const { section, navigateTo } = useApp();

  return (
    <aside className="w-56 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">in</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">LinkedIn Studio</span>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              section === item.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Nav inferior */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        {BOTTOM_NAV.map(item => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              section === item.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
