import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const INR = (val) =>
    val != null ? '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0'

const roasClass = (r) => {
    const v = parseFloat(r)
    if (v >= 4.0) return 'roas-green'
    if (v >= 2.0) return 'roas-yellow'
    return 'roas-red'
}

const COLS = [
    { key: 'name', label: 'Channel' },
    { key: 'total_spend', label: 'Spend (₹)' },
    { key: 'total_revenue', label: 'Revenue (₹)' },
    { key: 'total_conversions', label: 'Conversions' },
    { key: 'roas', label: 'ROAS' },
    { key: 'cpa', label: 'CPA (₹)' },
    { key: 'cpc', label: 'CPC (₹)' },
]

function SortIcon({ col, sortBy, order }) {
    if (sortBy !== col) return <ChevronsUpDown size={14} className="sort-icon muted" aria-hidden="true" />
    return order === 'asc'
        ? <ChevronUp size={14} className="sort-icon active" aria-hidden="true" />
        : <ChevronDown size={14} className="sort-icon active" aria-hidden="true" />
}

export default function ChannelTable({ channels, sortBy, order, onSort }) {
    if (!channels || channels.length === 0) {
        return <p className="empty-state">No channel data available.</p>
    }

    return (
        <div className="table-card">
            <div className="table-scroll" role="region" aria-label="Channel performance table" tabIndex={0}>
                <table className="data-table" aria-label="Channel performance sorted by various metrics">
                    <thead>
                        <tr>
                            {COLS.map((c) => (
                                <th
                                    key={c.key}
                                    onClick={() => onSort(c.key)}
                                    className={`sortable-th ${sortBy === c.key ? 'active-th' : ''}`}
                                    aria-sort={sortBy === c.key ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    title={`Sort by ${c.label}`}
                                    scope="col"
                                >
                                    <span className="th-inner">
                                        {c.label}
                                        <SortIcon col={c.key} sortBy={sortBy} order={order} />
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {channels.map((ch, i) => (
                            <tr key={ch.name || i} className="data-row">
                                <td className={`td-name ${sortBy === 'name' ? 'sorted-col' : ''}`}>{ch.name}</td>
                                <td className={sortBy === 'total_spend' ? 'sorted-col' : ''}>{INR(ch.total_spend)}</td>
                                <td className={`td-bold ${sortBy === 'total_revenue' ? 'sorted-col' : ''}`}>{INR(ch.total_revenue)}</td>
                                <td className={sortBy === 'total_conversions' ? 'sorted-col' : ''}>{Number(ch.total_conversions).toLocaleString('en-IN')}</td>
                                <td className={sortBy === 'roas' ? 'sorted-col' : ''}>
                                    <span className={`roas-pill ${roasClass(ch.roas)}`}>
                                        {parseFloat(ch.roas).toFixed(2)}x
                                    </span>
                                </td>
                                <td className={sortBy === 'cpa' ? 'sorted-col' : ''}>{INR(ch.cpa)}</td>
                                <td className={sortBy === 'cpc' ? 'sorted-col' : ''}>{INR(ch.cpc)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
