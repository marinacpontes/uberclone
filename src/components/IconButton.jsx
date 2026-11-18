import Icon from './Icon';
import './controls.css';

export default function IconButton({ icon, label, variant = 'float', size = 44, iconSize = 22, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-btn icon-btn--${variant} ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
