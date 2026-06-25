export default function Alert({ type = 'error', children, onClose }) {
  const icons = {
    error:   <AlertCircleIcon />,
    success: <CheckCircleIcon />,
    info:    <InfoIcon />,
    warning: <WarningIcon />,
  };
  return (
    <div className={`alert alert-${type}`} role="alert" aria-live="assertive">
      {icons[type]}
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', padding:0, lineHeight:0, marginLeft:4 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" style={{stroke:'currentColor',fill:'none',strokeWidth:2,strokeLinecap:'round'}}>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);
const WarningIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
