import { TrendingUp, TrendingDown, DollarSign, Users, Zap, MousePointer } from 'lucide-react'

const INR = (val) =>
    val != null
        ? '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })
        : '₹0'

const roasAccent = (roas) => {
    const r = parseFloat(roas)
    if (r >= 3.0) return 'accent-green'
    if (r >= 2.0) return 'accent-orange'
    return 'accent-red'
}

export default function SummaryHero({ summary }) {
    if (!summary) return null

    const cards = [
        {
            label: 'Total Spend',
            value: INR(summary.total_spend),
            icon: <DollarSign size={20} aria-hidden="true" />,
            accent: 'accent-purple',
            sub: 'All channels combined',
        },
        {
            label: 'Total Revenue',
            value: INR(summary.total_revenue),
            icon: <TrendingUp size={20} aria-hidden="true" />,
            accent: 'accent-green',
            sub: 'Gross revenue generated',
        },
        {
            label: 'Total Conversions',
            value: Number(summary.total_conversions).toLocaleString('en-IN'),
            icon: <Users size={20} aria-hidden="true" />,
            accent: 'accent-blue',
            sub: 'Across all campaigns',
        },
        {
            label: 'Overall ROAS',
            value: parseFloat(summary.overall_roas).toFixed(2) + 'x',
            icon: <Zap size={20} aria-hidden="true" />,
            accent: roasAccent(summary.overall_roas),
            sub: parseFloat(summary.overall_roas) >= 3
                ? '✓ Healthy return on ad spend'
                : parseFloat(summary.overall_roas) >= 2
                    ? '⚠ Moderate — consider optimising'
                    : '✗ Below target — action needed',
        },
        {
            label: 'Overall CPA',
            value: INR(summary.overall_cpa),
            icon: <TrendingDown size={20} aria-hidden="true" />,
            accent: 'accent-orange',
            sub: 'Cost per acquisition',
        },
        {
            label: 'Overall CPC',
            value: INR(summary.overall_cpc),
            icon: <MousePointer size={20} aria-hidden="true" />,
            accent: 'accent-teal',
            sub: 'Cost per click',
        },
    ]

    return (
        <div className="hero-grid" role="list" aria-label="Key performance indicators">
            {cards.map((c) => (
                <article
                    key={c.label}
                    className={`hero-card ${c.accent}`}
                    role="listitem"
                    aria-label={`${c.label}: ${c.value}`}
                >
                    <div className="hero-card-top">
                        <div className="hero-icon">{c.icon}</div>
                        <span className="hero-label">{c.label}</span>
                    </div>
                    <div className="hero-value" aria-live="polite">{c.value}</div>
                    <div className="hero-sub">{c.sub}</div>
                </article>
            ))}
        </div>
    )
}
