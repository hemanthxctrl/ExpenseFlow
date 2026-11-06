# 💎 ExpenseFlow – Personal Finance Manager

> A modern, responsive, frontend-only personal finance dashboard built with **React 18**, **Vite**, **Tailwind CSS**, **Recharts**, and **localStorage** persistence. 
> Designed as an individual college project adhering to zero-backend constraints while delivering enterprise SaaS UI/UX quality.

---

## 📸 Visual Showcase & Screenshots

| Desktop Dashboard (Deep Navy Dark SaaS) | Transactions Ledger & Instant Filters |
|:---:|:---:|
| Total balance, 6M cashflow area chart, category donut, budget health | Multi-criteria filters, search, sorting, pagination, CSV export |

| Monthly Category Budgets & Warnings | Analytics & Performance Reports |
|:---:|:---:|
| 80% cautionary warnings, exceeded badges, progress meters | Side-by-side bar comparisons, category share, payment channels |

*Detailed screenshot walkthroughs and asset specifications are documented in the [`screenshots/`](./screenshots/README.md) directory.*

---

## 🎯 Project Objective & Requirements

- **Client-Side Only**: 100% frontend implementation. No backend, APIs, MongoDB, Firebase, or Express required.
- **Persistent Data**: All transactions, budgets, settings, and profile data automatically persist in browser `localStorage`.
- **Realistic Sample Data**: Pre-seeded with 20 realistic Indian transactions (Swiggy, Infosys salary, Amazon, Cult.fit, Zerodha SIP, BESCOM electricity, etc.) seeded **only when no data exists** without ever overwriting user modifications.
- **Cross-Platform Compatibility**: Single unified codebase automatically adapting to Desktop, Tablet, and Mobile devices (Android/iOS) with desktop sidebar, mobile header, thumb-friendly bottom navigation bar, touch-friendly tap targets, and no horizontal scroll.
- **Fully Interactive**: Every button, modal, filter, calculation, and chart responds live without static mockups.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Core Framework** | React 18.3.1 | Functional components, custom hooks, and React Context architecture |
| **Bundler & Tooling** | Vite 5.4.6 | Lightning-fast HMR and optimized production Rollup chunks |
| **Styling & Design** | Tailwind CSS 3.4.11 | Deep navy theme (`#0B0F19`), violet accents, custom glow shadows |
| **Routing** | React Router DOM 6.26.2 | Single-page client-side routing (`/`, `/transactions`, `/budgets`, etc.) |
| **Data Visualization** | Recharts 2.12.7 | Interactive Area charts, side-by-side Bar charts, and Donut charts |
| **Iconography** | Lucide React | Semantic, consistent icons for categories, actions, and states |
| **Data Persistence** | HTML5 `localStorage` | Client-side persistent ledger with JSON import/export capabilities |

---

## ✨ Features by Page

### 1. 📊 Dashboard (`/`)
- **Key Financial Metrics**: Live cards for **Total Balance**, **Monthly Income**, **Monthly Expenses**, and **Monthly Savings** (with savings rate % and month-over-month growth indicators).
- **Interactive Cashflow Trend**: 6-month Area chart comparing income vs expenses with custom dark tooltips and metric toggles.
- **Top Spending Donut Chart**: Visual distribution of current month's expenses across categories with interactive color legends.
- **Budget Health Glance**: Instant progress bar indicator alerting if any category has exceeded or is nearing its spending threshold.
- **Recent Transactions Ledger**: 5 most recent transactions with quick-action links.
- **Quick Action Triggers**: "+ New Transaction" and "Export CSV" buttons.

### 2. 📝 Transactions (`/transactions`)
- **Full CRUD Support**: Add new transactions, edit existing entries, and delete with safety confirmation dialogs.
- **Form Validation**: Strict validation preventing negative amounts, empty titles, or invalid dates.
- **Comprehensive Fields**: Title, Amount, Type (Income vs Expense), Category, Date, Payment Method (UPI, Credit Card, Debit Card, Net Banking, Cash, Bank Transfer), and optional Notes.
- **Instant Search**: Live search across title, notes, vendor, or category name.
- **Multi-Faceted Filtering**: Filter by Type (All / Income / Expense), Category, Payment Method, and Timeframe (This Month, Last Month, Last 3M, Last 6M, This Year, All Time).
- **Sort Controls**: Newest first, Oldest first, Highest amount, Lowest amount, Title (A-Z).
- **Pagination & Summary Bar**: Smooth 10-per-page pagination and filtered summary pill showing Total In, Total Out, and Net Balance for the current filter set.
- **Transaction Receipt Modal**: View comprehensive details of any transaction in an elegant modal card.

