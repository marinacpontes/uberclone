import './controls.css';

/** Origem e destino ligados pela linha vertical (círculo → quadrado). */
export default function RouteStops({ origin, destination, showSubtitles = true }) {
  return (
    <div className="route-stops">
      <div className="route-stops__rail" aria-hidden="true">
        <span className="route-stops__dot" />
        <span className="route-stops__line" />
        <span className="route-stops__square" />
      </div>
      <div className="route-stops__stop">
        <div className="route-stops__title">{origin.title}</div>
        {showSubtitles && <div className="route-stops__subtitle">{origin.subtitle}</div>}
      </div>
      <div className="route-stops__stop">
        <div className="route-stops__title">{destination.title}</div>
        {showSubtitles && <div className="route-stops__subtitle">{destination.subtitle}</div>}
      </div>
    </div>
  );
}
