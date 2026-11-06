export const CATEGORIES = [
  {
    id: 'Food',
    name: 'Food',
    type: 'expense',
    color: '#F59E0B', // Amber
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: 'Utensils',
    description: 'Groceries, restaurants, food deliveries & dining out'
  },
  {
    id: 'Shopping',
    name: 'Shopping',
    type: 'expense',
    color: '#EC4899', // Pink
    bgColor: 'rgba(236, 72, 153, 0.15)',
    icon: 'ShoppingBag',
    description: 'Clothing, gadgets, accessories & retail'
  },
  {
    id: 'Transportation',
    name: 'Transportation',
    type: 'expense',
    color: '#3B82F6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: 'Car',
    description: 'Fuel, cab rides, public transit & vehicle maintenance'
  },
  {
    id: 'Education',
    name: 'Education',
    type: 'expense',
    color: '#8B5CF6', // Violet
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: 'GraduationCap',
    description: 'Books, online courses, college fees & certifications'
  },
  {
    id: 'Entertainment',
    name: 'Entertainment',
    type: 'expense',
    color: '#A855F7', // Purple
    bgColor: 'rgba(168, 85, 247, 0.15)',
    icon: 'Film',
    description: 'Movies, streaming services, concerts & gaming'
  },
  {
    id: 'Healthcare',
    name: 'Healthcare',
    type: 'expense',
    color: '#EF4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: 'HeartPulse',
    description: 'Medicines, doctor visits, health insurance & gym'
  },
  {
    id: 'Bills',
    name: 'Bills',
    type: 'expense',
    color: '#F97316', // Orange
    bgColor: 'rgba(249, 115, 22, 0.15)',
    icon: 'Receipt',
    description: 'Electricity, water, broadband, mobile recharge & rent'
  },
  {
    id: 'Salary',
    name: 'Salary',
    type: 'income',
    color: '#10B981', // Emerald
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: 'Briefcase',
    description: 'Full-time monthly paycheck & corporate bonuses'
  },
  {
    id: 'Freelancing',
    name: 'Freelancing',
    type: 'income',
    color: '#06B6D4', // Cyan
    bgColor: 'rgba(6, 182, 212, 0.15)',
    icon: 'Laptop',
    description: 'Client projects, consulting gigs & contracts'
  },
  {
    id: 'Investment',
    name: 'Investment',
    type: 'both',
    color: '#14B8A6', // Teal
    bgColor: 'rgba(20, 184, 166, 0.15)',
    icon: 'TrendingUp',
    description: 'Mutual fund SIPs, stocks, dividends & returns'
  },
  {
    id: 'Other',
    name: 'Other',
    type: 'both',
    color: '#64748B', // Slate
    bgColor: 'rgba(100, 116, 139, 0.15)',
    icon: 'MoreHorizontal',
    description: 'Miscellaneous expenses or uncategorized transactions'
  }
];

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Bank Transfer'
];

export const getCategoryMeta = (categoryId) => {
  return CATEGORIES.find(c => c.id === categoryId) || {
    id: categoryId || 'Other',
    name: categoryId || 'Other',
    type: 'expense',
    color: '#64748B',
    bgColor: 'rgba(100, 116, 139, 0.15)',
    icon: 'MoreHorizontal'
  };
};

