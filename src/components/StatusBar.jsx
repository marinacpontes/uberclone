import { useNow } from '../hooks/useNow';
import { formatTime } from '../lib/format';

/** Barra de status do iOS — exibida apenas na moldura de aparelho (telas grandes). */
export default function StatusBar({ tone = 'dark' }) {
  const now = useNow(10000);
  return (
    <div className={`statusbar statusbar--${tone}`} aria-hidden="true">
      <span className="statusbar__time">{formatTime(now)}</span>
      <span className="statusbar__icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.3c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .5C5.2.5 2.7 1.6.8 3.4L2 4.7a8.6 8.6 0 0 1 6-2.4Z" />
          <path d="M8 5.6c1.4 0 2.6.5 3.6 1.4l1.2-1.3A7 7 0 0 0 8 3.8a7 7 0 0 0-4.8 1.9L4.4 7c1-.9 2.2-1.4 3.6-1.4Z" />
          <path d="M8 8.9c.6 0 1.1.2 1.5.6L8 11.5 6.5 9.5c.4-.4.9-.6 1.5-.6Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  );
}
