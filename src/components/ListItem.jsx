import Icon from './Icon';
import './controls.css';

/**
 * Linha de lista padrão: ícone em círculo cinza, título, subtítulo e
 * conteúdo opcional à direita. Vira <button> quando recebe onClick.
 */
export default function ListItem({
  icon,
  iconShape = 'circle',
  leading,
  meta,
  title,
  subtitle,
  trailing,
  chevron = false,
  onClick,
  last = false,
  divider = true,
  className = '',
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`list-item ${last ? 'list-item--last' : ''} ${divider ? '' : 'list-item--no-divider'} ${className}`}
      onClick={onClick}
    >
      {(leading || icon) && (
        <span className="list-item__leading">
          {leading ?? (
            <span className={`list-item__icon list-item__icon--${iconShape}`}>
              <Icon name={icon} size={20} />
            </span>
          )}
          {meta && <span className="list-item__meta">{meta}</span>}
        </span>
      )}
      <span className="list-item__body">
        <span className="list-item__text">
          <span className="list-item__title">{title}</span>
          {subtitle && <span className="list-item__subtitle">{subtitle}</span>}
        </span>
        {(trailing || chevron) && (
          <span className="list-item__trailing">
            {trailing}
            {chevron && <Icon name="chevronRight" size={18} />}
          </span>
        )}
      </span>
    </Tag>
  );
}