### 3. 🎯 Budgets (`/budgets`)
- **Monthly Category Spending Caps**: Set limits for Food, Shopping, Transportation, Healthcare, Bills, Entertainment, etc.
- **Utilization Progress Bars**: Visual progress indicators styled dynamically based on consumption:
  - `< 80%`: Healthy (Violet/Emerald progress bar)
  - `80% – 99%`: **Warning state** with cautionary badge and amber indicator
  - `≥ 100%`: **Exceeded state** with alert badge and red glow
- **Safe-to-Spend Metric**: Displays remaining balance available across all budgeted categories.
- **Budget Management**: Add new category budgets, adjust existing limits, and remove budgets.

### 4. 📈 Analytics (`/analytics`)
- **Timeframe Selector**: Dynamically filter analytics between This Month, Last 3 Months, Last 6 Months, This Year, and All Time.
- **Monthly Income vs Expense Bar Chart**: Side-by-side comparison illustrating financial trends over the past 6 months.
- **Category Donut Chart**: Proportional breakdown of expenses with exact percentage share.
- **Cashflow Trajectory Area Chart**: Inflow and outflow trends over time.
- **Payment Method Distribution**: Visual distribution of spending across UPI, Credit Card, Net Banking, and Cash.
- **Category Summary Table**: Tabular breakdown featuring category icon, transaction count, total spent, and graphical percentage share bar.

### 5. ⚙️ Settings & Data Management (`/settings`)
- **User Profile**: Customize display name, email, and occupation with automatic avatar generation saved to local storage.
- **Base Currency Selector**: Default **INR (₹)** with support for USD ($), EUR (€), GBP (£), CAD (CA$), AUD (AU$), JPY (¥), and AED.
- **Theme Toggle**: One-click switch between **Deep Navy Dark SaaS** (default) and **Clean Light** themes with immediate DOM sync.
- **Export to CSV**: Download full transaction history as a clean CSV spreadsheet with sanitized columns.
- **Offline Backup & Restore**: Download complete data state as `.json` and restore backups seamlessly via file picker.
- **Reset Sample Data**: Re-seeds the 20 realistic Indian transactions and default budgets (with confirmation dialog).
- **Wipe Local Database**: Two-step danger confirmation to completely purge localStorage records for a fresh slate.

---

## 📂 Project Structure

