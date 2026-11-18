import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar';
import CallOverlay from '../components/CallOverlay';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import { useApp } from '../state/AppProvider';
import { useTrip } from '../state/TripProvider';
import { formatTime } from '../lib/format';
import './ChatScreen.css';

const QUICK_REPLIES = ['Estou a caminho', 'Já estou no local', 'Pode me esperar 2 minutos?', 'Tenho uma mala', 'Obrigada!'];

export default function ChatScreen() {
  const { goBack } = useApp();
  const { trip, messages, sendMessage, driverTyping } = useTrip();
  const [text, setText] = useState('');
  const [calling, setCalling] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, driverTyping]);

  if (!trip) return null;
  const { driver } = trip;

  const submit = (e) => {
    e.preventDefault();
    sendMessage(text);
    setText('');
  };

  return (
    <div className="screen screen--page chat">
      <header className="chat__header">
        <IconButton icon="arrowLeft" label="Voltar para a viagem" variant="plain" onClick={goBack} />
        <Avatar person={driver.avatar} size={40} />
        <div className="chat__who">
          <strong>{driver.name}</strong>
          <span>
            {driver.car} · {driver.plate}
          </span>
        </div>
        <IconButton icon="phone" label={`Ligar para ${driver.name}`} variant="gray" size={40} iconSize={20} onClick={() => setCalling(true)} />
      </header>

      <div className="chat__list scroll" ref={listRef} aria-live="polite">
        <p className="chat__notice">
          <Icon name="lock" size={14} />
          Para sua segurança, o motorista não vê seu número de telefone.
        </p>
        {messages.map((m) => (
          <div key={m.id} className={`bubble bubble--${m.from}`}>
            <span>{m.text}</span>
            <time>{formatTime(m.at)}</time>
          </div>
        ))}
        {driverTyping && (
          <div className="bubble bubble--driver bubble--typing" aria-label={`${driver.name} está digitando`}>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className="chat__quick">
        {QUICK_REPLIES.map((reply) => (
          <button key={reply} type="button" className="chip chip--small" onClick={() => sendMessage(reply)}>
            {reply}
          </button>
        ))}
      </div>

      <form className="chat__composer" onSubmit={submit}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Mensagem para ${driver.name}`} aria-label="Escreva uma mensagem" />
        <button type="submit" className="chat__send" disabled={!text.trim()} aria-label="Enviar mensagem">
          <Icon name="send" size={20} />
        </button>
      </form>

      {calling && <CallOverlay name={driver.name} subtitle="Seu número de telefone fica protegido" avatar={driver.avatar} onEnd={() => setCalling(false)} />}
    </div>
  );
}
