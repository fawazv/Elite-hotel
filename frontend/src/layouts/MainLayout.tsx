// layouts/MainLayout.tsx
import React, { useEffect, useRef, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header/Header'
import Footer from '../components/layout/Footer/Footer'

interface MainLayoutContext {
  addToRefs: (el: HTMLDivElement | null) => void
}

interface MainLayoutProps {
  enableSnapScrolling?: boolean
}

const MainLayout: React.FC<MainLayoutProps> = ({
  enableSnapScrolling = false,
}) => {
  const sections = useRef<HTMLElement[]>([])
  const isScrollingRef = useRef(false)

  const handleScroll = useCallback(
    (event: WheelEvent) => {
      if (!enableSnapScrolling) return

      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      // Allow normal scrolling if we're at the bottom
      if (scrollTop + viewportHeight >= documentHeight - 10) {
        return
      }

      // Find current section
      const currentSectionIndex = sections.current.findIndex((section) => {
        if (!section) return false
        const rect = section.getBoundingClientRect()
        return rect.top >= -viewportHeight / 2 && rect.top <= viewportHeight / 2
      })

      // If we're at the last section and scrolling down, allow normal scrolling
      if (
        currentSectionIndex === sections.current.length - 1 &&
        event.deltaY > 0
      ) {
        return
      }

      // Otherwise, use snap scrolling
      event.preventDefault()

      if (isScrollingRef.current) return
      isScrollingRef.current = true

      const direction = event.deltaY > 0 ? 1 : -1

      const nextIndex = Math.min(
        Math.max(0, currentSectionIndex + direction),
        sections.current.length - 1
      )

      if (sections.current[nextIndex]) {
        sections.current[nextIndex].scrollIntoView({ behavior: 'smooth' })
      }

      setTimeout(() => {
        isScrollingRef.current = false
      }, 800)
    },
    [enableSnapScrolling]
  )

  useEffect(() => {
    if (!enableSnapScrolling) return

    const wheelHandler = (e: WheelEvent) => handleScroll(e)
    window.addEventListener('wheel', wheelHandler, { passive: false })

    return () => window.removeEventListener('wheel', wheelHandler)
  }, [handleScroll, enableSnapScrolling])

  const addToRefs = useCallback((el: HTMLDivElement | null) => {
    if (el && !sections.current.includes(el)) {
      sections.current.push(el)
    }
  }, [])

  const contextValue: MainLayoutContext = {
    addToRefs,
  }

  return (
    <div className="min-h-screen bg-white transition-colors duration-300">
      <Header />
      <main>
        <Outlet context={contextValue} />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
