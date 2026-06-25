export default function AccountCard({ account }) {
  return (
    <div className="account-card">
      <div className="account-card-header">
        <h3>{account.name}</h3>
        <span className="account-type">{account.type}</span>
      </div>
      
      <div className="account-balance">
        <p className="balance-label">Available Balance</p>
        <p className="balance-amount">{account.balance}</p>
      </div>

      <div className="account-details">
        <div className="detail-item">
          <span className="detail-label">Account Number</span>
          <span className="detail-value">{account.accountNumber}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Routing Number</span>
          <span className="detail-value">{account.routingNumber}</span>
        </div>
      </div>

      <div className="account-actions">
        <button className="account-action-btn">View Details</button>
        <button className="account-action-btn outline">Transfer</button>
      </div>
    </div>
  );
}
