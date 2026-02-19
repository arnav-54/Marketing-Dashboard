# 📊 Marketing Spend Analysis — Analytics Script Documentation

## Overview

`spend_analysis.py` is a Python data analysis script that processes raw marketing campaign data from a CSV file, computes key performance metrics, and exports a structured JSON summary. This summary powers the MarketingOS full-stack dashboard.

---

## How to Run the Script

### Prerequisites

- **Python 3.8+** installed
- A virtual environment (recommended)

### Steps

```bash
# 1. Navigate to the project root
cd marketing-analytics-dashboard

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

# 3. Install dependencies
pip install pandas numpy

# 4. Run the script
python spend_analysis.py
```

On successful execution, the script outputs:

```
Loading data...
Calculating metrics...
Generating summaries...
Generating insights...
Exporting data...
Summary exported to data/summary_data.json
```

The generated file `data/summary_data.json` is consumed by the Node.js backend to serve data to the dashboard.

---

## Libraries and Dependencies

| Library    | Version | Purpose                                                         |
| ---------- | ------- | --------------------------------------------------------------- |
| `pandas`   | ≥ 1.5   | Data loading, manipulation, grouping, and aggregation            |
| `numpy`    | ≥ 1.24  | Vectorized arithmetic and safe division (avoiding divide-by-zero) |
| `json`     | stdlib  | Serializing the output summary to JSON format                    |
| `os`       | stdlib  | File system operations (directory creation)                      |
| `datetime` | stdlib  | Timestamping the generated output                                |

---

## Data Cleaning Approach and Assumptions

### Input Data

The script reads `marketing_spend_data.csv` containing **5,153 rows** with the following columns:

| Column          | Type    | Description                       |
| --------------- | ------- | --------------------------------- |
| `date`          | Date    | Campaign date (YYYY-MM-DD)        |
| `channel`       | String  | Marketing channel name            |
| `campaign_name` | String  | Individual campaign identifier    |
| `spend`         | Numeric | Amount spent (₹)                  |
| `impressions`   | Integer | Number of ad impressions          |
| `clicks`        | Integer | Number of clicks received         |
| `conversions`   | Integer | Number of conversions achieved    |
| `revenue`       | Numeric | Revenue generated (₹)             |

### Cleaning Steps

1. **Type Coercion**: All numeric columns (`spend`, `revenue`, `impressions`, `clicks`, `conversions`) are explicitly cast to numeric types using `pd.to_numeric()` with `errors='coerce'`. Any non-numeric or malformed values are replaced with `0` via `.fillna(0)`.

2. **Missing Categorical Values**: Missing `campaign` names are filled with `"Unknown Campaign"`, and missing `channel` names are filled with `"Unknown Channel"` to prevent grouping errors.

3. **Column Normalization**: If the CSV uses `campaign_name` as the column header, it is automatically renamed to `campaign` for internal consistency.

4. **Date Parsing**: The `date` column is parsed with `pd.to_datetime()`. Any rows with unparseable or missing dates are dropped entirely (`dropna(subset=['date'])`). A derived `month` column is created in `YYYY-MM` format for monthly aggregation.

5. **Duplicate Removal**: Exact duplicate rows are dropped using `df.drop_duplicates()`.

6. **Zero-Division Handling**: All derived metrics (ROAS, CPC, CPA, CTR, CVR) use `np.where()` to guard against division by zero — if the denominator is `0`, the metric defaults to `0` instead of producing `inf` or `NaN`.

### Assumptions

- All monetary values are in Indian Rupees (₹).
- Each row represents a single day's performance for one campaign on one channel.
- The CSV is expected to have a header row matching the column names listed above.
- ROAS is calculated as `revenue / spend` (not `(revenue - spend) / spend`).
- Month-over-month (MoM) growth for the first month defaults to `0%` since there is no prior month for comparison.
- Underperforming campaigns are defined as those with **total spend > ₹50,000** AND **ROAS < 2.0**.
- Scaling opportunities are campaigns with **ROAS > 5.0** AND **total spend < ₹20,000**.

---

## Key Findings

### Overall Performance

The dataset covers **6 months** (August 2025 – January 2026) of marketing activity across **7 channels** and **28 campaigns**, totaling approximately **₹4.63 crore** in spend and **₹16.7 crore** in revenue. The overall ROAS stands at **3.61x**, meaning every ₹1 spent generates ₹3.61 in revenue. While this indicates a profitable marketing operation overall, the CPA of **₹60.89** suggests there is room to optimize conversion efficiency, particularly on higher-cost channels.

### Channel Efficiency

Email marketing emerged as the standout performer with a ROAS of **7.28x** — more than double the overall average — while maintaining the lowest CPA of just **₹7.68**. SEO followed closely at **5.68x ROAS** with a CPA of **₹23.75**. In contrast, Instagram had the weakest ROAS at **2.91x**, and Influencer marketing, despite being the highest-spend channel at **₹1.32 crore**, delivered a below-average ROAS of **3.17x**. This suggests that reallocating budget from Influencer and Instagram toward Email and SEO could significantly improve overall returns.

### Monthly Trends

Monthly performance remained relatively stable, with ROAS fluctuating narrowly between **3.57x** and **3.63x**. December 2025 saw the highest spend at ₹80.5 lakh with a corresponding **9.39% revenue jump** month-over-month, likely driven by seasonal demand. November experienced a slight dip with a **-3.7% revenue decline**. January 2026 closed with the best ROAS of **3.63x**, indicating a strong start to Q1.

### Campaign-Level Insights

At the campaign level, **Email campaigns** (Welcome_Series, Re_engagement, Cart_Abandonment, Newsletter_Promo) dominated the top ROAS rankings, all exceeding **7.0x**. The script automatically identifies underperforming campaigns (high spend, low return) and scaling opportunities (high ROAS, low spend) to provide actionable budget reallocation recommendations. The auto-generated insights recommend focusing on Conversion Rate Optimization (CRO) to reduce the relatively high CPA and diversifying the channel mix to reduce over-reliance on a single high-spend channel.
