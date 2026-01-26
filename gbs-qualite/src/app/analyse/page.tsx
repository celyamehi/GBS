'use client'

import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, User } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { mockAgents, mockEcoutes } from '@/data/mockData'
import { Agent, Ecoute, BLOCS_CRITERES } from '@/lib/supabase'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function AnalysePage() {
  const [agents] = useLocalStorage<Agent[]>('gbs-agents', mockAgents)
  const [ecoutes] = useLocalStorage<Ecoute[]>('gbs-ecoutes', mockEcoutes)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const activeAgents = agents.filter(a => a.actif)

  // Filtrer les écoutes par agent et dates
  const filteredEcoutes = useMemo(() => {
    return ecoutes.filter(ecoute => {
      // Filtrer uniquement les RDV Validé qualité et 2ème passage
      const isQualiteValide = ecoute.statut_rdv === 'Validé qualité' || ecoute.statut_rdv === '2ème passage'
      const matchesAgent = !selectedAgent || ecoute.agent_id === selectedAgent
      const matchesDateDebut = !dateDebut || ecoute.date_rdv >= dateDebut
      const matchesDateFin = !dateFin || ecoute.date_rdv <= dateFin
      return isQualiteValide && matchesAgent && matchesDateDebut && matchesDateFin
    })
  }, [ecoutes, selectedAgent, dateDebut, dateFin])

  // Analyser les critères par bloc pour les écoutes filtrées
  const analyseParBloc = useMemo(() => {
    const analyse: Record<string, {
      titre: string
      couleur: string
      criteres: Record<string, { total: number; respecte: number; taux: number }>
      tauxGlobal: number
    }> = {}

    Object.entries(BLOCS_CRITERES)
      .filter(([blocKey]) => blocKey !== 'gestion_objections')
      .forEach(([blocKey, bloc]) => {
      const criteresAnalyse: Record<string, { total: number; respecte: number; taux: number }> = {}
      
      bloc.criteres.forEach(critere => {
        const key = `${blocKey}_${critere}`
        let total = 0
        let respecte = 0

        filteredEcoutes.forEach(ecoute => {
          if (ecoute.criteres && ecoute.criteres[key]) {
            total++
            if (ecoute.criteres[key].respecte) {
              respecte++
            }
          }
        })

        criteresAnalyse[critere] = {
          total,
          respecte,
          taux: total > 0 ? (respecte / total) * 100 : 0
        }
      })

      const totalCriteres = Object.values(criteresAnalyse).reduce((sum, c) => sum + c.total, 0)
      const totalRespecte = Object.values(criteresAnalyse).reduce((sum, c) => sum + c.respecte, 0)

      analyse[blocKey] = {
        titre: bloc.titre,
        couleur: bloc.couleur,
        criteres: criteresAnalyse,
        tauxGlobal: totalCriteres > 0 ? (totalRespecte / totalCriteres) * 100 : 0
      }
    })

    return analyse
  }, [filteredEcoutes])

  // Points forts et axes d'amélioration
  const pointsForts = useMemo(() => {
    const allCriteres: { bloc: string; critere: string; taux: number }[] = []
    
    Object.entries(analyseParBloc).forEach(([blocKey, bloc]) => {
      Object.entries(bloc.criteres).forEach(([critere, data]) => {
        if (data.total > 0) {
          allCriteres.push({ bloc: bloc.titre, critere, taux: data.taux })
        }
      })
    })

    return allCriteres
      .filter(c => c.taux >= 80)
      .sort((a, b) => b.taux - a.taux)
      .slice(0, 5)
  }, [analyseParBloc])

  const axesAmelioration = useMemo(() => {
    const allCriteres: { bloc: string; critere: string; taux: number }[] = []
    
    Object.entries(analyseParBloc).forEach(([blocKey, bloc]) => {
      Object.entries(bloc.criteres).forEach(([critere, data]) => {
        if (data.total > 0) {
          allCriteres.push({ bloc: bloc.titre, critere, taux: data.taux })
        }
      })
    })

    return allCriteres
      .filter(c => c.taux < 80)
      .sort((a, b) => a.taux - b.taux)
      .slice(0, 5)
  }, [analyseParBloc])

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.nom || 'Tous les agents'
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Analyse des Évaluations"
        description="Analyse détaillée des performances par critère d'évaluation"
      />

      {/* Filtres */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les agents</option>
              {activeAgents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.nom}</option>
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
        <p className="text-sm text-[#6b7280] mt-3">
          {filteredEcoutes.length} écoute(s) analysée(s) {selectedAgent && `pour ${getAgentName(selectedAgent)}`}
        </p>
      </div>

      {filteredEcoutes.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 className="w-16 h-16 text-[#d1d5db] mx-auto mb-4" />
          <p className="text-[#6b7280]">Aucune écoute avec grille d'évaluation pour cette sélection</p>
        </div>
      ) : (
        <>
          {/* Points forts et Axes d'amélioration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#10b981]" />
                Points forts
              </h3>
              {pointsForts.length === 0 ? (
                <p className="text-sm text-[#6b7280]">Pas assez de données</p>
              ) : (
                <div className="space-y-3">
                  {pointsForts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a2e]">{item.critere}</p>
                        <p className="text-xs text-[#6b7280]">{item.bloc}</p>
                      </div>
                      <span className="text-sm font-bold text-[#10b981]">{item.taux.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                Axes d'amélioration
              </h3>
              {axesAmelioration.length === 0 ? (
                <p className="text-sm text-[#6b7280]">Pas assez de données</p>
              ) : (
                <div className="space-y-3">
                  {axesAmelioration.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a2e]">{item.critere}</p>
                        <p className="text-xs text-[#6b7280]">{item.bloc}</p>
                      </div>
                      <span className={`text-sm font-bold ${item.taux < 50 ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>
                        {item.taux.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analyse par bloc */}
          <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Analyse par bloc</h2>
          <div className="space-y-4">
            {Object.entries(analyseParBloc).map(([blocKey, bloc]) => (
              <div key={blocKey} className="card overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: bloc.couleur }}
                >
                  <h3 className="font-semibold text-[#1a1a2e]">{bloc.titre}</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-3 bg-white/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1a1a2e] rounded-full transition-all"
                        style={{ width: `${bloc.tauxGlobal}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#1a1a2e] min-w-[50px] text-right">
                      {bloc.tauxGlobal.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {Object.entries(bloc.criteres).map(([critere, data]) => (
                      <div key={critere} className="flex items-center gap-4">
                        <span className="flex-1 text-sm text-[#1a1a2e]">{critere}</span>
                        <div className="flex items-center gap-3 w-48">
                          <div className="flex-1 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                data.taux >= 80 ? 'bg-[#10b981]' : 
                                data.taux >= 50 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                              }`}
                              style={{ width: `${data.taux}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold min-w-[40px] text-right ${
                            data.taux >= 80 ? 'text-[#10b981]' : 
                            data.taux >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                          }`}>
                            {data.total > 0 ? `${data.taux.toFixed(0)}%` : '-'}
                          </span>
                        </div>
                        <span className="text-xs text-[#6b7280] min-w-[60px] text-right">
                          {data.respecte}/{data.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
