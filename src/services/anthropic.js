export async function chatWithClaude(messages, systemPrompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export function buildSystemPrompt(perfil) {
  return `Eres un asistente experto en creación de contenido para LinkedIn en español.
Ayudas a ${perfil.nombre || 'el usuario'} a crear posts profesionales.

Perfil del usuario:
- Nicho: ${perfil.nicho || 'consultoría de inteligencia artificial para empresas'}
- Tono: ${perfil.tono || 'profesional pero cercano'}
- Titular: ${perfil.titular || 'Consultor de Inteligencia Artificial'}
- Objetivo: atraer empresas que contraten servicios de consultoría IA

Reglas para los posts de LinkedIn:
- Escribe siempre en español
- Primer párrafo: hook potente que corte en "Ver más" (~210 caracteres)
- Estructura: hook → desarrollo → conclusión/pregunta
- Sin emojis excesivos, máximo 2-3 si aportan valor
- Longitud óptima: 800-1300 caracteres
- Incluye siempre una llamada a la acción o pregunta al final
- Estilo directo, sin relleno, sin corporativismos
- Cuando generes un post, devuelve SOLO el texto del post, sin explicaciones adicionales`;
}

export async function getPostIdeas(article, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Basándote en esta noticia de IA, dame 3 ángulos diferentes para crear un post en LinkedIn dirigido a empresas que podrían contratar consultoría IA. Solo los 3 ángulos en formato numerado, sin desarrollarlos.

Noticia: "${article.titulo_es}"
Resumen: "${article.resumen_es}"`,
      }],
    }),
  });

  if (!response.ok) throw new Error(`Error ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}
