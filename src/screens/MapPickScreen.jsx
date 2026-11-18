import { useEffect, useRef, useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import { useApp } from '../state/AppProvider';
import { reverseGeocode } from '../lib/geocoding';
import './MapPickScreen.css';

/** Altura do alfinete: mesma regra usada pelo mapa para centralizar acima do painel. */
const pinYFor = (height, inset) => (height - Math.min(inset, height * 0.62)) / 2 + 20;

export default function MapPickScreen({ params }) {
  const { mapRef, mapInset, setOrigin, setDestination, navigate, setStack, destination } = useApp();
  const field = params.field ?? 'destination';
  const [place, setPlace] = useState(null);
  const [moving, setMoving] = useState(false);
  const [pinY, setPinY] = useState(null);
  const insetRef = useRef(mapInset);
  insetRef.current = mapInset;

  useEffect(() => {
    const map = mapRef.current;
    if (map) setPinY(pinYFor(map.getSize().y, mapInset));
  }, [mapInset, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    let controller;
    let timer;
    const onStart = () => setMoving(true);
    const onEnd = () => {
      setMoving(false);
      clearTimeout(timer);
      controller?.abort();
      setPlace(null);
      timer = setTimeout(() => {
        controller = new AbortController();
        const size = map.getSize();
        const latlng = map.containerPointToLatLng([size.x / 2, pinYFor(size.y, insetRef.current)]);
        reverseGeocode([latlng.lat, latlng.lng], controller.signal).then(setPlace).catch(() => {});
      }, 300);
    };
    map.on('movestart', onStart);
    map.on('moveend', onEnd);
    onEnd();
    return () => {
      map.off('movestart', onStart);
      map.off('moveend', onEnd);
      clearTimeout(timer);
      controller?.abort();
    };
  }, [mapRef]);

  const confirm = () => {
    if (!place) return;
    if (field === 'destination') {
      setDestination(place);
      navigate('options', {}, { replace: true });
      return;
    }
    setOrigin(place);
    if (destination) navigate('options', {}, { replace: true });
    else setStack((s) => [...s.slice(0, -2), { name: 'search', params: { focus: 'destination' } }]);
  };

  const isOrigin = field === 'origin';

  return (
    <div className="screen screen--map pick">
      <div className="map-topbar">
        <IconButton icon="arrowLeft" label="Voltar" onClick={() => setStack((s) => s.slice(0, -1))} />
      </div>

      {pinY != null && (
        <div className={`pick-pin ${moving ? 'pick-pin--lifted' : ''}`} style={{ top: pinY }} aria-hidden="true">
          <span className="pick-pin__head" />
          <span className="pick-pin__stem" />
          <span className="pick-pin__shadow" />
        </div>
      )}

      <BottomSheet label={isOrigin ? 'Definir partida' : 'Definir destino'}>
        <div className="pick__body">
          <h2 className="t-h2">{isOrigin ? 'Defina o ponto de partida' : 'Defina o destino'}</h2>
          <p className="t-body t-secondary">Arraste o mapa para posicionar o marcador</p>
          <div className="pick__address">
            <span className="pick__address-icon">
              <Icon name={isOrigin ? 'person' : 'flag'} size={18} />
            </span>
            {place && !moving ? (
              <span className="pick__address-text">
                <strong>{place.title}</strong>
                <span>{place.subtitle}</span>
              </span>
            ) : (
              <span className="pick__address-text">
                <span className="skeleton" style={{ width: '70%', height: 18, margin: '1px 0' }} />
                <span className="skeleton" style={{ width: '45%', height: 14, margin: '3px 0 1px' }} />
              </span>
            )}
          </div>
        </div>
        <div className="pick__actions">
          <Button onClick={confirm} disabled={!place || moving}>
            {isOrigin ? 'Confirmar partida' : 'Confirmar destino'}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
