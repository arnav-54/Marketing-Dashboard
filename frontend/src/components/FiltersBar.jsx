import { Filter, X, ArrowUp, ArrowDown } from 'lucide-react'

export default function FiltersBar({
    channels,
    selectedChannel,
    onChannelChange,
    minRoas,
    maxRoas,
    onMinRoas,
    onMaxRoas,
    sortBy,
    onSortBy,
    order,
    onOrderChange,
    onApply,
    onReset,
    isLoading,
}) {
    return (
        <div className="filters-bar">
            <div className="filters-bar-inner">
                <div className="filter-group">
                    <Filter size={15} className="filter-bar-icon" />
                    <span className="filter-bar-label">Filters</span>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Channel</label>
                    <select
                        className="filter-select"
                        value={selectedChannel}
                        onChange={(e) => onChannelChange(e.target.value)}
                        style={{ width: '150px' }}
                    >
                        <option value="">All Channels</option>
                        {channels.map((ch) => (
                            <option key={ch} value={ch}>{ch}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">ROAS Min</label>
                    <input
                        type="number"
                        className="filter-input"
                        placeholder=""
                        value={minRoas}
                        min={0}
                        step={0.1}
                        onChange={(e) => onMinRoas(e.target.value)}
                        style={{ width: '100px' }}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-label">ROAS Max</label>
                    <input
                        type="number"
                        className="filter-input"
                        placeholder=""
                        value={maxRoas}
                        min={0}
                        step={0.1}
                        onChange={(e) => onMaxRoas(e.target.value)}
                        style={{ width: '100px' }}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-label">Sort Channels By</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => onSortBy(e.target.value)}
                            style={{ width: '130px' }}
                        >
                            <option value="roas">ROAS</option>
                            <option value="total_spend">Spend</option>
                            <option value="total_revenue">Revenue</option>
                            <option value="total_conversions">Conversions</option>
                            <option value="cpa">CPA</option>
                            <option value="cpc">CPC</option>
                        </select>
                        <button
                            className="btn-order-toggle"
                            onClick={() => onOrderChange(order === 'desc' ? 'asc' : 'desc')}
                            title={`Toggle Sort Order (Currently ${order === 'desc' ? 'Descending' : 'Ascending'})`}
                            aria-label="Toggle sort order"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f9fafb',
                                border: '1px solid var(--border-light)',
                                borderRadius: '8px',
                                width: '40px',
                                height: '42px',
                                cursor: 'pointer',
                                color: order === 'desc' ? 'var(--primary-purple)' : 'var(--text-secondary)',
                                flexShrink: 0,
                            }}
                        >
                            {order === 'desc' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                        </button>
                    </div>
                </div>

                <div className="filter-actions">
                    <button
                        className="btn-apply"
                        onClick={onApply}
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? 'Applying...' : 'Apply Filters'}
                    </button>
                    <button className="btn-reset" onClick={(e) => { e.stopPropagation(); onReset(); }}>
                        <X size={14} /> Reset
                    </button>
                </div>
            </div>
        </div>
    )
}
