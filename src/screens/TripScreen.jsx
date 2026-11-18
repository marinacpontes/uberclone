import { useState } from 'react';
import ActionSheet from '../components/ActionSheet';
import Avatar from '../components/Avatar';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import CallOverlay from '../components/CallOverlay';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import ListItem from '../components/ListItem';
import PaymentIcon from '../components/PaymentIcon';
import PaymentSheet from '../components/PaymentSheet';
import RouteStops from '../components/RouteStops';
import VehicleArt from '../components/VehicleArt';
import { useApp } from '../state/AppProvider';
import { useTrip } from '../state/TripProvider';
import { findPayment } from '../data/payments';
import { addMinutes, formatBRL, formatRating, formatTime } from '../lib/format';
import './TripScreen.css';

const TRUSTED_CONTACTS = [
  { id: 'mae', name: 'Mãe', phone: '(11) 99812-4410' },
  { id: 'pedro', name: 'Pedro Ribeiro', phone: '(11) 98143-2276' },
  { id: 'ana', name: 'Ana Souza', phone: '(11) 97455-0391' },
];

function statusFor(trip, snap) {
  if (snap.phase === 'approach') {
    return {
      title: 'Encontre o motorista no ponto de partida',
      subtitle: `${trip.driver.name} está a caminho de ${trip.origin.title}`,
      eta: snap.etaMin,
    };
  }
  if (snap.phase === 'arrived') {
    const arrivedAt = new Date(trip.startedAt + trip.timing.approachMs);
    return {
      title: 'Seu motorista chegou',
      subtitle: `${trip.driver.name} vai aguardar até ${formatTime(addMinutes(arrivedAt, 5))}`,
    };
  }
  return {
    title: `Indo para ${trip.destination.title}`,
    subtitle: `Chegada prevista às ${formatTime(addMinutes(new Date(), snap.etaMin))}`,
    eta: snap.etaMin,
  };
}

