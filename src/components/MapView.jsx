import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../state/AppProvider';
import { carIcon, labelIcon, pulseIcon, stopIcon, userIcon } from './mapMarkers';
import './MapView.css';

/** Mapa base em tons de cinza. Stadia funciona sem chave em localhost; se falhar, usa Esri Light Gray. */
const TILES = {
  url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  attribution:
    '© <a href="https://stadiamaps.com/" target="_blank" rel="noreferrer">Stadia Maps</a> © <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
};
const FALLBACK_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap',
  maxNativeZoom: 16,
};
const TOP_PADDING = 120;
const SIDE_PADDING = 48;

/* ---------- Enquadramento considerando o painel inferior ---------- */
function visibleBottom(map, inset) {
  return Math.min(inset, map.getSize().y * 0.62);
}

function focus(map, latlng, zoom, inset) {
  const bottom = visibleBottom(map, inset);
  const point = map.project(latlng, zoom).add([0, bottom / 2 - 20]);
  map.setView(map.unproject(point, zoom), zoom, { animate: true });
}

function fit(map, points, inset) {
  const bottom = visibleBottom(map, inset);
  map.fitBounds(L.latLngBounds(points), {
    paddingTopLeft: [SIDE_PADDING, TOP_PADDING],
    paddingBottomRight: [SIDE_PADDING, bottom + 40],
    maxZoom: 16.5,
    animate: true,
  });
}

function frameScene(map, scene, inset) {
  switch (scene.type) {
    case 'home':
      return focus(map, scene.center, 16, inset);
    case 'pick':
      return focus(map, scene.center, 17, inset);
    case 'matching':
      return focus(map, scene.center, 16, inset);
    case 'route':
    case 'points':
      return fit(map, scene.bounds, inset);
    case 'trip':
      return scene.phase === 'arrived' ? focus(map, scene.center, 17, inset) : fit(map, scene.bounds, inset);
    default:
      return undefined;
  }
}

/* ---------- Desenho das camadas ---------- */
function drawLine(group, path, { faded = false } = {}) {
  const casing = L.polyline(path, { color: '#ffffff', weight: 9, opacity: faded ? 0.6 : 1, interactive: false, lineCap: 'round', lineJoin: 'round' });
  const line = L.polyline(path, { color: '#000000', weight: 5, opacity: faded ? 0.25 : 1, interactive: false, lineCap: 'round', lineJoin: 'round' });
  casing.addTo(group);
  line.addTo(group);
  return [casing, line];
}

/** Lado para onde o rótulo cresce: sempre em direção ao outro ponto, para não sair da tela. */
const sideToward = (from, to) => (from[1] <= to[1] ? 'right' : 'left');

function addLabel(group, latlng, options, onClick) {
  const marker = L.marker(latlng, {
    icon: labelIcon({ ...options, clickable: Boolean(onClick) }),
    interactive: Boolean(onClick),
    keyboard: false,
    zIndexOffset: 1000,
  }).addTo(group);
  if (onClick) marker.on('click', onClick);
}

function drawScene(scene, group, refs) {
  switch (scene.type) {
    case 'home':
      scene.cars.forEach((car) => L.marker(car.pos, { icon: carIcon(car.bearing), interactive: false, keyboard: false }).addTo(group));
      L.marker(scene.center, { icon: userIcon(), interactive: false, keyboard: false, zIndexOffset: 500 }).addTo(group);
      break;

    case 'points':
      L.marker(scene.origin, { icon: stopIcon('origin'), interactive: false, keyboard: false }).addTo(group);
      L.marker(scene.destination, { icon: stopIcon('dest'), interactive: false, keyboard: false }).addTo(group);
      break;

    case 'route':
      drawLine(group, scene.path);
      L.marker(scene.origin, { icon: stopIcon('origin'), interactive: false, keyboard: false }).addTo(group);
      L.marker(scene.destination, { icon: stopIcon('dest'), interactive: false, keyboard: false }).addTo(group);
      addLabel(group, scene.origin, { text: scene.originLabel, eta: scene.eta, side: sideToward(scene.origin, scene.destination) }, scene.onOriginClick);
      addLabel(group, scene.destination, { text: scene.destinationLabel, side: sideToward(scene.destination, scene.origin) }, scene.onDestinationClick);
      break;

    case 'matching':
      if (scene.path) drawLine(group, scene.path, { faded: true });
      L.marker(scene.center, { icon: pulseIcon(), interactive: false, keyboard: false }).addTo(group);
      break;

    case 'trip': {
      const frame = scene.timeline.at(Date.now());
      const path = frame.remaining.length > 1 ? frame.remaining : [frame.pos, frame.pos];
      refs.lines.current = drawLine(group, path);
      if (scene.phase === 'onTrip') {
        L.marker(scene.destination, { icon: stopIcon('dest'), interactive: false, keyboard: false }).addTo(group);
        addLabel(group, scene.destination, { text: scene.destinationLabel, side: sideToward(scene.destination, scene.origin) });
      } else {
        L.marker(scene.origin, { icon: stopIcon('origin'), interactive: false, keyboard: false }).addTo(group);
        addLabel(group, scene.origin, { text: scene.originLabel, side: sideToward(scene.origin, scene.bounds[0]) });
      }
      refs.car.current = L.marker(frame.pos, { icon: carIcon(frame.bearing), interactive: false, keyboard: false, zIndexOffset: 800 }).addTo(group);
      break;
    }

    default:
      break;
  }
}

