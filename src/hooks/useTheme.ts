import { useCallback, useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const listeners = new Set<() => void>()

let currentTheme: Theme = (() => {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage may be unavailable
  }
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
})()

function applyTheme(t: Theme) {
  currentTheme = t
  try {
    localStorage.setItem('theme', t)
  } catch {
    // localStorage may be unavailable
  }
  document.documentElement.classList.toggle('dark', t === 'dark')
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): Theme {
  return currentTheme
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light' as Theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')
  }, [])

  const toggleTheme = useCallback(() => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggleTheme }
}
