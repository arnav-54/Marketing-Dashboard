import pandas as pd
import numpy as np
import json
import datetime
import os


INPUT_FILE = 'marketing_spend_data.csv'
OUTPUT_FILE = 'data/summary_data.json'

def load_data(filepath):
    """
    Reads CSV, handles missing values, converts types,
    adds month column, removes duplicates, handles zero division.
    """
    try:
        df = pd.read_csv(filepath)
    except FileNotFoundError:
        print(f"Error: File {filepath} not found.")
        return None

    numeric_cols = ['spend', 'revenue', 'impressions', 'clicks', 'conversions']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    if 'campaign' in df.columns:
        df['campaign'] = df['campaign'].fillna('Unknown Campaign')
    if 'channel' in df.columns:
        df['channel'] = df['channel'].fillna('Unknown Channel')

    if 'campaign_name' in df.columns:
        df.rename(columns={'campaign_name': 'campaign'}, inplace=True)

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        df['month'] = df['date'].dt.strftime('%Y-%m')

    df = df.drop_duplicates()

    return df

def calculate_metrics(df):
    """
    Computes ROAS, CPC, CPA, CTR, CVR.
    Handles zero division by replacing inf with 0.
    """
    df['roas'] = np.where(df['spend'] > 0, df['revenue'] / df['spend'], 0)
    
    df['cpc'] = np.where(df['clicks'] > 0, df['spend'] / df['clicks'], 0)
    
    df['cpa'] = np.where(df['conversions'] > 0, df['spend'] / df['conversions'], 0)
    
    df['ctr'] = np.where(df['impressions'] > 0, df['clicks'] / df['impressions'], 0)
    
    df['cvr'] = np.where(df['clicks'] > 0, df['conversions'] / df['clicks'], 0)

    return df

def summarize_overall(df):
    """
    Return total spend, revenue, conversions, overall ROAS, CPA, CPC.
    """
    total_spend = df['spend'].sum()
    total_revenue = df['revenue'].sum()
    total_conversions = df['conversions'].sum()
    total_clicks = df['clicks'].sum()
    
    overall_roas = total_revenue / total_spend if total_spend > 0 else 0
    overall_cpa = total_spend / total_conversions if total_conversions > 0 else 0
    overall_cpc = total_spend / total_clicks if total_clicks > 0 else 0

    return {
        "total_spend": float(round(total_spend, 2)),
        "total_revenue": float(round(total_revenue, 2)),
        "total_conversions": int(total_conversions),
        "overall_roas": float(round(overall_roas, 2)),
        "overall_cpa": float(round(overall_cpa, 2)),
        "overall_cpc": float(round(overall_cpc, 2))
    }

def summarize_by_channel(df):
    """
    Group by channel. 
    Return: spend, revenue, conversions, ROAS, CPA, CPC, avg CTR, avg CVR.
    Sorted by ROAS descending.
    """
    grouped = df.groupby('channel').agg({
        'spend': 'sum',
        'revenue': 'sum',
        'conversions': 'sum',
        'clicks': 'sum',
        'impressions': 'sum'
    }).reset_index()

    grouped['roas'] = np.where(grouped['spend'] > 0, grouped['revenue'] / grouped['spend'], 0)
    grouped['cpa'] = np.where(grouped['conversions'] > 0, grouped['spend'] / grouped['conversions'], 0)
    grouped['cpc'] = np.where(grouped['clicks'] > 0, grouped['spend'] / grouped['clicks'], 0)
    grouped['ctr'] = np.where(grouped['impressions'] > 0, grouped['clicks'] / grouped['impressions'], 0)
    grouped['cvr'] = np.where(grouped['clicks'] > 0, grouped['conversions'] / grouped['clicks'], 0)

    grouped = grouped.sort_values(by='roas', ascending=False)

    channels_data = []
    for _, row in grouped.iterrows():
        channels_data.append({
            "channel": row['channel'],
            "spend": float(round(row['spend'], 2)),
            "revenue": float(round(row['revenue'], 2)),
            "conversions": int(row['conversions']),
            "roas": float(round(row['roas'], 2)),
            "cpa": float(round(row['cpa'], 2)),
            "cpc": float(round(row['cpc'], 2)),
            "avg_ctr": float(round(row['ctr'], 4)), 
            "avg_cvr": float(round(row['cvr'], 4))
        })
    
    return channels_data

def summarize_by_month(df):
    """
    Group by month.
    Return: spend, revenue, conversions, ROAS.
    MoM spend growth, MoM revenue growth.
    Identify: highest spend month, best ROAS month, worst ROAS month.
    """
    grouped = df.groupby('month').agg({
        'spend': 'sum',
        'revenue': 'sum',
        'conversions': 'sum'
    }).reset_index().sort_values('month')

    grouped['roas'] = np.where(grouped['spend'] > 0, grouped['revenue'] / grouped['spend'], 0)

    grouped['mom_spend_growth'] = grouped['spend'].pct_change().fillna(0) * 100
    grouped['mom_revenue_growth'] = grouped['revenue'].pct_change().fillna(0) * 100

    monthly_data = []
    for _, row in grouped.iterrows():
        monthly_data.append({
            "month": row['month'],
            "spend": float(round(row['spend'], 2)),
            "revenue": float(round(row['revenue'], 2)),
            "conversions": int(row['conversions']),
            "roas": float(round(row['roas'], 2)),
            "mom_spend_growth": float(round(row['mom_spend_growth'], 2)),
            "mom_revenue_growth": float(round(row['mom_revenue_growth'], 2))
        })
    
    if not grouped.empty:
        highest_spend_month = grouped.loc[grouped['spend'].idxmax()]['month']
        best_roas_month_row = grouped.loc[grouped['roas'].idxmax()]
        worst_roas_month_row = grouped.loc[grouped['roas'].idxmin()]
        
        month_highlights = {
            "highest_spend_month": highest_spend_month,
            "best_roas_month": best_roas_month_row['month'],
            "best_roas_value": float(round(best_roas_month_row['roas'], 2)),
            "worst_roas_month": worst_roas_month_row['month'],
            "worst_roas_value": float(round(worst_roas_month_row['roas'], 2))
        }
    else:
        month_highlights = {}

    return monthly_data, month_highlights