/**
 * Mapa único e persistente da aplicação. Cada tela descreve uma "cena"
 * (início, trajeto, busca de motorista, viagem) e o mapa se redesenha e
 * se enquadra conforme o espaço deixado pelo painel inferior.
 */
export default function MapView({ scene }) {
  const { mapRef, mapInset, recenterKey } = useApp();
  const elRef = useRef(null);
  const groupRef = useRef(null);
  const carRef = useRef(null);
  const linesRef = useRef(null);
  const sceneRef = useRef(scene);
  const insetRef = useRef(mapInset);
  sceneRef.current = scene;
  insetRef.current = mapInset;

  useEffect(() => {
    const map = L.map(elRef.current, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.25,
      center: scene.center ?? [-23.5585, -46.6597],
      zoom: 16,
      fadeAnimation: true,
    });
    const tiles = L.tileLayer(TILES.url, { maxZoom: 20, attribution: TILES.attribution }).addTo(map);
    let failures = 0;
    const onTileError = () => {
      failures += 1;
      if (failures < 3) return;
      tiles.off('tileerror', onTileError);
      map.removeLayer(tiles);
      L.tileLayer(FALLBACK_TILES.url, { maxZoom: 20, maxNativeZoom: FALLBACK_TILES.maxNativeZoom, attribution: FALLBACK_TILES.attribution }).addTo(map);
    };
    tiles.on('tileerror', onTileError);
    map.attributionControl.setPrefix(false);
    groupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(elRef.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Camadas da cena
  useEffect(() => {
    const group = groupRef.current;
    if (!group || scene.type === 'hidden') return;
    group.clearLayers();
    carRef.current = null;
    linesRef.current = null;
    drawScene(scene, group, { car: carRef, lines: linesRef });
  }, [scene.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enquadramento (aguarda o painel terminar de se acomodar)
  const insetBucket = Math.round(mapInset / 24);
  const framedRef = useRef({ fitKey: null, recenterKey });
  useEffect(() => {
    const map = mapRef.current;
    if (!map || scene.type === 'hidden') return undefined;
    // No modo "definir no mapa" o usuário controla a câmera: enquadra só ao entrar.
    const last = framedRef.current;
    if (scene.type === 'pick' && last.fitKey === scene.fitKey && last.recenterKey === recenterKey) return undefined;
    const id = setTimeout(() => {
      framedRef.current = { fitKey: scene.fitKey, recenterKey };
      frameScene(map, sceneRef.current, insetRef.current);
    }, 90);
    return () => clearTimeout(id);
  }, [scene.fitKey, insetBucket, recenterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animação do carro durante a viagem
  useEffect(() => {
    if (scene.type !== 'trip') return undefined;
    let raf;
    let lastLine = 0;
    const loop = (ts) => {
      const current = sceneRef.current;
      if (current.type !== 'trip') return;
      const frame = current.timeline.at(Date.now());
      const car = carRef.current;
      if (car) {
        car.setLatLng(frame.pos);
        const body = car.getElement()?.querySelector('.m-car__body');
        if (body) body.style.transform = `rotate(${frame.bearing}deg)`;
      }
      if (linesRef.current && ts - lastLine > 200) {
        lastLine = ts;
        const path = frame.remaining.length > 1 ? frame.remaining : [frame.pos, frame.pos];
        linesRef.current.forEach((line) => line.setLatLngs(path));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scene.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={elRef} className="map" style={{ '--map-inset': `${mapInset}px` }} role="region" aria-label="Mapa" />;
}
