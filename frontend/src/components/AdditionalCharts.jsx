import { Bar, Scatter } from 'react-chartjs-2'
import { BarChart, ScatterChart, DollarSign, TrendingUp, Users } from 'lucide-react'

export default function AdditionalCharts({ channels }) {
    if (!channels || channels.length === 0) return null

    const roasData = {
        labels: channels.map(c => c.name),
        datasets: [
            {
                label: 'ROAS (Return on Ad Spend)',
                data: channels.map(c => c.roas),
                backgroundColor: channels.map(c => parseFloat(c.roas) >= 3 ? '#10b981' : parseFloat(c.roas) >= 2 ? '#f59e0b' : '#ef4444'),
                borderRadius: 4,
            }
        ]
    }

    const roasOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'ROAS (x)' }
            },
            x: {
                grid: { display: false }
            }
        }
    }

    const cpaData = {
        labels: channels.map(c => c.name),
        datasets: [
            {
                label: 'CPA (Cost Per Acquisition)',
                data: channels.map(c => c.cpa),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
                indexAxis: 'y',
            }
        ]
    }

    const cpaOptions = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                beginAtZero: true,
                title: { display: true, text: 'Cost per Acquisition (₹)' }
            },
            y: {
                grid: { display: false }
            }
        }
    }

    const scatterData = {
        datasets: [
            {
                label: 'Channel Efficiency',
                data: channels.map(c => ({
                    x: Number(c.total_spend),
                    y: Number(c.total_conversions),
                    channel: c.name
                })),
                backgroundColor: '#8b5cf6',
                pointRadius: 6,
                pointHoverRadius: 8,
            }
        ]
    }

    const scatterOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const raw = ctx.raw
                        const channelName = channels[ctx.dataIndex].name
                        return `${channelName}: Spend ₹${Number(raw.x).toLocaleString()} → ${Number(raw.y).toLocaleString()} Conv.`
                    }
                }
            },
            legend: { display: false }
        },
        scales: {
            x: {
                title: { display: true, text: 'Total Spend (₹)' },
                beginAtZero: true
            },
            y: {
                title: { display: true, text: 'Total Conversions' },
                beginAtZero: true
            }
        }
    }

    return (
        <section className="dashboard-section">
            <div className="section-heading">
                <h2 className="section-title">Deep Dive Analytics</h2>
                <p className="section-desc">Advanced performance metrics across channels</p>
            </div>

            <div className="charts-grid">

                <div className="chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>ROAS Efficiency</h3>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Bar data={roasData} options={roasOptions} />
                    </div>
                </div>

                <div className="chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                            <DollarSign size={20} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Cost Per Acquisition</h3>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Bar data={cpaData} options={cpaOptions} />
                    </div>
                </div>

                <div className="chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-card)', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '8px', background: '#f5f3ff', borderRadius: '8px', color: '#8b5cf6' }}>
                            <Users size={20} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Spend vs. Conversion Correlation</h3>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Scatter data={scatterData} options={scatterOptions} />
                    </div>
                </div>
            </div>
        </section>
    )
}
