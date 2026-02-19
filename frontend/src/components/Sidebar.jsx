import { useState } from 'react'
import {
    LayoutGrid, Globe, CalendarDays, TrendingUp,
    Lightbulb, Settings, Sparkles, ChevronRight, ChevronLeft, X, LogOut, PanelLeftClose, PanelLeftOpen
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
    const { user, logout } = useAuth()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const getInitials = (name) => {
        if (!name) return '??'
        const parts = name.split(' ')
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
        return name.slice(0, 2).toUpperCase()
    }

    const userName = user?.name || 'Guest User'

    return (
        <aside
            id="sidebar-nav"
            className={`sidebar${isOpen ? ' sidebar--open' : ''}${isCollapsed ? ' sidebar--collapsed' : ''}`}
            role="navigation"
            aria-label="Dashboard navigation"
        >
            <div className="logo-area">
                <div className="logo-main">
                    <img src="/logo.png" alt="MarketingOS Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    <span className="logo-text">MarketingOS</span>
                </div>

                <button
                    className="sidebar-collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>

                <button
                    className="sidebar-close-btn"
                    onClick={onClose}
                    aria-label="Close navigation menu"
                >
                    <X size={20} />
                </button>
            </div>

            <nav aria-label="Main sections">
                <ul className="nav-section" role="list">
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                        const isActive = activeId === id || (activeId === 'section-simulator' && id === 'section-monthly')
                        return (
                            <li key={id} role="listitem">
                                <button
                                    id={`nav-${id}`}
                                    className={`nav-item${isActive ? ' active' : ''}`}
                                    onClick={() => onNavClick(id)}
                                    aria-current={isActive ? 'page' : undefined}
                                    aria-label={`Navigate to ${label} section`}
                                    title={isCollapsed ? label : undefined}
                                >
                                    <span className="nav-item-content">
                                        <Icon size={20} aria-hidden="true" />
                                        <span className="nav-label">{label}</span>
                                    </span>
                                    {!isCollapsed && <ChevronRight
                                        size={16}
                                        className="nav-chevron"
                                        aria-hidden="true"
                                        style={{ opacity: isActive ? 1 : 0.35 }}
                                    />}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user-container">
                    <div className="sidebar-user" aria-label={`Logged in as ${userName}`}>
                        <div className="sidebar-avatar" aria-hidden="true">{getInitials(userName.replace(/ Member$/i, ''))}</div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{userName.replace(/ Member$/i, '')}</span>
                        </div>
                    </div>
                    {!isCollapsed && (
                        <button className="sidebar-logout-btn" onClick={logout} title="Log Out" aria-label="Log Out">
                            <LogOut size={18} />
                        </button>
                    )}
                    {isCollapsed && (
                        <button className="sidebar-logout-btn collapsed" onClick={logout} title="Log Out" aria-label="Log Out" style={{ marginLeft: 'auto' }}>
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    )
}
