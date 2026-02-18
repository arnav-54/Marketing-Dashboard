import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Bar } from 'react-chartjs-2'

const INR = (val) =>
    val != null ? '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0'

const fmtMonth = (m) => {
    if (!m) return ''
    const [y, mo] = m.split('-')
    const d = new Date(+y, +mo - 1)
    return d.toLocaleString('en-IN', { month: 'short', year: 'numeric' })
}

function MoMBadge({ val }) {
    if (val === 0 || val == null) {
        return (
            <span className="mom-badge neutral" aria-label="No change">
                <Minus size={12} aria-hidden="true" /> 0%
            </span>
        )
    }
    const pos = val > 0
    return (
        <span
            className={`mom-badge ${pos ? 'pos' : 'neg'}`}
            aria-label={`${pos ? 'Increased' : 'Decreased'} by ${Math.abs(val).toFixed(1)}%`}
        >
            {pos ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
            {Math.abs(val).toFixed(1)}%
        </span>
    )
}

export default function MonthlyTrend({ monthly }) {
    
    const lastMonth = monthly[monthly.length - 1]?.month || ''
    const [selected, setSelected] = useState(lastMonth)

    
    useEffect(() => {
        const last = monthly[monthly.length - 1]?.month || ''
        setSelected(last)
    }, [monthly])

    const current = monthly.find((m) => m.month === selected) || monthly[monthly.length - 1]
    const prevIdx = monthly.findIndex((m) => m.month === selected) - 1
    const prev = prevIdx >= 0 ? monthly[prevIdx] : null

    const spend = current?.total_spend ?? current?.spend ?? 0
    const revenue = current?.total_revenue ?? current?.revenue ?? 0
    const conversions = current?.total_conversions ?? current?.conversions ?? 0
    const roas = current?.roas ?? 0

    
    const momSpend = current?.mom_spend_growth ?? (prev ? ((spend - (prev.total_spend ?? prev.spend ?? 0)) / (prev.total_spend ?? prev.spend ?? 1) * 100) : 0)
    const momRevenue = current?.mom_revenue_growth ?? (prev ? ((revenue - (prev.total_revenue ?? prev.revenue ?? 0)) / (prev.total_revenue ?? prev.revenue ?? 1) * 100) : 0)

    
    const barData = {
        labels: monthly.map((m) => fmtMonth(m.month)),
        datasets: [
            {
                label: 'Spend (₹)',
                data: monthly.map((m) => m.total_spend ?? m.spend ?? 0),
                backgroundColor: monthly.map((m) =>
                    m.month === selected ? 'rgba(139,92,246,1)' : 'rgba(139,92,246,0.45)'
                ),
                borderRadius: 6,
                barThickness: 22,
            },
            {
                label: 'Revenue (₹)',
                data: monthly.map((m) => m.total_revenue ?? m.revenue ?? 0),
                backgroundColor: monthly.map((m) =>
                    m.month === selected ? 'rgba(16,185,129,1)' : 'rgba(16,185,129,0.45)'
                ),
                borderRadius: 6,
                barThickness: 22,
            },
        ],
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter, sans-serif' } },
            },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ₹${Number(ctx.raw).toLocaleString('en-IN')}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { family: 'Inter, sans-serif' } },
            },
            y: {
                grid: { color: '#f3f4f6', borderDash: [4, 4] },
                ticks: {
                    color: '#9ca3af',
                    font: { family: 'Inter, sans-serif' },
                    callback: (v) => '₹' + (v / 1e6).toFixed(1) + 'M',
                },
                border: { display: false },
            },
        },
        onClick: (_, elements) => {
            
            if (elements.length > 0) {
                const idx = elements[0].index
                setSelected(monthly[idx]?.month || selected)
            }
        },
    }

    return (
        <section id="section-monthly" className="dashboard-section" aria-labelledby="heading-monthly">
            <div className="section-heading">
                <h2 id="heading-monthly" className="section-title">Monthly Trends</h2>
                <p className="section-desc">Month-over-month performance breakdown — click a bar or tab to select</p>
            </div>

            {}
            <div className="month-selector-row">
                <span className="filter-label" id="month-selector-label">Select Month</span>
                <div className="month-tabs" role="tablist" aria-labelledby="month-selector-label">
                    {monthly.map((m) => (
                        <button
                            key={m.month}
                            role="tab"
                            aria-selected={selected === m.month}
                            className={`month-tab ${selected === m.month ? 'active' : ''}`}
                            onClick={() => setSelected(m.month)}
                            aria-label={`View data for ${fmtMonth(m.month)}`}
                        >
                            {fmtMonth(m.month)}
                        </button>
                    ))}
                </div>
            </div>

            {}
            {current && (
                <div
                    className="monthly-metrics"
                    role="region"
                    aria-label={`Metrics for ${fmtMonth(selected)}`}
                    aria-live="polite"
                >
                    <div className="monthly-metric-card">
                        <span className="mm-label">Spend</span>
                        <span className="mm-value">{INR(spend)}</span>
                        <MoMBadge val={momSpend} />
                    </div>
                    <div className="monthly-metric-card">
                        <span className="mm-label">Revenue</span>
                        <span className="mm-value">{INR(revenue)}</span>
                        <MoMBadge val={momRevenue} />
                    </div>
                    <div className="monthly-metric-card">
                        <span className="mm-label">Conversions</span>
                        <span className="mm-value">{Number(conversions).toLocaleString('en-IN')}</span>
                        <span className="mom-badge neutral" aria-label="No MoM data">
                            <Minus size={12} aria-hidden="true" /> —
                        </span>
                    </div>
                    <div className="monthly-metric-card">
                        <span className="mm-label">ROAS</span>
                        <span className="mm-value">{parseFloat(roas).toFixed(2)}x</span>
                        <span className="mom-badge neutral" aria-label="No MoM data">
                            <Minus size={12} aria-hidden="true" /> —
                        </span>
                    </div>
                </div>
            )}

            {}
            <div
                className="chart-container"
                role="img"
                aria-label="Bar chart showing monthly spend vs revenue. Click a bar to select that month."
            >
                <div className="chart-header">
                    <h3 className="chart-title">Spend vs Revenue by Month</h3>
                    <span className="chart-label">Click bar to select month</span>
                </div>
                <div style={{ flex: 1, position: 'relative', minHeight: 280 }}>
                    <Bar
                        key={`chart-${monthly.length}-${selected}`}
                        data={barData}
                        options={barOptions}
                        aria-hidden="true"
                    />
                </div>
            </div>
        </section>
    )
}
