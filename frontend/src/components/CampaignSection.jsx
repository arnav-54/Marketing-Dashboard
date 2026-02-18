import { Trophy, AlertTriangle, Rocket } from 'lucide-react'

const INR = (val) =>
    val != null ? '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0'

const roasClass = (r) => {
    const v = parseFloat(r)
    if (v >= 4.0) return 'roas-green'
    if (v >= 2.0) return 'roas-yellow'
    return 'roas-red'
}

const CHANNEL_COLORS = {
    Email: '#8b5cf6',
    SEO: '#10b981',
    LinkedIn: '#0ea5e9',
    'Google Ads': '#f59e0b',
    Influencer: '#ec4899',
    'Meta Ads': '#3b82f6',
    Instagram: '#f97316',
}

function CampaignCard({ c }) {
    const channel = c.channel_name || c.channel || ''
    const color = CHANNEL_COLORS[channel] || '#8b5cf6'
    const spend = c.total_spend ?? c.spend ?? 0
    const revenue = c.total_revenue ?? c.revenue ?? 0
    const roas = parseFloat(c.roas ?? 0)

    return (
        <article className="campaign-card" aria-label={`Campaign: ${c.campaign_name || c.campaign}`}>
            <div className="campaign-card-top">
                <span className="campaign-name">{c.campaign_name || c.campaign}</span>
                <span className="channel-tag" style={{ background: color + '18', color }}>
                    {channel}
                </span>
            </div>
            <div className="campaign-metrics">
                <div className="cm-item">
                    <span className="cm-label">Spend</span>
                    <span className="cm-value">{INR(spend)}</span>
                </div>
                <div className="cm-item">
                    <span className="cm-label">Revenue</span>
                    <span className="cm-value bold">{INR(revenue)}</span>
                </div>
                <div className="cm-item">
                    <span className="cm-label">ROAS</span>
                    <span className={`roas-pill ${roasClass(roas)}`}>
                        {roas.toFixed(2)}x
                    </span>
                </div>
                {c.conversions != null && (
                    <div className="cm-item">
                        <span className="cm-label">Conversions</span>
                        <span className="cm-value">{Number(c.conversions).toLocaleString('en-IN')}</span>
                    </div>
                )}
            </div>
        </article>
    )
}

// ─── CampaignSection — no outer <section>, App owns that ─────────────────────
export default function CampaignSection({ campaigns }) {
    if (!campaigns || campaigns.length === 0) {
        return <p className="empty-state">No campaigns match the current filters.</p>
    }

    const top5 = [...campaigns].sort((a, b) => b.roas - a.roas).slice(0, 5)

    const underperforming = campaigns.filter((c) => {
        const spend = parseFloat(c.total_spend ?? c.spend ?? 0)
        return spend >= 50000 && parseFloat(c.roas) < 2.0
    })

    const scaling = campaigns.filter((c) => {
        const spend = parseFloat(c.total_spend ?? c.spend ?? 0)
        return parseFloat(c.roas) >= 5.0 && spend < 20000
    })

    return (
        <div className="campaign-groups">

            {/* Top 5 by ROAS */}
            <div className="campaign-group">
                <div className="campaign-group-header">
                    <Trophy size={18} className="cg-icon gold" aria-hidden="true" />
                    <h3 className="cg-title">Top 5 Campaigns by ROAS</h3>
                </div>
                <div className="campaign-cards-grid">
                    {top5.map((c, i) => <CampaignCard key={c.campaign_name || i} c={c} />)}
                </div>
            </div>

            {/* Underperforming */}
            <div className="campaign-group">
                <div className="campaign-group-header">
                    <AlertTriangle size={18} className="cg-icon red" aria-hidden="true" />
                    <h3 className="cg-title">Underperforming Campaigns</h3>
                    <span className="cg-badge red">Spend ≥ ₹50k &amp; ROAS &lt; 2.0</span>
                </div>
                {underperforming.length === 0
                    ? <p className="empty-state">No underperforming campaigns with current filters.</p>
                    : (
                        <div className="campaign-cards-grid">
                            {underperforming.map((c, i) => <CampaignCard key={c.campaign_name || i} c={c} />)}
                        </div>
                    )
                }
            </div>

            {/* Scaling opportunities */}
            <div className="campaign-group">
                <div className="campaign-group-header">
                    <Rocket size={18} className="cg-icon green" aria-hidden="true" />
                    <h3 className="cg-title">Scaling Opportunities</h3>
                    <span className="cg-badge green">ROAS ≥ 5.0 &amp; Spend &lt; ₹20k</span>
                </div>
                {scaling.length === 0
                    ? <p className="empty-state">No scaling opportunities with current filters.</p>
                    : (
                        <div className="campaign-cards-grid">
                            {scaling.map((c, i) => <CampaignCard key={c.campaign_name || i} c={c} />)}
                        </div>
                    )
                }
            </div>

        </div>
    )
}
