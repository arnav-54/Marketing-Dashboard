# MarketingOS — Full-Stack Dashboard Documentation

## Overview

MarketingOS is a full-stack marketing analytics dashboard that visualizes campaign performance, channel efficiency, and budget impact. It features real-time filtering, interactive charts, a budget reallocation simulator, and an authenticated multi-user experience.

**Live Stack**: React (Vite) + Node.js (Express) + MySQL (TiDB Cloud)

---

## Project Structure

```
marketing-analytics-dashboard/
│
├── server.js                        # Express server entry point
├── package.json                     # Backend dependencies
├── .env                             # Environment variables (DB, port)
├── spend_analysis.py                # Python analytics script
├── marketing_spend_data.csv         # Raw marketing data (5,153 rows)
│
├── backend/
│   ├── config/
│   │   └── database.js              # MySQL connection pool (mysql2)
│   ├── controllers/
│   │   ├── apiController.js         # Dashboard data endpoints logic
│   │   ├── authController.js        # Login, register, logout logic
│   │   └── tutorialController.js    # Tutorial status management
│   ├── middleware/
│   │   └── authMiddleware.js        # Session-based auth guard
│   ├── routes/
│   │   ├── apiRoutes.js             # /api/* route definitions
│   │   ├── authRoutes.js            # /api/auth/* route definitions
│   │   └── tutorialRoutes.js        # /api/tutorial/* route definitions
│   └── scripts/
│       ├── setupDb.js               # Creates users table + demo user
│       ├── importData.js            # Imports JSON/CSV into MySQL
│       └── updateTutorialColumn.js  # Adds tutorial_seen column
│
├── frontend/
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── index.html                   # HTML entry point
│   ├── public/                      # Static assets (icons, logo)
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Main application component
│       ├── App.css                  # Minimal app styles
│       ├── index.css                # Full design system (32KB)
│       ├── config.js                # API base URL configuration
│       ├── context/
│       │   └── AuthContext.jsx      # Authentication state provider
│       ├── hooks/
│       │   └── useScrollSpy.js      # Scroll-based navigation tracking
│       └── components/
│           ├── Login.jsx            # Login/Register form
│           ├── Sidebar.jsx          # Collapsible navigation sidebar
│           ├── FiltersBar.jsx       # Channel, ROAS, sort filters
│           ├── SummaryHero.jsx      # KPI summary cards
│           ├── ChannelTable.jsx     # Sortable channel performance table
│           ├── MonthlyTrend.jsx     # Monthly bar/line chart + metrics
│           ├── AdditionalCharts.jsx # ROAS, CPA, scatter charts
│           ├── BudgetSimulator.jsx  # Budget reallocation simulator
│           ├── CampaignSection.jsx  # Campaign cards (top, under, scaling)
│           ├── InsightsPanel.jsx    # AI-generated insights display
│           ├── Tutorial.jsx         # First-time user tutorial overlay
│           └── Feedback.jsx         # Toast, skeleton loaders
│
├── data/
│   └── summary_data.json           # Generated analytics output
│
└── database/
    └── schema.sql                   # Full database schema
```

---

## Installation Instructions

### Prerequisites

| Tool       | Version  | Purpose              |
| ---------- | -------- | -------------------- |
| Node.js    | ≥ 18.x   | Backend runtime      |
| npm        | ≥ 9.x    | Package manager      |
| Python     | ≥ 3.8    | Analytics script     |
| MySQL      | ≥ 8.0    | Database (or TiDB)   |

### Step-by-Step Setup

```bash

git clone https://github.com/arnav-54/Marketing-Dashboard.git
cd Marketing-Dashboard


npm install


cd frontend
npm install
cd ..

python3 -m venv venv
source venv/bin/activate
pip install pandas numpy

python spend_analysis.py

cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketing_analytics
DB_PORT=3306
PORT=3000
EOF
```

---

## Database Setup Instructions

