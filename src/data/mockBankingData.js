export const MOCK_ACCOUNTS = [
  {
    id: 1,
    name: 'Checking Account',
    type: 'PRIMARY',
    balance: '$12,456.78',
    accountNumber: '****4829',
    routingNumber: '021000021',
    lastUpdated: 'Today at 2:34 PM',
  },
  {
    id: 2,
    name: 'Savings Account',
    type: 'SAVINGS',
    balance: '$45,230.00',
    accountNumber: '****5847',
    routingNumber: '021000021',
    lastUpdated: 'Today at 2:34 PM',
  },
  {
    id: 3,
    name: 'Money Market',
    type: 'INVESTMENT',
    balance: '$78,945.32',
    accountNumber: '****6234',
    routingNumber: '021000021',
    lastUpdated: 'Today at 2:34 PM',
  },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 1,
    description: 'Starbucks Coffee',
    amount: '-$5.62',
    date: 'Today',
    icon: '☕',
    merchant: 'Starbucks',
    type: 'debit',
  },
  {
    id: 2,
    description: 'Amazon Purchase',
    amount: '-$49.99',
    date: 'Yesterday',
    icon: '📦',
    merchant: 'Amazon.com',
    type: 'debit',
  },
  {
    id: 3,
    description: 'Salary Deposit',
    amount: '+$2,500.00',
    date: '2 days ago',
    icon: '💰',
    merchant: 'Direct Deposit',
    type: 'credit',
  },
  {
    id: 4,
    description: 'Electric Bill Payment',
    amount: '-$125.43',
    date: '3 days ago',
    icon: '⚡',
    merchant: 'City Electric',
    type: 'debit',
  },
  {
    id: 5,
    description: 'Restaurant',
    amount: '-$45.67',
    date: '5 days ago',
    icon: '🍽️',
    merchant: 'The Olive Garden',
    type: 'debit',
  },
];

export const ACCOUNT_STATS = {
  totalBalance: '$136,632.10',
  monthlySpending: '$1,234.56',
  savingsGoal: '$50,000',
  savingsProgress: 90.5,
};
