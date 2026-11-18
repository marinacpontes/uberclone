import { useLayoutEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppProvider';
import './BottomSheet.css';

const TOP_GAP = 72;

/**
 * Painel inferior sobre o mapa. Informa ao mapa quanto da tela ocupa
 * (para enquadrar trajetos na área visível) e, se `expandable`, pode ser
 * arrastado ou tocado na alça para alternar entre recolhido e expandido.
 */
export default function BottomSheet({
  children,
  footer,
  floating,
  expandable = false,
  peek = 0.5,
  className = '',
  style,
  label,
}) {
  const { setMapInset } = useApp();
  const ref = useRef(null);
  const probeRef = useRef(null);
  const drag = useRef(null);
  const [metrics, setMetrics] = useState({ parent: 0, bottom: 0, safeTop: 0 });
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el.parentElement;
    // Usa offsets de layout (ignoram a animação de entrada com transform).
    const report = () => {
      const parentH = parent.clientHeight;
      setMapInset(Math.max(0, Math.round(parentH - el.offsetTop)));
      setMetrics((m) => {
        const next = {
          parent: parentH,
          bottom: Math.round(parentH - el.offsetTop - el.offsetHeight),
          safeTop: probeRef.current?.offsetHeight ?? 0,
        };
        return m.parent === next.parent && m.bottom === next.bottom && m.safeTop === next.safeTop ? m : next;
      });
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [setMapInset]);

  const available = Math.max(0, metrics.parent - metrics.bottom - metrics.safeTop - TOP_GAP);
  const peekPx = Math.min(available, peek <= 1 ? metrics.parent * peek : peek);
  const height = expandable && metrics.parent ? (dragHeight ?? (expanded ? available : peekPx)) : undefined;

  const onPointerDown = (e) => {
    if (!expandable) return;
    drag.current = { y: e.clientY, start: height ?? peekPx, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    if (drag.current.moved) setDragHeight(Math.min(available, Math.max(peekPx * 0.85, drag.current.start - dy)));
  };
  const onPointerUp = (e) => {
    if (!drag.current) return;
    const { moved, start, y } = drag.current;
    drag.current = null;
    setDragHeight(null);
    if (!moved) {
      setExpanded((x) => !x);
      return;
    }
    const finalH = start - (e.clientY - y);
    setExpanded(finalH > (peekPx + available) / 2);
  };

  return (
    <section
      ref={ref}
      aria-label={label}
      className={`sheet ${expandable ? 'sheet--expandable' : ''} ${dragHeight != null ? 'sheet--dragging' : ''} ${className}`}
      style={{ ...style, height }}
    >
      <span ref={probeRef} className="sheet__probe" aria-hidden="true" />
      {floating && (
        <div className={`sheet__floating ${height != null && height > peekPx + 24 ? 'sheet__floating--hidden' : ''}`}>{floating}</div>
      )}
      <div
        className="sheet__handle-area"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-label={expandable ? (expanded ? 'Recolher painel' : 'Expandir painel') : undefined}
        aria-expanded={expandable ? expanded : undefined}
        onKeyDown={(e) => {
          if (expandable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setExpanded((x) => !x);
          }
        }}
      >
        <span className="sheet__handle" />
      </div>
      <div className="sheet__content scroll">{children}</div>
      {footer && <div className="sheet__footer">{footer}</div>}
    </section>
  );
}
