// ─── Mock Users ─────────────────────────────────────────────
// NOTE: For production, connect to a real authentication backend
// This is a placeholder structure for user data
export const MOCK_USERS = [
  {
    id: '1',
    username: 'john.doe',
    email: 'john.doe@example.com',
    password: 'Password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '(212) 555-1234',
    phoneMasked: '(212) ••• ••••',
    accountNumber: '1234567890',
    billingDate: 'June 15, 2026',
    supportStatus: 'Good',
    plan: 'Premium',
    billAmount: '$99.99',
    dataUsed: '67 GB',
    dataTotal: '100 GB',
    dataPercent: 67,
  },
];

// ─── Mock OTP ────────────────────────────────────────────────
// NOTE: For production, OTP should be generated and sent via email/SMS
// This is a placeholder for OTP verification logic
export const MOCK_OTP = null;

// ─── Activity Feed ───────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { id: 1, desc: 'Payment of $89.99 processed', date: 'Jun 1, 2026', badge: 'Paid', badgeType: 'green', dot: 'green' },
  { id: 2, desc: 'Data usage alert — 80% reached', date: 'May 28, 2026', badge: 'Alert', badgeType: 'amber', dot: 'amber' },
  { id: 3, desc: 'Plan upgraded to Pro Unlimited', date: 'May 15, 2026', badge: 'Updated', badgeType: 'blue', dot: 'blue' },
  { id: 4, desc: 'Account login from new device', date: 'May 10, 2026', badge: 'Login', badgeType: 'gray', dot: 'gray' },
  { id: 5, desc: 'Monthly invoice generated', date: 'May 1, 2026', badge: 'Invoice', badgeType: 'gray', dot: 'gray' },
];

// ─── FAQs ────────────────────────────────────────────────────
export const MOCK_FAQS = [
  {
    id: 'f1',
    q: 'How do I pay my bill online?',
    a: 'Sign in to your Spectrum account and navigate to the "Billing" section in your dashboard. You can pay using a debit/credit card or set up autopay. Payments are typically processed within 24 hours.',
  },
  {
    id: 'f2',
    q: 'How do I reset my password?',
    a: 'On the Sign In page, click "Forgot Username or Password?" and follow the prompts. You\'ll receive a 6-digit verification code via email or text. Enter the code and you\'ll be able to set a new password.',
  },
  {
    id: 'f3',
    q: 'What is my data limit and how do I check usage?',
    a: 'Your data limit depends on your plan. After signing in, your dashboard shows current usage and the remaining data in real time. If you exceed your plan limit, standard overage rates apply unless you have Unlimited.',
  },
  {
    id: 'f4',
    q: 'How do I upgrade or change my plan?',
    a: 'Log in to your account, go to "My Plan" from the dashboard, and select "Change Plan." Changes take effect at the start of your next billing cycle. Contact support if you need an immediate change.',
  },
  {
    id: 'f5',
    q: 'Can I transfer my account to another person?',
    a: 'Yes. Account transfers are possible with a valid government-issued ID and written authorization. Please contact our customer support team directly to initiate the transfer process.',
  },
  {
    id: 'f6',
    q: 'Why is my internet speed slow?',
    a: 'Speed issues can be caused by network congestion, router placement, or device configuration. Try restarting your router first. If the issue persists, run a speed test and contact support with the results.',
  },
];
