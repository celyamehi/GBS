'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function StatCard({ label, value, icon, color = '#ede9fe', trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
