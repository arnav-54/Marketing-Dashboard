# Marketing Analytics Dashboard

A full-stack marketing analytics system that processes campaign data using Python and visualizes it in a modern Node.js + MySQL dashboard.

## Project Structure

- `spend_analysis.py`: Python script for data processing and analysis.
- `backend/`: Node.js API and data import scripts.
- `frontend/`: HTML/CSS/JS dashboard.
- `database/`: SQL schema.
- `data/`: Generated JSON summaries.

## Prerequisites

- Python 3.x (with pandas, numpy)
- Node.js (v14+)
- MySQL Server

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database and user, or use your existing root user.
2. Update `backend/config/database.js` or create a `.env` file in the root directory with your credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=marketing_analytics
PORT=3000
```

3. Run the schema script to create tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

### 2. Generate Analysis Data (Python)

Run the Python script to process the CSV data and generate `summary_data.json`:

```bash
# Install dependencies
pip install pandas numpy

# Run analysis
python3 spend_analysis.py
```

This will create `data/summary_data.json` based on `marketing_spend_data.csv`.

### 3. Import Data to MySQL

Load the generated JSON data into your MySQL database:

```bash
npm install
npm run import-data
```

### 4. Start the Dashboard

Run the Node.js server:

```bash
npm start
```

Visit `http://localhost:3000` in your browser.

## Features

- **Automated Analysis**: Python script cleans data, calculates complex metrics (ROAS, CPA, CPC), and generates AI insights.
- **Interactive Dashboard**: Sortable tables, monthly trend charts, and campaign filtering.
- **Insights Panel**: Highlights top performers and scaling opportunities.
- **Strict Architecture**: Follows the separation of concerns between Data Engineering (Python) and Web Application (Node/MySQL).
