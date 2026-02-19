import { useState, useEffect, useRef, useCallback } from 'react'

export function useScrollSpy(sectionIds, scrollerId, offset = 120) {
    const [activeId, setActiveId] = useState(sectionIds[0])
    const isProgrammaticRef = useRef(false)
    const timerRef = useRef(null)

    useEffect(() => {
        const container = document.getElementById(scrollerId)
        const scrollTarget = container || window

        function onScroll() {
            if (isProgrammaticRef.current) return

            let current = sectionIds[0]

            for (let i = 0; i < sectionIds.length; i++) {
                const el = document.getElementById(sectionIds[i])
                if (!el) continue

                const rect = el.getBoundingClientRect()
                const refTop = container
                    ? container.getBoundingClientRect().top
                    : 0
                const relativeTop = rect.top - refTop

                if (relativeTop <= offset) {
                    current = sectionIds[i]
                }
            }

            setActiveId(current)
        }

        scrollTarget.addEventListener('scroll', onScroll, { passive: true })

        if (container) {
            window.addEventListener('scroll', onScroll, { passive: true })
        }

        onScroll()

        return () => {
            scrollTarget.removeEventListener('scroll', onScroll)
            if (container) {
                window.removeEventListener('scroll', onScroll)
            }
        }
    }, [])

    const scrollToSection = useCallback((id) => {
        const container = document.getElementById(scrollerId)
        const el = document.getElementById(id)
        if (!el) return

        setActiveId(id)
        isProgrammaticRef.current = true
        if (timerRef.current) clearTimeout(timerRef.current)

        if (container) {
            const containerRect = container.getBoundingClientRect()
            const elRect = el.getBoundingClientRect()
            const scrollTarget = container.scrollTop + (elRect.top - containerRect.top) - offset

            container.scrollTo({ top: scrollTarget, behavior: 'smooth' })
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }

        timerRef.current = setTimeout(() => {
            isProgrammaticRef.current = false
        }, 800)
    }, [scrollerId, offset])

    return { activeId, scrollToSection }
}