### Option A: Local MySQL

```bash
mysql -u root -p

source database/schema.sql;

exit;

node backend/scripts/setupDb.js

npm run import-data
```

### Option B: TiDB Cloud (Production)

The project is pre-configured for TiDB Cloud. Update `.env` with your TiDB credentials:

```env
DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
DB_USER=your_tidb_user
DB_PASSWORD=your_tidb_password
DB_NAME=test
DB_PORT=4000
DB_SSL={"rejectUnauthorized":true}
```

Then run:
```bash
node backend/scripts/setupDb.js
npm run import-data
```

### Database Schema

| Table                  | Purpose                              | Key Columns                                        |
| ---------------------- | ------------------------------------ | -------------------------------------------------- |
| `users`                | User authentication                  | id, name, email, password_hash, tutorial_seen       |
| `channels`             | Channel-level aggregated metrics     | name, total_spend, total_revenue, roas, cpa, cpc    |
| `monthly_performance`  | Monthly aggregated performance       | month, total_spend, total_revenue, roas              |
| `campaigns`            | Campaign-level aggregated metrics    | campaign_name, channel_name, total_spend, roas       |
| `marketing_data`       | Raw daily campaign data (from CSV)   | date, channel, campaign_name, spend, revenue, etc.   |

---

## How to Run

### Backend Server

```bash
npm start
```

### Frontend Dev Server

```bash
cd frontend
npm run dev
```

### Both Together (Development)

Open two terminals:
```bash
npm start

cd frontend && npm run dev
```

Access the dashboard at **http://localhost:5173**.

### Demo Login Credentials

| Email             | Password  |
| ----------------- | --------- |
| admin@example.com | admin123  |

(Auto-created by `setupDb.js` if not already present)

---

## API Endpoint Documentation

All API endpoints (except auth) require an authenticated session. The backend uses session-based authentication with `express-session`.

### Authentication

| Method | Endpoint             | Description                     | Body                                    |
| ------ | -------------------- | ------------------------------- | --------------------------------------- |
| POST   | `/api/auth/register` | Register a new user             | `{ name, email, password }`             |
| POST   | `/api/auth/login`    | Log in and create a session     | `{ email, password }`                   |
| POST   | `/api/auth/logout`   | Destroy the current session     | —                                       |
| GET    | `/api/auth/me`       | Get current authenticated user  | —                                       |

**Response (login/register):**
```json
{ "success": true, "user": { "id": 1, "name": "Admin", "email": "admin@example.com" } }
```

### Dashboard Data

| Method | Endpoint          | Query Parameters                             | Description                          |
| ------ | ----------------- | -------------------------------------------- | ------------------------------------ |
| GET    | `/api/summary`    | `month`, `channel`                           | Overall KPIs (spend, revenue, ROAS, CPA, CPC) |
| GET    | `/api/channels`   | `sort_by`, `order`, `month`, `channel`, `min_roas`, `max_roas` | Channel performance data |
| GET    | `/api/monthly`    | `channel`                                    | Monthly trend data with MoM growth   |
| GET    | `/api/campaigns`  | `channel`, `min_roas`, `max_roas`, `month`   | Campaign-level performance data      |
| GET    | `/api/insights`   | —                                            | AI-generated business insights       |

**Example Request:**
```
GET /api/channels?sort_by=roas&order=desc&min_roas=3.0
```

**Example Response:**
```json
[
  {
    "name": "Email",
    "total_spend": 1764078.73,
    "total_revenue": 12833973.13,
    "total_conversions": 229747,
    "roas": 7.28,
    "cpa": 7.68,
    "cpc": 0.54
  }
]
```

### Tutorial

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| GET    | `/api/tutorial/status`   | Check if user has seen tutorial |
| POST   | `/api/tutorial/complete` | Mark tutorial as completed      |

### Fallback Behavior

If the MySQL database is unreachable, the API automatically falls back to reading from `data/summary_data.json` to ensure the dashboard remains functional.

