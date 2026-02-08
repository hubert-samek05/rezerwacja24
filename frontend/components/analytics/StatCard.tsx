import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  delay?: number
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  delay = 0,
  trend,
  subtitle
}: StatCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-[var(--text-muted)]'
    if (trend === 'up') return 'text-emerald-500'
    if (trend === 'down') return 'text-red-500'
    return 'text-[var(--text-muted)]'
  }

  const getChangeDisplay = () => {
    if (change === undefined) return null
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 shadow-card hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-primary)]" />
        </div>
        {change !== undefined && (
          <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 
            trend === 'down' ? 'bg-red-500/10 text-red-500' : 
            'bg-[var(--bg-card-hover)] text-[var(--text-muted)]'
          }`}>
            {getChangeDisplay()}
          </span>
        )}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</h3>
      <p className="text-[var(--text-muted)] text-sm">{title}</p>
      {subtitle && (
        <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
      )}
    </motion.div>
  )
}
