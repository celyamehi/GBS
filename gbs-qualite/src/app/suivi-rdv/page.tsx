'use client'

import { useState } from 'react'
import { Search, Check, X } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { mockAgents, mockEcoutes } from '@/data/mockData'
import { Agent, Ecoute, STATUTS_RDV } from '@/lib/supabase'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function SuiviRdvPage() {
  const [agents] = useLocalStorage<Agent[]>('gbs-agents', mockAgents)
  const [ecoutes, setEcoutes] = useLocalStorage<Ecoute[]>('gbs-ecoutes', mockEcoutes)
  const [filterAgent, setFilterAgent] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterHonore, setFilterHonore] = useState<string>('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const activeAgents = agents.filter(a => a.actif)

  const filteredEcoutes = ecoutes.filter(ecoute => {
    // Filtrer uniquement les RDV Validé qualité et 2ème passage
    const isQualiteValide = ecoute.statut_rdv === 'Validé qualité' || ecoute.statut_rdv === '2ème passage'
    const matchesAgent = !filterAgent || ecoute.agent_id === filterAgent
    const matchesStatut = !filterStatut || ecoute.statut_rdv === filterStatut
    const matchesHonore = filterHonore === '' || 
      (filterHonore === 'honore' && ecoute.rdv_honore === true) ||
      (filterHonore === 'non_honore' && ecoute.rdv_honore === false) ||
      (filterHonore === 'en_attente' && ecoute.rdv_honore === null)
    const matchesDateDebut = !dateDebut || ecoute.date_rdv >= dateDebut
    const matchesDateFin = !dateFin || ecoute.date_rdv <= dateFin
    
    return isQualiteValide && matchesAgent && matchesStatut && matchesHonore && matchesDateDebut && matchesDateFin
  })

  const toggleHonore = (ecouteId: string, honore: boolean) => {
    setEcoutes(ecoutes.map(e => 
      e.id === ecouteId ? { ...e, rdv_honore: honore } : e
    ))
  }

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.nom || 'Agent inconnu'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const stats = {
    total: filteredEcoutes.length,
    honores: filteredEcoutes.filter(e => e.rdv_honore === true).length,
    nonHonores: filteredEcoutes.filter(e => e.rdv_honore === false).length,
    enAttente: filteredEcoutes.filter(e => e.rdv_honore === null).length
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Suivi RDV Honorés"
        description="Suivez et mettez à jour le statut des RDV"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="stat-label">Total RDV</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <p className="stat-label">Honorés</p>
          <p className="stat-value text-[#10b981]">{stats.honores}</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <p className="stat-label">Non Honorés</p>
          <p className="stat-value text-[#ef4444]">{stats.nonHonores}</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p className="stat-label">En Attente</p>
          <p className="stat-value text-[#f59e0b]">{stats.enAttente}</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Agent</label>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les agents</option>
              {activeAgents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.nom}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Statut RDV</label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les statuts</option>
              {STATUTS_RDV.map(statut => (
                <option key={statut} value={statut}>{statut}</option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Honoré</label>
            <select
              value={filterHonore}
              onChange={(e) => setFilterHonore(e.target.value)}
              className="input-field"
            >
              <option value="">Tous</option>
              <option value="honore">Honoré</option>
              <option value="non_honore">Non honoré</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Date début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="w-40">
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

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Date prise RDV</th>
                <th>Date RDV</th>
                <th>Qualité</th>
                <th>Statut RDV</th>
                <th className="text-center">Honoré</th>
              </tr>
            </thead>
            <tbody>
              {filteredEcoutes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#6b7280]">
                    Aucun RDV trouvé
                  </td>
                </tr>
              ) : (
                filteredEcoutes.map(ecoute => (
                  <tr key={ecoute.id}>
                    <td className="font-medium">{getAgentName(ecoute.agent_id)}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_prise_rdv)}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_rdv)}</td>
                    <td>
                      <span className={`badge ${ecoute.rdv_qualite ? 'badge-success' : 'badge-danger'}`}>
                        {ecoute.rdv_qualite ? 'Qualité' : 'Non qualité'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        ecoute.statut_rdv === 'Validé qualité' ? 'badge-success' :
                        ecoute.statut_rdv === 'Annulé' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {ecoute.statut_rdv}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleHonore(ecoute.id, true)}
                          className={`p-2 rounded-lg transition-all ${
                            ecoute.rdv_honore === true 
                              ? 'bg-[#d4edda] text-[#10b981]' 
                              : 'hover:bg-[#d4edda] text-[#6b7280] hover:text-[#10b981]'
                          }`}
                          title="Marquer comme honoré"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleHonore(ecoute.id, false)}
                          className={`p-2 rounded-lg transition-all ${
                            ecoute.rdv_honore === false 
                              ? 'bg-[#ffd6e0] text-[#ef4444]' 
                              : 'hover:bg-[#ffd6e0] text-[#6b7280] hover:text-[#ef4444]'
                          }`}
                          title="Marquer comme non honoré"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
