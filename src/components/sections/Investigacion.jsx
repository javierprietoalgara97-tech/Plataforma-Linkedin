import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchArticles, groupArticlesByDate } from '../../services/supabase';
import { getPostIdeas } from '../../services/anthropic';
import storage from '../../services/storage';

function getWeekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const startOfWeek = new Date(d);
  const day = d.getDay() || 7;
  startOfWeek.setDate(d.getDate() - day + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return `${startOfWeek.getDate()}–${endOfWeek.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short' })}`;
}

function groupByWeek(datesByMonth) {
  const weeks = {};
  Object.keys(datesByMonth).sort().reverse().forEach(date => {
    const label = getWeekLabel(date);
    if (!weeks[label]) weeks[label] = [];
    weeks[label].push(date);
  });
  return weeks;
}

export function Investigacion() {
  const { settings, navigateTo } = useApp();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [ideas, setIdeas] = useState('');
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    const cache = storage.get('newsCache');
    if (cache?.articles) setArticles(cache.articles);

    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      setLoading(true);
      fetchArticles(settings.supabaseUrl, settings.supabaseAnonKey)
        .then(setArticles)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, []);

  const byDate = useMemo(() => groupArticlesByDate(articles), [articles]);

  // Agrupar por mes
  const byMonth = useMemo(() => {
    const months = {};
    Object.keys(byDate).sort().reverse().forEach(date => {
      const d = new Date(date + 'T00:00:00');
      const key = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!months[key]) months[key] = {};
      months[key][date] = byDate[date];
    });
    return months;
  }, [byDate]);

  // Filtrar artículos
  const filteredArticles = useMemo(() => {
    let list = articles;
    if (selectedDate) list = list.filter(a => a.fecha === selectedDate);
    else if (selectedWeek) {
      // filtrar por la semana seleccionada
      const weekDates = Object.values(byMonth).flatMap(month =>
        Object.entries(groupByWeek(month))
          .filter(([label]) => label === selectedWeek)
          .flatMap(([, dates]) => dates)
      );
      list = list.filter(a => weekDates.includes(a.fecha));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.titulo_es?.toLowerCase().includes(q) || a.resumen_es?.toLowerCase().includes(q));
    }
    if (catFilter) list = list.filter(a => a.categoria === catFilter);
    return list;
  }, [articles, selectedDate, selectedWeek, search, catFilter, byMonth]);

  const categories = useMemo(() => [...new Set(articles.map(a => a.categoria).filter(Boolean))].sort(), [articles]);

  const byCategory = useMemo(() => {
    const grouped = {};
    filteredArticles.forEach(a => {
      const cat = a.categoria || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(a);
    });
    return grouped;
  }, [filteredArticles]);

  async function loadIdeas(article) {
    if (!settings.anthropicApiKey) return;
    setLoadingIdeas(true);
    setIdeas('');
    try {
      const result = await getPostIdeas(article, settings.anthropicApiKey);
      setIdeas(result);
    } catch (e) {
      setIdeas(`Error: ${e.message}`);
    }
    setLoadingIdeas(false);
  }

  const lastUpdate = storage.get('newsCache')?.timestamp;

  return (
    <div className="flex h-screen">
      {/* Árbol temporal */}
      <div className="w-56 border-r border-gray-100 bg-white flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Investigación</h2>
          {lastUpdate && (
            <p className="text-xs text-gray-400 mt-1">
              Act. {new Date(lastUpdate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <button
            onClick={() => { setSelectedDate(null); setSelectedWeek(null); }}
            className={`w-full text-left px-4 py-1.5 text-sm ${!selectedDate && !selectedWeek ? 'text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Todos ({articles.length})
          </button>
          {Object.entries(byMonth).map(([monthLabel, monthDates]) => {
            const weeks = groupByWeek(monthDates);
            const isExpanded = expandedMonths[monthLabel] !== false;
            return (
              <div key={monthLabel}>
                <button
                  onClick={() => setExpandedMonths(m => ({ ...m, [monthLabel]: !isExpanded }))}
                  className="w-full text-left px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-50 flex items-center justify-between"
                >
                  {monthLabel}
                  <span>{isExpanded ? '▾' : '▸'}</span>
                </button>
                {isExpanded && Object.entries(weeks).map(([weekLabel, dates]) => {
                  const weekExpanded = expandedWeeks[weekLabel] !== false;
                  const weekCount = dates.reduce((acc, d) => acc + (byDate[d]?.length || 0), 0);
                  return (
                    <div key={weekLabel}>
                      <button
                        onClick={() => {
                          setExpandedWeeks(w => ({ ...w, [weekLabel]: !weekExpanded }));
                          setSelectedDate(null);
                          setSelectedWeek(weekExpanded ? null : weekLabel);
                        }}
                        className={`w-full text-left px-6 py-1 text-xs flex items-center justify-between ${selectedWeek === weekLabel ? 'text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span>Sem. {weekLabel}</span>
                        <span className="text-gray-400">{weekCount}</span>
                      </button>
                      {weekExpanded && dates.sort().reverse().map(date => (
                        <button
                          key={date}
                          onClick={() => { setSelectedDate(date); setSelectedWeek(null); }}
                          className={`w-full text-left px-8 py-1 text-xs flex items-center justify-between ${selectedDate === date ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                          <span>{new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                          <span>{byDate[date]?.length || 0}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Buscador */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar en noticias..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-sm text-gray-400">{filteredArticles.length} artículos</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading && <p className="text-gray-400 text-sm">Cargando noticias...</p>}
          {error && <p className="text-amber-600 text-sm bg-amber-50 px-4 py-3 rounded-lg">{error}</p>}

          {Object.entries(byCategory).map(([cat, arts]) => (
            <div key={cat} className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{cat}</h3>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {arts.map(article => (
                  <div
                    key={article.id}
                    onClick={() => { setSelectedArticle(article); setIdeas(''); }}
                    className="bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">{article.titulo_es}</p>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{article.resumen_es}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-300">{article.fecha}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); navigateTo('chat', { type: 'news', data: article }); }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Crear post →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredArticles.length === 0 && !loading && (
            <div className="text-center text-gray-400 mt-16">
              <p className="text-4xl mb-3">◈</p>
              <p className="text-sm">No hay artículos para mostrar</p>
              {!settings.supabaseUrl && <p className="text-xs mt-2">Configura Supabase en ajustes para recibir noticias diarias</p>}
            </div>
          )}
        </div>
      </div>

      {/* Panel artículo */}
      {selectedArticle && (
        <div className="w-80 border-l border-gray-100 bg-white flex flex-col flex-shrink-0">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Artículo</h3>
            <button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">{selectedArticle.categoria}</span>
              <h4 className="font-semibold text-gray-900 mt-1 leading-snug">{selectedArticle.titulo_es}</h4>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selectedArticle.resumen_es}</p>
              {selectedArticle.url_original && (
                <a href={selectedArticle.url_original} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                  Ver artículo original ↗
                </a>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-900">Ideas de post</h5>
                <button
                  onClick={() => loadIdeas(selectedArticle)}
                  disabled={loadingIdeas || !settings.anthropicApiKey}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40"
                >
                  {loadingIdeas ? 'Generando...' : 'Generar ✦'}
                </button>
              </div>
              {ideas && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ideas}</p>}
              {!settings.anthropicApiKey && <p className="text-xs text-gray-400">Necesitas API key de Anthropic</p>}
            </div>
          </div>
          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={() => navigateTo('chat', { type: 'news', data: selectedArticle })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg"
            >
              Crear post sobre esto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
