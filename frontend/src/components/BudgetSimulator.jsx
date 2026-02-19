import { useState, useMemo, useEffect } from 'react'
import { TrendingUp, Calculator, RefreshCcw, DollarSign } from 'lucide-react'

const INR = (val) =>
    '₹' + Math.round(val).toLocaleString('en-IN')

export default function BudgetSimulator({ channels }) {

    const initialAllocations = useMemo(() => {
        return channels.map(ch => ({
            name: ch.name,
            spend: parseFloat(ch.total_spend),
            roas: parseFloat(ch.roas),
            originalSpend: parseFloat(ch.total_spend)
        }))
    }, [channels])

    const [allocations, setAllocations] = useState(initialAllocations)

    useEffect(() => {
        setAllocations(initialAllocations)
    }, [initialAllocations])

    const handleSpendChange = (name, newSpend) => {
        setAllocations(prev => prev.map(a =>
            a.name === name ? { ...a, spend: Math.max(0, parseFloat(newSpend)) } : a
        ))
    }

    const reset = () => setAllocations(initialAllocations)


    const originalTotalSpend = initialAllocations.reduce((sum, a) => sum + a.originalSpend, 0)
    const newTotalSpend = allocations.reduce((sum, a) => sum + a.spend, 0)

    const originalProjectedRevenue = initialAllocations.reduce((sum, a) => sum + (a.originalSpend * a.roas), 0)
    const newProjectedRevenue = allocations.reduce((sum, a) => sum + (a.spend * a.roas), 0)

    const originalROAS = originalProjectedRevenue / originalTotalSpend
    const newLineROAS = newProjectedRevenue / newTotalSpend

    const revenueDiff = newProjectedRevenue - originalProjectedRevenue
    const spendDiff = newTotalSpend - originalTotalSpend

    return (
        <section id="section-simulator" className="dashboard-section section-simulator">
            <div className="section-heading">
                <h2 className="section-title">Budget Reallocation Simulator</h2>
                <p className="section-desc">Adjust spend per channel to see projected impact on total revenue and ROAS.</p>
            </div>

            <div className="simulator-container">
                <div className="simulator-controls">
                    <div className="sim-header">
                        <div className="sim-header-title">
                            <Calculator size={18} />
                            <span>Adjust Daily/Monthly Spend</span>
                        </div>
                        <button className="btn-reset-sim" onClick={reset}>
                            <RefreshCcw size={14} /> Reset
                        </button>
                    </div>

                    <div className="sim-sliders">
                        {allocations.map(ch => (
                            <div key={ch.name} className="sim-row">
                                <div className="sim-row-info">
                                    <span className="sim-channel-name">{ch.name}</span>
                                    <span className="sim-channel-roas">Efficiency: {ch.roas.toFixed(2)}x</span>
                                </div>
                                <div className="sim-input-group">
                                    <input
                                        type="range"
                                        min="0"
                                        max={ch.originalSpend * 3}
                                        step={ch.originalSpend / 10}
                                        value={ch.spend}
                                        onChange={(e) => handleSpendChange(ch.name, e.target.value)}
                                        className="sim-slider"
                                    />
                                    <div className="sim-val-box">
                                        <span className="sim-currency">₹</span>
                                        <input
                                            type="number"
                                            value={Math.round(ch.spend)}
                                            onChange={(e) => handleSpendChange(ch.name, e.target.value)}
                                            className="sim-value-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="simulator-results">
                    <div className="sim-results-card">
                        <div className="sim-res-header">Projected Impact</div>

                        <div className="sim-impact-grid">
                            <div className="sim-impact-item">
                                <div className="sim-impact-label">Total Spend Change</div>
                                <div className={`sim-impact-val ${spendDiff > 0 ? 'pos' : spendDiff < 0 ? 'neg' : ''}`}>
                                    {spendDiff > 0 ? '+' : ''}{INR(spendDiff)}
                                </div>
                                <div className="sim-impact-total">Total: {INR(newTotalSpend)}</div>
                            </div>

                            <div className="sim-impact-item">
                                <div className="sim-impact-label">Projected Revenue Change</div>
                                <div className={`sim-impact-val ${revenueDiff > 0 ? 'rev-pos' : revenueDiff < 0 ? 'neg' : ''}`}>
                                    {revenueDiff > 0 ? '+' : ''}{INR(revenueDiff)}
                                </div>
                                <div className="sim-impact-total">Total: {INR(newProjectedRevenue)}</div>
                            </div>
                        </div>

                        <div className="sim-roas-viz">
                            <div className="sim-roas-header">
                                <TrendingUp size={16} />
                                <span>Projected ROAS</span>
                            </div>
                            <div className="sim-roas-compare">
                                <div className="sim-roas-stat">
                                    <div className="sim-roas-label">Original</div>
                                    <div className="sim-roas-num">{originalROAS.toFixed(2)}x</div>
                                </div>
                                <div className="sim-roas-arrow">→</div>
                                <div className="sim-roas-stat">
                                    <div className="sim-roas-label">New</div>
                                    <div className={`sim-roas-num highlighted ${newLineROAS >= originalROAS ? 'pos' : 'neg'}`}>
                                        {newLineROAS.toFixed(2)}x
                                    </div>
                                </div>
                            </div>
                            {newLineROAS < originalROAS && (
                                <div className="sim-warning">
                                    ⚠️ Caution: Your overall ROAS is decreasing. Try allocating more budget to higher efficiency channels like Email or SEO.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
