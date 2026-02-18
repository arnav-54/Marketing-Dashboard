import { useState, useEffect, useRef } from 'react'


export function useScrollSpy(sectionIds, scrollerId, offset = 100) {
    const [activeId, setActiveId] = useState(sectionIds[0])
    const isProgrammaticRef = useRef(false)
    const timerRef = useRef(null)

    useEffect(() => {
        const container = document.getElementById(scrollerId)
        if (!container) return

        const handleScroll = () => {
            if (isProgrammaticRef.current) return

            
            let current = sectionIds[0]
            for (const id of sectionIds) {
                const el = document.getElementById(id)
                if (!el) continue
                
                
                const containerTop = container.getBoundingClientRect().top
                const elTop = el.getBoundingClientRect().top - containerTop
                if (elTop <= offset) {
                    current = id
                }
            }
            setActiveId(current)
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        
        handleScroll()

        return () => container.removeEventListener('scroll', handleScroll)
    }, [sectionIds, scrollerId, offset])

    const scrollToSection = (id) => {
        const container = document.getElementById(scrollerId)
        const el = document.getElementById(id)
        if (!container || !el) return

        
        setActiveId(id)

        
        isProgrammaticRef.current = true
        if (timerRef.current) clearTimeout(timerRef.current)

        
        const containerRect = container.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - offset

        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' })

        
        timerRef.current = setTimeout(() => {
            isProgrammaticRef.current = false
        }, 700)
    }

    return { activeId, scrollToSection }
}