def analyze_campaigns(df):
    """
    Top 3 campaigns by ROAS.
    Top 3 by revenue.
    Flag campaigns:
    - High Spend (>50000) AND ROAS < 2
    - High ROAS (>5) AND Spend < 20000
    """
    camp_grouped = df.groupby(['campaign', 'channel']).agg({
        'spend': 'sum',
        'revenue': 'sum',
        'conversions': 'sum'
    }).reset_index()

    camp_grouped['roas'] = np.where(camp_grouped['spend'] > 0, camp_grouped['revenue'] / camp_grouped['spend'], 0)

    top_roas = camp_grouped.sort_values(by='roas', ascending=False).head(3)
    top_roas_list = top_roas[['campaign', 'roas']].to_dict(orient='records')

    top_revenue = camp_grouped.sort_values(by='revenue', ascending=False).head(3)
    top_revenue_list = top_revenue[['campaign', 'revenue']].to_dict(orient='records')

    underperforming = camp_grouped[
        (camp_grouped['spend'] > 50000) & (camp_grouped['roas'] < 2)
    ][['campaign', 'spend', 'roas']].to_dict(orient='records')

    scaling_opportunities = camp_grouped[
        (camp_grouped['roas'] > 5) & (camp_grouped['spend'] < 20000)
    ][['campaign', 'spend', 'roas']].to_dict(orient='records')
    
    all_campaigns = []
    for _, row in camp_grouped.iterrows():
        all_campaigns.append({
            "campaign": row['campaign'],
            "channel": row['channel'],
            "spend": float(round(row['spend'], 2)),
            "revenue": float(round(row['revenue'], 2)),
            "conversions": int(row['conversions']),
            "roas": float(round(row['roas'], 2))
        })

    return {
        "top_roas_campaigns": top_roas_list,
        "top_revenue_campaigns": top_revenue_list,
        "underperforming_campaigns": underperforming,
        "scaling_opportunities": scaling_opportunities,
        "all_campaigns": all_campaigns
    }

def generate_insights(overall_stats, month_highlights, campaign_analysis):
    """
    Auto-generate 5-7 business recommendations.
    """
    insights = []

    if overall_stats['overall_roas'] > 4:
        insights.append(f"Overall ROAS is healthy at {overall_stats['overall_roas']}. Consider increasing budget to scale.")
    elif overall_stats['overall_roas'] < 2:
        insights.append(f"Overall ROAS is low at {overall_stats['overall_roas']}. Review high-spend, low-performance channels.")
    else:
        insights.append(f"Overall ROAS is stable at {overall_stats['overall_roas']}. Optimize creatives to improve margins.")

    if 'best_roas_month' in month_highlights:
         insights.append(f"Best performance was in {month_highlights['best_roas_month']} with ROAS of {month_highlights['best_roas_value']}. Analyze what worked that month.")

    scaling_opps = campaign_analysis.get('scaling_opportunities', [])
    if scaling_opps:
        camp_names = [c['campaign'] for c in scaling_opps[:2]]
        insights.append(f"Scaling Opportunities: Campaigns like {', '.join(camp_names)} have high ROAS but low spend. Increase budget here.")
    
    underperformers = campaign_analysis.get('underperforming_campaigns', [])
    if underperformers:
        camp_names = [c['campaign'] for c in underperformers[:2]]
        insights.append(f"Budget Waste Risk: Campaigns like {', '.join(camp_names)} are spending heavily (>50k) with low ROAS (<2). Pause or restructure immediately.")

    if overall_stats['overall_cpa'] > 50: 
        insights.append(f"CPA is relatively high at ${overall_stats['overall_cpa']}. Focus on CRO (Conversion Rate Optimization) to lower acquisition costs.")
    
    
    if len(insights) < 5:
         insights.append("Diversify channel mix to reduce dependency on top performing channel.")
    
    return insights

def export_summary(overall, channels, months, campaigns, insights):
    """
    Create summary_data.json
    """
    data = {
        "overall": overall,
        "channels": channels,
        "monthly": months,
        "campaigns": campaigns,
        "insights": insights,
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

   
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Summary exported to {OUTPUT_FILE}")

def main():
    print("Loading data...")
    df = load_data(INPUT_FILE)
    if df is None:
        return

    print("Calculating metrics...")
    df = calculate_metrics(df)

    print("Generating summaries...")
    overall_stats = summarize_overall(df)
    channel_stats = summarize_by_channel(df)
    monthly_stats, month_highlights = summarize_by_month(df)
    campaign_analysis = analyze_campaigns(df)

    print("Generating insights...")
    insights = generate_insights(overall_stats, month_highlights, campaign_analysis)

    print("Exporting data...")
    
    export_summary(
        overall=overall_stats,
        channels=channel_stats,
        months=monthly_stats,
        campaigns=campaign_analysis['all_campaigns'], 
        insights=insights
    )

    
if __name__ == "__main__":
    main()
