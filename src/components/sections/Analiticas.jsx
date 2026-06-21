import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { getMonthName, getDayName } from '../../utils/dates';

function MetricsModal({ post, onClose }) {
  const { updatePost } = useApp();
  const [form, setForm] = useState({
    impresiones: post.metricas?.impresiones || '',
    reacciones: post.metricas?.reacciones || '',
    comentarios: post.metricas?.comentarios || '',
    compartidos: post.metricas?.compartidos || '',
    verMas: post.metricas?.verMas || '',
  });

  function save() {
    updatePost(post.id, {
      metricas: {
        impresiones: Number(form.impresiones) || 0,
        reacciones: Number(form.reacciones) || 0,
        comentarios: Number(form.comentarios) || 0,
        compartidos: Number(form.compartidos) || 0,
        verMas: Number(form.verMas) || 0,
      },
    });
    onClose();
  }

  return (
    <Modal title="Actualizar métricas" onClose={onClose}>
      <div className="space-y-3">
        {[['impresiones', 'Impresiones'], ['reacciones', 'Reacciones'], ['comentarios', 'Comentarios'], ['compartidos', 'Compartidos'], ['verMas', 'Clics "Ver más"']].map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-gray-500 font-medium">{label}</label>
            <input
              type="number"
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg mt-2">
          Guardar métricas
        </button>
      </div>
    </Modal>
  );
}

export function Analiticas() {
  const { posts, categories } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sortKey, setSortKey] = useState('fechaProgramada');
  const [sortDir, setSortDir] = useState('desc');
  const [metricsPost, setMetricsPost] = useState(null);

  const monthPosts = useMemo(() =>
    posts.filter(p => {
      if (!p.fechaProgramada || !p.metricas) return false;
      const d = new Date(p.fechaProgramada + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }), [posts, year, month]);

  const allMonthPosts = useMemo(() =>
    posts.filter(p => {
      if (!p.fechaProgramada) return false;
      const d = new Date(p.fechaProgramada + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }), [posts, year, month]);

  // KPIs
  const totalImpresiones = monthPosts.reduce((s, p) => s + (p.metricas?.impresiones || 0), 0);
  const mediaReacciones = monthPosts.length
    ? Math.round(monthPosts.reduce((s, p) => s + (p.metricas?.reacciones || 0), 0) / monthPosts.length)
    : 0;

  const dayStats = useMemo(() => {
    const stats = { 1: { total: 0, count: 0 }, 2: { total: 0, count: 0 }, 4: { total: 0, count: 0 } };
    monthPosts.forEach(p => {
      const day = new Date(p.fechaProgramada + 'T00:00:00').getDay();
      if (stats[day]) { stats[day].total += p.metricas?.impresiones || 0; stats[day].count++; }
    });
    return stats;
  }, [monthPosts]);

  const bestDay = Object.entries(dayStats).reduce((best, [day, s]) => {
    const avg = s.count ? s.total / s.count : 0;
    return avg > best.avg ? { day: Number(day), avg } : best;
  }, { day: null, avg: 0 });

  const dayNames = { 1: 'Lunes', 2: 'Martes', 4: 'Jueves' };

  const catStats = useMemo(() => {
    const stats = {};
    monthPosts.forEach(p => {
      const cat = categories.find(c => c.id === p.categoria);
      if (!cat) return;
      if (!stats[cat.nombre]) stats[cat.nombre] = { total: 0, count: 0, color: cat.color };
      stats[cat.nombre].total += p.metricas?.impresiones || 0;
      stats[cat.nombre].count++;
    });
    return Object.entries(stats).map(([nombre, s]) => ({ nombre, media: s.count ? Math.round(s.total / s.count) : 0, color: s.color })).sort((a, b) => b.media - a.media);
  }, [monthPosts, categories]);

  const bestCat = catStats[0];

  // Gráfico de línea por semana
  const weeklyData = useMemo(() => {
    const weeks = {};
    monthPosts.forEach(p => {
      const d = new Date(p.fechaProgramada + 'T00:00:00');
      const weekNum = Math.ceil(d.getDate() / 7);
      const key = `Sem ${weekNum}`;
      if (!weeks[key]) weeks[key] = 0;
      weeks[key] += p.metricas?.impresiones || 0;
    });
    return Object.entries(weeks).map(([semana, impresiones]) => ({ semana, impresiones }));
  }, [monthPosts]);

  // Gráfico barras L/M/J
  const dayChartData = [
    { dia: 'Lunes', media: dayStats[1].count ? Math.round(dayStats[1].total / dayStats[1].count) : 0 },
    { dia: 'Martes', media: dayStats[2].count ? Math.round(dayStats[2].total / dayStats[2].count) : 0 },
    { dia: 'Jueves', media: dayStats[4].count ? Math.round(dayStats[4].total / dayStats[4].count) : 0 },
  ];

  // Tabla ordenable
  const sorted = useMemo(() => {
    return [...allMonthPosts].sort((a, b) => {
      let va = sortKey === 'fechaProgramada' ? (a.fechaProgramada || '') : (a.metricas?.[sortKey] || 0);
      let vb = sortKey === 'fechaProgramada' ? (b.fechaProgramada || '') : (b.metricas?.[sortKey] || 0);
      if (sortDir === 'asc') return va > vb ? 1 : -1;
      return va < vb ? 1 : -1;
    });
  }, [allMonthPosts, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  }

  const SortIcon = ({ k }) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">←</button>
        <h1 className="text-2xl font-semibold text-gray-900 w-44 text-center">{getMonthName(month, year)}</h1>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">→</button>
        <span className="text-sm text-gray-400 ml-2">{monthPosts.length} posts con métricas</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Impresiones totales', value: totalImpresiones.toLocaleString(), sub: 'este mes' },
          { label: 'Media reacciones', value: mediaReacciones.toLocaleString(), sub: 'por post' },
          { label: 'Mejor día', value: bestDay.day ? dayNames[bestDay.day] : '—', sub: bestDay.avg ? `${Math.round(bestDay.avg).toLocaleString()} imp. de media` : 'sin datos' },
          { label: 'Mejor categoría', value: bestCat?.nombre || '—', sub: bestCat ? `${bestCat.media.toLocaleString()} imp. de media` : 'sin datos' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-xs text-gray-400 font-medium">{kpi.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-medium text-gray-900 mb-4 text-sm">Impresiones por semana</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="semana" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip formatter={v => [v.toLocaleString(), 'Impresiones']} />
                <Line type="monotone" dataKey="impresiones" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-300 text-center py-16">Sin datos este mes</p>}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="font-medium text-gray-900 mb-4 text-sm">Media por día</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip formatter={v => [v.toLocaleString(), 'Media imp.']} />
              <Bar dataKey="media" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {catStats.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-8">
          <h3 className="font-medium text-gray-900 mb-4 text-sm">Rendimiento por categoría (media de impresiones)</h3>
          <ResponsiveContainer width="100%" height={Math.max(100, catStats.length * 40)}>
            <BarChart layout="vertical" data={catStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 12, fill: '#6b7280' }} width={150} />
              <Tooltip formatter={v => [v.toLocaleString(), 'Media imp.']} />
              <Bar dataKey="media" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900 text-sm">Posts del mes</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase">Post</th>
              {[['fechaProgramada', 'Fecha'], ['impresiones', 'Impresiones'], ['reacciones', 'Reacciones'], ['comentarios', 'Comentarios']].map(([key, label]) => (
                <th key={key}
                  onClick={() => handleSort(key)}
                  className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-gray-600 select-none">
                  {label}<SortIcon k={key} />
                </th>
              ))}
              <th className="px-4 py-3 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-800 max-w-xs">
                  <p className="line-clamp-1">{post.contenido.slice(0, 80)}</p>
                  {post.actualizadoEn && post.metricas && (
                    <p className="text-xs text-gray-300">Act. {new Date(post.actualizadoEn).toLocaleDateString('es-ES')}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-400">{post.fechaProgramada || '—'}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{post.metricas?.impresiones?.toLocaleString() || '—'}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{post.metricas?.reacciones?.toLocaleString() || '—'}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{post.metricas?.comentarios?.toLocaleString() || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setMetricsPost(post)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    {post.metricas ? 'Actualizar' : 'Añadir métricas'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">No hay posts este mes</p>
        )}
      </div>

      {metricsPost && <MetricsModal post={metricsPost} onClose={() => setMetricsPost(null)} />}
    </div>
  );
}
