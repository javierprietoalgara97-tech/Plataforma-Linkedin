import { useState } from 'react';
import { useApp } from '../context/AppContext';

const NAV = [
  { id: 'dashboard',     label: 'Dashboard',      icon: '⊞' },
  { id: 'chat',          label: 'Chat IA',         icon: '✦' },
  { id: 'calendario',    label: 'Calendario',      icon: '▦' },
  { id: 'biblioteca',    label: 'Biblioteca',      icon: '▤' },
  { id: 'investigacion', label: 'Investigación',   icon: '◈' },
  { id: 'analiticas',    label: 'Analíticas',      icon: '◎' },
];

const BOTTOM_NAV = [
  { id: 'configuracion', label: 'Configuración', icon: '⚙' },
];

const ALL_NAV = [...NAV, ...BOTTOM_NAV];

export function Sidebar() {
  const { section, navigateTo } = useApp();
  const [open, setOpen] = useState(false);

  function go(id) {
    navigateTo(id);
    setOpen(false);
  }

  const currentLabel = ALL_NAV.find(n => n.id === section)?.label ?? 'LinkedIn Studio';

  return (
    <>
      {/* ── DESKTOP sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-56 h-screen bg-white border-r border-gray-100 flex-col fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">in</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">LinkedIn Studio</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                section === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          {BOTTOM_NAV.map(item => (
            <button key={item.id} onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                section === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── MOBILE top bar ──────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center h-14 px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100"
          aria-label="Abrir menú"
        >
          <span className="block w-5 h-0.5 bg-gray-700 rounded" />
          <span className="block w-5 h-0.5 bg-gray-700 rounded" />
          <span className="block w-5 h-0.5 bg-gray-700 rounded" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">in</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">{currentLabel}</span>
        </div>
      </header>

      {/* ── MOBILE drawer overlay ───────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── MOBILE drawer ───────────────────────────────────── */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-72 z-50 bg-[#1e2a4a] flex flex-col transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">in</span>
            </div>
            <span className="text-white font-semibold text-base">LinkedIn Studio</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors text-left ${
                section === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}>
              <span className="text-lg w-6 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom config */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {BOTTOM_NAV.map(item => (
            <button key={item.id} onClick={() => go(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors text-left ${
                section === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}>
              <span className="text-lg w-6 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
