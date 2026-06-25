export default function QuickActions() {
  const actions = [
    {
      id: 1,
      label: 'Send Money',
      icon: '💸',
      color: '#004899',
    },
    {
      id: 2,
      label: 'Pay Bills',
      icon: '📄',
      color: '#004899',
    },
    {
      id: 3,
      label: 'Transfer Funds',
      icon: '🔄',
      color: '#004899',
    },
    {
      id: 4,
      label: 'Mobile Check',
      icon: '📱',
      color: '#004899',
    },
    {
      id: 5,
      label: 'ATM Locator',
      icon: '📍',
      color: '#004899',
    },
    {
      id: 6,
      label: 'More Services',
      icon: '⋯',
      color: '#004899',
    },
  ];

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className="action-card"
            onClick={() => alert(`${action.label} feature coming soon!`)}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
