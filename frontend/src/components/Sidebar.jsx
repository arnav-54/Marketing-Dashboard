import {
    LayoutGrid, Globe, CalendarDays, TrendingUp,
    Lightbulb, Settings, Sparkles, ChevronRight, X,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

export const NAV_ITEMS = [
    { id: 'section-overview', label: 'Overview', icon: LayoutGrid },
    { id: 'section-channels', label: 'Channels', icon: Globe },
    { id: 'section-monthly', label: 'Monthly', icon: CalendarDays },
    { id: 'section-campaigns', label: 'Campaigns', icon: TrendingUp },
    { id: 'section-insights', label: 'Insights', icon: Lightbulb },
]

export default function Sidebar({ activeId, onNavClick, isOpen, onClose }) {
    const { user } = useAuth()

    // Get initials from user name
    const getInitials = (name) => {
        if (!name) return '??'
        const parts = name.split(' ')
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
        return name.slice(0, 2).toUpperCase()
    }

    const userName = user?.name || 'Guest User'
    const userRole = user?.email === 'admin@marketingos.com' ? 'Admin' : 'Member'

    return (
        <aside
            id="sidebar-nav"
            className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
            role="navigation"
            aria-label="Dashboard navigation"
        >
            {/* Logo */}
            <div className="logo-area">
                <div className="logo-main">
                    <div className="logo-icon" aria-hidden="true"><Sparkles size={20} /></div>
                    <span className="logo-text">MarketingOS</span>
                </div>
                {/* Mobile Close Button */}
                <button
                    className="sidebar-close-btn"
                    onClick={onClose}
                    aria-label="Close navigation menu"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
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

            {/* User Profile */}
            <div className="sidebar-footer">
                <div className="sidebar-user" aria-label={`Logged in as ${userName}`}>
                    <div className="sidebar-avatar" aria-hidden="true">{getInitials(userName)}</div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{userName}</span>
                        <span className="sidebar-user-role">{userRole}</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
