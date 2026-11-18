import Icon from './Icon';
import './controls.css';

const GLYPH = { pix: 'pix', card: 'card', cash: 'cash' };

export default function PaymentIcon({ method }) {
  return (
    <span className={`pay-icon pay-icon--${method.type}`} aria-hidden="true">
      <Icon name={GLYPH[method.type]} size={method.type === 'card' ? 18 : 20} />
    </span>
  );
}
