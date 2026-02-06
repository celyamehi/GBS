'use client'

import { useState } from 'react'
import { Search, Check, X } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { Agent, Ecoute, STATUTS_RDV } from '@/lib/supabase'
import { useAgents, useEcoutes } from '@/hooks/useSupabaseData'
import { PROJETS } from '@/data/mockData'

export default function SuiviRdvPage() {
  const { agents, loading: agentsLoading, error: agentsError } = useAgents()
  const { ecoutes, loading: ecoutesLoading, error: ecoutesError, toggleHonore: toggleHonoreSupabase, updateEcoute } = useEcoutes()
  const [filterAgent, setFilterAgent] = useState('')
  const [filterProjet, setFilterProjet] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterSuivi, setFilterSuivi] = useState<string>('')
  const [filterConfirmation, setFilterConfirmation] = useState<string>('')
  const [filterNumeroClient, setFilterNumeroClient] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const activeAgents = agents.filter(a => a.actif)

  const filteredEcoutes = ecoutes.filter(ecoute => {
    // Filtrer uniquement les RDV Validé qualité et 2ème passage
    const isQualiteValide = ecoute.statut_rdv === 'Validé qualité' || ecoute.statut_rdv === '2ème passage'
    const matchesAgent = !filterAgent || ecoute.agent_id === filterAgent
    const matchesProjet = !filterProjet || ecoute.projet === filterProjet
    const matchesStatut = !filterStatut || ecoute.statut_rdv === filterStatut
    const matchesSuivi = !filterSuivi || ecoute.suivi === filterSuivi
    const matchesConfirmation = !filterConfirmation || ecoute.confirmation === filterConfirmation
    const matchesNumeroClient = !filterNumeroClient || ecoute.numero_client?.toLowerCase().includes(filterNumeroClient.toLowerCase())
    const matchesDateDebut = !dateDebut || ecoute.date_rdv >= dateDebut
    const matchesDateFin = !dateFin || ecoute.date_rdv <= dateFin
    
    return isQualiteValide && matchesAgent && matchesProjet && matchesStatut && matchesSuivi && matchesConfirmation && matchesNumeroClient && matchesDateDebut && matchesDateFin
  })

  const handleToggleHonore = async (ecouteId: string, honore: boolean) => {
    try {
      await toggleHonoreSupabase(ecouteId, honore)
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
    }
  }

  const handleUpdateSuivi = async (ecouteId: string, suivi: string | null) => {
    try {
      await updateEcoute(ecouteId, { suivi })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du suivi:', error)
    }
  }

  const handleUpdateConfirmation = async (ecouteId: string, confirmation: string | null) => {
    try {
      await updateEcoute(ecouteId, { confirmation })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la confirmation:', error)
    }
  }

  const handleUpdateStatutRdv = async (ecouteId: string, statutRdv: string) => {
    try {
      await updateEcoute(ecouteId, { statut_rdv: statutRdv })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut RDV:', error)
    }
  }

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.nom || 'Agent inconnu'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const stats = {
    total: filteredEcoutes.length,
    honores: filteredEcoutes.filter(e => e.suivi === 'Honore').length,
    nrp: filteredEcoutes.filter(e => e.suivi === 'NRP').length,
    annules: filteredEcoutes.filter(e => e.suivi === 'Annuler').length,
    hc: filteredEcoutes.filter(e => e.suivi === 'HC').length,
    confirmes: filteredEcoutes.filter(e => e.confirmation === 'Confirmer').length,
    nrpConfirmation: filteredEcoutes.filter(e => e.confirmation === 'NRP').length
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
            <X className="w-12 h-12 mx-auto" />
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
        title="Suivi RDV"
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
          <p className="stat-label">NRP</p>
          <p className="stat-value text-[#ef4444]">{stats.nrp}</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p className="stat-label">Annulés</p>
          <p className="stat-value text-[#f59e0b]">{stats.annules}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <p className="stat-label">HC</p>
          <p className="stat-value text-[#8b5cf6]">{stats.hc}</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #06b6d4' }}>
          <p className="stat-label">Confirmés</p>
          <p className="stat-value text-[#06b6d4]">{stats.confirmes}</p>
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
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Suivi</label>
            <select
              value={filterSuivi}
              onChange={(e) => setFilterSuivi(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les suivis</option>
              <option value="Honore">Honoré</option>
              <option value="NRP">NRP</option>
              <option value="Annuler">Annuler</option>
              <option value="HC">HC</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Confirmation</label>
            <select
              value={filterConfirmation}
              onChange={(e) => setFilterConfirmation(e.target.value)}
              className="input-field"
            >
              <option value="">Toutes les confirmations</option>
              <option value="Confirmer">Confirmer</option>
              <option value="NRP">NRP</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Numéro client</label>
            <input
              type="text"
              value={filterNumeroClient}
              onChange={(e) => setFilterNumeroClient(e.target.value)}
              className="input-field"
              placeholder="Rechercher..."
            />
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
        
        {(filterAgent || filterProjet || filterStatut || filterSuivi || filterConfirmation || filterNumeroClient || dateDebut || dateFin) && (
          <button
            onClick={() => {
              setFilterAgent('')
              setFilterProjet('')
              setFilterStatut('')
              setFilterSuivi('')
              setFilterConfirmation('')
              setFilterNumeroClient('')
              setDateDebut('')
              setDateFin('')
            }}
            className="btn-secondary text-sm"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Projet</th>
                <th>Date prise RDV</th>
                <th>Date RDV</th>
                <th>Numéro client</th>
                <th>Statut RDV</th>
                <th className="text-center">Suivi</th>
                <th className="text-center">Confirmation</th>
              </tr>
            </thead>
            <tbody>
              {filteredEcoutes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#6b7280]">
                    Aucun RDV trouvé
                  </td>
                </tr>
              ) : (
                filteredEcoutes.map(ecoute => (
                  <tr key={ecoute.id}>
                    <td className="font-medium">{getAgentName(ecoute.agent_id)}</td>
                    <td className="text-[#6b7280]">{ecoute.projet || '-'}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_prise_rdv)}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_rdv)}</td>
                    <td className="text-[#6b7280]">{ecoute.numero_client || '-'}</td>
                    <td>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        ecoute.statut_rdv === 'Validé qualité' ? 'bg-green-100 text-green-800 border border-green-200' :
                        ecoute.statut_rdv === 'Annulé' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {ecoute.statut_rdv === 'Validé qualité' ? 'RDV QUALITE' : ecoute.statut_rdv}
                      </div>
                    </td>
                    <td className="text-center py-2">
                      <select
                        value={ecoute.suivi || ''}
                        onChange={(e) => handleUpdateSuivi(ecoute.id, e.target.value || null)}
                        className={`w-full min-w-[100px] text-sm border rounded-md px-2 py-1 font-medium focus:outline-none focus:ring-2 ${
                          ecoute.suivi === 'Honore' ? 'bg-green-50 border-green-300 text-green-800 focus:ring-green-500' :
                          ecoute.suivi === 'NRP' ? 'bg-red-50 border-red-300 text-red-800 focus:ring-red-500' :
                          ecoute.suivi === 'Annuler' ? 'bg-orange-50 border-orange-300 text-orange-800 focus:ring-orange-500' :
                          ecoute.suivi === 'HC' ? 'bg-purple-50 border-purple-300 text-purple-800 focus:ring-purple-500' :
                          'bg-white border-gray-300 text-gray-700 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">-</option>
                        <option value="Honore">Honoré</option>
                        <option value="NRP">NRP</option>
                        <option value="Annuler">Annuler</option>
                        <option value="HC">HC</option>
                      </select>
                    </td>
                    <td className="text-center py-2">
                      <select
                        value={ecoute.confirmation || ''}
                        onChange={(e) => handleUpdateConfirmation(ecoute.id, e.target.value || null)}
                        className={`w-full min-w-[100px] text-sm border rounded-md px-2 py-1 font-medium focus:outline-none focus:ring-2 ${
                          ecoute.confirmation === 'Confirmer' ? 'bg-green-50 border-green-300 text-green-800 focus:ring-green-500' :
                          ecoute.confirmation === 'NRP' ? 'bg-red-50 border-red-300 text-red-800 focus:ring-red-500' :
                          'bg-white border-gray-300 text-gray-700 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">-</option>
                        <option value="Confirmer">Confirmer</option>
                        <option value="NRP">NRP</option>
                      </select>
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
