import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
  delay?: number
}

export default function ChartCard({ title, children, action, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 shadow-card mb-6"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{title}</h2>
        {action}
      </div>
      <div className="w-full overflow-x-auto">
        {children}
      </div>
    </motion.div>
  )
}
