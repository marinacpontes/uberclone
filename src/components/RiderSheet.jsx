import ActionSheet from './ActionSheet';
import ListItem from './ListItem';

export default function RiderSheet({ open, onClose, value, onChange }) {
  const choose = (id) => {
    onChange(id);
    onClose();
  };
  return (
    <ActionSheet open={open} onClose={onClose} title="Quem vai viajar?" subtitle="Vamos avisar o motorista sobre quem ele vai buscar.">
      <ListItem
        icon="person"
        title="Para mim"
        trailing={<span className={`radio ${value === 'me' ? 'radio--on' : ''}`} />}
        onClick={() => choose('me')}
      />
      <ListItem
        icon="users"
        title="Para outra pessoa"
        subtitle="Ela receberá os detalhes da viagem por SMS"
        last
        trailing={<span className={`radio ${value === 'other' ? 'radio--on' : ''}`} />}
        onClick={() => choose('other')}
      />
    </ActionSheet>
  );
}
