import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import PaymentIcon from '../components/PaymentIcon';
import PaymentSheet from '../components/PaymentSheet';
import ScheduleSheet from '../components/ScheduleSheet';
import VehicleArt from '../components/VehicleArt';
import { useApp } from '../state/AppProvider';
import { VEHICLES } from '../data/vehicles';
import { findPayment } from '../data/payments';
import { buildRideOptions } from '../lib/pricing';
import { formatBRL, formatTime } from '../lib/format';
import { useNow } from '../hooks/useNow';
import './RideOptionsScreen.css';

function RideOption({ option, selected, scheduled, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`ride-option ${selected ? 'ride-option--selected' : ''}`}
      onClick={onSelect}
    >
      <span className="ride-option__art">
        <VehicleArt kind={option.art} tone={option.tone} width={84} />
      </span>
      <span className="ride-option__info">
        <span className="ride-option__name">
          {option.name}
          {option.seats && (
            <span className="ride-option__seats" aria-label={`${option.seats} ${option.seats > 1 ? 'passageiros' : 'passageiro'}`}>
              <Icon name="person" size={13} />
              {option.seats}
            </span>
          )}
        </span>
        <span className="ride-option__eta">
          {scheduled
            ? `Retirada às ${formatTime(option.pickupAt)}`
            : `${formatTime(option.arrivalAt)} · a ${option.pickupMin} min`}
        </span>
        {selected && <span className="ride-option__desc">{option.description}</span>}
        {option.badge && (
          <span className="ride-option__badge">
            <Badge tone={option.badge.tone}>
              {option.badge.tone === 'blue' && <Icon name="bolt" size={12} />}
              {option.badge.tone === 'green' && <Icon name="tag" size={12} />}
              {option.badge.label}
            </Badge>
          </span>
        )}
      </span>
      <span className="ride-option__price">
        <strong className={option.discount ? 'ride-option__price--promo' : ''}>{formatBRL(option.price)}</strong>
        {option.discount && <s>{formatBRL(option.original)}</s>}
      </span>
    </button>
  );
}

function OptionSkeleton() {
  return (
    <div className="ride-option ride-option--skeleton" aria-hidden="true">
      <span className="skeleton" style={{ width: 84, height: 40, borderRadius: 8 }} />
      <span className="ride-option__info">
        <span className="skeleton" style={{ width: '50%', height: 16 }} />
        <span className="skeleton" style={{ width: '70%', height: 12, marginTop: 6 }} />
      </span>
      <span className="skeleton" style={{ width: 64, height: 16 }} />
    </div>
  );
}

export default function RideOptionsScreen() {
  const {
    origin,
    destination,
    route,
    vehicleId,
    setVehicleId,
    paymentId,
    setPaymentId,
    pickupOffset,
    setPickupOffset,
    goBack,
    navigate,
    resetTo,
    setUpcoming,
    showToast,
  } = useApp();
  const now = useNow(20000);
  const [sheet, setSheet] = useState(null);
  const scheduled = pickupOffset > 0;
  const payment = findPayment(paymentId);

  const options = useMemo(
    () => (route ? buildRideOptions(VEHICLES, route, now, pickupOffset) : null),
    [route, now, pickupOffset],
  );
  const selected = options?.find((o) => o.id === vehicleId) ?? options?.[0];

  const confirm = () => {
    if (!selected) return;
    if (scheduled) {
      setUpcoming((list) => [
        ...list,
        { id: `res-${Date.now()}`, vehicleId: selected.id, origin, destination, pickupAt: selected.pickupAt, price: selected.price },
      ]);
      resetTo('activity');
      showToast(`${selected.name} reservado para ${formatTime(selected.pickupAt)}`);
      return;
    }
    navigate('matching');
  };

  return (
    <div className="screen screen--map options">
      <div className="map-topbar">
        <IconButton icon="arrowLeft" label="Voltar" onClick={goBack} />
        <button type="button" className="options__trip-chip" onClick={goBack}>
          <span className="options__trip-chip-text">
            {origin.title} <Icon name="arrowRight" size={12} /> {destination.title}
          </span>
        </button>
        <span className="map-topbar__spacer" />
      </div>

      <BottomSheet
        expandable
        peek={0.56}
        label="Escolha uma viagem"
        footer={
          <div className="options__footer">
            <button type="button" className="options__payment" onClick={() => setSheet('payment')}>
              <PaymentIcon method={payment} />
              <span className="options__payment-label">{payment.label}</span>
              <Icon name="chevronRight" size={18} />
            </button>
            <div className="options__cta">
              <Button onClick={confirm} disabled={!selected}>
                {selected ? `${scheduled ? 'Reservar' : 'Escolher'} ${selected.name}` : 'Calculando preços…'}
              </Button>
              <IconButton
                icon="calendar"
                label="Programar horário de retirada"
                variant="gray"
                size={56}
                className="options__schedule"
                onClick={() => setSheet('schedule')}
              />
            </div>
          </div>
        }
      >
        <h2 className="options__title">{scheduled ? 'Reserve sua viagem' : 'Escolha uma viagem'}</h2>
        {route && (
          <p className="options__subtitle">
            {route.distanceKm.toFixed(1).replace('.', ',')} km · cerca de {Math.round(route.durationMin)} min de viagem
          </p>
        )}
        <div className="options__list" role="radiogroup" aria-label="Categorias de viagem">
          {options
            ? options.map((option) => (
                <RideOption
                  key={option.id}
                  option={option}
                  scheduled={scheduled}
                  selected={option.id === selected.id}
                  onSelect={() => setVehicleId(option.id)}
                />
              ))
            : Array.from({ length: 4 }, (_, i) => <OptionSkeleton key={i} />)}
        </div>
        <p className="options__note">
          <Icon name="info" size={14} />
          Os preços são estimados e podem variar conforme trânsito e demanda.
        </p>
      </BottomSheet>

      <PaymentSheet open={sheet === 'payment'} onClose={() => setSheet(null)} value={paymentId} onChange={setPaymentId} />
      <ScheduleSheet open={sheet === 'schedule'} onClose={() => setSheet(null)} value={pickupOffset} onChange={setPickupOffset} />
    </div>
  );
}
