import { useEffect } from 'react'
import { AlertCircle, X, CheckCircle, Info } from 'lucide-react'

/**
 * Toast notification — auto-dismisses after `duration` ms.
 * Props: message, type ('error'|'success'|'info'), onClose
 */
export function Toast({ message, type = 'error', onClose, duration = 5000 }) {
    useEffect(() => {
        if (!message) return
        const t = setTimeout(onClose, duration)
        return () => clearTimeout(t)
    }, [message, duration, onClose])

    if (!message) return null

    const icons = {
        error: <AlertCircle size={18} aria-hidden="true" />,
        success: <CheckCircle size={18} aria-hidden="true" />,
        info: <Info size={18} aria-hidden="true" />,
    }

    return (
        <div
            className={`toast toast-${type}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-msg">{message}</span>
            <button
                className="toast-close"
                onClick={onClose}
                aria-label="Dismiss notification"
            >
                <X size={16} />
            </button>
        </div>
    )
}

/**
 * SkeletonCard — animated placeholder while data loads.
 * Props: height (px string, default '80px'), width ('100%')
 */
export function SkeletonCard({ height = '80px', width = '100%', radius = '16px' }) {
    return (
        <div
            className="skeleton"
            style={{ height, width, borderRadius: radius }}
            aria-hidden="true"
            role="presentation"
        />
    )
}

/**
 * SkeletonHeroGrid — 6 placeholder KPI cards
 */
export function SkeletonHeroGrid() {
    return (
        <div className="hero-grid" aria-busy="true" aria-label="Loading summary data">
            {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} height="130px" radius="20px" />
            ))}
        </div>
    )
}

/**
 * SkeletonTable — placeholder rows for a table
 */
export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="skeleton-table" aria-busy="true" aria-label="Loading table data">
            <SkeletonCard height="44px" radius="8px" />
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonCard key={i} height="52px" radius="8px" />
            ))}
        </div>
    )
}

/**
 * SkeletonCards — placeholder campaign/insight cards
 */
export function SkeletonCards({ count = 4 }) {
    return (
        <div className="campaign-cards-grid" aria-busy="true" aria-label="Loading cards">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} height="120px" radius="12px" />
            ))}
        </div>
    )
}
