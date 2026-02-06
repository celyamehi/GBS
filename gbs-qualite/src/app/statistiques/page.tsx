'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Calendar, CheckCircle, XCircle, Download } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { Agent, Ecoute } from '@/lib/supabase'
import { useAgents, useEcoutes } from '@/hooks/useSupabaseData'
import { exportToPDF, exportTableToPDF } from '@/utils/pdfExport'

export default function StatistiquesPage() {
  const { agents, loading: agentsLoading, error: agentsError } = useAgents()
  const { ecoutes, loading: ecoutesLoading, error: ecoutesError } = useEcoutes()
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  // Obtenir le mois en cours au format YYYY-MM
  const currentMonth = new Date().toISOString().substring(0, 7)
  const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Écoutes filtrées par date (pour la vue par agent)
  const filteredEcoutes = useMemo(() => {
    return ecoutes.filter(ecoute => {
      const matchesDateDebut = !dateDebut || ecoute.date_rdv >= dateDebut
      const matchesDateFin = !dateFin || ecoute.date_rdv <= dateFin
      return matchesDateDebut && matchesDateFin
    })
  }, [ecoutes, dateDebut, dateFin])

  // Écoutes du mois en cours (pour la vue globale)
  const currentMonthEcoutes = useMemo(() => {
    return ecoutes.filter(ecoute => 
      ecoute.date_rdv.substring(0, 7) === currentMonth
      // Prendre TOUS les RDV du mois, pas seulement certains statuts
    )
  }, [ecoutes, currentMonth])

  // Stats du mois en cours (vue globale) - selon la nouvelle logique
  const globalStats = useMemo(() => {
    const totalRdv = currentMonthEcoutes.length
    
    // RDV confirmés (confirmation === 'Confirmer')
    const rdvConfirme = currentMonthEcoutes.filter(e => e.confirmation === 'Confirmer').length
    
    // RDV honorés (suivi === 'Honore')
    const rdvHonore = currentMonthEcoutes.filter(e => e.suivi === 'Honore').length
    
    // RDV NRP (suivi === 'NRP')
    const rdvNrp = currentMonthEcoutes.filter(e => e.suivi === 'NRP').length
    
    // Calcul des taux selon la nouvelle logique
    const tauxConfirme = totalRdv > 0 ? (rdvConfirme / totalRdv) * 100 : 0
    const tauxHonore = totalRdv > 0 ? (rdvHonore / totalRdv) * 100 : 0
    const tauxNrp = totalRdv > 0 ? (rdvNrp / totalRdv) * 100 : 0

    return {
      totalRdv,
      rdvConfirme,
      rdvHonore,
      rdvNrp,
      tauxConfirme,
      tauxHonore,
      tauxNrp
    }
  }, [currentMonthEcoutes])

  const agentStats = useMemo(() => {
    const activeAgents = agents.filter(a => a.actif)

    return activeAgents.map(agent => {
      // Filtrer tous les RDV de cet agent selon les dates
      const agentEcoutes = filteredEcoutes.filter(e => e.agent_id === agent.id)
      
      // Total des RDV programmés (tous les RDV)
      const totalRdv = agentEcoutes.length
      
      // RDV confirmés (confirmation === 'Confirmer')
      const rdvConfirme = agentEcoutes.filter(e => e.confirmation === 'Confirmer').length
      
      // RDV honorés (suivi === 'Honore')
      const rdvHonore = agentEcoutes.filter(e => e.suivi === 'Honore').length
      
      // RDV NRP (suivi === 'NRP')
      const rdvNrp = agentEcoutes.filter(e => e.suivi === 'NRP').length
      
      // Calcul des taux
      const tauxConfirme = totalRdv > 0 ? (rdvConfirme / totalRdv) * 100 : 0
      const tauxHonore = totalRdv > 0 ? (rdvHonore / totalRdv) * 100 : 0
      const tauxNrp = totalRdv > 0 ? (rdvNrp / totalRdv) * 100 : 0

      return {
        agent,
        totalRdv,
        rdvConfirme,
        rdvHonore,
        rdvNrp,
        tauxConfirme,
        tauxHonore,
        tauxNrp
      }
    }).filter(stat => stat.totalRdv > 0) // Ne garder que les agents avec au moins 1 RDV
     .sort((a, b) => b.tauxConfirme - a.tauxConfirme) // Trier par taux de confirmation
  }, [agents, filteredEcoutes])

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

  const handleExportPDF = async () => {
    const filename = `statistiques_${currentMonth.replace('-', '_')}.pdf`
    const title = `Statistiques - ${currentMonthName}`
    const success = await exportToPDF('stats-content', filename, title)
    if (success) {
      console.log('PDF exporté avec succès')
    } else {
      alert('Erreur lors de l\'export PDF')
    }
  }

  const handleExportTablePDF = async () => {
    const filename = `classement_agents_${currentMonth.replace('-', '_')}.pdf`
    const title = `Classement des Agents - ${currentMonthName}`
    const additionalInfo = `Période: ${currentMonthName} | Total agents: ${agentStats.length}`
    const success = await exportTableToPDF('agent-table', filename, title, additionalInfo)
    if (success) {
      console.log('PDF du tableau exporté avec succès')
    } else {
      alert('Erreur lors de l\'export PDF du tableau')
    }
  }

  if (agentsLoading || ecoutesLoading) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (agentsError || ecoutesError) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-red-600 mb-2">Erreur de chargement</p>
          <p className="text-[#6b7280] text-sm">{agentsError || ecoutesError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Statistiques"
        description="Vue globale et par agent sur la qualité et l'honorisation"
        action={
          <button 
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>
        }
      />

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4">
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
        <p className="text-sm text-[#6b7280] mt-3">
          Les filtres de date s'appliquent à la vue par agent. La vue globale affiche les stats du mois en cours.
        </p>
      </div>

      <div id="stats-content" className="space-y-6">

      <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">
        Vue globale - {currentMonthName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total RDV programmés"
          value={globalStats.totalRdv}
          icon={<Calendar className="w-6 h-6 text-[#7c3aed]" />}
          color="#ede9fe"
        />
        <StatCard 
          label="RDV confirmés"
          value={`${globalStats.rdvConfirme} (${globalStats.tauxConfirme.toFixed(1)}%)`}
          icon={<CheckCircle className="w-6 h-6 text-[#10b981]" />}
          color="#d4edda"
        />
        <StatCard 
          label="RDV honorés"
          value={`${globalStats.rdvHonore} (${globalStats.tauxHonore.toFixed(1)}%)`}
          icon={<TrendingUp className="w-6 h-6 text-[#f59e0b]" />}
          color="#fff3cd"
        />
        <StatCard 
          label="RDV NRP"
          value={`${globalStats.rdvNrp} (${globalStats.tauxNrp.toFixed(1)}%)`}
          icon={<XCircle className="w-6 h-6 text-[#ef4444]" />}
          color="#ffd6e0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Répartition Confirmés</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-8 bg-[#e5e7eb] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[#10b981] transition-all"
                  style={{ width: `${globalStats.tauxConfirme}%` }}
                />
                <div 
                  className="h-full bg-[#ef4444] transition-all"
                  style={{ width: `${100 - globalStats.tauxConfirme}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
              Confirmés: {globalStats.rdvConfirme}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
              Non confirmés: {globalStats.totalRdv - globalStats.rdvConfirme}
            </span>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Répartition Honorés</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-8 bg-[#e5e7eb] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[#f59e0b] transition-all"
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
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
              Honorés: {globalStats.rdvHonore}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
              Non honorés: {globalStats.totalRdv - globalStats.rdvHonore}
            </span>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Répartition NRP</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-8 bg-[#e5e7eb] rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[#ef4444] transition-all"
                  style={{ width: `${globalStats.tauxNrp}%` }}
                />
                <div 
                  className="h-full bg-[#10b981] transition-all"
                  style={{ width: `${100 - globalStats.tauxNrp}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
              NRP: {globalStats.rdvNrp}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
              Non NRP: {globalStats.totalRdv - globalStats.rdvNrp}
            </span>
          </div>
        </div>
      </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#1a1a2e]">Vue par agent</h2>
        <button 
          onClick={handleExportTablePDF}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exporter tableau PDF
        </button>
      </div>
      <div className="card mb-6">
        <div id="agent-table" className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom agent</th>
                <th className="text-center">Total RDV programmés</th>
                <th className="text-center">RDV confirmés</th>
                <th className="text-center">RDV honorés</th>
                <th className="text-center">RDV NRP</th>
                <th className="text-center">Taux confirmés</th>
                <th className="text-center">Taux honorés</th>
                <th className="text-center">Taux NRP</th>
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
                    <td className="text-center font-semibold">{stat.totalRdv}</td>
                    <td className="text-center">
                      <span className="text-[#10b981] font-semibold">{stat.rdvConfirme}</span>
                    </td>
                    <td className="text-center">
                      <span className="text-[#f59e0b] font-semibold">{stat.rdvHonore}</span>
                    </td>
                    <td className="text-center">
                      <span className="text-[#ef4444] font-semibold">{stat.rdvNrp}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full"
                            style={{ width: `${stat.tauxConfirme}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#10b981] text-sm">{stat.tauxConfirme.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] rounded-full"
                            style={{ width: `${stat.tauxHonore}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#f59e0b] text-sm">{stat.tauxHonore.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#ef4444] to-[#f87171] rounded-full"
                            style={{ width: `${stat.tauxNrp}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#ef4444] text-sm">{stat.tauxNrp.toFixed(1)}%</span>
                      </div>
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
    </div>
  )
}
