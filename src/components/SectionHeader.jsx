import './controls.css';

export default function SectionHeader({ title, action, onAction, as: Tag = 'h2' }) {
  return (
    <div className="section-header">
      <Tag className="t-h3">{title}</Tag>
      {action && (
        <button type="button" className="section-header__action" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
