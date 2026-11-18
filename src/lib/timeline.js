import { measurePath, pointAlong } from './geo';

/**
 * Linha do tempo da viagem simulada: motorista a caminho → chegou → em viagem → concluída.
 * As durações são aceleradas, mas os minutos exibidos seguem os tempos reais estimados.
 */
export function createTimeline(trip) {
  const approach = measurePath(trip.approachRoute.path);
  const ride = measurePath(trip.route.path);
  const { approachMs, waitMs, rideMs } = trip.timing;
  const origin = trip.approachRoute.path[trip.approachRoute.path.length - 1];
  const arrivedBearing = pointAlong(approach, 1).bearing;

  function at(now) {
    const elapsed = now - trip.startedAt;

    if (elapsed < approachMs) {
      const t = elapsed / approachMs;
      const frame = pointAlong(approach, t);
      return { ...frame, phase: 'approach', progress: t, etaMin: Math.max(1, Math.ceil(trip.pickupMin * (1 - t))) };
    }

    if (elapsed < approachMs + waitMs) {
      const t = (elapsed - approachMs) / waitMs;
      return { pos: origin, bearing: arrivedBearing, remaining: [origin], phase: 'arrived', progress: t, etaMin: 0 };
    }

    if (elapsed < approachMs + waitMs + rideMs) {
      const t = (elapsed - approachMs - waitMs) / rideMs;
      const frame = pointAlong(ride, t);
      return { ...frame, phase: 'onTrip', progress: t, etaMin: Math.max(1, Math.ceil(trip.route.durationMin * (1 - t))) };
    }

    const end = pointAlong(ride, 1);
    return { ...end, remaining: [end.pos], phase: 'completed', progress: 1, etaMin: 0 };
  }

  return { at };
}
