import { useState } from 'react';

const VER_MAS_LIMIT = 210;

export function LinkedInPreview({ content, perfil }) {
  const [expanded, setExpanded] = useState(false);

  const needsTruncation = content.length > VER_MAS_LIMIT;
  const displayText = !expanded && needsTruncation
    ? content.slice(0, VER_MAS_LIMIT)
    : content;

  const lines = displayText.split('\n');

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header perfil */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-50">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {perfil?.foto
            ? <img src={perfil.foto} alt="" className="w-full h-full object-cover rounded-full" />
            : (perfil?.nombre?.[0] || 'T')
          }
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{perfil?.nombre || 'Tu Nombre'}</div>
          <div className="text-xs text-gray-500">{perfil?.titular || 'Consultor de Inteligencia Artificial'}</div>
          <div className="text-xs text-gray-400 mt-0.5">Ahora • 🌐</div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 pt-3 pb-2">
        {!content ? (
          <p className="text-gray-300 text-sm italic">El post aparecerá aquí...</p>
        ) : (
          <div className="text-sm text-gray-800 leading-relaxed">
            {lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
            {!expanded && needsTruncation && (
              <span className="text-gray-500">... </span>
            )}
            {needsTruncation && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-500 font-medium hover:text-gray-700 text-sm"
              >
                {expanded ? 'ver menos' : 'ver más'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer LinkedIn */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
        <span>👍 Me gusta</span>
        <span>💬 Comentar</span>
        <span>🔄 Compartir</span>
        <span>📩 Enviar</span>
      </div>
    </div>
  );
}
