import Icon from './Icon';
import { useApp } from '../state/AppProvider';
import './BottomNav.css';

const TABS = [
  { id: 'home', label: 'Página inicial', icon: 'home' },
  { id: 'services', label: 'Opções', icon: 'grid' },
  { id: 'activity', label: 'Atividade', icon: 'receipt' },
  { id: 'account', label: 'Conta', icon: 'person' },
];

export default function BottomNav({ active }) {
  const { resetTo } = useApp();
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav__item ${active === tab.id ? 'bottom-nav__item--active' : ''}`}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => active !== tab.id && resetTo(tab.id)}
        >
          <Icon name={tab.icon} size={24} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
