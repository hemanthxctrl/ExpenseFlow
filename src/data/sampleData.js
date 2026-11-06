// Helper to get formatted YYYY-MM-DD for current month or N months ago
// Perfectly handles month transitions, leap years, and cross-year dates.
export const getMonthDate = (monthsAgo, dayOfMonth) => {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, dayOfMonth);
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const INITIAL_TRANSACTIONS = [
  // --- CURRENT MONTH TRANSACTIONS (monthsAgo = 0: 14 transactions) ---
  {
    id: 'tx-1',
    title: 'Infosys Monthly Tech Salary',
    amount: 85000,
    type: 'income',
    category: 'Salary',
    date: getMonthDate(0, 1),
    paymentMethod: 'Bank Transfer',
    description: 'Credited directly from Infosys payroll for software engineering role.'
  },
  {
    id: 'tx-2',
    title: 'Upwork UI/UX Design Contract',
    amount: 28500,
    type: 'income',
    category: 'Freelancing',
    date: getMonthDate(0, 4),
    paymentMethod: 'Bank Transfer',
    description: 'Milestone 2 payout for SaaS dashboard design client in London.'
  },
  {
    id: 'tx-3',
    title: 'Cult.fit Elite Annual Membership',
    amount: 14500,
    type: 'expense',
    category: 'Healthcare',
    date: getMonthDate(0, 2),
    paymentMethod: 'Credit Card',
    description: 'Annual Cult.fit access for gym workouts & boxing sessions.'
  },
  {
    id: 'tx-4',
    title: 'Amazon Electronics - Ergonomic Mouse',
    amount: 4350,
    type: 'expense',
    category: 'Shopping',
    date: getMonthDate(0, 3),
    paymentMethod: 'Credit Card',
    description: 'Logitech wireless ergonomic vertical mouse with wrist rest.'
  },
  {
    id: 'tx-5',
    title: 'Myntra Wardrobe Essentials Sale',
    amount: 3100,
    type: 'expense',
    category: 'Shopping',
    date: getMonthDate(0, 4),
    paymentMethod: 'UPI',
    description: 'Cotton shirts and casual trousers during End of Reason Sale.'
  },
  {
    id: 'tx-6',
    title: 'Zara Casual Denim & Sneakers',
    amount: 1200,
    type: 'expense',
    category: 'Shopping',
    date: getMonthDate(0, 5),
    paymentMethod: 'UPI',
    description: 'White sneakers and tailored denim from Zara Koramangala.'
  },
  {
    id: 'tx-7',
    title: 'Swiggy Gourmet Family Dinner',
    amount: 1450,
    type: 'expense',
    category: 'Food',
    date: getMonthDate(0, 2),
    paymentMethod: 'UPI',
    description: 'Truffles burger combos & dessert platter ordered via Swiggy.'
  },
  {
    id: 'tx-8',
    title: 'Zomato Biryani Lunch with Team',
    amount: 890,
    type: 'expense',
    category: 'Food',
    date: getMonthDate(0, 3),
    paymentMethod: 'UPI',
    description: 'Meghana Foods special chicken biryani order.'
  },
  {
    id: 'tx-9',
    title: 'Nature Basket Organic Groceries',
    amount: 3800,
    type: 'expense',
    category: 'Food',
    date: getMonthDate(0, 5),
    paymentMethod: 'Cash',
    description: 'Fresh fruits, vegetables, artisan sourdough and dairy.'
  },
  {
    id: 'tx-10',
    title: 'Uber Premier - Airport Ride',
    amount: 840,
    type: 'expense',
    category: 'Transportation',
    date: getMonthDate(0, 2),
    paymentMethod: 'UPI',
    description: 'Cab ride from Bangalore International Airport to Koramangala.'
  },
  {
    id: 'tx-11',
    title: 'Shell Petrol Pump Fuel Refill',
    amount: 2200,
    type: 'expense',
    category: 'Transportation',
    date: getMonthDate(0, 4),
    paymentMethod: 'Debit Card',
    description: 'Full tank unleaded petrol for commute.'
  },
  {
    id: 'tx-12',
    title: 'BESCOM Electricity Bill',
    amount: 2450,
    type: 'expense',
    category: 'Bills',
    date: getMonthDate(0, 3),
    paymentMethod: 'UPI',
    description: 'Monthly utility power consumption bill payment.'
  },
  {
    id: 'tx-13',
    title: 'Airtel Xstream Fiber Broadband',
    amount: 1180,
    type: 'expense',
    category: 'Bills',
    date: getMonthDate(0, 4),
    paymentMethod: 'UPI',
    description: '200 Mbps fiber optic home internet monthly billing.'
  },
  {
    id: 'tx-14',
    title: 'Netflix 4K UHD Premium Plan',
    amount: 649,
    type: 'expense',
    category: 'Entertainment',
    date: getMonthDate(0, 1),
    paymentMethod: 'Credit Card',
    description: 'Monthly auto-debit for 4 screens 4K family streaming.'
  },

  // --- PRIOR MONTH TRANSACTIONS (monthsAgo = 1: 4 transactions) ---
  {
    id: 'tx-15',
    title: 'Infosys Tech Salary (Prior Month)',
    amount: 85000,
    type: 'income',
    category: 'Salary',
    date: getMonthDate(1, 1),
    paymentMethod: 'Bank Transfer',
    description: 'Previous month software engineering salary.'
  },
  {
    id: 'tx-16',
    title: 'NextJS Consultancy Workshop',
    amount: 25000,
    type: 'income',
    category: 'Freelancing',
    date: getMonthDate(1, 14),
    paymentMethod: 'Bank Transfer',
    description: '3-hour technical advisory session on enterprise Next.js optimization.'
  },
  {
    id: 'tx-17',
    title: 'Apartment Rent & Maintenance',
    amount: 45000,
    type: 'expense',
    category: 'Bills',
    date: getMonthDate(1, 5),
    paymentMethod: 'Net Banking',
    description: 'Monthly residential flat rental and society maintenance dues.'
  },
  {
    id: 'tx-18',
    title: 'BigBasket Monthly Grocery Pantry',
    amount: 7500,
    type: 'expense',
    category: 'Food',
    date: getMonthDate(1, 8),
    paymentMethod: 'UPI',
    description: 'Bulk household pantry staples, cooking oil, rice and spices.'
  },

  // --- HISTORICAL TRANSACTIONS (monthsAgo = 2: 2 transactions) ---
  {
    id: 'tx-19',
    title: 'Nifty 50 Dividend Payout',
    amount: 3200,
    type: 'income',
    category: 'Investment',
    date: getMonthDate(2, 10),
    paymentMethod: 'Direct Deposit',
    description: 'Quarterly dividend credited to demat linked bank account.'
  },
  {
    id: 'tx-20',
    title: 'Udemy Fullstack React Architecture Course',
    amount: 799,
    type: 'expense',
    category: 'Education',
    date: getMonthDate(2, 18),
    paymentMethod: 'UPI',
    description: 'Lifetime access to Advanced Frontend Engineering Masterclass.'
  }
];

export const INITIAL_BUDGETS = [
  { category: 'Food', limit: 12000 },
  { category: 'Shopping', limit: 10000 },       // Spent ₹8,650 -> 86.5% WARNING!
  { category: 'Transportation', limit: 6000 },  // Spent ₹3,040 -> 50.7% Healthy
  { category: 'Bills', limit: 5000 },           // Spent ₹3,630 -> 72.6% Healthy
  { category: 'Entertainment', limit: 4000 },   // Spent ₹649 -> 16.2% Healthy
  { category: 'Healthcare', limit: 12000 },     // Spent ₹14,500 -> 120.8% EXCEEDED!
  { category: 'Education', limit: 3000 },
  { category: 'Investment', limit: 15000 }
];

export const INITIAL_PROFILE = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@example.com',
  occupation: 'Lead Frontend Engineer',
  avatarUrl: '',
  memberSince: '2024-01-15'
};
