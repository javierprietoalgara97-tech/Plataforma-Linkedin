import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, CategoryBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../utils/dates';

function CategoryManager({ onClose }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [editing, setEditing] = useState({});

  return (
    <Modal title="Gestionar categorías" onClose={onClose}>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <input
              type="color"
              value={editing[cat.id]?.color ?? cat.color}
              onChange={e => setEditing(prev => ({ ...prev, [cat.id]: { ...prev[cat.id], color: e.target.value } }))}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={editing[cat.id]?.nombre ?? cat.nombre}
              onChange={e => setEditing(prev => ({ ...prev, [cat.id]: { ...prev[cat.id], nombre: e.target.value } }))}
              className="flex-1 text-sm border border-transparent hover:border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
            />
            {editing[cat.id] && (
              <button
                onClick={() => { updateCategory(cat.id, editing[cat.id]); setEditing(p => { const n = { ...p }; delete n[cat.id]; return n; }); }}
                className="text-xs text-green-600 hover:text-green-800 font-medium"
              >
                Guardar
              </button>
            )}
            <button
              onClick={() => { if (window.confirm(`¿Eliminar "${cat.nombre}"?`)) deleteCategory(cat.id); }}
              className="text-xs text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
        <input
          type="text"
          placeholder="Nueva categoría..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { if (newName.trim()) { addCategory({ nombre: newName.trim(), color: newColor }); setNewName(''); } }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg"
        >
          Añadir
        </button>
      </div>
    </Modal>
  );
}

const EMPTY_METRICS = { impresiones: '', reacciones: '', comentarios: '', compartidos: '', verMas: '' };
const EMPTY_HISTORIC = { contenido: '', categoria: '', fecha: '', ...EMPTY_METRICS };

