'use client'

import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Users, Calendar, CheckCircle, XCircle } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { mockAgents, mockEcoutes, PROJETS } from '@/data/mockData'
import { Agent, Ecoute } from '@/lib/supabase'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function StatistiquesPage() {
  const [agents] = useLocalStorage<Agent[]>('gbs-agents', mockAgents)
  const [ecoutes] = useLocalStorage<Ecoute[]>('gbs-ecoutes', mockEcoutes)
  const [filterProjet, setFilterProjet] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const filteredEcoutes = useMemo(() => {
    return ecoutes.filter(ecoute => {
      const agent = agents.find(a => a.id === ecoute.agent_id)
      const matchesProjet = !filterProjet || agent?.projet === filterProjet
      const matchesDateDebut = !dateDebut || ecoute.date_rdv >= dateDebut
      const matchesDateFin = !dateFin || ecoute.date_rdv <= dateFin
      return matchesProjet && matchesDateDebut && matchesDateFin
    })
  }, [ecoutes, agents, filterProjet, dateDebut, dateFin])

  const globalStats = useMemo(() => {
    const total = filteredEcoutes.length
    const qualite = filteredEcoutes.filter(e => e.rdv_qualite).length
    const nonQualite = total - qualite
    const annules = filteredEcoutes.filter(e => e.statut_rdv === 'Annulé').length
    const honores = filteredEcoutes.filter(e => e.rdv_honore === true).length
    const nonHonores = filteredEcoutes.filter(e => e.rdv_honore === false).length

    return {
      total,
      qualite,
      nonQualite,
      tauxQualite: total > 0 ? (qualite / total) * 100 : 0,
      annules,
      honores,
      nonHonores,
      tauxHonore: (honores + nonHonores) > 0 ? (honores / (honores + nonHonores)) * 100 : 0
    }
  }, [filteredEcoutes])

  const agentStats = useMemo(() => {
    const activeAgents = agents.filter(a => {
      if (!a.actif) return false
      if (filterProjet && a.projet !== filterProjet) return false
      return true
    })

    return activeAgents.map(agent => {
      const agentEcoutes = filteredEcoutes.filter(e => e.agent_id === agent.id)
      const total = agentEcoutes.length
      const qualite = agentEcoutes.filter(e => e.rdv_qualite).length
      const honores = agentEcoutes.filter(e => e.rdv_honore === true).length
      const nonHonores = agentEcoutes.filter(e => e.rdv_honore === false).length
      const annules = agentEcoutes.filter(e => e.statut_rdv === 'Annulé').length
      const noteMoyenne = total > 0 
        ? agentEcoutes.reduce((sum, e) => sum + e.note_globale, 0) / total 
        : 0

      return {
        agent,
        total,
        qualite,
        nonQualite: total - qualite,
        tauxQualite: total > 0 ? (qualite / total) * 100 : 0,
        honores,
        nonHonores,
        tauxHonore: (honores + nonHonores) > 0 ? (honores / (honores + nonHonores)) * 100 : 0,
        annules,
        noteMoyenne
      }
    }).sort((a, b) => b.tauxQualite - a.tauxQualite)
  }, [agents, filteredEcoutes, filterProjet])

  const selectedAgentData = useMemo(() => {
    if (!selectedAgent) return null
    
    const agentEcoutes = filteredEcoutes.filter(e => e.agent_id === selectedAgent)
    
    const byMonth: Record<string, { qualite: number; total: number; honores: number; nonHonores: number }> = {}
    
    agentEcoutes.forEach(ecoute => {
      const month = ecoute.date_rdv.substring(0, 7)
      if (!byMonth[month]) {
        byMonth[month] = { qualite: 0, total: 0, honores: 0, nonHonores: 0 }
      }
      byMonth[month].total++
      if (ecoute.rdv_qualite) byMonth[month].qualite++
      if (ecoute.rdv_honore === true) byMonth[month].honores++
      if (ecoute.rdv_honore === false) byMonth[month].nonHonores++
    })

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        ...data,
        tauxQualite: data.total > 0 ? (data.qualite / data.total) * 100 : 0
      }))
  }, [selectedAgent, filteredEcoutes])

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.nom || 'Agent inconnu'
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Statistiques"
        description="Vue globale et par agent sur la qualité et l'honorisation"
      />

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Projet</label>
            <select
              value={filterProjet}
              onChange={(e) => setFilterProjet(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les projets</option>
              {PROJETS.map(projet => (
                <option key={projet} value={projet}>{projet}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Date début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Date fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Vue globale</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total RDV"
          value={globalStats.total}
          icon={<Calendar className="w-6 h-6 text-[#7c3aed]" />}
          color="#ede9fe"
        />
        <StatCard 
          label="RDV Qualité"
          value={`${globalStats.qualite} (${globalStats.tauxQualite.toFixed(1)}%)`}
          icon={<CheckCircle className="w-6 h-6 text-[#10b981]" />}
          color="#d4edda"
        />
        <StatCard 
          label="RDV Annulés"
          value={globalStats.annules}
          icon={<XCircle className="w-6 h-6 text-[#ef4444]" />}
          color="#ffd6e0"
        />
        <StatCard 
          label="Taux Honoré"
          value={`${globalStats.tauxHonore.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6 text-[#f59e0b]" />}
          color="#fff3cd"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Répartition Qualité</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-8 bg-[#e5e7eb] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[#10b981] transition-all"
                  style={{ width: `${globalStats.tauxQualite}%` }}
                />
                <div 
                  className="h-full bg-[#ef4444] transition-all"
                  style={{ width: `${100 - globalStats.tauxQualite}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
              Qualité: {globalStats.qualite}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
              Non qualité: {globalStats.nonQualite}
            </span>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Répartition Honorés</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-8 bg-[#e5e7eb] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[#10b981] transition-all"
                  style={{ width: `${globalStats.tauxHonore}%` }}
                />
                <div 
                  className="h-full bg-[#ef4444] transition-all"
                  style={{ width: `${100 - globalStats.tauxHonore}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
              Honorés: {globalStats.honores}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
              Non honorés: {globalStats.nonHonores}
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Vue par agent</h2>
      <div className="card mb-6">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Projet</th>
                <th className="text-center">Total</th>
                <th className="text-center">Qualité</th>
                <th className="text-center">Taux Qualité</th>
                <th className="text-center">Honorés</th>
                <th className="text-center">Taux Honoré</th>
                <th className="text-center">Note Moy.</th>
              </tr>
            </thead>
            <tbody>
              {agentStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#6b7280]">
                    Aucune donnée disponible
                  </td>
                </tr>
              ) : (
                agentStats.map(stat => (
                  <tr 
                    key={stat.agent.id}
                    className={`cursor-pointer ${selectedAgent === stat.agent.id ? 'bg-[#ede9fe]' : ''}`}
                    onClick={() => setSelectedAgent(selectedAgent === stat.agent.id ? null : stat.agent.id)}
                  >
                    <td className="font-medium">{stat.agent.nom}</td>
                    <td>
                      <span className="badge badge-info">{stat.agent.projet}</span>
                    </td>
                    <td className="text-center font-semibold">{stat.total}</td>
                    <td className="text-center">
                      <span className="text-[#10b981]">{stat.qualite}</span>
                      <span className="text-[#6b7280]"> / </span>
                      <span className="text-[#ef4444]">{stat.nonQualite}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full"
                            style={{ width: `${stat.tauxQualite}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#7c3aed] text-sm">{stat.tauxQualite.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="text-[#10b981]">{stat.honores}</span>
                      <span className="text-[#6b7280]"> / </span>
                      <span className="text-[#ef4444]">{stat.nonHonores}</span>
                    </td>
                    <td className="text-center">
                      <span className="font-semibold text-[#f59e0b]">{stat.tauxHonore.toFixed(0)}%</span>
                    </td>
                    <td className="text-center">
                      <span className="font-semibold text-[#7c3aed]">{stat.noteMoyenne.toFixed(1)}/10</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAgent && selectedAgentData && selectedAgentData.length > 0 && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">
            Évolution de {getAgentName(selectedAgent)}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8e8e8]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6b7280]">Période</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#6b7280]">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#6b7280]">Qualité</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#6b7280]">Taux</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#6b7280]">Honorés</th>
                </tr>
              </thead>
              <tbody>
                {selectedAgentData.map((data, index) => (
                  <tr key={index} className="border-b border-[#e8e8e8] last:border-0">
                    <td className="py-3 px-4 font-medium">{data.month}</td>
                    <td className="py-3 px-4 text-center">{data.total}</td>
                    <td className="py-3 px-4 text-center text-[#10b981]">{data.qualite}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-[#7c3aed]">{data.tauxQualite.toFixed(0)}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[#10b981]">{data.honores}</span>
                      <span className="text-[#6b7280]"> / </span>
                      <span className="text-[#ef4444]">{data.nonHonores}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
