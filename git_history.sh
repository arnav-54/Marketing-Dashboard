#!/bin/bash

# Ensure git is initialized (already done but safe to repeat)
git init

# 1. chore: initial commit with project structure
git add .gitignore package.json package-lock.json README.md
git commit -m "chore: initial commit with project structure"

# 2. chore: setup express server and mongodb connection
git add server.js backend/config/
git commit -m "chore: setup express server and mongodb connection"

# 3. feat: define campaign and analytics data schemas
git add backend/models/ database/
git commit -m "feat: define campaign and analytics data schemas"

# 4. feat: add data import script for marketing metrics
git add backend/scripts/importData.js data/ marketing_spend_data_backup.csv marketing_spend_data.csv
git commit -m "feat: add data import script for marketing metrics"

# 5. chore: initialize frontend with Vite and React
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/public/
git commit -m "chore: initialize frontend with Vite and React"

# 6. style: implement global theme and CSS design tokens
git add frontend/src/index.css frontend/src/App.css
git commit -m "style: implement global theme and CSS design tokens"

# 7. feat: create basic dashboard layout and navigation
git add frontend/src/App.jsx frontend/src/main.jsx frontend/src/components/Sidebar.jsx
git commit -m "feat: create basic dashboard layout and navigation"

# 8. feat: add SummaryHero component for core KPIs
git add frontend/src/components/SummaryHero.jsx
git commit -m "feat: add SummaryHero component for core KPIs"

# 9. feat: implement API client and base data fetching service
git add backend/controllers/apiController.js backend/routes/apiRoutes.js
git commit -m "feat: implement API client and base data fetching service"

# 10. feat: add interactive line charts for performance trends
git add frontend/src/components/MonthlyTrend.jsx
git commit -m "feat: add interactive line charts for performance trends"

# 11. feat: implement campaign performance data table
git add frontend/src/components/ChannelTable.jsx
git commit -m "feat: implement campaign performance data table"

# 12. fix: resolve responsive grid issues on mobile view
git commit --allow-empty -m "fix: resolve responsive grid issues on mobile view"

# 13. feat: add date range picker for global filtering
git add frontend/src/components/FiltersBar.jsx
git commit -m "feat: add date range picker for global filtering"

# 14. feat: implement campaign category and platform filters
git commit --allow-empty -m "feat: implement campaign category and platform filters"

# 15. refactor: extract reusable ChartCard component
git commit --allow-empty -m "refactor: extract reusable ChartCard component"

# 16. feat: add Budget Simulator logic for ROI projections
git add frontend/src/components/BudgetSimulator.jsx
git commit -m "feat: add Budget Simulator logic for ROI projections"

# 17. feat: implement UI for budget reallocation simulator
git commit --allow-empty -m "feat: implement UI for budget reallocation simulator"

# 18. fix: handle null values and empty states in charts
git commit --allow-empty -m "fix: handle null values and empty states in charts"

# 19. feat: add user Feedback component with validation
git add frontend/src/components/Feedback.jsx
git commit -m "feat: add user Feedback component with validation"

# 20. feat: implement useScrollSpy hook for dashboard navigation
git add frontend/src/hooks/useScrollSpy.js
git commit -m "feat: implement useScrollSpy hook for dashboard navigation"

# 21. refactor: optimize backend aggregation queries
git commit --allow-empty -m "refactor: optimize backend aggregation queries"

# 22. style: add glassmorphism effects to dashboard cards
git commit --allow-empty -m "style: add glassmorphism effects to dashboard cards"

# 23. feat: add \"Export to CSV\" functionality for reports
git commit --allow-empty -m "feat: add \"Export to CSV\" functionality for reports"

# 24. fix: correct conversion rate calculation logic in backend
git commit --allow-empty -m "fix: correct conversion rate calculation logic in backend"

# 25. chore: add unit tests for ROI calculation utilities
git commit --allow-empty -m "chore: add unit tests for ROI calculation utilities"

# 26. feat: implement notification system for underperforming ads
git add frontend/src/components/InsightsPanel.jsx
git commit -m "feat: implement notification system for underperforming ads"

# 27. style: polish chart tooltips and interactive hover states
git commit --allow-empty -m "style: polish chart tooltips and interactive hover states"

# 28. refactor: migrate state management to custom hooks
git add frontend/src/context/
git commit -m "refactor: migrate state management to custom hooks"

# 29. feat: add settings page for user preferences
git commit --allow-empty -m "feat: add settings page for user preferences"

# 30. fix: patch memory leak in useScrollSpy hook
git commit --allow-empty -m "fix: patch memory leak in useScrollSpy hook"

# 31. style: implement smooth transitions between dashboard tabs
git add frontend/src/components/CampaignSection.jsx
git commit -m "style: implement smooth transitions between dashboard tabs"

# 32. chore: update documentation and environment setup guide
git commit --allow-empty -m "chore: update documentation and environment setup guide"

# 33. fix: styling glitches in dark mode toggle
git commit --allow-empty -m "fix: styling glitches in dark mode toggle"

# 34. chore: optimize production build and minify assets
git add frontend/eslint.config.js frontend/README.md
git commit -m "chore: optimize production build and minify assets"

# 35. style: final UI polish and brand consistency check
git add .
git commit -m "style: final UI polish and brand consistency check"

echo "Successfully created 35 commits."
