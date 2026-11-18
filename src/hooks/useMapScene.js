import { useMemo } from 'react';
import { useApp } from '../state/AppProvider';
import { useTrip } from '../state/TripProvider';
import { CURRENT_LOCATION } from '../data/places';
import { findVehicle } from '../data/vehicles';
import { offset, toLatLng } from '../lib/geo';

/** Carros parados/circulando perto do usuário na tela inicial. */
const NEARBY = [
  { km: 0.22, deg: 28, bearing: 118 },
  { km: 0.38, deg: 104, bearing: 15 },
  { km: 0.31, deg: 168, bearing: 262 },
  { km: 0.47, deg: 226, bearing: 200 },
  { km: 0.27, deg: 296, bearing: 32 },
  { km: 0.55, deg: 338, bearing: 290 },
];

/**
 * Traduz a tela atual em uma "cena" para o mapa. `key` muda quando as
 * camadas precisam ser redesenhadas; `fitKey`, quando a câmera deve se reenquadrar.
 */
export function useMapScene() {
  const { current, origin, destination, route, vehicleId, navigate } = useApp();
  const { trip, timeline, snap } = useTrip();
  const center = useMemo(() => toLatLng(CURRENT_LOCATION), []);
  const cars = useMemo(() => NEARBY.map((c) => ({ pos: offset(center, c.km, c.deg), bearing: c.bearing })), [center]);

  const { name, params } = current;

  if (name === 'home') return { type: 'home', key: 'home', fitKey: 'home', center, cars };

  if (name === 'pick') {
    const target = params.field === 'origin' ? origin : (destination ?? origin);
    return { type: 'pick', key: 'pick', fitKey: `pick-${params.field}`, center: toLatLng(target) };
  }

  if (name === 'options' && origin && destination) {
    const o = toLatLng(origin);
    const d = toLatLng(destination);
    if (!route) return { type: 'points', key: `pts-${origin.id}-${destination.id}`, fitKey: `pts-${origin.id}-${destination.id}`, origin: o, destination: d, bounds: [o, d] };
    return {
      type: 'route',
      key: `route-${route.key}-${vehicleId}`,
      fitKey: `route-${route.key}`,
      path: route.path,
      bounds: route.path,
      origin: o,
      destination: d,
      originLabel: origin.title,
      destinationLabel: destination.title,
      eta: findVehicle(vehicleId).pickupMin,
      onOriginClick: () => navigate('search', { focus: 'origin' }),
      onDestinationClick: () => navigate('search', { focus: 'destination' }),
    };
  }

  if (name === 'matching' && origin) {
    return { type: 'matching', key: `matching-${route?.key ?? 'pending'}`, fitKey: 'matching', center: toLatLng(origin), path: route?.path };
  }

  if ((name === 'trip' || name === 'chat') && trip && timeline && snap) {
    const phase = snap.phase;
    return {
      type: 'trip',
      key: `trip-${trip.id}-${phase}`,
      fitKey: `trip-${trip.id}-${phase}`,
      phase,
      timeline,
      center: toLatLng(trip.origin),
      bounds: phase === 'onTrip' ? trip.route.path : trip.approachRoute.path,
      origin: toLatLng(trip.origin),
      destination: toLatLng(trip.destination),
      originLabel: trip.origin.title,
      destinationLabel: trip.destination.title,
    };
  }

  return { type: 'hidden', key: 'hidden', fitKey: 'hidden' };
}
