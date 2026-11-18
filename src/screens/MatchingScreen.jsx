import { useEffect, useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import PaymentIcon from '../components/PaymentIcon';
import RouteStops from '../components/RouteStops';
import VehicleArt from '../components/VehicleArt';
import Avatar from '../components/Avatar';
import { useApp } from '../state/AppProvider';
import { DRIVERS, findVehicle } from '../data/vehicles';
import { findPayment } from '../data/payments';
import { estimateFare } from '../lib/pricing';
import { fetchRoute } from '../lib/routing';
import { offset, toLatLng } from '../lib/geo';
import { formatBRL } from '../lib/format';
import './MatchingScreen.css';

const SEARCH_MS = 4200;
const FOUND_MS = 1400;

export default function MatchingScreen() {
  const { origin, destination, route, vehicleId, paymentId, setTrip, navigate, goBack, showToast } = useApp();
  const vehicle = findVehicle(vehicleId);
  const driver = DRIVERS[vehicle.id];
  const payment = findPayment(paymentId);
  const [found, setFound] = useState(false);

  useEffect(() => {
    if (!route) return undefined;
    let alive = true;
    const timers = [];
    const started = Date.now();
    // O motorista parte de um ponto próximo, proporcional ao tempo de chegada da categoria.
    const start = offset(toLatLng(origin), 0.45 + vehicle.pickupMin * 0.2, 30 + Math.random() * 300);

    fetchRoute(start, toLatLng(origin)).then((approachRoute) => {
      if (!alive) return;
      timers.push(
        setTimeout(() => {
          setFound(true);
          timers.push(
            setTimeout(() => {
              setTrip({
                id: `trip-${Date.now()}`,
                vehicle,
                driver,
                origin,
                destination,
                route,
                approachRoute,
                price: estimateFare(vehicle, route).price,
                pickupMin: vehicle.pickupMin,
                startedAt: Date.now(),
                timing: { approachMs: 18000, waitMs: 7000, rideMs: 36000 },
                pin: String(1000 + Math.floor(Math.random() * 9000)),
              });
              navigate('trip', {}, { replace: true });
            }, FOUND_MS),
          );
        }, Math.max(0, SEARCH_MS - (Date.now() - started))),
      );
    });

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = () => {
    goBack();
    showToast('Solicitação cancelada. Nenhuma cobrança foi feita.');
  };

  return (
    <div className="screen screen--map matching">
      <BottomSheet label="Procurando motorista">
        <div className="matching__head">
          {found ? (
            <div className="matching__found">
              <Avatar person={driver.avatar} size={44} />
              <div>
                <h2 className="t-h2">Motorista encontrado</h2>
                <p className="t-body t-secondary">{driver.name} aceitou sua viagem</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="t-h2">Procurando motoristas próximos</h2>
              <p className="t-body t-secondary">Normalmente leva menos de 1 minuto</p>
            </>
          )}
          <div className={`progress ${found ? 'progress--done' : ''}`} role="progressbar" aria-label="Procurando motorista">
            <span />
          </div>
        </div>

        <div className="matching__vehicle">
          <VehicleArt kind={vehicle.art} tone={vehicle.tone} width={88} />
          <div className="matching__vehicle-info">
            <strong>{vehicle.name}</strong>
            <span>{vehicle.description}</span>
          </div>
          {route && <strong className="matching__price">{formatBRL(estimateFare(vehicle, route).price)}</strong>}
        </div>

        <hr className="divider divider--thick" />
        <div className="matching__section">
          <RouteStops origin={origin} destination={destination} />
        </div>
        <hr className="divider" />
        <div className="matching__section matching__payment">
          <PaymentIcon method={payment} />
          <span>{payment.label}</span>
        </div>
        <div className="matching__actions">
          <Button variant="secondary" onClick={cancel} disabled={found}>
            Cancelar solicitação
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
