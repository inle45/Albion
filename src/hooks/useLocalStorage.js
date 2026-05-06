import { useEffect, useRef, useState } from 'react'

const PREFIX = 'albion-dashboard:'

export function useLocalStorage(key, initialValue) {
  const storageKey = PREFIX + key
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw == null) return initialValue
      return JSON.parse(raw)
    } catch {
      return initialValue
    }
  })

  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      /* quota or serialization issue — drop silently */
    }
  }, [storageKey, value])

  return [value, setValue]
}
