'use client'

import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useDashboardTranslation, Language } from '@/hooks/useDashboardTranslation'

const languageNames: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  pl: 'Polski',
  fr: 'Français',
  it: 'Italiano',
  es: 'Español',
  nl: 'Nederlands',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hr: 'Hrvatski',
}

const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  pl: '🇵🇱',
  fr: '🇫🇷',
  it: '🇮🇹',
  es: '🇪🇸',
  nl: '🇳🇱',
  cs: '🇨🇿',
  sk: '🇸🇰',
  hr: '🇭🇷',
}

export default function DashboardLanguageSwitcher() {
  const { language, setLanguage, availableLanguages, isEuRegion, isClient } = useDashboardTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // Nie pokazuj przełącznika dla regionu PL (tylko polski)
  if (!isClient || !isEuRegion) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-muted)]"
        title="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">{languageFlags[language]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 overflow-hidden">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  language === lang
                    ? 'bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <span>{languageFlags[lang]}</span>
                <span>{languageNames[lang]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
