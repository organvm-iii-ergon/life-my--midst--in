'use client';

interface EntityListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onDelete: (id: string) => void;
  title: string;
  onCreate: () => void;
}

export function EntityList<T extends { id: string }>({
  items,
  renderItem,
  onDelete,
  title,
  onCreate,
}: EntityListProps<T>) {
  return (
    <div className="section">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button className="button" onClick={onCreate}>
          Add New
        </button>
      </div>
      {items.length === 0 ? (
        <div className="stat-card">No {title.toLowerCase()} found.</div>
      ) : (
        <div className="stack">
          {items.map((item) => (
            <div
              key={item.id}
              className="stack-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ flex: 1 }}>{renderItem(item)}</div>
              <button
                className="button ghost"
                onClick={() => onDelete(item.id)}
                style={{
                  marginLeft: '1rem',
                  color: 'var(--accent-strong)',
                  borderColor: 'var(--accent-strong)',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
