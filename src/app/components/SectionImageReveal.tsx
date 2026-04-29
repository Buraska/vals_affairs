'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type SectionRevealValue = {
  revealed: boolean
  reportLoaded: () => void
}

const DEFAULT_VALUE: SectionRevealValue = {
  revealed: true,
  reportLoaded: () => {},
}

const SectionRevealContext = createContext<SectionRevealValue>(DEFAULT_VALUE)

/**
 * Descendant images subscribe to know when the whole section is ready and to
 * report their own load/error. Outside of a provider this returns
 * `{ revealed: true, reportLoaded: noop }` so SmartImage still works.
 */
export function useRegisterImage(): SectionRevealValue {
  return useContext(SectionRevealContext)
}

type Props = {
  count: number
  timeoutMs?: number
  className?: string
  children: ReactNode
}

/**
 * Coordinates a batch of images: page layout renders immediately (text, card
 * chrome), while each child SmartImage shows its own skeleton and stays
 * invisible until every image in the section has loaded — or a safety
 * timeout fires. Then all images in the section fade in together.
 */
export default function SectionImageReveal({
  count,
  timeoutMs = 0,
  className,
  children,
}: Props) {
  const [loaded, setLoaded] = useState(0)
  const [revealed, setRevealed] = useState(count <= 0)
  const countRef = useRef(count)

  useEffect(() => {
    countRef.current = count
    if (count <= 0) {
      setRevealed(true)
      return
    }
    setRevealed(false)
    setLoaded(0)
  }, [count])

  useEffect(() => {
    if (revealed) return
    if (loaded >= countRef.current) setRevealed(true)
  }, [loaded, revealed])

  useEffect(() => {
    if (revealed || count <= 0) return
    const id = window.setTimeout(() => setRevealed(true), timeoutMs)
    return () => window.clearTimeout(id)
  }, [revealed, count, timeoutMs])

  const reportLoaded = useCallback(() => {
    setLoaded((prev) => prev + 1)
  }, [])

  const value = useMemo<SectionRevealValue>(
    () => ({ revealed, reportLoaded }),
    [revealed, reportLoaded],
  )

  return (
    <SectionRevealContext.Provider value={value}>
      {className ? <div className={className}>{children}</div> : children}
    </SectionRevealContext.Provider>
  )
}