---

## Design Decisions and Technology Choices

### Backend

| Decision                  | Rationale                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **Express.js**            | Lightweight, widely adopted, excellent middleware ecosystem                                   |
| **MySQL (TiDB Cloud)**    | Relational data fits tabular marketing metrics; TiDB provides serverless MySQL compatibility  |
| **Session-based Auth**    | Simpler than JWT for a single-domain app; no token refresh complexity                         |
| **bcryptjs**              | Secure password hashing with salt rounds; pure JS (no native compilation needed)              |
| **JSON Fallback**         | Ensures the dashboard works even without a database connection using cached summary data      |

### Frontend

| Decision                   | Rationale                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **React 19 + Vite 7**     | Fast HMR, modern JSX transform, excellent developer experience                            |
| **Chart.js + react-chartjs-2** | Responsive, interactive charts with low bundle size; supports bar, line, pie, scatter  |
| **Vanilla CSS (32KB)**     | Full control over design system; no framework dependency; custom variables and animations  |
| **Lucide React Icons**     | Lightweight, tree-shakeable icon library; consistent visual style                          |
| **Scroll Spy Hook**        | Custom `useScrollSpy` provides smooth section-based navigation without a router            |
| **Single Page App**        | Dashboard is a single view with scroll-based sections; no need for multi-page routing      |

### Analytics (Python)

| Decision                   | Rationale                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **Pandas + NumPy**         | Industry-standard for data manipulation and safe vectorized computation                    |
| **JSON Export**             | Universal format readable by both Node.js backend and any other consumer                  |
| **Modular Functions**      | Each analysis step (overall, channel, monthly, campaign, insights) is a separate function  |

### Architecture

- **Separation of Concerns**: Python handles data analysis, Node.js serves the API, React renders the UI.
- **Ref-based Filter State**: Filter values are mirrored in React refs alongside state to avoid stale closure issues in async callbacks.
- **Optimistic UI**: Skeleton loaders and loading spinners provide immediate visual feedback during data fetches.

---

## Known Issues and Limitations

1. **No Real-Time Data Sync**: The Python script must be re-run manually to update `summary_data.json` when new CSV data is available. There is no automated pipeline.

2. **Session Storage**: Sessions are stored in-memory by default. In a production deployment, a persistent session store (e.g., Redis, database) should be configured to survive server restarts.

3. **Single-User Concurrency**: The budget simulator is client-side only and does not persist reallocation changes to the backend. Each user sees independent simulator state.

4. **No Password Reset Flow**: The authentication system supports register/login/logout but does not include a "forgot password" or email verification feature.

5. **CSV Format Dependency**: The analytics script expects a specific CSV column structure. Any changes to column names (beyond the handled `campaign_name` → `campaign` rename) will require script modifications.

6. **Date Range**: The dataset covers August 2025 to January 2026 only. There is no date-range picker in the UI — filtering is by individual month selection.

7. **Mobile Responsiveness**: The dashboard is optimized for desktop and tablet viewports. Some complex sections (scatter charts, budget simulator) may require horizontal scrolling on smaller mobile screens.

8. **CORS Configuration**: The backend is configured to accept requests from `http://localhost:5173` by default. For production deployment, the `FRONTEND_URL` environment variable must be updated.

---

## Scripts Reference

| Command                       | Location     | Description                                        |
| ----------------------------- | ------------ | -------------------------------------------------- |
| `python spend_analysis.py`    | Root         | Run analytics script → generates `data/summary_data.json` |
| `npm start`                   | Root         | Start the Express backend server                    |
| `npm run import-data`         | Root         | Import analytics data into MySQL                    |
| `node backend/scripts/setupDb.js` | Root     | Create users table and demo user                    |
| `npm run dev`                 | `frontend/`  | Start Vite dev server for frontend                  |
| `npm run build`               | `frontend/`  | Build production bundle                             |
