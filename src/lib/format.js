const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatBRL = (value) => brl.format(value).replace(/ /g, ' ');

export const formatTime = (date) =>
  date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

export function formatDistance(km) {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export const formatRating = (rating) => rating.toFixed(2).replace('.', ',');

export const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function formatTripDate(date) {
  const day = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
  return `${day} · ${formatTime(date)}`;
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
