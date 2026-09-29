export function EmptyTabState({
  label,
  sub,
  onAdd,
  btnLabel,
}: {
  label: string;
  sub: string;
  onAdd: () => void;
  btnLabel: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '60px 40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: '#EBF9FD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6BA3E3',
          marginBottom: '6px',
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
      <p
        style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#1e1b2e',
          margin: '0',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '13.5px',
          color: '#7c6fa0',
          margin: '0',
          maxWidth: '280px',
          lineHeight: '1.6',
        }}
      >
        {sub}
      </p>
      <button
        onClick={onAdd}
        style={{
          marginTop: '6px',
          background: '#3783D1',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '10px 22px',
          fontSize: '13.5px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {btnLabel}
      </button>
    </div>
  );
}
