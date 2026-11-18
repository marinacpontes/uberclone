import L from 'leaflet';
import { escapeHtml } from '../lib/format';

/** Carro visto de cima, como os veículos exibidos no mapa do app. */
const CAR_SVG = `
<svg viewBox="0 0 32 64" width="18" height="36" aria-hidden="true">
  <rect x="3" y="2" width="26" height="60" rx="11" fill="#151515"/>
  <rect x="3" y="2" width="26" height="60" rx="11" fill="none" stroke="#fff" stroke-opacity=".25"/>
  <path d="M7.5 19.5Q16 14.5 24.5 19.5L23.2 27.5Q16 25.5 8.8 27.5Z" fill="#8E98A3"/>
  <rect x="8.5" y="29" width="15" height="15" rx="3" fill="#2A2A2A"/>
  <path d="M8.8 46.5Q16 48.5 23.2 46.5L24.3 53.5Q16 56.5 7.7 53.5Z" fill="#8E98A3"/>
  <rect x="5.5" y="4" width="5" height="2.6" rx="1.3" fill="#F2F2F2"/>
  <rect x="21.5" y="4" width="5" height="2.6" rx="1.3" fill="#F2F2F2"/>
  <rect x="6" y="58" width="5" height="2" rx="1" fill="#C22C1F"/>
  <rect x="21" y="58" width="5" height="2" rx="1" fill="#C22C1F"/>
</svg>`;

const CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const icon = (html, className = '') =>
  L.divIcon({ html, className: `map-icon ${className}`, iconSize: [0, 0], iconAnchor: [0, 0] });

export const userIcon = () =>
  icon('<div class="m-user"><span class="m-user__halo"></span><span class="m-user__dot"></span></div>');

export const carIcon = (bearing = 0) =>
  icon(`<div class="m-car"><div class="m-car__body" style="transform:rotate(${bearing}deg)">${CAR_SVG}</div></div>`, 'map-icon--car');

export const stopIcon = (kind) => icon(`<div class="m-stop m-stop--${kind}"></div>`);

export const pulseIcon = () =>
  icon('<div class="m-pulse"><span></span><span></span><span></span><i></i></div>');

export function labelIcon({ text, eta, clickable = true, side = 'right' }) {
  const etaHtml = eta != null ? `<span class="m-label__eta"><b>${eta}</b><small>min</small></span>` : '';
  return icon(
    `<div class="m-label m-label--${side} ${clickable ? 'm-label--clickable' : ''}">${etaHtml}<span class="m-label__text">${escapeHtml(text)}</span>${clickable ? CHEVRON : ''}</div>`,
    'map-icon--label',
  );
}
