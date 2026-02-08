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
    if (!trend) return 'text-neutral-gray/70'
    if (trend === 'up') return 'text-green-400'
    if (trend === 'down') return 'text-red-400'
    return 'text-neutral-gray/70'
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
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-carbon-black" />
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {getChangeDisplay()}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-neutral-gray/70 text-sm">{title}</p>
      {subtitle && (
        <p className="text-xs text-neutral-gray/50 mt-1">{subtitle}</p>
      )}
    </motion.div>
  )
}
