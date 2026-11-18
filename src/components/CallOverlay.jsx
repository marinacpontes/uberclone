import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';
import './CallOverlay.css';

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** Chamada de voz simulada pelo app (número protegido). */
export default function CallOverlay({ name, subtitle, avatar, onEnd }) {
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    const ring = setTimeout(() => setConnected(true), 2400);
    return () => clearTimeout(ring);
  }, []);

  useEffect(() => {
    if (!connected) return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [connected]);

  return (
    <div className="call" role="dialog" aria-modal="true" aria-label={`Chamada com ${name}`}>
      <div className="call__top">
        {avatar ? (
          <Avatar person={avatar} size={104} />
        ) : (
          <span className="call__glyph">
            <Icon name="siren" size={44} />
          </span>
        )}
        <h2 className="call__name">{name}</h2>
        <p className="call__state" aria-live="polite">
          {connected ? mmss(seconds) : 'Chamando…'}
        </p>
        <p className="call__note">
          <Icon name="lock" size={14} />
          {subtitle}
        </p>
      </div>
      <div className="call__controls">
        <button type="button" className={`call__ctl ${muted ? 'call__ctl--on' : ''}`} onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
          <span>
            <Icon name={muted ? 'micOff' : 'mic'} size={28} />
          </span>
          {muted ? 'Ativar som' : 'Silenciar'}
        </button>
        <button type="button" className={`call__ctl ${speaker ? 'call__ctl--on' : ''}`} onClick={() => setSpeaker((s) => !s)} aria-pressed={speaker}>
          <span>
            <Icon name="speaker" size={28} />
          </span>
          Alto-falante
        </button>
      </div>
      <button type="button" className="call__end" onClick={onEnd} aria-label="Encerrar chamada">
        <Icon name="phoneEnd" size={32} />
      </button>
    </div>
  );
}
