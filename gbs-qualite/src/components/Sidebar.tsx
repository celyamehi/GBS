'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Headphones, 
  Trophy, 
  CalendarCheck, 
  MessageSquare, 
  BarChart3,
  Sparkles,
  PieChart
} from 'lucide-react'

const navItems = [
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/ecoutes', label: 'Écoutes / RDV', icon: Headphones },
  { href: '/analyse', label: 'Analyse', icon: PieChart },
  { href: '/classement', label: 'Classement', icon: Trophy },
  { href: '/suivi-rdv', label: 'Suivi RDV', icon: CalendarCheck },
  { href: '/briefings', label: 'Briefings IA', icon: MessageSquare },
  { href: '/statistiques', label: 'Statistiques', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#e8e8e8] flex flex-col">
      <div className="p-6 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#1a1a2e]">GBS Qualité</h1>
            <p className="text-xs text-[#6b7280]">Centre d'appel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <p className="section-title px-3 mb-3">Navigation</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#e8e8e8]">
        <div className="bg-[#ede9fe] rounded-xl p-4">
          <p className="text-sm font-medium text-[#7c3aed]">GBS Conseil</p>
          <p className="text-xs text-[#6b7280] mt-1">Application Qualité v1.0</p>
        </div>
      </div>
    </aside>
  )
}
