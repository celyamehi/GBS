'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Calendar, CheckCircle, XCircle, Download } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { Agent, Ecoute } from '@/lib/supabase'
import { useAgents, useEcoutes } from '@/hooks/useSupabaseData'
import { exportToPDF, exportTableToPDF } from '../../utils/pdfExport'
import { PROJETS } from '@/data/mockData'

export default function StatistiquesPage() {
  const { agents, loading: agentsLoading, error: agentsError } = useAgents()
  const { ecoutes, loading: ecoutesLoading, error: ecoutesError } = useEcoutes()
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedProjet, setSelectedProjet] = useState<string>('')

  const currentMonth = new Date().toISOString().substring(0, 7)
  const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const activeAgents = agents.filter(a => a.actif)

  const filteredEcoutes = useMemo(() => {
    return ecoutes.filter(ecoute => {
      const matchesDateDebut = !dateDebut || ecoute.date_rdv >= dateDebut
      const matchesDateFin = !dateFin || ecoute.date_rdv <= dateFin
      const matchesProjet = !selectedProjet || ecoute.projet === selectedProjet
      const matchesAgent = !selectedAgent || ecoute.agent_id === selectedAgent
      return matchesDateDebut && matchesDateFin && matchesProjet && matchesAgent
    })
  }, [ecoutes, dateDebut, dateFin])

  const currentMonthEcoutes = useMemo(() => {
    return ecoutes.filter(ecoute => 
      ecoute.date_rdv.substring(0, 7) === currentMonth
    )
  }, [ecoutes, currentMonth])

  const globalStats = useMemo(() => {
    const filteredForGlobal = currentMonthEcoutes.filter(ecoute => 
      !selectedProjet || ecoute.projet === selectedProjet
    )
    
    const totalRdv = filteredForGlobal.length
    const rdvConfirme = filteredForGlobal.filter(e => e.confirmation === 'Confirmer').length
    const rdvHonore = filteredForGlobal.filter(e => e.suivi === 'Honore').length
    const rdvNrp = filteredForGlobal.filter(e => e.suivi === 'NRP').length
    
    return {
      totalRdv,
      rdvConfirme,
      rdvHonore,
      rdvNrp,
      tauxConfirme: totalRdv > 0 ? (rdvConfirme / totalRdv) * 100 : 0,
      tauxHonore: totalRdv > 0 ? (rdvHonore / totalRdv) * 100 : 0,
      tauxNrp: totalRdv > 0 ? (rdvNrp / totalRdv) * 100 : 0
    }
  }, [currentMonthEcoutes, selectedProjet])

  const agentStats = useMemo(() => {
    return activeAgents.map(agent => {
      const agentEcoutes = filteredEcoutes.filter(e => e.agent_id === agent.id)
      
      const totalRdv = agentEcoutes.length
      const rdvConfirme = agentEcoutes.filter(e => e.confirmation === 'Confirmer').length
      const rdvHonore = agentEcoutes.filter(e => e.suivi === 'Honore').length
      const rdvNrp = agentEcoutes.filter(e => e.suivi === 'NRP').length
      
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
    })
    .filter(stat => stat.totalRdv > 0)
    .sort((a, b) => b.tauxConfirme - a.tauxConfirme)
  }, [filteredEcoutes])

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
    const filename = `tableau_agents_${currentMonth.replace('-', '_')}.pdf`
    const title = `Tableau des Agents - ${currentMonthName}`
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
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Projet</label>
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les projets</option>
              {PROJETS.map(projet => (
                <option key={projet} value={projet}>{projet}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Agent</label>
            <select
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(e.target.value || null)}
              className="input-field"
            >
              <option value="">Tous les agents</option>
              {activeAgents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-[#6b7280] mt-3">
          Les filtres de date, projet et agent s'appliquent à la vue par agent. La vue globale affiche les stats du mois en cours.
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
            color="#fee2e2"
          />
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
                  agentStats.map((stat, index) => (
                    <tr key={stat.agent.id}>
                      <td className="font-medium">{stat.agent.nom}</td>
                      <td className="text-center font-semibold">{stat.totalRdv}</td>
                      <td className="text-center">
                        <span className="text-[#10b981] font-semibold">{stat.rdvConfirme}</span>
                        <span className="text-[#6b7280]"> / </span>
                        <span className="text-[#ef4444] font-semibold">{stat.totalRdv - stat.rdvConfirme}</span>
                      </td>
                      <td className="text-center">
                        <span className="text-[#f59e0b] font-semibold">{stat.rdvHonore}</span>
                        <span className="text-[#6b7280]"> / </span>
                        <span className="text-[#ef4444] font-semibold">{stat.totalRdv - stat.rdvHonore - stat.rdvNrp}</span>
                      </td>
                      <td className="text-center">
                        <span className="text-[#ef4444] font-semibold">{stat.rdvNrp}</span>
                        <span className="text-[#6b7280]"> / </span>
                        <span className="text-[#ef4444] font-semibold">{stat.totalRdv - stat.rdvNrp}</span>
                      </td>
                      <td className="text-center">{stat.tauxConfirme.toFixed(1)}%</td>
                      <td className="text-center">{stat.tauxHonore.toFixed(1)}%</td>
                      <td className="text-center">{stat.tauxNrp.toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
