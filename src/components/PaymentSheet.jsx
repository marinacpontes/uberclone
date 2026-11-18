import ActionSheet from './ActionSheet';
import Button from './Button';
import ListItem from './ListItem';
import PaymentIcon from './PaymentIcon';
import { PAYMENT_METHODS } from '../data/payments';

export default function PaymentSheet({ open, onClose, value, onChange }) {
  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      title="Forma de pagamento"
      subtitle="Escolha como você quer pagar esta viagem."
      footer={
        <Button variant="primary" size="lg" onClick={onClose}>
          Concluído
        </Button>
      }
    >
      <div role="radiogroup" aria-label="Formas de pagamento">
        {PAYMENT_METHODS.map((method, i) => (
          <ListItem
            key={method.id}
            leading={<PaymentIcon method={method} />}
            title={method.label}
            subtitle={method.detail}
            last={i === PAYMENT_METHODS.length - 1}
            trailing={<span className={`radio ${value === method.id ? 'radio--on' : ''}`} role="radio" aria-checked={value === method.id} />}
            onClick={() => onChange(method.id)}
          />
        ))}
      </div>
    </ActionSheet>
  );
}
