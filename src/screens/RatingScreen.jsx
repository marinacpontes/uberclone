import { useEffect, useState } from 'react';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import PaymentIcon from '../components/PaymentIcon';
import RouteStops from '../components/RouteStops';
import { useApp } from '../state/AppProvider';
import { findPayment } from '../data/payments';
import { formatBRL, formatTime } from '../lib/format';
import './RatingScreen.css';

const PRAISE = ['Direção segura', 'Carro limpo', 'Ótima conversa', 'Rota eficiente', 'Muito educado', 'Pontual'];
const ISSUES = ['Rota ruim', 'Direção perigosa', 'Carro sujo', 'Atrasou', 'Comportamento inadequado', 'Cobrança errada'];
const TIPS = [0, 2, 5, 10];
const LABELS = ['', 'Péssima', 'Ruim', 'Ok', 'Boa', 'Excelente'];

export default function RatingScreen() {
  const { trip, setTrip, setHistory, setDestination, resetTo, showToast, paymentId } = useApp();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (!trip) resetTo('home');
  }, [trip, resetTo]);

  if (!trip) return null;
  const { driver } = trip;
  const payment = findPayment(paymentId);
  const tagOptions = rating >= 4 ? PRAISE : ISSUES;

  const finish = (rated) => {
    setHistory((h) => [
      { id: trip.id, vehicleId: trip.vehicle.id, place: trip.destination, date: new Date(), price: trip.price + tip, status: 'completed' },
      ...h,
    ]);
    setTrip(null);
    setDestination(null);
    resetTo('home');
    showToast(rated ? `Obrigado! Sua avaliação foi enviada${tip ? ` com gorjeta de ${formatBRL(tip)}` : ''}.` : 'Viagem concluída. Até a próxima!');
  };

  return (
    <div className="screen screen--page rating">
      <header className="rating__top">
        <IconButton icon="close" label="Fechar" variant="plain" onClick={() => finish(false)} />
      </header>

      <div className="scroll rating__body">
        <p className="rating__eyebrow">Você chegou · {formatTime(new Date())}</p>
        <h1 className="t-h1 rating__title">Como foi sua viagem com {driver.name}?</h1>
        <div className="rating__driver">
          <Avatar person={driver.avatar} size={88} />
          <span className="t-body t-secondary">
            {driver.car} · {driver.plate}
          </span>
        </div>

        <div className="stars" role="radiogroup" aria-label="Avaliação de 1 a 5 estrelas">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n > 1 ? 'estrelas' : 'estrela'}`}
              className={`stars__star ${n <= rating ? 'stars__star--on' : ''}`}
              onClick={() => {
                setRating(n);
                setTags([]);
              }}
            >
              <Icon name="star" size={40} />
            </button>
          ))}
        </div>
        <p className="rating__label">{rating ? LABELS[rating] : 'Toque nas estrelas para avaliar'}</p>

        {rating > 0 && (
          <section className="rating__section">
            <h2 className="t-h3">{rating >= 4 ? 'O que foi ótimo?' : 'O que poderia melhorar?'}</h2>
            <div className="rating__chips">
              {tagOptions.map((tag) => {
                const on = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`chip ${on ? 'chip--active' : ''}`}
                    aria-pressed={on}
                    onClick={() => setTags((t) => (on ? t.filter((x) => x !== tag) : [...t, tag]))}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="rating__section">
          <h2 className="t-h3">Adicionar gorjeta</h2>
          <p className="t-body t-secondary">100% do valor vai para {driver.name}.</p>
          <div className="rating__tips">
            {TIPS.map((value) => (
              <button key={value} type="button" className={`tip ${tip === value ? 'tip--on' : ''}`} aria-pressed={tip === value} onClick={() => setTip(value)}>
                {value ? formatBRL(value) : 'Sem gorjeta'}
              </button>
            ))}
          </div>
        </section>

        <section className="rating__section rating__receipt">
          <RouteStops origin={trip.origin} destination={trip.destination} showSubtitles={false} />
          <hr className="divider" />
          <div className="rating__total">
            <PaymentIcon method={payment} />
            <span>{payment.label}</span>
            <strong>{formatBRL(trip.price + tip)}</strong>
          </div>
        </section>
      </div>

      <footer className="rating__footer">
        <Button onClick={() => finish(true)} disabled={!rating}>
          Enviar avaliação
        </Button>
      </footer>
    </div>
  );
}