function HistoricModal({ onClose, addAnother = false }) {
  const { categories, addPost } = useApp();
  const [form, setForm] = useState(EMPTY_HISTORIC);
  const [keepOpen, setKeepOpen] = useState(addAnother);
  const [saved, setSaved] = useState(0);

  function handleSave() {
    if (!form.contenido.trim()) return;
    addPost({
      contenido: form.contenido,
      categoria: form.categoria || null,
      estado: 'publicado',
      fechaProgramada: form.fecha || null,
      esHistorico: true,
      metricas: {
        impresiones: Number(form.impresiones) || 0,
        reacciones: Number(form.reacciones) || 0,
        comentarios: Number(form.comentarios) || 0,
        compartidos: Number(form.compartidos) || 0,
        verMas: Number(form.verMas) || 0,
      },
    });
    setSaved(s => s + 1);
    if (keepOpen) setForm(EMPTY_HISTORIC);
    else onClose();
  }

  const field = (key, label, type = 'text') => (
    <div>
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <Modal title={`Añadir post histórico${saved > 0 ? ` (${saved} guardados)` : ''}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium">Contenido del post</label>
          <textarea
            rows={6}
            value={form.contenido}
            onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
            placeholder="Pega aquí el contenido del post..."
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Categoría</label>
            <select
              value={form.categoria}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          {field('fecha', 'Fecha de publicación', 'date')}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Métricas</p>
          <div className="grid grid-cols-3 gap-3">
            {field('impresiones', 'Impresiones', 'number')}
            {field('reacciones', 'Reacciones', 'number')}
            {field('comentarios', 'Comentarios', 'number')}
            {field('compartidos', 'Compartidos', 'number')}
            {field('verMas', 'Clics "Ver más"', 'number')}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={keepOpen} onChange={e => setKeepOpen(e.target.checked)} />
            Añadir otro después
          </label>
          <button
            onClick={handleSave}
            disabled={!form.contenido.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-lg disabled:opacity-40"
          >
            Guardar post
          </button>
        </div>
      </div>
    </Modal>
  );
}

function MetricsModal({ post, onClose }) {
  const { updatePost } = useApp();
  const [form, setForm] = useState({
    impresiones: post.metricas?.impresiones || '',
    reacciones: post.metricas?.reacciones || '',
    comentarios: post.metricas?.comentarios || '',
    compartidos: post.metricas?.compartidos || '',
    verMas: post.metricas?.verMas || '',
  });

  function handleSave() {
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
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg mt-2"
        >
          Guardar métricas
        </button>
      </div>
    </Modal>
  );
}

export function Biblioteca() {
  const { posts, categories, deletePost, addPost, navigateTo } = useApp();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showHistoric, setShowHistoric] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const months = useMemo(() => {
    const set = new Set(posts.map(p => p.fechaProgramada?.slice(0, 7)).filter(Boolean));
    return [...set].sort().reverse();
  }, [posts]);

  const filtered = useMemo(() => {
    return posts
      .filter(p => {
        if (filterEstado && p.estado !== filterEstado) return false;
        if (filterCat && p.categoria !== filterCat) return false;
        if (filterMonth && !p.fechaProgramada?.startsWith(filterMonth)) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!p.contenido.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.fechaProgramada || '').localeCompare(a.fechaProgramada || ''));
  }, [posts, filterEstado, filterCat, filterMonth, search]);

  const getCat = id => categories.find(c => c.id === id);

  function handleDelete() {
    deletePost(selectedPost.id);
    setSelectedPost(null);
    setConfirmDelete(false);
  }

  function handleDuplicate() {
    addPost({ ...selectedPost, estado: 'borrador', fechaProgramada: null, metricas: null, esHistorico: false });
  }

  return (
    <div className="flex h-screen">
      {/* Lista */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filtros */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Buscar posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los estados</option>
              <option value="publicado">Publicado</option>
              <option value="programado">Programado</option>
              <option value="borrador">Borrador</option>
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas las categorías</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los meses</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex-1" />
            <button onClick={() => setShowCategoryManager(true)}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg">
              Categorías
            </button>
            <button onClick={() => setShowHistoric(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
              + Post histórico
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Post</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase w-36">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase w-28">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase w-28">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase w-24">Impresiones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(post => {
                const cat = getCat(post.categoria);
                return (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedPost?.id === post.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-800 line-clamp-1">{post.contenido.slice(0, 100)}</p>
                      {post.esHistorico && <span className="text-xs text-gray-400 italic">Histórico</span>}
                    </td>
                    <td className="px-4 py-3">{cat && <CategoryBadge category={cat} />}</td>
                    <td className="px-4 py-3"><StatusBadge estado={post.estado} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{post.fechaProgramada ? formatDate(post.fechaProgramada) : '—'}</td>
                    <td className="px-6 py-3 text-right text-sm text-gray-600">
                      {post.metricas?.impresiones ? post.metricas.impresiones.toLocaleString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16">
              <p className="text-4xl mb-3">▤</p>
              <p className="text-sm">No hay posts con estos filtros</p>
            </div>
          )}
        </div>
      </div>

      {/* Panel lateral */}
      {selectedPost && (
        <div className="w-80 border-l border-gray-100 bg-white flex flex-col flex-shrink-0">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusBadge estado={selectedPost.estado} />
              {selectedPost.esHistorico && <span className="text-xs text-gray-400 italic">Histórico</span>}
            </div>
            <button onClick={() => { setSelectedPost(null); setConfirmDelete(false); }} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {getCat(selectedPost.categoria) && <div className="mb-3"><CategoryBadge category={getCat(selectedPost.categoria)} /></div>}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.contenido}</p>
            {selectedPost.fechaProgramada && (
              <p className="text-xs text-gray-400 mt-3">{formatDate(selectedPost.fechaProgramada)}</p>
            )}
            {selectedPost.metricas && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-2 text-xs">
                {[['Impresiones', 'impresiones'], ['Reacciones', 'reacciones'], ['Comentarios', 'comentarios'], ['Compartidos', 'compartidos']].map(([label, key]) => (
                  <div key={key}>
                    <span className="text-gray-400">{label}</span>
                    <div className="font-semibold text-gray-700">{selectedPost.metricas[key]?.toLocaleString() || '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 space-y-2">
            <button onClick={() => navigateTo('chat', { type: 'edit', data: selectedPost })}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg">
              Editar en Chat IA
            </button>
            <button onClick={() => navigateTo('chat', { type: 'similar', data: selectedPost })}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg">
              Crear post similar
            </button>
            <button onClick={handleDuplicate}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg">
              Duplicar como borrador
            </button>
            <button onClick={() => setShowMetrics(true)}
              className="w-full border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm py-2 rounded-lg">
              {selectedPost.metricas ? 'Actualizar métricas' : 'Añadir métricas'}
            </button>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg">Confirmar</button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-gray-200 text-sm py-2 rounded-lg">Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="w-full text-red-400 hover:text-red-600 text-sm py-1.5">Eliminar</button>
            )}
          </div>
        </div>
      )}

      {showHistoric && <HistoricModal onClose={() => setShowHistoric(false)} />}
      {showCategoryManager && <CategoryManager onClose={() => setShowCategoryManager(false)} />}
      {showMetrics && selectedPost && <MetricsModal post={selectedPost} onClose={() => { setShowMetrics(false); setSelectedPost(p => ({ ...posts.find(x => x.id === p.id) })); }} />}
    </div>
  );
}
