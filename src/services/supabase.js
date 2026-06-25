import storage from './storage';

const CACHE_TTL = 60 * 60 * 1000; // 1 hora

function getCredentials() {
  const s = storage.get('settings') || {};
  return { url: s.supabaseUrl, key: s.supabaseAnonKey };
}

function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
}

export async function fetchPosts() {
  const { url, key } = getCredentials();
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/posts?select=*&order=created_at.desc`, { headers: headers(key) });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows.map(r => ({
    id: r.id,
    contenido: r.contenido,
    categoria: r.categoria,
    estado: r.estado,
    fechaProgramada: r.fecha_programada,
    esHistorico: r.es_historico,
    urlLinkedIn: r.url_linkedin,
    archivo: r.archivo,
    metricas: r.metricas,
    actualizadoEn: r.actualizado_en,
  }));
}

export async function upsertPost(post) {
  const { url, key } = getCredentials();
  if (!url || !key) return;
  const row = {
    id: post.id,
    contenido: post.contenido,
    categoria: post.categoria || null,
    estado: post.estado,
    fecha_programada: post.fechaProgramada || null,
    es_historico: post.esHistorico || false,
    url_linkedin: post.urlLinkedIn || null,
    archivo: post.archivo || null,
    metricas: post.metricas || null,
    actualizado_en: new Date().toISOString(),
  };
  await fetch(`${url}/rest/v1/posts`, {
    method: 'POST',
    headers: { ...headers(key), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  });
}

export async function deletePostFromSupabase(id) {
  const { url, key } = getCredentials();
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/posts?id=eq.${id}`, { method: 'DELETE', headers: headers(key) });
}

export async function fetchArticles(supabaseUrl, anonKey) {
  // Devuelve caché si es reciente
  const cache = storage.get('newsCache');
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.articles;
  }

  const url = `${supabaseUrl}/rest/v1/articles?select=*&order=created_at.desc&limit=300`;
  const response = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) throw new Error(`Supabase error ${response.status}`);

  const articles = await response.json();
  storage.set('newsCache', { articles, timestamp: Date.now() });
  return articles;
}

export function getArticlesForDay(articles, dateStr) {
  return articles.filter(a => a.fecha === dateStr);
}

export function getArticlesByCategory(articles) {
  const grouped = {};
  articles.forEach(a => {
    const cat = a.categoria || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  });
  return grouped;
}

export function groupArticlesByDate(articles) {
  const grouped = {};
  articles.forEach(a => {
    const fecha = a.fecha;
    if (!grouped[fecha]) grouped[fecha] = [];
    grouped[fecha].push(a);
  });
  return grouped;
}
