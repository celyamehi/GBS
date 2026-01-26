'use client'

import { useState, useMemo } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { mockAgents, mockEcoutes, PROJETS } from '@/data/mockData'
import { Agent, Ecoute } from '@/lib/supabase'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function ClassementPage() {
  const [agents] = useLocalStorage<Agent[]>('gbs-agents', mockAgents)
  const [ecoutes] = useLocalStorage<Ecoute[]>('gbs-ecoutes', mockEcoutes)
  const [filterProjet, setFilterProjet] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  const classement = useMemo(() => {
    const activeAgents = agents.filter(a => a.actif)
    
    return activeAgents.map(agent => {
      let agentEcoutes = ecoutes.filter(e => e.agent_id === agent.id)
      
      if (filterProjet && agent.projet !== filterProjet) {
        return null
      }
      
      if (dateDebut) {
        agentEcoutes = agentEcoutes.filter(e => e.date_rdv >= dateDebut)
      }
      if (dateFin) {
        agentEcoutes = agentEcoutes.filter(e => e.date_rdv <= dateFin)
      }

      // Filtrer uniquement les RDV "Validé qualité" et "2ème passage"
      const rdvQualiteValides = agentEcoutes.filter(e => 
        e.statut_rdv === 'Validé qualité' || e.statut_rdv === '2ème passage'
      )
      
      const totalRdv = rdvQualiteValides.length
      const rdvQualite = rdvQualiteValides.filter(e => e.rdv_qualite).length
      const rdvNonQualite = totalRdv - rdvQualite
      const tauxQualite = totalRdv > 0 ? (rdvQualite / totalRdv) * 100 : 0
      const rdvHonores = rdvQualiteValides.filter(e => e.rdv_honore === true).length
      const rdvNonHonores = rdvQualiteValides.filter(e => e.rdv_honore === false).length

      return {
        agent,
        totalRdv,
        rdvQualite,
        rdvNonQualite,
        tauxQualite,
        rdvHonores,
        rdvNonHonores
      }
    })
    .filter(Boolean)
    .sort((a, b) => b!.tauxQualite - a!.tauxQualite)
  }, [agents, ecoutes, filterProjet, dateDebut, dateFin])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-[#f59e0b]" />
    if (index === 1) return <Medal className="w-5 h-5 text-[#9ca3af]" />
    if (index === 2) return <Award className="w-5 h-5 text-[#cd7f32]" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-[#6b7280]">{index + 1}</span>
  }

  const getRankBg = (index: number) => {
    if (index === 0) return 'bg-[#fff3cd]'
    if (index === 1) return 'bg-[#f3f4f6]'
    if (index === 2) return 'bg-[#ffe5d0]'
    return ''
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Classement des Agents"
        description="Classement par taux de qualité (meilleur → pire)"
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

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="w-16">Rang</th>
                <th>Agent</th>
                <th>Projet</th>
                <th className="text-center">Total RDV</th>
                <th className="text-center">RDV Qualité</th>
                <th className="text-center">RDV Non Qualité</th>
                <th className="text-center">Taux Qualité</th>
                <th className="text-center">Honorés</th>
                <th className="text-center">Non Honorés</th>
              </tr>
            </thead>
            <tbody>
              {classement.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#6b7280]">
                    Aucun agent trouvé
                  </td>
                </tr>
              ) : (
                classement.map((item, index) => item && (
                  <tr key={item.agent.id} className={getRankBg(index)}>
                    <td className="text-center">
                      <div className="flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="font-medium">{item.agent.nom}</td>
                    <td>
                      <span className="badge badge-info">{item.agent.projet}</span>
                    </td>
                    <td className="text-center font-semibold">{item.totalRdv}</td>
                    <td className="text-center">
                      <span className="text-[#10b981] font-semibold">{item.rdvQualite}</span>
                    </td>
                    <td className="text-center">
                      <span className="text-[#ef4444] font-semibold">{item.rdvNonQualite}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full"
                            style={{ width: `${item.tauxQualite}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#7c3aed]">{item.tauxQualite.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="text-[#10b981] font-semibold">{item.rdvHonores}</span>
                    </td>
                    <td className="text-center">
                      <span className="text-[#ef4444] font-semibold">{item.rdvNonHonores}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {classement.length > 0 && classement[0] && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6 bg-gradient-to-br from-[#fff3cd] to-[#fef3c7]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Trophy className="w-7 h-7 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-sm text-[#92400e]">Meilleur agent</p>
                <p className="text-xl font-bold text-[#1a1a2e]">{classement[0].agent.nom}</p>
                <p className="text-sm text-[#7c3aed] font-semibold">{classement[0].tauxQualite.toFixed(1)}% qualité</p>
              </div>
            </div>
          </div>

          {classement[1] && (
            <div className="card p-6 bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Medal className="w-7 h-7 text-[#9ca3af]" />
                </div>
                <div>
                  <p className="text-sm text-[#6b7280]">2ème place</p>
                  <p className="text-xl font-bold text-[#1a1a2e]">{classement[1].agent.nom}</p>
                  <p className="text-sm text-[#7c3aed] font-semibold">{classement[1].tauxQualite.toFixed(1)}% qualité</p>
                </div>
              </div>
            </div>
          )}

          {classement[2] && (
            <div className="card p-6 bg-gradient-to-br from-[#ffe5d0] to-[#fed7aa]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Award className="w-7 h-7 text-[#cd7f32]" />
                </div>
                <div>
                  <p className="text-sm text-[#9a3412]">3ème place</p>
                  <p className="text-xl font-bold text-[#1a1a2e]">{classement[2].agent.nom}</p>
                  <p className="text-sm text-[#7c3aed] font-semibold">{classement[2].tauxQualite.toFixed(1)}% qualité</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
