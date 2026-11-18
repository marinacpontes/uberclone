import { useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import ListItem from '../components/ListItem';
import SectionHeader from '../components/SectionHeader';
import ScheduleSheet from '../components/ScheduleSheet';
import VehicleArt from '../components/VehicleArt';
import { useApp } from '../state/AppProvider';
import { CURRENT_LOCATION, SAVED_PLACES, recentPlaces } from '../data/places';
import { addMinutes, formatTime } from '../lib/format';
import { useNow } from '../hooks/useNow';
import './HomeScreen.css';

const SUGGESTIONS = [
  { id: 'uberx', label: 'Viagem', art: 'hatch', tone: 'light' },
  { id: 'moto', label: 'Moto', art: 'moto', badge: 'Promo' },
  { id: 'reserve', label: 'Reserve', icon: 'calendar' },
  { id: 'flash', label: 'Flash', art: 'flash' },
];

export function SearchBar({ onSearch, onSchedule, pickupOffset }) {
  const now = useNow(30000);
  return (
    <div className="search-bar">
      <button type="button" className="search-bar__field" onClick={onSearch}>
        <Icon name="search" size={22} />
        <span>Para onde?</span>
      </button>
      <button type="button" className="search-bar__time" onClick={onSchedule} aria-label="Escolher horário de retirada">
        <Icon name="clock" size={18} />
        <span>{pickupOffset > 0 ? formatTime(addMinutes(now, pickupOffset)) : 'Agora'}</span>
        <Icon name="chevronDown" size={16} />
      </button>
    </div>
  );
}

export function SuggestionTiles({ onSelect }) {
  return (
    <div className="tiles">
      {SUGGESTIONS.map((s) => (
        <button key={s.id} type="button" className="tile" onClick={() => onSelect(s.id)}>
          {s.badge && <span className="tile__badge">{s.badge}</span>}
          <span className="tile__art">
            {s.art ? <VehicleArt kind={s.art} tone={s.tone} width={64} /> : <Icon name={s.icon} size={30} />}
          </span>
          <span className="tile__label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function HomeScreen() {
  const {
    navigate,
    resetTo,
    setOrigin,
    setDestination,
    setVehicleId,
    pickupOffset,
    setPickupOffset,
    requestRecenter,
    origin,
    showToast,
  } = useApp();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const recent = recentPlaces()[0];

  const rideTo = (place) => {
    setDestination(place);
    navigate('options');
  };

  const onSuggestion = (id) => {
    if (id === 'reserve') {
      setScheduleOpen(true);
      return;
    }
    setVehicleId(id);
    navigate('search', { focus: 'destination' });
  };

  const onSchedule = (minutes) => {
    setPickupOffset(minutes);
    if (minutes > 0) showToast(`Retirada programada para ${formatTime(addMinutes(new Date(), minutes))}`);
  };

  return (
    <div className="screen screen--map home">
      <div className="map-topbar">
        <IconButton icon="menu" label="Abrir conta" onClick={() => resetTo('account')} />
        <button type="button" className="pickup-pill" onClick={() => navigate('search', { focus: 'origin' })}>
          <span className="pickup-pill__dot" aria-hidden="true" />
          <span className="pickup-pill__text">
            <small>Partida</small>
            <span>{origin.id === CURRENT_LOCATION.id ? 'Localização atual' : origin.title}</span>
          </span>
          <Icon name="chevronDown" size={16} />
        </button>
        <span className="map-topbar__spacer" />
      </div>

      <BottomSheet
        expandable
        peek={318}
        label="Para onde você vai"
        style={{ bottom: 'calc(var(--nav-h) + var(--safe-bottom))' }}
        floating={
          <IconButton
            icon="locate"
            label="Centralizar na minha localização"
            onClick={() => {
              setOrigin(CURRENT_LOCATION);
              requestRecenter();
            }}
          />
        }
      >
        <div className="home__search">
          <SearchBar
            pickupOffset={pickupOffset}
            onSearch={() => navigate('search', { focus: 'destination' })}
            onSchedule={() => setScheduleOpen(true)}
          />
        </div>

        <div className="home__places">
          {SAVED_PLACES.map((place) => (
            <ListItem key={place.id} icon={place.icon} title={place.label} subtitle={place.title} onClick={() => rideTo(place)} />
          ))}
          <ListItem icon="clock" title={recent.title} subtitle={recent.subtitle} onClick={() => rideTo(recent)} last />
        </div>

        <SectionHeader title="Sugestões" action="Ver tudo" onAction={() => resetTo('services')} />
        <SuggestionTiles onSelect={onSuggestion} />

        <SectionHeader title="Mais formas de usar o app" />
        <div className="promo-row">
          <button type="button" className="promo-card" onClick={() => setScheduleOpen(true)}>
            <span className="promo-card__visual promo-card__visual--calendar">
              <Icon name="calendar" size={40} />
            </span>
            <span className="promo-card__title">Reserve sua viagem</span>
            <span className="promo-card__text">Garanta seu carro para o aeroporto com antecedência</span>
          </button>
          <button
            type="button"
            className="promo-card"
            onClick={() => {
              setVehicleId('moto');
              navigate('search', { focus: 'destination' });
            }}
          >
            <span className="promo-card__visual">
              <VehicleArt kind="moto" width={120} />
            </span>
            <span className="promo-card__title">15% off no Moto</span>
            <span className="promo-card__text">Fuja do trânsito pagando menos até domingo</span>
          </button>
        </div>
        <div className="home__spacer" />
      </BottomSheet>

      <BottomNav active="home" />
      <ScheduleSheet open={scheduleOpen} onClose={() => setScheduleOpen(false)} value={pickupOffset} onChange={onSchedule} />
    </div>
  );
}
