'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export function NavigationOverlay() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const prevPathRef = useRef(pathname)
  const isInitialMount = useRef(true)



  // When pathname changes, navigation is done — hide overlay
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevPathRef.current = pathname
      return
    }
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname
      setIsNavigating(false)
    }
  }, [pathname])

  // On same-origin link click or back/forward: show overlay
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a')
      if (!target?.href) return
      try {
        const url = new URL(target.href)
        if (url.origin !== window.location.origin) return
        if (target.target === '_blank' || target.hasAttribute('download')) return
        if (url.pathname === pathname && url.search === window.location.search) return
        setIsNavigating(true)
      } catch {
        // ignore invalid URLs
      }
    }

    const handlePopState = () => {
      setIsNavigating(true)
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname])

  if (!isNavigating) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--cream)]/80 backdrop-blur-[2px]"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--rust)] animate-spin"
          aria-hidden
        />
        <span className="text-sm font-medium text-[var(--muted)]">
          Loading…
        </span>
      </div>
    </div>
  )
}
