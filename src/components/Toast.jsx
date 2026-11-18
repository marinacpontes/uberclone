import { useEffect, useState } from 'react';
import Icon from './Icon';
import './Toast.css';

export default function Toast({ toast }) {
  const [visible, setVisible] = useState(Boolean(toast));

  useEffect(() => {
    if (!toast) return undefined;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  if (!toast || !visible) return null;
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <Icon name="check" size={18} />
      <span>{toast.message}</span>
    </div>
  );
}
