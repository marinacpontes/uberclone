import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Icon from '../components/Icon';
import ScheduleSheet from '../components/ScheduleSheet';
import SectionHeader from '../components/SectionHeader';
import VehicleArt from '../components/VehicleArt';
import { useApp } from '../state/AppProvider';
import { CURRENT_LOCATION, findPlace } from '../data/places';
import { findVehicle } from '../data/vehicles';
import { formatBRL, formatTime, formatTripDate } from '../lib/format';
import './TabScreens.css';

export default function ActivityScreen() {
  const {
    history,
    upcoming,
    setUpcoming,
    setOrigin,
    setDestination,
    setVehicleId,
    setPickupOffset,
    pickupOffset,
    navigate,
    showToast,
  } = useApp();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const rebook = (entry) => {
    setOrigin(CURRENT_LOCATION);
    setDestination(entry.place ?? findPlace(entry.placeId));
    setVehicleId(entry.vehicleId);
    setPickupOffset(0);
    navigate('options');
  };

  return (
    <div className="screen screen--page tab">
      <div className="scroll tab__scroll">
        <h1 className="t-display tab__title">Atividade</h1>

        <SectionHeader title="Próximas" />
        {upcoming.length === 0 ? (
          <div className="empty-card">
            <div>
              <p className="t-label">Nenhuma viagem programada</p>
              <p className="t-body t-secondary">Reserve uma viagem e ela aparecerá aqui.</p>
              <Button size="sm" block={false} variant="primary" icon="calendar" onClick={() => setScheduleOpen(true)}>
                Reservar viagem
              </Button>
            </div>
            <Icon name="calendar" size={48} className="empty-card__icon" />
          </div>
        ) : (
          upcoming.map((res) => {
            const vehicle = findVehicle(res.vehicleId);
            return (
              <div key={res.id} className="upcoming-card">
                <div className="upcoming-card__head">
                  <span className="badge badge--black">
                    <Icon name="calendar" size={12} /> Hoje, {formatTime(res.pickupAt)}
                  </span>
                  <span className="t-body t-secondary">{vehicle.name}</span>
                </div>
                <p className="t-label">{res.destination.title}</p>
                <p className="t-body t-secondary">Partida: {res.origin.title}</p>
                <div className="upcoming-card__foot">
                  <strong>{formatBRL(res.price)}</strong>
                  <Button
                    size="sm"
                    block={false}
                    variant="secondary"
                    onClick={() => {
                      setUpcoming((list) => list.filter((r) => r.id !== res.id));
                      showToast('Reserva cancelada sem custo');
                    }}
                  >
                    Cancelar reserva
                  </Button>
                </div>
              </div>
            );
          })
        )}

        <SectionHeader title="Anteriores" />
        {history.map((entry) => {
          const place = entry.place ?? findPlace(entry.placeId);
          const vehicle = findVehicle(entry.vehicleId);
          const canceled = entry.status === 'canceled';
          return (
            <div key={entry.id} className="past-trip">
              <span className="past-trip__art">
                <VehicleArt kind={vehicle.art} tone={vehicle.tone} width={56} />
              </span>
              <div className="past-trip__info">
                <strong>{place.label ?? place.title}</strong>
                <span>{formatTripDate(entry.date)}</span>
                <span>{canceled ? 'Cancelada' : `${formatBRL(entry.price)} · ${vehicle.name}`}</span>
              </div>
              <button type="button" className="chip chip--small" onClick={() => rebook(entry)}>
                <Icon name="repeat" size={14} />
                Repetir
              </button>
            </div>
          );
        })}
      </div>

      <BottomNav active="activity" />
      <ScheduleSheet
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        value={pickupOffset || 30}
        onChange={(minutes) => {
          setPickupOffset(minutes);
          navigate('search', { focus: 'destination' });
        }}
      />
    </div>
  );
}
