import TopNav from '../components/TopNav';
import AccountCard from '../components/AccountCard';
import TransactionHistory from '../components/TransactionHistory';
import QuickActions from '../components/QuickActions';
import { useAuth } from '../context/AuthContext';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, ACCOUNT_STATS } from '../data/mockBankingData';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page page-enter">
      <TopNav />

      <div className="dashboard-body">
        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <h1>Welcome back, {user?.firstName}! 👋</h1>
          <p>Manage your accounts, check transactions, and handle all your banking needs in one place.</p>
        </div>

        {/* Account Summary Stats */}
        <div className="dashboard-summary">
          <div className="summary-item">
            <div className="summary-item-label">Total Balance</div>
            <div className="summary-item-value">{ACCOUNT_STATS.totalBalance}</div>
            <div className="summary-item-sub">Across all accounts</div>
          </div>
          <div className="summary-item">
            <div className="summary-item-label">Monthly Spending</div>
            <div className="summary-item-value">{ACCOUNT_STATS.monthlySpending}</div>
            <div className="summary-item-sub">This month to date</div>
          </div>
          <div className="summary-item">
            <div className="summary-item-label">Savings Goal</div>
            <div className="summary-item-value">{ACCOUNT_STATS.savingsProgress}%</div>
            <div className="summary-item-sub">Progress: {ACCOUNT_STATS.savingsGoal}</div>
          </div>
        </div>

        {/* Account Cards */}
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>My Accounts</h2>
          {MOCK_ACCOUNTS.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Transaction History */}
        <TransactionHistory transactions={MOCK_TRANSACTIONS} />

        {/* Account Info Footer */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5) var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-6)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {[
            { label: 'Account Holder', value: `${user?.firstName} ${user?.lastName}` },
            { label: 'Email', value: user?.email },
            { label: 'Phone', value: user?.phoneMasked || '••• ••• ••••' },
            { label: 'Member Since', value: 'Jan 2023' },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-500)', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
