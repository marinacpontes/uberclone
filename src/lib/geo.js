const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

export const toLatLng = (place) => [place.lat, place.lng];

export function distanceKm(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function bearing(a, b) {
  const φ1 = toRad(a[0]);
  const φ2 = toRad(b[0]);
  const Δλ = toRad(b[1] - a[1]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Ponto a `km` de distância de `point`, na direção `deg` (0 = norte). */
export function offset(point, km, deg) {
  const δ = km / EARTH_RADIUS_KM;
  const θ = toRad(deg);
  const φ1 = toRad(point[0]);
  const λ1 = toRad(point[1]);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return [toDeg(φ2), toDeg(λ2)];
}

/** Pré-calcula as distâncias acumuladas de um trajeto. */
export function measurePath(path) {
  const cumulative = [0];
  for (let i = 1; i < path.length; i += 1) {
    cumulative.push(cumulative[i - 1] + distanceKm(path[i - 1], path[i]));
  }
  return { path, cumulative, total: cumulative[cumulative.length - 1] };
}

function locate(measured, t) {
  const { path, cumulative, total } = measured;
  const target = total * Math.min(Math.max(t, 0), 1);
  let i = 1;
  while (i < cumulative.length - 1 && cumulative[i] < target) i += 1;
  const segment = cumulative[i] - cumulative[i - 1] || 1e-9;
  const f = Math.min(Math.max((target - cumulative[i - 1]) / segment, 0), 1);
  const a = path[i - 1];
  const b = path[i];
  return { pos: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], index: i };
}

/** Posição, direção e trecho restante ao longo de um trajeto (t de 0 a 1). */
export function pointAlong(measured, t) {
  const { path, total } = measured;
  if (path.length < 2 || total === 0) return { pos: path[0], bearing: 0, remaining: [path[0]] };
  const here = locate(measured, t);
  const lookAhead = Math.min(0.03 / total, 0.05);
  const ahead = locate(measured, Math.min(t + lookAhead, 1));
  const behind = locate(measured, Math.max(t - lookAhead, 0));
  const heading = t >= 1 ? bearing(behind.pos, here.pos) : bearing(here.pos, ahead.pos);
  return { pos: here.pos, bearing: heading, remaining: [here.pos, ...path.slice(here.index)] };
}
