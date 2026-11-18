import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import ListItem from '../components/ListItem';
import RiderSheet from '../components/RiderSheet';
import ScheduleSheet, { pickupLabel } from '../components/ScheduleSheet';
import { useApp } from '../state/AppProvider';
import { CURRENT_LOCATION, SAVED_PLACES, recentPlaces, searchablePlaces } from '../data/places';
import { distanceKm, toLatLng } from '../lib/geo';
import { formatDistance, normalize } from '../lib/format';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { useNow } from '../hooks/useNow';
import './SearchScreen.css';

const distanceFromUser = (place) => formatDistance(distanceKm(toLatLng(CURRENT_LOCATION), toLatLng(place)));

function matchLocal(query) {
  const q = normalize(query);
  return searchablePlaces()
    .filter((p) => normalize(`${p.label ?? ''} ${p.title} ${p.subtitle} ${p.keywords ?? ''}`).includes(q))
    .slice(0, 6);
}

export default function SearchScreen({ params }) {
  const {
    origin,
    destination,
    setOrigin,
    setDestination,
    navigate,
    goBack,
    pickupOffset,
    setPickupOffset,
    rider,
    setRider,
  } = useApp();
  const now = useNow(30000);
  const [focus, setFocus] = useState(params.focus ?? 'destination');
  const [texts, setTexts] = useState({ origin: origin.title, destination: destination?.title ?? '' });
  const [dirty, setDirty] = useState({ origin: false, destination: false });
  const [sheet, setSheet] = useState(null);
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const refs = { origin: originRef, destination: destinationRef };

  useEffect(() => {
    const input = refs[focus].current;
    input?.focus();
    input?.select();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const query = dirty[focus] ? texts[focus] : '';
  const remote = usePlaceSearch(query);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const local = matchLocal(query);
    const seen = new Set(local.map((p) => normalize(p.title)));
    return [...local, ...remote.results.filter((p) => !seen.has(normalize(p.title)))].slice(0, 8);
  }, [query, remote.results]);

  const setText = (field, value) => {
    setTexts((t) => ({ ...t, [field]: value }));
    setDirty((d) => ({ ...d, [field]: true }));
  };

  const select = (place) => {
    if (focus === 'origin') {
      setOrigin(place);
      setTexts((t) => ({ ...t, origin: place.title }));
      setDirty((d) => ({ ...d, origin: false }));
      if (destination) {
        navigate('options');
      } else {
        setFocus('destination');
        destinationRef.current?.focus();
      }
      return;
    }
    setDestination(place);
    setTexts((t) => ({ ...t, destination: place.title }));
    setDirty((d) => ({ ...d, destination: false }));
    navigate('options');
  };

  const swap = () => {
    if (!destination) return;
    setOrigin(destination);
    setDestination(origin);
    setTexts({ origin: destination.title, destination: origin.title });
    setDirty({ origin: false, destination: false });
  };

  const field = (name, label, placeholder) => (
    <label className={`loc-field ${focus === name ? 'loc-field--active' : ''}`}>
      <span className="visually-hidden">{label}</span>
      <input
        ref={refs[name]}
        value={texts[name]}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        onChange={(e) => setText(name, e.target.value)}
        onFocus={(e) => {
          setFocus(name);
          e.target.select();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) select(results[0]);
        }}
      />
      {focus === name && texts[name] && (
        <button
          type="button"
          className="loc-field__clear"
          aria-label={`Limpar ${label.toLowerCase()}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setText(name, '')}
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </label>
  );

  const showingResults = query.trim().length > 0;

  return (
    <div className="screen screen--page search">
      <header className="page-header">
        <IconButton icon="arrowLeft" label="Voltar" variant="plain" onClick={goBack} />
        <h1 className="page-header__title">Planeje sua viagem</h1>
        <span className="page-header__spacer" />
      </header>

      <div className="search__chips">
        <button type="button" className="chip" onClick={() => setSheet('schedule')}>
          <Icon name="clock" size={16} />
          {pickupLabel(pickupOffset, now)}
          <Icon name="chevronDown" size={14} />
        </button>
        <button type="button" className="chip" onClick={() => setSheet('rider')}>
          <Icon name="person" size={16} />
          {rider === 'me' ? 'Para mim' : 'Para outra pessoa'}
          <Icon name="chevronDown" size={14} />
        </button>
      </div>

      <div className="loc-box">
        <div className="loc-box__rail" aria-hidden="true">
          <span className="route-stops__dot" />
          <span className="loc-box__line" />
          <span className="route-stops__square" />
        </div>
        <div className="loc-box__fields">
          {field('origin', 'Local de partida', 'Local de partida')}
          {field('destination', 'Destino', 'Para onde?')}
        </div>
        <IconButton icon="swap" label="Inverter partida e destino" variant="gray" size={36} iconSize={18} onClick={swap} disabled={!destination} className="loc-box__swap" />
      </div>

      <div className="scroll search__results" role="listbox" aria-label="Sugestões de local">
        {showingResults ? (
          <>
            {results.map((place, i) => (
              <ListItem
                key={place.id}
                icon={place.icon ?? 'pin'}
                meta={distanceFromUser(place)}
                title={place.label ?? place.title}
                subtitle={place.label ? place.title : place.subtitle}
                onClick={() => select(place)}
                last={i === results.length - 1}
              />
            ))}
            {remote.loading && (
              <div className="search__loading" aria-live="polite">
                <span className="search__spinner" /> Buscando endereços…
              </div>
            )}
            {!remote.loading && results.length === 0 && (
              <div className="search__empty">
                <p className="t-label">Nenhum local encontrado</p>
                <p className="t-body t-secondary">Confira o endereço digitado ou defina o local diretamente no mapa.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {focus === 'origin' && (
              <ListItem
                icon="locate"
                title="Localização atual"
                subtitle={CURRENT_LOCATION.title}
                onClick={() => select(CURRENT_LOCATION)}
              />
            )}
            {SAVED_PLACES.map((place) => (
              <ListItem key={place.id} icon={place.icon} title={place.label} subtitle={place.title} meta={distanceFromUser(place)} onClick={() => select(place)} />
            ))}
            {recentPlaces().map((place) => (
              <ListItem key={place.id} icon="clock" title={place.title} subtitle={place.subtitle} meta={distanceFromUser(place)} onClick={() => select(place)} />
            ))}
          </>
        )}
        <ListItem
          icon="pin"
          title="Definir local no mapa"
          subtitle={focus === 'origin' ? 'Escolha o ponto de partida arrastando o mapa' : 'Escolha o destino arrastando o mapa'}
          chevron
          last
          onClick={() => navigate('pick', { field: focus })}
        />
      </div>

      <ScheduleSheet open={sheet === 'schedule'} onClose={() => setSheet(null)} value={pickupOffset} onChange={setPickupOffset} />
      <RiderSheet open={sheet === 'rider'} onClose={() => setSheet(null)} value={rider} onChange={setRider} />
    </div>
  );
}