export default function TripScreen() {
  const { navigate, resetTo, setTrip, showToast, paymentId, setPaymentId } = useApp();
  const { trip, snap, messages } = useTrip();
  const [sheet, setSheet] = useState(null);
  const [calling, setCalling] = useState(null);
  const [shareWith, setShareWith] = useState(['mae']);
  const [recording, setRecording] = useState(false);

  if (!trip || !snap || snap.phase === 'completed') return null;

  const { driver, vehicle } = trip;
  const status = statusFor(trip, snap);
  const payment = findPayment(paymentId);
  const lastFromDriver = [...messages].reverse().find((m) => m.from === 'driver');
  const beforePickup = snap.phase !== 'onTrip';

  const cancelTrip = () => {
    setSheet(null);
    setTrip(null);
    resetTo('home');
    showToast('Sua viagem foi cancelada sem cobrança.');
  };

  const shareTrip = () => {
    setSheet(null);
    const names = TRUSTED_CONTACTS.filter((c) => shareWith.includes(c.id)).map((c) => c.name);
    showToast(`Status compartilhado com ${names.join(', ')}`);
  };

  return (
    <div className="screen screen--map trip">
      <BottomSheet
        expandable
        peek={392}
        label="Detalhes da viagem"
        floating={
          <button type="button" className="safety-fab" onClick={() => setSheet('safety')}>
            <Icon name="shield" size={20} />
            Segurança
          </button>
        }
      >
        <div className="trip__status">
          <div className="trip__status-text">
            <h2 className="t-h2">{status.title}</h2>
            <p className="t-body t-secondary">{status.subtitle}</p>
          </div>
          {status.eta != null && (
            <div className="trip__eta" aria-label={`${status.eta} minutos`}>
              <b>{status.eta}</b>
              <small>min</small>
            </div>
          )}
        </div>

        <div className="trip__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${snap.phase === 'arrived' ? 1 : snap.progress})` }} />
        </div>

        {beforePickup && (
          <div className="trip__pin">
            <span>Informe o PIN ao motorista</span>
            <span className="trip__pin-digits" aria-label={`PIN ${trip.pin.split('').join(' ')}`}>
              {trip.pin.split('').map((d, i) => (
                <b key={i}>{d}</b>
              ))}
            </span>
          </div>
        )}

        <div className="trip__driver">
          <div className="trip__visual">
            <VehicleArt kind={vehicle.art} tone={driver.tone} width={120} />
            <Avatar person={driver.avatar} size={52} className="trip__avatar" />
          </div>
          <div className="trip__driver-info">
            <span className="trip__plate">{driver.plate}</span>
            <span className="trip__car">
              {driver.car} · {driver.color}
            </span>
            <span className="trip__name">
              {driver.name}
              <span className="trip__rating">
                <Icon name="star" size={12} />
                {formatRating(driver.rating)}
              </span>
            </span>
          </div>
        </div>

        <div className="trip__contact">
          <button type="button" className="trip__message" onClick={() => navigate('chat')}>
            <span className="trip__message-text">
              {lastFromDriver && messages.length === 1 ? `Nova mensagem de ${driver.name}` : `Enviar mensagem para ${driver.name}`}
            </span>
            {lastFromDriver && messages.length === 1 && <span className="trip__unread" aria-label="Mensagem não lida" />}
          </button>
          <IconButton icon="phone" label={`Ligar para ${driver.name}`} variant="gray" size={48} onClick={() => setCalling('driver')} />
        </div>

        <p className="trip__driver-meta">
          {driver.trips} viagens · {driver.years} anos como motorista parceiro
        </p>

        <hr className="divider divider--thick" />
        <ListItem
          icon="shield"
          title="Central de segurança"
          subtitle="Ferramentas para viajar com tranquilidade"
          chevron
          onClick={() => setSheet('safety')}
        />
        <ListItem
          icon="share"
          title="Compartilhar status da viagem"
          subtitle="Contatos acompanham seu trajeto em tempo real"
          chevron
          last
          onClick={() => setSheet('share')}
        />

        <hr className="divider divider--thick" />
        <div className="trip__section">
          <h3 className="t-h3">Sua viagem</h3>
          <RouteStops origin={trip.origin} destination={trip.destination} />
        </div>
        <ListItem
          leading={<PaymentIcon method={payment} />}
          title={payment.label}
          subtitle={`Total estimado ${formatBRL(trip.price)}`}
          trailing={<span className="trip__change">Alterar</span>}
          last
          onClick={() => setSheet('payment')}
        />

        {beforePickup && (
          <div className="trip__cancel">
            <Button variant="secondary" onClick={() => setSheet('cancel')}>
              Cancelar viagem
            </Button>
          </div>
        )}
        <div style={{ height: 'calc(16px + var(--safe-bottom))' }} />
      </BottomSheet>

      <ActionSheet
        open={sheet === 'cancel'}
        onClose={() => setSheet(null)}
        title="Cancelar a viagem?"
        subtitle={`${driver.name} já está a caminho. Cancelamentos feitos mais de 2 minutos após a confirmação podem gerar uma taxa de ${formatBRL(5)}.`}
        footer={
          <>
            <Button onClick={() => setSheet(null)}>Manter viagem</Button>
            <Button variant="secondary" onClick={cancelTrip}>
              Sim, cancelar
            </Button>
          </>
        }
      />

      <ActionSheet open={sheet === 'safety'} onClose={() => setSheet(null)} title="Central de segurança" subtitle="Recursos disponíveis durante toda a viagem.">
        <ListItem icon="share" title="Compartilhar status da viagem" subtitle="Envie o trajeto para contatos de confiança" chevron onClick={() => setSheet('share')} />
        <ListItem
          icon="mic"
          title="Gravação de áudio"
          subtitle="O áudio fica criptografado no seu celular"
          trailing={<span className="toggle" role="switch" aria-checked={recording} />}
          onClick={() => {
            setRecording((r) => !r);
            showToast(recording ? 'Gravação de áudio desativada' : 'Gravação de áudio ativada');
          }}
        />
        <ListItem
          icon="siren"
          title="Ligar para 190"
          subtitle={`Sua localização e a placa ${driver.plate} ficam na tela`}
          last
          onClick={() => {
            setSheet(null);
            setCalling('police');
          }}
        />
      </ActionSheet>

      <ActionSheet
        open={sheet === 'share'}
        onClose={() => setSheet(null)}
        title="Compartilhar status da viagem"
        subtitle="Eles verão o motorista, a placa e o trajeto até você chegar."
        footer={
          <Button onClick={shareTrip} disabled={shareWith.length === 0}>
            Compartilhar
          </Button>
        }
      >
        {TRUSTED_CONTACTS.map((contact, i) => {
          const on = shareWith.includes(contact.id);
          return (
            <ListItem
              key={contact.id}
              icon="person"
              title={contact.name}
              subtitle={contact.phone}
              last={i === TRUSTED_CONTACTS.length - 1}
              trailing={
                <span className={`check ${on ? 'check--on' : ''}`} role="checkbox" aria-checked={on}>
                  {on && <Icon name="check" size={14} />}
                </span>
              }
              onClick={() => setShareWith((list) => (on ? list.filter((id) => id !== contact.id) : [...list, contact.id]))}
            />
          );
        })}
      </ActionSheet>

      <PaymentSheet open={sheet === 'payment'} onClose={() => setSheet(null)} value={paymentId} onChange={setPaymentId} />

      {calling === 'driver' && (
        <CallOverlay name={driver.name} subtitle="Seu número de telefone fica protegido" avatar={driver.avatar} onEnd={() => setCalling(null)} />
      )}
      {calling === 'police' && (
        <CallOverlay name="190" subtitle={`Polícia Militar · placa ${driver.plate}`} onEnd={() => setCalling(null)} />
      )}
    </div>
  );
}
