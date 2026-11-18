import { useEffect, useState } from 'react';
import ActionSheet from './ActionSheet';
import Button from './Button';
import ListItem from './ListItem';
import { addMinutes, formatTime } from '../lib/format';
import { useNow } from '../hooks/useNow';

const OPTIONS = [
  { minutes: 0, label: 'Agora', hint: 'Solicite e seja buscado em poucos minutos' },
  { minutes: 15, label: 'Em 15 minutos' },
  { minutes: 30, label: 'Em 30 minutos' },
  { minutes: 60, label: 'Em 1 hora' },
  { minutes: 120, label: 'Em 2 horas' },
];

export const pickupLabel = (offset, now = new Date()) =>
  offset > 0 ? `Retirada às ${formatTime(addMinutes(now, offset))}` : 'Retirar agora';

export default function ScheduleSheet({ open, onClose, value, onChange }) {
  const now = useNow(30000);
  const [selected, setSelected] = useState(value);
  useEffect(() => {
    if (open) setSelected(value);
  }, [open, value]);

  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      title="Quando você quer ser buscado?"
      subtitle="Reserve com até 90 dias de antecedência. Seu motorista espera 15 minutos sem custo adicional."
      footer={
        <Button
          onClick={() => {
            onChange(selected);
            onClose();
          }}
        >
          {selected > 0 ? `Reservar para ${formatTime(addMinutes(now, selected))}` : 'Confirmar'}
        </Button>
      }
    >
      <div role="radiogroup" aria-label="Horário de retirada">
        {OPTIONS.map((option, i) => (
          <ListItem
            key={option.minutes}
            icon={option.minutes === 0 ? 'clock' : 'calendar'}
            title={option.label}
            subtitle={option.hint ?? `Retirada às ${formatTime(addMinutes(now, option.minutes))}`}
            last={i === OPTIONS.length - 1}
            trailing={<span className={`radio ${selected === option.minutes ? 'radio--on' : ''}`} role="radio" aria-checked={selected === option.minutes} />}
            onClick={() => setSelected(option.minutes)}
          />
        ))}
      </div>
    </ActionSheet>
  );
}
