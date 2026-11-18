import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';
import ListItem from '../components/ListItem';
import ScheduleSheet from '../components/ScheduleSheet';
import SectionHeader from '../components/SectionHeader';
import VehicleArt from '../components/VehicleArt';
import { useApp } from '../state/AppProvider';
import './TabScreens.css';

const FEATURED = [
  { id: 'uberx', label: 'Viagem', art: 'hatch' },
  { id: 'reserve', label: 'Reserve', icon: 'calendar' },
];

const SERVICES = [
  { id: 'moto', label: 'Moto', art: 'moto', badge: '15% off' },
  { id: 'priority', label: 'Prioridade', art: 'hatch', tone: 'silver' },
  { id: 'comfort', label: 'Comfort', art: 'sedan', tone: 'gray' },
  { id: 'black', label: 'Black', art: 'suv', tone: 'black' },
  { id: 'flash', label: 'Flash', art: 'flash' },
  { id: 'other', label: 'Para outra pessoa', icon: 'users' },
];

export default function ServicesScreen() {
  const { navigate, setVehicleId, setRider, pickupOffset, setPickupOffset } = useApp();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const open = (id) => {
    if (id === 'reserve') {
      setScheduleOpen(true);
      return;
    }
    if (id === 'other') {
      setRider('other');
      setVehicleId('uberx');
    } else {
      setVehicleId(id);
    }
    navigate('search', { focus: 'destination' });
  };

  return (
    <div className="screen screen--page tab">
      <div className="scroll tab__scroll">
        <h1 className="t-display tab__title">Opções</h1>

        <SectionHeader title="Vá a qualquer lugar" />
        <div className="svc-featured">
          {FEATURED.map((s) => (
            <button key={s.id} type="button" className="svc-card svc-card--big" onClick={() => open(s.id)}>
              <span className="svc-card__label">{s.label}</span>
              <span className="svc-card__art">{s.art ? <VehicleArt kind={s.art} width={96} /> : <Icon name={s.icon} size={44} />}</span>
            </button>
          ))}
        </div>
        <div className="svc-grid">
          {SERVICES.map((s) => (
            <button key={s.id} type="button" className="svc-card" onClick={() => open(s.id)}>
              {s.badge && <span className="tile__badge">{s.badge}</span>}
              <span className="svc-card__art">{s.art ? <VehicleArt kind={s.art} tone={s.tone} width={72} /> : <Icon name={s.icon} size={32} />}</span>
              <span className="svc-card__label">{s.label}</span>
            </button>
          ))}
        </div>

        <SectionHeader title="Recursos para sua viagem" />
        <ListItem icon="calendar" title="Programar viagem" subtitle="Reserve com até 90 dias de antecedência" chevron onClick={() => setScheduleOpen(true)} />
        <ListItem icon="package" title="Enviar itens com Flash" subtitle="Documentos, chaves e encomendas na cidade" chevron onClick={() => open('flash')} />
        <ListItem icon="users" title="Viagem para outra pessoa" subtitle="Peça um carro para amigos e família" chevron last onClick={() => open('other')} />
      </div>

      <BottomNav active="services" />
      <ScheduleSheet
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        value={pickupOffset}
        onChange={(minutes) => {
          setPickupOffset(minutes);
          setVehicleId('uberx');
          navigate('search', { focus: 'destination' });
        }}
      />
    </div>
  );
}
