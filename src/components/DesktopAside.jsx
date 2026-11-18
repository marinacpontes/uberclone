import Icon from './Icon';
import { useApp } from '../state/AppProvider';
import { CURRENT_LOCATION, findPlace } from '../data/places';
import './DesktopAside.css';

const FLOWS = [
  { id: 'home', icon: 'home', title: 'Tela inicial', text: 'Mapa, “Para onde?”, atalhos e locais salvos' },
  { id: 'options', icon: 'car', title: 'Solicitar viagem', text: 'Trajeto até o MASP com categorias e preços' },
  { id: 'trip', icon: 'route', title: 'Viagem em andamento', text: 'Busca de motorista e acompanhamento ao vivo' },
];

/** Painel lateral exibido em telas largas, com atalhos para os fluxos. */
export default function DesktopAside() {
  const { resetTo, setStack, setOrigin, setDestination, setPickupOffset, setTrip, trip, current } = useApp();

  const go = (id) => {
    if (id === 'home') {
      resetTo('home');
      return;
    }
    if (trip) setTrip(null);
    setOrigin(CURRENT_LOCATION);
    setDestination(findPlace('masp'));
    setPickupOffset(0);
    if (id === 'options') setStack([{ name: 'home', params: {} }, { name: 'options', params: {} }]);
    if (id === 'trip') setStack([{ name: 'home', params: {} }, { name: 'options', params: {} }, { name: 'matching', params: {} }]);
  };

  const activeFlow = ['trip', 'chat', 'matching'].includes(current.name)
    ? 'trip'
    : current.name === 'options'
      ? 'options'
      : current.name === 'home'
        ? 'home'
        : null;

  return (
    <aside className="stage__aside">
      <p className="aside__eyebrow">Protótipo navegável</p>
      <h1 className="aside__title">App de mobilidade</h1>
      <p className="aside__text">
        Interface mobile em 390 × 844 pt. Toque nos elementos dentro do aparelho ou use os atalhos para pular entre os fluxos principais.
      </p>
      <nav className="aside__flows" aria-label="Atalhos de fluxo">
        {FLOWS.map((flow) => (
          <button
            key={flow.id}
            type="button"
            className={`aside__flow ${activeFlow === flow.id ? 'aside__flow--active' : ''}`}
            onClick={() => go(flow.id)}
          >
            <span className="aside__flow-icon">
              <Icon name={flow.icon} size={20} />
            </span>
            <span>
              <strong>{flow.title}</strong>
              <span>{flow.text}</span>
            </span>
          </button>
        ))}
      </nav>
      <p className="aside__foot">Mapa: Stadia Maps / OpenStreetMap · Rotas: OSRM · Endereços: Nominatim</p>
    </aside>
  );
}
