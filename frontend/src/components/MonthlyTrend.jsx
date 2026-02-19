import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart } from 'lucide-react'
import { Bar, Line } from 'react-chartjs-2'

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

export default function MonthlyTrend({ monthly, selected, onSelect }) {
    const lastMonth = monthly[monthly.length - 1]?.month || ''
    const [internalSelected, setInternalSelected] = useState(lastMonth)
    const [chartType, setChartType] = useState('bar')

    const activeMonth = selected !== undefined ? selected : internalSelected

    const handleSelect = (m) => {
        if (onSelect) {
            onSelect(m)
        } else {
            setInternalSelected(m)
        }
    }

    useEffect(() => {
        const last = monthly[monthly.length - 1]?.month || ''
        if (!selected) setInternalSelected(last)
    }, [monthly, selected])

    const current = monthly.find((m) => m.month === activeMonth) || monthly[monthly.length - 1]
    const prevIdx = monthly.findIndex((m) => m.month === activeMonth) - 1
    const prev = prevIdx >= 0 ? monthly[prevIdx] : null

    const spend = current?.total_spend ?? current?.spend ?? 0
    const revenue = current?.total_revenue ?? current?.revenue ?? 0
    const conversions = current?.total_conversions ?? current?.conversions ?? 0
    const roas = current?.roas ?? 0

    const momSpend = current?.mom_spend_growth ?? (prev ? ((spend - (prev.total_spend ?? prev.spend ?? 0)) / (prev.total_spend ?? prev.spend ?? 1) * 100) : 0)
    const momRevenue = current?.mom_revenue_growth ?? (prev ? ((revenue - (prev.total_revenue ?? prev.revenue ?? 0)) / (prev.total_revenue ?? prev.revenue ?? 1) * 100) : 0)

    const chartData = {
        labels: monthly.map((m) => fmtMonth(m.month)),
        datasets: [
            {
                label: 'Spend (₹)',
                data: monthly.map((m) => m.total_spend ?? m.spend ?? 0),
                backgroundColor: monthly.map((m) =>
                    m.month === activeMonth ? 'rgba(5, 150, 105, 1)' : 'rgba(5, 150, 105, 0.45)'
                ),
                borderColor: '#059669',
                borderWidth: chartType === 'line' ? 3 : 0,
                tension: 0.4,
                pointBackgroundColor: monthly.map((m) =>
                    m.month === activeMonth ? '#059669' : 'rgba(5, 150, 105, 0.5)'
                ),
                pointRadius: monthly.map((m) => m.month === activeMonth ? 6 : (chartType === 'line' ? 4 : 0)),
                borderRadius: 6,
                barThickness: 22,
                fill: chartType === 'line' ? { target: 'origin', above: 'rgba(5, 150, 105, 0.1)' } : false,
            },
            {
                label: 'Revenue (₹)',
                data: monthly.map((m) => m.total_revenue ?? m.revenue ?? 0),
                backgroundColor: monthly.map((m) =>
                    m.month === activeMonth ? 'rgba(16,185,129,1)' : 'rgba(16,185,129,0.45)'
                ),
                borderColor: '#10b981',
                borderWidth: chartType === 'line' ? 3 : 0,
                tension: 0.4,
                pointBackgroundColor: monthly.map((m) =>
                    m.month === activeMonth ? '#10b981' : 'rgba(16,185,129,0.5)'
                ),
                pointRadius: monthly.map((m) => m.month === activeMonth ? 6 : (chartType === 'line' ? 4 : 0)),
                borderRadius: 6,
                barThickness: 22,
                fill: chartType === 'line' ? { target: 'origin', above: 'rgba(16,185,129,0.1)' } : false,
            },
        ],
    }

    const chartOptions = {
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
                handleSelect(monthly[idx]?.month || activeMonth)
            }
        },
    }

    return (
        <section id="section-monthly" className="dashboard-section" aria-labelledby="heading-monthly">
            <div className="section-heading">
                <h2 id="heading-monthly" className="section-title">Monthly Trends</h2>
                <p className="section-desc">Month-over-month performance breakdown — click a bar or tab to select</p>
            </div>

            <div className="month-selector-row">
                <span className="filter-label" id="month-selector-label">Select Month</span>
                <div className="month-tabs" role="tablist" aria-labelledby="month-selector-label">
                    {monthly.map((m) => (
                        <button
                            key={m.month}
                            role="tab"
                            aria-selected={activeMonth === m.month}
                            className={`month-tab ${activeMonth === m.month ? 'active' : ''}`}
                            onClick={() => handleSelect(m.month)}
                            aria-label={`View data for ${fmtMonth(m.month)}`}
                        >
                            {fmtMonth(m.month)}
                        </button>
                    ))}
                </div>
            </div>

            {current && (
                <div
                    className="monthly-metrics"
                    role="region"
                    aria-label={`Metrics for ${fmtMonth(activeMonth)}`}
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

            <div
                className="chart-container"
                role="img"
                aria-label="Chart showing monthly spend vs revenue"
            >
                <div className="chart-header">
                    <div className="chart-title-group">
                        <h3 className="chart-title">Spend vs Revenue Trends</h3>
                        <span className="chart-label">Visualize month-over-month growth</span>
                    </div>
                    <div className="chart-type-selector">
                        <button
                            className={`type-btn ${chartType === 'bar' ? 'active' : ''}`}
                            onClick={() => setChartType('bar')}
                            title="Bar Chart"
                        >
                            <BarChart3 size={18} />
                            <span>Bar</span>
                        </button>
                        <button
                            className={`type-btn ${chartType === 'line' ? 'active' : ''}`}
                            onClick={() => setChartType('line')}
                            title="Line Chart"
                        >
                            <LineChart size={18} />
                            <span>Line</span>
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, position: 'relative', minHeight: 280 }}>
                    {chartType === 'bar' ? (
                        <Bar
                            key={`bar-chart`}
                            data={chartData}
                            options={chartOptions}
                            aria-hidden="true"
                        />
                    ) : (
                        <Line
                            key={`line-chart`}
                            data={chartData}
                            options={chartOptions}
                            aria-hidden="true"
                        />
                    )}
                </div>
            </div>
        </section>
    )
}
