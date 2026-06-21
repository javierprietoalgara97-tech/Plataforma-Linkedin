import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, CategoryBadge } from '../ui/Badge';
import {
  getPublishDaysInMonth, getDaysInMonth, getMonthName,
  getNextEmptyPublishDay, getStreak, formatDateShort, isPublishDay
} from '../../utils/dates';
import storage from '../../services/storage';

export function Dashboard() {
  const { posts, categories, navigateTo, settings } = useApp();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const publishDays = useMemo(() => getPublishDaysInMonth(year, month), [year, month]);
  const calendarDays = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const monthPosts = useMemo(() =>
    posts.filter(p => {
      if (!p.fechaProgramada) return false;
      const d = new Date(p.fechaProgramada + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }), [posts, year, month]);

  const published = monthPosts.filter(p => p.estado === 'publicado').length;
  const total = publishDays.length;
  const streak = useMemo(() => getStreak(posts), [posts]);
  const nextEmpty = useMemo(() => getNextEmptyPublishDay(posts), [posts]);

  const top5 = useMemo(() => {
    return [...posts]
      .filter(p => p.metricas?.impresiones)
      .sort((a, b) => (b.metricas.impresiones || 0) - (a.metricas.impresiones || 0))
      .slice(0, 5);
  }, [posts]);

  const newsCache = storage.get('newsCache');
  const todayNews = useMemo(() => {
    if (!newsCache?.articles) return [];
    const today = now.toISOString().split('T')[0];
    const todays = newsCache.articles.filter(a => a.fecha === today);
    return (todays.length >= 3 ? todays : newsCache.articles).slice(0, 3);
  }, [newsCache]);

  const getCat = (catId) => categories.find(c => c.id === catId);

  const postsByDay = useMemo(() => {
    const map = {};
    monthPosts.forEach(p => { if (p.fechaProgramada) map[p.fechaProgramada] = p; });
    return map;
  }, [monthPosts]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{getMonthName(month, year)}</h1>
        <p className="text-gray-500 text-sm mt-1">Vista general de tu contenido</p>
      </div>

      {/* Barra de estado */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-gray-900">{published}<span className="text-lg text-gray-400">/{total}</span></div>
          <div className="text-sm text-gray-500 mt-1">Posts publicados este mes</div>
          <div className="mt-3 bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${total > 0 ? (published / total) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-gray-900">{streak}</div>
          <div className="text-sm text-gray-500 mt-1">
            {streak === 1 ? 'semana de racha' : streak > 1 ? 'semanas de racha' : 'Sin racha activa'}
          </div>
          {streak > 0 && <div className="text-xs text-green-600 mt-2 font-medium">¡Sigue así! 🔥</div>}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-sm font-medium text-gray-900">Próximo hueco</div>
          {nextEmpty ? (
            <>
              <div className="text-lg font-semibold text-blue-600 mt-1">{formatDateShort(nextEmpty)}</div>
              <button
                onClick={() => navigateTo('chat', { type: 'date', data: nextEmpty })}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
              >
                Crear post para este día →
              </button>
            </>
          ) : (
            <div className="text-sm text-green-600 mt-1 font-medium">¡Mes completo!</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Top 5 posts */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏆</span> Top 5 posts
          </h2>
          {top5.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no hay posts con métricas. Añade posts históricos en la Biblioteca.</p>
          ) : (
            <div className="space-y-3">
              {top5.map((post, i) => {
                const cat = getCat(post.categoria);
                return (
                  <div key={post.id} className="flex items-start gap-3">
                    <span className="text-lg font-bold text-gray-200 w-6 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2 leading-snug">{post.contenido.slice(0, 80)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-blue-600">{post.metricas.impresiones?.toLocaleString()} imp.</span>
                        {cat && <CategoryBadge category={cat} />}
                      </div>
                      <button
                        onClick={() => navigateTo('chat', { type: 'similar', data: post })}
                        className="text-xs text-gray-400 hover:text-blue-600 mt-1"
                      >
                        Crear post similar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mini calendario */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">📅 {getMonthName(month, year)}</h2>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <div key={d} className="text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const post = postsByDay[day];
              const isPublish = isPublishDay(day);
              const dayNum = new Date(day + 'T00:00:00').getDate();
              const isToday = day === now.toISOString().split('T')[0];

              let cellClass = 'text-xs rounded py-1 cursor-default ';
              if (post) {
                if (post.estado === 'publicado') cellClass += 'bg-green-100 text-green-700 font-semibold';
                else if (post.estado === 'programado') cellClass += 'bg-blue-100 text-blue-700 font-semibold';
                else cellClass += 'bg-gray-100 text-gray-600';
              } else if (isPublish) {
                cellClass += 'bg-blue-50 text-blue-400 cursor-pointer hover:bg-blue-100';
              } else {
                cellClass += 'text-gray-300';
              }
              if (isToday) cellClass += ' ring-1 ring-blue-500';

              return (
                <div
                  key={day}
                  className={cellClass}
                  title={post ? post.contenido.slice(0, 50) : isPublish ? 'Día de publicación — click para crear' : ''}
                  onClick={() => !post && isPublish && navigateTo('chat', { type: 'date', data: day })}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Publicado</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Programado</span>
          </div>
        </div>

        {/* Noticias del día */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>📡 Noticias de hoy</span>
            <button onClick={() => navigateTo('investigacion')} className="text-xs text-blue-600 hover:underline">Ver todas →</button>
          </h2>
          {todayNews.length === 0 ? (
            <p className="text-sm text-gray-400">Configura Supabase en ajustes para ver las noticias de IA del día.</p>
          ) : (
            <div className="space-y-4">
              {todayNews.map(article => (
                <div key={article.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{article.titulo_es}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{article.resumen_es}</p>
                  <button
                    onClick={() => navigateTo('chat', { type: 'news', data: article })}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                  >
                    Crear post sobre esto →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
