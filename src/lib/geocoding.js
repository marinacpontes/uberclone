const NOMINATIM = 'https://nominatim.openstreetmap.org';
/** Recorte da Grande São Paulo usado para priorizar resultados próximos. */
const VIEWBOX = '-46.83,-23.40,-46.36,-23.75';

function toPlace(result, { preferStreet = false } = {}) {
  const a = result.address ?? {};
  const street = [a.road, a.house_number].filter(Boolean).join(', ');
  const isRoadFeature = result.category === 'highway' || result.class === 'highway';
  const title = (preferStreet || isRoadFeature ? street || result.name : result.name || street) || result.display_name.split(',')[0];
  const district = a.suburb || a.neighbourhood || a.city_district || a.quarter;
  const city = a.city || a.town || a.municipality || 'São Paulo';
  const subtitle = [result.name && street && title !== street ? street : null, district, `${city} - SP`].filter(Boolean).join(', ');
  return {
    id: `osm-${result.osm_type}-${result.osm_id}`,
    title,
    subtitle,
    lat: Number(result.lat),
    lng: Number(result.lon),
  };
}

export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    countrycodes: 'br',
    viewbox: VIEWBOX,
    bounded: '1',
    limit: '6',
    'accept-language': 'pt-BR',
  });
  const response = await fetch(`${NOMINATIM}/search?${params}`, { signal });
  if (!response.ok) return [];
  const data = await response.json();
  return data.map(toPlace);
}

const reverseCache = new Map();

export async function reverseGeocode([lat, lng], signal) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseCache.has(key)) return { ...reverseCache.get(key), lat, lng };
  const fallback = {
    id: `pin-${lat.toFixed(5)},${lng.toFixed(5)}`,
    title: 'Local marcado no mapa',
    subtitle: `${lat.toFixed(5).replace('.', ',')}, ${lng.toFixed(5).replace('.', ',')}`,
    lat,
    lng,
  };
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'jsonv2',
      addressdetails: '1',
      zoom: '18',
      'accept-language': 'pt-BR',
    });
    const response = await fetch(`${NOMINATIM}/reverse?${params}`, { signal });
    if (!response.ok) return fallback;
    const data = await response.json();
    if (!data || data.error) return fallback;
    const place = { ...toPlace(data, { preferStreet: true }), id: fallback.id, lat, lng };
    reverseCache.set(key, place);
    return place;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return fallback;
  }
}
