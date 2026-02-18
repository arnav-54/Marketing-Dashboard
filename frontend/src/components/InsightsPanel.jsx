import { Lightbulb, TrendingUp, AlertCircle, Info } from 'lucide-react'

const ICONS = [
    <TrendingUp size={18} />,
    <Lightbulb size={18} />,
    <AlertCircle size={18} />,
    <Info size={18} />,
]
const COLORS = ['insight-purple', 'insight-green', 'insight-orange', 'insight-blue']

export default function InsightsPanel({ insights }) {
    if (!insights || insights.length === 0) return null

    return (
        <section id="section-insights" className="dashboard-section">
            <div className="section-heading">
                <h2 className="section-title">Insights &amp; Recommendations</h2>
                <p className="section-desc">AI-generated analysis based on your marketing data</p>
            </div>
            <div className="insights-grid">
                {insights.map((text, i) => (
                    <div key={i} className={`insight-card ${COLORS[i % COLORS.length]}`}>
                        <div className={`insight-icon insight-icon-${COLORS[i % COLORS.length].split('-')[1]}`}>
                            {ICONS[i % ICONS.length]}
                        </div>
                        <div>
                            <p className="insight-body">{text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
