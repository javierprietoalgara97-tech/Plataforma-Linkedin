// Días de publicación: lunes (1), martes (2), jueves (4)
export const PUBLISH_DAYS = [1, 2, 4];

export function isPublishDay(date) {
  const d = new Date(date);
  return PUBLISH_DAYS.includes(d.getDay());
}

export function getDayName(date) {
  const d = new Date(date);
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return names[d.getDay()];
}

export function getMonthName(month, year) {
  const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${names[month]} ${year}`;
}

export function getPublishDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (isPublishDay(date)) {
      days.push(new Date(date).toISOString().split('T')[0]);
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  // Padding inicio (lunes como primer día)
  let startDay = date.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;
  for (let i = 0; i < startDay; i++) days.push(null);
  while (date.getMonth() === month) {
    days.push(new Date(date).toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function getNextEmptyPublishDay(posts, fromDate = new Date()) {
  const published = new Set(posts.map(p => p.fechaProgramada).filter(Boolean));
  const check = new Date(fromDate);
  for (let i = 0; i < 60; i++) {
    const str = check.toISOString().split('T')[0];
    if (isPublishDay(check) && !published.has(str)) return str;
    check.setDate(check.getDate() + 1);
  }
  return null;
}

export function getStreak(posts) {
  const published = posts
    .filter(p => p.estado === 'publicado' && p.fechaProgramada)
    .map(p => p.fechaProgramada)
    .sort()
    .reverse();

  if (!published.length) return 0;

  // Contar días desde último post publicado
  const last = new Date(published[0] + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - last) / 86400000);
  if (diff > 7) return 0;

  let streak = 1;
  for (let i = 1; i < published.length; i++) {
    const a = new Date(published[i - 1] + 'T00:00:00');
    const b = new Date(published[i] + 'T00:00:00');
    const gap = Math.floor((a - b) / 86400000);
    if (gap <= 7) streak++;
    else break;
  }
  return streak;
}
