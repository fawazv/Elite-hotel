// pages/home/Home.tsx
import React, { useEffect, useRef } from 'react'
import Header from '../../components/Header'

const Home: React.FC = () => {
  const sections = useRef<HTMLDivElement[]>([])
  const isScrollingRef = useRef<boolean>(false)

  const handleScroll = (event: WheelEvent): void => {
    if (isScrollingRef.current) return
    isScrollingRef.current = true

    const direction = event.deltaY > 0 ? 1 : -1
    const viewportHeight = window.innerHeight

    const currentSectionIndex = sections.current.findIndex((section) => {
      const rect = section.getBoundingClientRect()
      return rect.top >= -viewportHeight / 2 && rect.top <= viewportHeight / 2
    })

    const nextIndex = Math.min(
      Math.max(0, currentSectionIndex + direction),
      sections.current.length - 1
    )

    sections.current[nextIndex]?.scrollIntoView({ behavior: 'smooth' })

    setTimeout(() => {
      isScrollingRef.current = false
    }, 800)
  }

  useEffect(() => {
    window.addEventListener('wheel', handleScroll)
    return () => {
      window.removeEventListener('wheel', handleScroll)
    }
  }, [])

  const addToRefs = (el: HTMLDivElement | null): void => {
    if (el && !sections.current.includes(el)) {
      sections.current.push(el)
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div ref={addToRefs}>
        <Header />
        {/* <Hero /> */}
      </div>
    </div>
  )
}

export default Home
