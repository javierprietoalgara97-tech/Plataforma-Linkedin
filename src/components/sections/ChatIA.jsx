import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { LinkedInPreview } from '../ui/LinkedInPreview';
import { chatWithClaude, buildSystemPrompt } from '../../services/anthropic';
import { getPublishDaysInMonth } from '../../utils/dates';

const QUICK_ACTIONS = [
  { label: 'Hazlo más corto', prompt: 'Acorta este post manteniendo el mensaje principal y el hook.' },
  { label: 'Más personal', prompt: 'Reescríbelo en primera persona con una anécdota o experiencia personal.' },
  { label: '3 hooks alternativos', prompt: 'Dame 3 primeras frases alternativas (hooks) para este post. Solo los hooks, no el post completo.' },
  { label: 'Añade llamada a la acción', prompt: 'Añade una pregunta o llamada a la acción potente al final.' },
  { label: 'Versión más directa', prompt: 'Hazlo más directo y contundente. Elimina el relleno.' },
];

export function ChatIA() {
  const { chatContext, setChatContext, settings, categories, addPost } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [saved, setSaved] = useState('');
  const messagesEndRef = useRef(null);

  const now = new Date();
  const publishDays = [
    ...getPublishDaysInMonth(now.getFullYear(), now.getMonth()),
    ...getPublishDaysInMonth(now.getFullYear(), now.getMonth() + 1),
  ].filter(d => d >= now.toISOString().split('T')[0]).slice(0, 12);

  // Cargar contexto inicial
  useEffect(() => {
    if (!chatContext) return;
    let firstMessage = '';
    if (chatContext.type === 'news') {
      firstMessage = `Quiero crear un post de LinkedIn sobre esta noticia:\n\n**${chatContext.data.titulo_es}**\n\n${chatContext.data.resumen_es}`;
    } else if (chatContext.type === 'similar') {
      firstMessage = `Crea un post similar a este que funcionó muy bien (${chatContext.data.metricas?.impresiones?.toLocaleString()} impresiones), pero con un ángulo diferente:\n\n${chatContext.data.contenido}`;
    } else if (chatContext.type === 'date') {
      firstMessage = `Necesito un post para el ${chatContext.data}. Sugiéreme un tema relevante para mi nicho de consultoría IA y escribe el post.`;
      setSelectedDate(chatContext.type === 'date' ? chatContext.data : '');
    }
    if (firstMessage) {
      setMessages([{ role: 'user', content: firstMessage }]);
      setChatContext(null);
      sendToAPI([{ role: 'user', content: firstMessage }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendToAPI(msgs) {
    if (!settings.anthropicApiKey) return;
    setLoading(true);
    try {
      const reply = await chatWithClaude(msgs, buildSystemPrompt(settings.perfil), settings.anthropicApiKey);
      const newMessages = [...msgs, { role: 'assistant', content: reply }];
      setMessages(newMessages);
      // Si la respuesta parece un post completo (>200 chars sin bullets de lista), cargarlo en el editor
      if (reply.length > 200 && !reply.startsWith('1.') && !reply.startsWith('•')) {
        setEditorContent(reply);
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `❌ Error: ${e.message}` }]);
    }
    setLoading(false);
  }

  function handleSend(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    sendToAPI(newMessages);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function savePost(estado) {
    if (!editorContent.trim()) return;
    addPost({
      contenido: editorContent,
      categoria: selectedCat || null,
      estado,
      fechaProgramada: selectedDate || null,
      esHistorico: false,
      metricas: null,
    });
    setSaved(estado === 'borrador' ? '¡Guardado como borrador!' : '¡Post programado!');
    setTimeout(() => setSaved(''), 2500);
  }

  const noApiKey = !settings.anthropicApiKey;

  return (
    <div className="flex h-screen">
      {/* Col izquierda — Chat */}
      <div className="w-80 flex flex-col border-r border-gray-100 bg-white">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Chat IA</h2>
          <p className="text-xs text-gray-400 mt-0.5">Asistente de contenido LinkedIn</p>
        </div>

        {noApiKey && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            Necesitas una API key de Anthropic.{' '}
            <button className="underline font-medium">Ir a Configuración →</button>
          </div>
        )}

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-8">
              <div className="text-3xl mb-3">✦</div>
              <p>Dime sobre qué quieres escribir hoy</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-500">
                <span className="animate-pulse">Escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Acciones rápidas */}
        {messages.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.label}
                onClick={() => handleSend(a.prompt)}
                disabled={loading || noApiKey}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full disabled:opacity-40"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe aquí... (Enter para enviar)"
              disabled={loading || noApiKey}
              rows={2}
              className="flex-1 resize-none text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading || noApiKey}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-40 flex-shrink-0"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Col central — Editor */}
      <div className="flex-1 flex flex-col border-r border-gray-100 bg-white">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Editor</h2>
          <span className={`text-xs ${editorContent.length > 3000 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {editorContent.length} caracteres
          </span>
        </div>

        <textarea
          value={editorContent}
          onChange={e => setEditorContent(e.target.value)}
          placeholder="El post aparecerá aquí cuando Claude lo genere. También puedes escribir directamente."
          className="flex-1 resize-none px-6 py-4 text-sm text-gray-800 leading-relaxed focus:outline-none"
        />

        <div className="px-6 py-4 border-t border-gray-100 space-y-3">
          <div className="flex gap-3">
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin fecha</option>
              {publishDays.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => savePost('borrador')}
              disabled={!editorContent.trim()}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg disabled:opacity-40"
            >
              Guardar borrador
            </button>
            <button
              onClick={() => savePost('programado')}
              disabled={!editorContent.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg disabled:opacity-40"
            >
              Programar
            </button>
          </div>

          {saved && (
            <p className="text-center text-sm text-green-600 font-medium">{saved}</p>
          )}
        </div>
      </div>

      {/* Col derecha — Preview */}
      <div className="w-80 flex flex-col bg-gray-50">
        <div className="px-5 py-4 border-b border-gray-100 bg-white">
          <h2 className="font-semibold text-gray-900">Preview LinkedIn</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <LinkedInPreview content={editorContent} perfil={settings.perfil} />
        </div>
      </div>
    </div>
  );
}
