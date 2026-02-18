import {
    LayoutGrid, Globe, CalendarDays, TrendingUp,
    Lightbulb, Settings, Sparkles, ChevronRight, X,
} from 'lucide-react'

export const NAV_ITEMS = [
    { id: 'section-overview', label: 'Overview', icon: LayoutGrid },
    { id: 'section-channels', label: 'Channels', icon: Globe },
    { id: 'section-monthly', label: 'Monthly', icon: CalendarDays },
    { id: 'section-campaigns', label: 'Campaigns', icon: TrendingUp },
    { id: 'section-insights', label: 'Insights', icon: Lightbulb },
    { id: 'section-settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeId, onNavClick, isOpen, onClose }) {
    return (
        <aside
            id="sidebar-nav"
            className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
            role="navigation"
            aria-label="Dashboard navigation"
        >
            { }
            <div className="logo-area">
                <div className="logo-main">
                    <div className="logo-icon" aria-hidden="true"><Sparkles size={20} /></div>
                    <span className="logo-text">MarketingOS</span>
                </div>
                { }
                <button
                    className="sidebar-close-btn"
                    onClick={onClose}
                    aria-label="Close navigation menu"
                >
                    <X size={20} />
                </button>
            </div>

            { }
            <nav aria-label="Main sections">
                <ul className="nav-section" role="list">
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                        const isActive = activeId === id
                        return (
                            <li key={id} role="listitem">
                                <button
                                    id={`nav-${id}`}
                                    className={`nav-item${isActive ? ' active' : ''}`}
                                    onClick={() => onNavClick(id)}
                                    aria-current={isActive ? 'page' : undefined}
                                    aria-label={`Navigate to ${label} section`}
                                >
                                    <span className="nav-item-content">
                                        <Icon size={20} aria-hidden="true" />
                                        <span>{label}</span>
                                    </span>
                                    <ChevronRight
                                        size={16}
                                        className="nav-chevron"
                                        aria-hidden="true"
                                        style={{ opacity: isActive ? 1 : 0.35 }}
                                    />
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            { }
            <div className="sidebar-footer">
                <div className="sidebar-user" aria-label="Logged in as Arnav Kumar, Admin">
                    <div className="sidebar-avatar" aria-hidden="true">AK</div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">Arnav Kumar</span>
                        <span className="sidebar-user-role">Admin</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
