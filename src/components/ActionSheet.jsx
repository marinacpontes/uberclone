import { useEffect } from 'react';
import './ActionSheet.css';

/** Folha modal que sobe da base, com fundo escurecido. */
export default function ActionSheet({ open, onClose, title, subtitle, children, footer, label }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        className="action-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={label ?? title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="action-sheet__handle" aria-hidden="true" />
        {title && (
          <header className="action-sheet__header">
            <h2 className="t-h2">{title}</h2>
            {subtitle && <p className="t-body t-secondary">{subtitle}</p>}
          </header>
        )}
        <div className="action-sheet__body scroll">{children}</div>
        {footer && <div className="action-sheet__footer">{footer}</div>}
      </div>
    </div>
  );
}
