export default function TransactionHistory({ transactions = [] }) {
  const defaultTransactions = [
    { id: 1, description: 'Starbucks Coffee', amount: '-$5.62', date: 'Today', icon: '☕' },
    { id: 2, description: 'Amazon Purchase', amount: '-$49.99', date: 'Yesterday', icon: '📦' },
    { id: 3, description: 'Salary Deposit', amount: '+$2,500.00', date: '2 days ago', icon: '💰' },
    { id: 4, description: 'Electric Bill Payment', amount: '-$125.43', date: '3 days ago', icon: '⚡' },
    { id: 5, description: 'Restaurant', amount: '-$45.67', date: '5 days ago', icon: '🍽️' },
  ];

  const items = transactions.length > 0 ? transactions : defaultTransactions;

  return (
    <div className="transaction-history">
      <div className="transaction-header">
        <h3>Recent Transactions</h3>
        <a href="#" className="view-all-link">View All</a>
      </div>

      <div className="transaction-list">
        {items.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-icon">{transaction.icon}</div>
            <div className="transaction-details">
              <p className="transaction-desc">{transaction.description}</p>
              <p className="transaction-date">{transaction.date}</p>
            </div>
            <div className={`transaction-amount ${transaction.amount.startsWith('+') ? 'positive' : 'negative'}`}>
              {transaction.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
