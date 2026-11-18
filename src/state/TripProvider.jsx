import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from './AppProvider';
import { createTimeline } from '../lib/timeline';
import { normalize } from '../lib/format';

const TripContext = createContext(null);

function driverReply(text) {
  const t = normalize(text);
  if (t.includes('caminho') || t.includes('descendo') || t.includes('minuto')) return 'Tranquilo, fico te aguardando aqui.';
  if (t.includes('cheguei') || t.includes('local') || t.includes('aqui')) return 'Perfeito, já estou quase aí!';
  if (t.includes('mala') || t.includes('bagagem')) return 'Sem problemas, o porta-malas está livre.';
  if (t.includes('obrigad')) return 'Eu que agradeço! Até já.';
  return 'Ok, combinado!';
}

export function TripProvider({ children }) {
  const { trip, resetTo } = useApp();
  const timeline = useMemo(() => (trip ? createTimeline(trip) : null), [trip]);
  const [snap, setSnap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [driverTyping, setDriverTyping] = useState(false);
  const completedRef = useRef(null);
  const replyTimer = useRef(null);

  // Snapshot de UI: só atualiza quando a fase ou o minuto exibido mudam.
  useEffect(() => {
    if (!timeline) {
      setSnap(null);
      return undefined;
    }
    let id;
    const tick = () => {
      const s = timeline.at(Date.now());
      setSnap((prev) => (prev && prev.phase === s.phase && prev.etaMin === s.etaMin ? prev : s));
      if (s.phase === 'completed') clearInterval(id);
    };
    tick();
    id = setInterval(tick, 400);
    return () => clearInterval(id);
  }, [timeline]);

  useEffect(() => {
    if (snap?.phase === 'completed' && trip && completedRef.current !== trip.id) {
      completedRef.current = trip.id;
      resetTo('rating');
    }
  }, [snap?.phase, trip, resetTo]);

  // Conversa: o motorista manda uma mensagem logo após aceitar.
  useEffect(() => {
    clearTimeout(replyTimer.current);
    setDriverTyping(false);
    if (!trip) {
      setMessages([]);
      return;
    }
    setMessages([
      {
        id: `${trip.id}-hello`,
        from: 'driver',
        text: `Olá! Aqui é ${trip.driver.article ?? 'o'} ${trip.driver.name}, já estou a caminho do ponto de partida.`,
        at: new Date(trip.startedAt + 2000),
      },
    ]);
  }, [trip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback((text) => {
    const body = text.trim();
    if (!body) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: 'me', text: body, at: new Date() }]);
    clearTimeout(replyTimer.current);
    setDriverTyping(true);
    replyTimer.current = setTimeout(() => {
      setDriverTyping(false);
      setMessages((m) => [...m, { id: `d-${Date.now()}`, from: 'driver', text: driverReply(body), at: new Date() }]);
    }, 1800);
  }, []);

  useEffect(() => () => clearTimeout(replyTimer.current), []);

  const value = { trip, timeline, snap, messages, sendMessage, driverTyping };
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  return useContext(TripContext);
}
