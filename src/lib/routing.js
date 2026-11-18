import { distanceKm } from './geo';

const cache = new Map();
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
/** Fator de trânsito aplicado ao tempo do OSRM (que considera vias livres). */
const TRAFFIC_FACTOR = 1.35;

const keyOf = (from, to) => `${from[0].toFixed(5)},${from[1].toFixed(5)}|${to[0].toFixed(5)},${to[1].toFixed(5)}`;

/**
 * Busca um trajeto real por ruas (OSRM). Sem rede, gera um trajeto
 * aproximado para que a interface continue funcionando.
 */
export async function fetchRoute(from, to) {
  const key = keyOf(from, to);
  if (cache.has(key)) return cache.get(key);

  let route;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const url = `${OSRM_URL}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`OSRM ${response.status}`);
    const data = await response.json();
    const best = data.routes?.[0];
    if (!best) throw new Error('Sem rota');
    const coords = best.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    route = {
      key,
      path: [from, ...coords, to],
      distanceKm: best.distance / 1000,
      durationMin: Math.max(2, (best.duration / 60) * TRAFFIC_FACTOR),
    };
  } catch {
    route = fallbackRoute(from, to, key);
  }

  cache.set(key, route);
  return route;
}

function fallbackRoute(from, to, key) {
  const midLng = (from[1] + to[1]) / 2;
  const path = [from, [from[0], midLng], [to[0], midLng], to];
  let km = 0;
  for (let i = 1; i < path.length; i += 1) km += distanceKm(path[i - 1], path[i]);
  return { key, path, distanceKm: km, durationMin: Math.max(3, (km / 21) * 60) };
}
