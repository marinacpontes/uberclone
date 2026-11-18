import Icon from './Icon';
import './controls.css';

export default function Button({ variant = 'primary', size = 'lg', block = true, icon, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${size} ${block ? 'btn--block' : ''} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} />}
      {children}
    </button>
  );
}
