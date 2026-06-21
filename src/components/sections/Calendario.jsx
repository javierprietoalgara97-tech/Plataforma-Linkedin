import { useState, useMemo } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { useApp } from '../../context/AppContext';
import { StatusBadge, CategoryBadge } from '../ui/Badge';
import { getDaysInMonth, getMonthName, isPublishDay, formatDate } from '../../utils/dates';

function DraggablePost({ post, category, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id });
  const style = transform ? { transform: `translate(${transform.x}px,${transform.y}px)`, zIndex: 50 } : {};

  const colors = { publicado: 'border-green-300 bg-green-50', programado: 'border-blue-300 bg-blue-50', borrador: 'border-gray-200 bg-gray-50' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`border rounded p-1.5 cursor-grab active:cursor-grabbing text-xs ${colors[post.estado] || colors.borrador} ${isDragging ? 'opacity-30' : ''}`}
    >
      <p className="font-medium text-gray-800 line-clamp-2 leading-tight">{post.contenido.slice(0, 60)}</p>
      {category && <div className="mt-1"><CategoryBadge category={category} /></div>}
    </div>
  );
}

function DroppableDay({ day, children, isPublish, isCurrentMonth, isToday }) {
  const { setNodeRef, isOver } = useDroppable({ id: day || `empty-${Math.random()}` });

  if (!day) return <div className="min-h-20" />;

  const dayNum = new Date(day + 'T00:00:00').getDate();

  return (
    <div
      ref={isPublish ? setNodeRef : undefined}
      className={`min-h-20 rounded-lg border p-1.5 transition-colors ${
        !isCurrentMonth ? 'opacity-30 pointer-events-none' :
        isOver && isPublish ? 'border-blue-400 bg-blue-50' :
        isPublish ? 'border-blue-100 bg-blue-50/30 hover:border-blue-200' :
        'border-transparent'
      }`}
    >
      <div className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
        isToday ? 'bg-blue-600 text-white' :
        isPublish ? 'text-blue-600' : 'text-gray-400'
      }`}>
        {dayNum}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function Calendario() {
  const { posts, categories, updatePost, deletePost, navigateTo } = useApp();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [activePost, setActivePost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const calendarDays = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const postsByDay = useMemo(() => {
    const map = {};
    posts.forEach(p => {
      if (!p.fechaProgramada) return;
      const d = new Date(p.fechaProgramada + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (!map[p.fechaProgramada]) map[p.fechaProgramada] = [];
        map[p.fechaProgramada].push(p);
      }
    });
    return map;
  }, [posts, year, month]);

  const monthPosts = Object.values(postsByDay).flat();
  const published = monthPosts.filter(p => p.estado === 'publicado').length;
  const programado = monthPosts.filter(p => p.estado === 'programado').length;
  const borrador = monthPosts.filter(p => p.estado === 'borrador').length;

  const getCat = id => categories.find(c => c.id === id);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function handleDragEnd({ active, over }) {
    setActivePost(null);
    if (!over || !isPublishDay(over.id)) return;
    updatePost(active.id, { fechaProgramada: over.id });
    if (selectedPost?.id === active.id) setSelectedPost(p => ({ ...p, fechaProgramada: over.id }));
  }

  function handleStatusChange(newStatus) {
    updatePost(selectedPost.id, { estado: newStatus });
    setSelectedPost(p => ({ ...p, estado: newStatus }));
  }

  function handleDelete() {
    deletePost(selectedPost.id);
    setSelectedPost(null);
    setConfirmDelete(false);
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">←</button>
            <h1 className="text-xl font-semibold text-gray-900 w-40 text-center">{getMonthName(month, year)}</h1>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">→</button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />{published} publicados</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />{programado} programados</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300" />{borrador} borradores</span>
            <button
              onClick={() => navigateTo('chat')}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg"
            >
              Rellenar mes
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <DndContext
            onDragStart={({ active }) => setActivePost(posts.find(p => p.id === active.id))}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="text-xs text-gray-400 font-medium text-center py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isPublish = day ? isPublishDay(day) : false;
                const isToday = day === today;
                const dayPosts = day ? (postsByDay[day] || []) : [];

                return (
                  <DroppableDay key={day || `null-${i}`} day={day} isPublish={isPublish} isCurrentMonth={!!day} isToday={isToday}>
                    {dayPosts.map(post => (
                      <DraggablePost
                        key={post.id}
                        post={post}
                        category={getCat(post.categoria)}
                        onClick={() => setSelectedPost(post)}
                      />
                    ))}
                    {day && isPublish && dayPosts.length === 0 && (
                      <button
                        onClick={() => navigateTo('chat', { type: 'date', data: day })}
                        className="w-full text-blue-300 hover:text-blue-500 text-lg leading-none mt-1"
                      >
                        +
                      </button>
                    )}
                  </DroppableDay>
                );
              })}
            </div>

            <DragOverlay>
              {activePost && (
                <div className="border border-blue-300 bg-white rounded p-2 text-xs shadow-lg">
                  {activePost.contenido.slice(0, 60)}...
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Panel lateral */}
      {selectedPost && (
        <div className="w-80 border-l border-gray-100 bg-white flex flex-col flex-shrink-0">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Post</h3>
            <button onClick={() => { setSelectedPost(null); setConfirmDelete(false); }} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge estado={selectedPost.estado} />
              {getCat(selectedPost.categoria) && <CategoryBadge category={getCat(selectedPost.categoria)} />}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.contenido.slice(0, 300)}{selectedPost.contenido.length > 300 ? '...' : ''}</p>
            {selectedPost.fechaProgramada && (
              <p className="text-xs text-gray-400 mt-3">{formatDate(selectedPost.fechaProgramada)}</p>
            )}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 space-y-2">
            <button
              onClick={() => navigateTo('chat', { type: 'edit', data: selectedPost })}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg"
            >
              Editar en Chat IA
            </button>
            <select
              value={selectedPost.estado}
              onChange={e => handleStatusChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="borrador">Borrador</option>
              <option value="programado">Programado</option>
              <option value="publicado">Publicado</option>
            </select>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg">Confirmar</button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-gray-200 text-sm py-2 rounded-lg">Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="w-full text-red-500 hover:text-red-700 text-sm py-2">
                Eliminar post
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
