'use client'

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Pobierz zapisany motyw lub użyj domyślnego jasnego
    const savedTheme = localStorage.getItem('rezerwacja24_theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      // Domyślnie jasny motyw
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('rezerwacja24_theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('rezerwacja24_theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return { theme, toggleTheme, setSpecificTheme, mounted }
}
