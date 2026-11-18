import { addMinutes } from './format';

/** Tarifa de referência em São Paulo (valores aproximados). */
const BASE_FARE = 4.2;
const PER_KM = 1.52;
const PER_MIN = 0.29;
const MIN_FARE = 9.5;

export function estimateFare(vehicle, route) {
  const raw = (BASE_FARE + PER_KM * route.distanceKm + PER_MIN * route.durationMin) * vehicle.multiplier;
  const minimum = vehicle.minFare ?? MIN_FARE * vehicle.multiplier;
  const fare = Math.max(raw, minimum);
  const original = Math.round(fare * 100) / 100;
  const price = vehicle.discount ? Math.round(original * (1 - vehicle.discount) * 100) / 100 : original;
  return { price, original };
}

/** Monta as opções exibidas na tela de escolha da viagem. */
export function buildRideOptions(vehicles, route, now, pickupOffset) {
  return vehicles.map((vehicle) => {
    const { price, original } = estimateFare(vehicle, route);
    const pickupAt = addMinutes(now, pickupOffset > 0 ? pickupOffset : vehicle.pickupMin);
    const durationMin = route.durationMin * (vehicle.speedFactor ?? 1);
    return {
      ...vehicle,
      price,
      original,
      pickupAt,
      arrivalAt: addMinutes(pickupAt, durationMin),
    };
  });
}
