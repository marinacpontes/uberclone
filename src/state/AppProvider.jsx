import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CURRENT_LOCATION } from '../data/places';
import { PAST_TRIPS } from '../data/activity';
import { fetchRoute } from '../lib/routing';
import { toLatLng } from '../lib/geo';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  /* ---- Navegação (pilha de telas) ---- */
  const [stack, setStack] = useState([{ name: 'home', params: {} }]);
  const navigate = useCallback((name, params = {}, { replace = false } = {}) => {
    setStack((s) => (replace ? [...s.slice(0, -1), { name, params }] : [...s, { name, params }]));
  }, []);
  const goBack = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const resetTo = useCallback((name, params = {}) => setStack([{ name, params }]), []);
  const current = stack[stack.length - 1];

  /* ---- Solicitação de viagem ---- */
  const [origin, setOrigin] = useState(CURRENT_LOCATION);
  const [destination, setDestination] = useState(null);
  const [pickupOffset, setPickupOffset] = useState(0);
  const [rider, setRider] = useState('me');
  const [vehicleId, setVehicleId] = useState('uberx');
  const [paymentId, setPaymentId] = useState('pix');
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!origin || !destination) {
      setRoute(null);
      return undefined;
    }
    let alive = true;
    setRoute(null);
    fetchRoute(toLatLng(origin), toLatLng(destination)).then((r) => alive && setRoute(r));
    return () => {
      alive = false;
    };
  }, [origin, destination]);

  /* ---- Viagem ativa, histórico e reservas ---- */
  const [trip, setTrip] = useState(null);
  const [history, setHistory] = useState(PAST_TRIPS);
  const [upcoming, setUpcoming] = useState([]);

  /* ---- Feedback e mapa ---- */
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => setToast({ message, id: Date.now() }), []);
  const [mapInset, setMapInset] = useState(0);
  const [recenterKey, setRecenterKey] = useState(0);
  const requestRecenter = useCallback(() => setRecenterKey((k) => k + 1), []);
  const mapRef = useRef(null);

  const value = {
    stack,
    setStack,
    current,
    navigate,
    goBack,
    resetTo,
    origin,
    setOrigin,
    destination,
    setDestination,
    pickupOffset,
    setPickupOffset,
    rider,
    setRider,
    vehicleId,
    setVehicleId,
    paymentId,
    setPaymentId,
    route,
    trip,
    setTrip,
    history,
    setHistory,
    upcoming,
    setUpcoming,
    toast,
    showToast,
    mapInset,
    setMapInset,
    recenterKey,
    requestRecenter,
    mapRef,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
