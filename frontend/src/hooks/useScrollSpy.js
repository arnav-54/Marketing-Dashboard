import { useState, useEffect, useRef } from 'react'

/**
 * useScrollSpy
 *
 * Tracks which section is currently visible inside a scrollable container
 * and provides a scrollToSection() helper.
 *
 * @param {string[]} sectionIds  - Array of section element IDs to observe
 * @param {string}   scrollerId  - ID of the scrollable container element
 * @param {number}   offset      - px from container top before a section activates
 */
export function useScrollSpy(sectionIds, scrollerId, offset = 100) {
    const [activeId, setActiveId] = useState(sectionIds[0])
    const isProgrammaticRef = useRef(false)
    const timerRef = useRef(null)

    useEffect(() => {
        const container = document.getElementById(scrollerId)
        if (!container) return

        const handleScroll = () => {
            if (isProgrammaticRef.current) return

            // Walk sections bottom-up; the last one whose top is above the threshold wins
            let current = sectionIds[0]
            for (const id of sectionIds) {
                const el = document.getElementById(id)
                if (!el) continue
                // getBoundingClientRect is relative to the viewport.
                // We compare against the container's top edge + offset.
                const containerTop = container.getBoundingClientRect().top
                const elTop = el.getBoundingClientRect().top - containerTop
                if (elTop <= offset) {
                    current = id
                }
            }
            setActiveId(current)
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        // Run once on mount so the initial active state is correct
        handleScroll()

        return () => container.removeEventListener('scroll', handleScroll)
    }, [sectionIds, scrollerId, offset])

    const scrollToSection = (id) => {
        const container = document.getElementById(scrollerId)
        const el = document.getElementById(id)
        if (!container || !el) return

        // Immediately update active state so the sidebar feels responsive
        setActiveId(id)

        // Suppress the scroll spy while the animation plays
        isProgrammaticRef.current = true
        if (timerRef.current) clearTimeout(timerRef.current)

        // Calculate the target scroll position inside the container
        const containerRect = container.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - offset

        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' })

        // Re-enable spy after the smooth scroll animation finishes (~700ms)
        timerRef.current = setTimeout(() => {
            isProgrammaticRef.current = false
        }, 700)
    }

    return { activeId, scrollToSection }
}
