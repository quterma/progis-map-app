type Item = { id: string; title: string; visible: boolean };
type Props = {
  items: Item[];
  onToggle: (id: string, v: boolean) => void;
  disabled?: boolean;
};

export default function LayersPanel({ items, onToggle, disabled }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 1000,
        background: '#fff',
        padding: 8,
        border: '1px solid #ddd',
        borderRadius: 6,
        minWidth: 140,
      }}
    >
      {items.map((it) => (
        <label
          key={it.id}
          style={{
            display: 'block',
            margin: '4px 0',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <input
            type="checkbox"
            checked={it.visible}
            disabled={disabled}
            onChange={(e) => onToggle(it.id, e.target.checked)}
          />
          <span style={{ marginLeft: 6 }}>{it.title}</span>
        </label>
      ))}
    </div>
  );
}
