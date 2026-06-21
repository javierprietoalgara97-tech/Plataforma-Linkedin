import storage from './storage';

const CACHE_TTL = 60 * 60 * 1000; // 1 hora

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