```
ExpenseFlow/
├── public/
├── screenshots/
│   └── README.md
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx            # Reusable status badges (income, expense, warning)
│   │   │   ├── Button.jsx           # Button variants (primary, secondary, danger, etc.)
│   │   │   ├── Card.jsx             # Dark SaaS styled container cards with hover effects
│   │   │   ├── CategoryIcon.jsx     # Semantic category icons with custom palette
│   │   │   ├── ConfirmDialog.jsx    # Modal dialog for deletions and data resets
│   │   │   ├── EmptyState.jsx       # Polished fallback states when lists are empty
│   │   │   ├── Modal.jsx            # Accessible overlay modal with keyboard & backdrop dismissal
│   │   │   └── StatCard.jsx         # KPI metric cards with trends and ambient glows
│   │   ├── layout/
│   │   │   ├── Layout.jsx           # Main app shell with sidebar and responsive outlet
│   │   │   ├── MobileNav.jsx        # Bottom navigation bar for mobile devices
│   │   │   ├── Navbar.jsx           # Top header with currency picker, theme toggle & quick-add
│   │   │   └── Sidebar.jsx          # Desktop sidebar navigation with live balance
│   │   ├── transactions/
│   │   │   ├── TransactionDetailsModal.jsx # Detailed receipt modal
│   │   │   ├── TransactionFilters.jsx      # Search, type, category, date, sort controls
│   │   │   ├── TransactionFormModal.jsx    # Add/Edit transaction with validation
│   │   │   ├── TransactionItem.jsx         # Responsive row/card for transactions
│   │   │   └── TransactionList.jsx         # Paginated transaction list with summary bar
│   │   ├── budgets/
│   │   │   ├── BudgetCard.jsx       # Category budget card with 80% warnings & exceeded badges
│   │   │   ├── BudgetFormModal.jsx  # Set or edit category budget limit
│   │   │   └── BudgetSummary.jsx    # High-level budget utilization overview
│   │   └── analytics/
│   │       ├── CashflowChart.jsx           # Recharts AreaChart with custom gradients
│   │       ├── CategoryPieChart.jsx        # Recharts Donut chart with legend
│   │       ├── ExpenseBreakdownTable.jsx   # Tabular category spending analysis
│   │       └── MonthlyBarChart.jsx         # Recharts BarChart for monthly comparisons
│   ├── context/
│   │   ├── CurrencyContext.jsx      # Active currency, symbols, and formatters
│   │   ├── FinanceContext.jsx       # Core ledger state, calculations, and CRUD logic
│   │   ├── ThemeContext.jsx         # Dark/Light mode manager syncing with HTML class
│   │   └── ToastContext.jsx         # Animated toast notification system
│   ├── data/
│   │   ├── categories.js            # 11 supported categories with colors and icons
│   │   ├── currencies.js            # Supported currency configurations (INR default)
│   │   └── sampleData.js            # 20 realistic Indian transactions and default budgets
│   ├── pages/
│   │   ├── Analytics.jsx            # Analytics page with timeframes and charts
│   │   ├── Budgets.jsx              # Budgets management and alerts page
│   │   ├── Dashboard.jsx            # Main dashboard overview
│   │   ├── NotFound.jsx             # 404 fallback page
│   │   ├── Settings.jsx             # Settings, profile, CSV export, and data wipe
│   │   └── Transactions.jsx         # Transactions ledger with filtering and search
│   ├── utils/
│   │   ├── calculations.js          # Pure financial calculation and aggregation engine
│   │   ├── exportCSV.js             # CSV file generator and JSON backup exporter
│   │   └── formatters.js            # Currency, relative date, and compact number formatters
│   ├── App.jsx                      # App root with providers and router
│   ├── index.css                    # Tailwind directives and custom scrollbar styling
│   └── main.jsx                     # Application DOM entry point
├── index.html                       # HTML5 template with Inter font and responsive viewport
├── package.json                     # Project manifest and dependencies
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind custom theme configuration
└── vite.config.js                   # Vite configuration with chunk splitting
```

---

## 🚀 Setup & Installation Instructions

Follow these straightforward steps to run the application locally on your computer:

### 1. Prerequisites
- **Node.js** (v18.0 or newer recommended)
- **npm**, **pnpm**, or **yarn**

### 2. Install Dependencies
Open your terminal in the project directory and run:

```bash
npm install
```

### 3. Start Development Server
Launch the live development server:

```bash
npm run dev
```

The application will start immediately at:
```
http://localhost:5173
```
Open this URL in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari.

### 4. Build for Production
To generate an optimized, minified production build:

```bash
npm run build
```

The compiled assets will be output to the `dist/` directory. You can preview the production build locally with:

```bash
npm run preview
```

---

## 📱 Cross-Platform & Device Testing Guide

The application was built from the ground up for seamless operation across desktop monitors, laptops, tablets, and smartphones:

- **Desktop (≥ 1024px)**: Uses the fixed left navigation sidebar with live balance status and comfortable multi-column dashboard grid.
- **Mobile / Smartphone (< 1024px)**:
  - Header displays a clean hamburger drawer trigger for full menu access.
  - Sticky bottom navigation bar enables effortless single-thumb switching between Dashboard, Transactions, Budgets, Analytics, and Settings.
  - Transactions list transforms from wide desktop tables to touch-friendly mobile cards with clear tap actions.
  - Recharts automatically resize to viewport width without horizontal scrollbars or overflow clipping.
  - All modals adapt to mobile screen heights with scrollable inner containers and sticky action footers.

---

## 🔒 Data Privacy & Architecture Note

- All data is maintained entirely on the client side using the standard browser `window.localStorage` API.
- No third-party servers, tracking scripts, or analytics beacons are loaded.
- Refreshing the browser preserves your transactions, budgets, profile changes, and selected theme/currency.

---

## 👨‍💻 College Project Submission Details

- **Project Title**: ExpenseFlow – Personal Finance Manager
- **Course**: Advanced Web Application Development / Frontend Engineering
- **Architecture**: Single-Page React Application (Frontend-Only, Zero-Backend)
- **Primary Currency**: INR (₹)
- **Sample Dataset**: 20 realistic Indian transaction records covering UPI, Credit Card, Net Banking, and Bank Transfers

#   M F E F - C L A 5  
 