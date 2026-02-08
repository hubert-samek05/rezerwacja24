'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  X,
  Check,
  ChevronRight,
  Building2,
  Scissors,
  Users,
  Clock,
  Palette,
  Sparkles,
  ArrowRight,
  CircleDot,
} from 'lucide-react'
import { useProfileSetup } from '@/hooks/useProfileSetup'

interface ProfileSetupWizardProps {
  onClose?: () => void
  variant?: 'modal' | 'inline' | 'banner'
}

const stepIcons = {
  company_data: Building2,
  services: Scissors,
  employees: Users,
  working_hours: Clock,
  branding: Palette,
}

export default function ProfileSetupWizard({ 
  onClose, 
  variant = 'modal' 
}: ProfileSetupWizardProps) {
  const { 
    steps, 
    completedCount, 
    totalCount, 
    percentage, 
    isComplete,
    currentStep,
    dismissWizard,
    isLoading 
  } = useProfileSetup()

  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (isComplete && !isLoading) {
      setShowCelebration(true)
      const timer = setTimeout(() => {
        dismissWizard()
        onClose?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, isLoading, dismissWizard, onClose])

  const handleDismiss = () => {
    dismissWizard()
    onClose?.()
  }

  if (isLoading) return null

  // Wersja banner - kompaktowa na górze dashboardu
  if (variant === 'banner') {
    if (isComplete) return null
    
    return (
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Dokończ konfigurację profilu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{completedCount}/{totalCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {steps.filter(s => !s.completed)[0] && (
                <Link
                  href={steps.filter(s => !s.completed)[0].href}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-teal-700 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  <span className="hidden sm:inline">Następny krok:</span>
                  <span>{steps.filter(s => !s.completed)[0].title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Wersja inline - karta na dashboardzie
  if (variant === 'inline') {
    if (isComplete) return null

    return (
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-500" />
              <h2 className="font-semibold text-[var(--text-primary)]">
                Skonfiguruj swój profil
              </h2>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Wykonaj poniższe kroki, aby Twój profil był gotowy do przyjmowania rezerwacji
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {steps.map((step, index) => {
            const Icon = stepIcons[step.id as keyof typeof stepIcons] || CircleDot
            const isCurrentStep = index === currentStep

            return (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  step.completed 
                    ? 'bg-teal-500/5' 
                    : isCurrentStep 
                      ? 'bg-[var(--bg-card-hover)]' 
                      : 'hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.completed 
                    ? 'bg-teal-500 text-white' 
                    : isCurrentStep
                      ? 'bg-teal-500/20 text-teal-500 ring-2 ring-teal-500'
                      : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)]'
                }`}>
                  {step.completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${
                    step.completed 
                      ? 'text-teal-600 line-through' 
                      : 'text-[var(--text-primary)]'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] truncate">
                    {step.description}
                  </p>
                </div>
                {!step.completed && (
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Wersja modal - pełnoekranowy wizard
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden"
        >
          {/* Celebration overlay */}
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-emerald-600 text-white p-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <Check className="w-10 h-10" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Gratulacje! 🎉</h2>
              <p className="text-center text-white/80">
                Twój profil jest w pełni skonfigurowany i gotowy do przyjmowania rezerwacji!
              </p>
            </motion.div>
          )}

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Witaj w Rezerwacja24!
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Skonfiguruj profil w kilku prostych krokach
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--text-muted)]">Postęp konfiguracji</span>
              <span className="font-medium text-[var(--text-primary)]">{completedCount} z {totalCount}</span>
            </div>
            <div className="h-2 bg-[var(--bg-card-hover)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 pb-6 space-y-2">
            {steps.map((step, index) => {
              const Icon = stepIcons[step.id as keyof typeof stepIcons] || CircleDot
              const isCurrentStep = index === currentStep

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={step.href}
                    onClick={handleDismiss}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      step.completed 
                        ? 'bg-teal-500/10' 
                        : isCurrentStep
                          ? 'bg-[var(--bg-card-hover)] ring-2 ring-teal-500'
                          : 'hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      step.completed 
                        ? 'bg-teal-500 text-white' 
                        : isCurrentStep
                          ? 'bg-teal-500/20 text-teal-500'
                          : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)]'
                    }`}>
                      {step.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${
                        step.completed 
                          ? 'text-teal-600' 
                          : 'text-[var(--text-primary)]'
                      }`}>
                        {step.title}
                        {step.completed && ' ✓'}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {step.description}
                      </p>
                    </div>
                    {!step.completed && isCurrentStep && (
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-medium">
                        <span>Rozpocznij</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                    {!step.completed && !isCurrentStep && (
                      <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[var(--bg-card-hover)] border-t border-[var(--border-color)]">
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Pomiń na razie — przypomnij później
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
