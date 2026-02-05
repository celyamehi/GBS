'use client'

import { useState, useEffect } from 'react'
import { Database, Upload, Check, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { Agent, Ecoute, Briefing } from '@/lib/supabase'
import { 
  getAgents, 
  createAgent, 
  getEcoutes, 
  createEcoute,
  getBriefings,
  createBriefing
} from '@/lib/database'

interface MigrationStats {
  agents: { total: number; imported: number; errors: number }
  ecoutes: { total: number; imported: number; errors: number }
  briefings: { total: number; imported: number; errors: number }
}

export default function MigrationPage() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [stats, setStats] = useState<MigrationStats>({
    agents: { total: 0, imported: 0, errors: 0 },
    ecoutes: { total: 0, imported: 0, errors: 0 },
    briefings: { total: 0, imported: 0, errors: 0 }
  })

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const getDataFromLocalStorage = () => {
    try {
      const agents = JSON.parse(localStorage.getItem('gbs-agents') || '[]')
      const ecoutes = JSON.parse(localStorage.getItem('gbs-ecoutes') || '[]')
      const briefings = JSON.parse(localStorage.getItem('gbs-briefings') || '[]')
      
      return { agents, ecoutes, briefings }
    } catch (error) {
      addLog(`❌ Erreur lecture localStorage: ${error}`)
      return { agents: [], ecoutes: [], briefings: [] }
    }
  }

  const diagnoseData = () => {
    const { agents, ecoutes, briefings } = getDataFromLocalStorage()
    
    addLog('🔍 DIAGNOSTIC DES DONNÉES LOCALSTORAGE')
    addLog('')
    
    // Diagnostiquer les agents
    addLog(`👥 AGENTS (${agents.length}):`)
    agents.forEach((agent: any, index: number) => {
      addLog(`   ${index + 1}. ${agent.nom} - Code: ${agent.code_agent || 'N/A'} - ID: ${agent.id || 'N/A'}`)
    })
    addLog('')
    
    // Diagnostiquer les écoutes
    addLog(`🎧 ÉCOUTES (${ecoutes.length}):`)
    const uniqueAgentIds = new Set()
    ecoutes.forEach((ecoute: any, index: number) => {
      uniqueAgentIds.add(ecoute.agent_id)
      if (index < 10) { // Limiter l'affichage
        addLog(`   ${index + 1}. Agent ID: ${ecoute.agent_id} - Date: ${ecoute.date_rdv} - Nom: ${ecoute.agent_nom || 'N/A'}`)
      }
    })
    if (ecoutes.length > 10) {
      addLog(`   ... et ${ecoutes.length - 10} autres`)
    }
    addLog(`   IDs d'agents uniques trouvés: ${Array.from(uniqueAgentIds).join(', ')}`)
    addLog('')
    
    // Diagnostiquer les briefings
    addLog(`📝 BRIEFINGS (${briefings.length}):`)
    briefings.forEach((briefing: any, index: number) => {
      if (index < 5) { // Limiter l'affichage
        addLog(`   ${index + 1}. Agent ID: ${briefing.agent_id} - Date: ${briefing.date_briefing} - Nom: ${briefing.agent_nom || 'N/A'}`)
      }
    })
    if (briefings.length > 5) {
      addLog(`   ... et ${briefings.length - 5} autres`)
    }
    
    addLog('')
    addLog('✅ Diagnostic terminé')
  }

  const migrateAgents = async (agents: any[]): Promise<number> => {
    let imported = 0
    let errors = 0

    for (const agent of agents) {
      try {
        // Vérifier si l'agent existe déjà
        const existingAgents = await getAgents()
        const exists = existingAgents.find(a => a.code_agent === agent.code_agent)
        
        if (!exists) {
          const agentData = {
            nom: agent.nom,
            code_agent: agent.code_agent,
            projet: agent.projet || 'Default',
            actif: agent.actif !== false
          }
          
          const result = await createAgent(agentData)
          if (result) {
            imported++
            addLog(`✅ Agent importé: ${agent.nom} (Code: ${agent.code_agent})`)
          } else {
            errors++
            addLog(`❌ Erreur import agent: ${agent.nom}`)
          }
        } else {
          addLog(`⚠️ Agent déjà existant: ${agent.nom} (Code: ${agent.code_agent})`)
        }
      } catch (error) {
        errors++
        addLog(`❌ Erreur agent ${agent.nom}: ${error}`)
      }
    }

    return imported
  }

  const migrateEcoutes = async (ecoutes: any[]): Promise<number> => {
    let imported = 0
    let errors = 0

    // Récupérer tous les agents une seule fois
    const agents = await getAgents()
    
    // Créer une table de correspondance ID → code_agent
    const idToCodeMap: Record<string, string> = {
      '1768232525223': 'AG5223',  // Sfaihi SAMAH
      '1768232535710': 'AG5710',  // Ouazene DIHIA
      '1768232545890': 'AG5890',  // Mokrani DALILA
      '1768380427249': 'AG7249',  // OUKMAMOU Melissa
      '1768387445024': 'AG5024',  // Attik TINHINANE
      '1768492296704': 'AG6704',  // Benyahia Lamine
      '1768574323981': 'AG3981',  // SAHEL Ines
      '1768820237053': 'AG7053',  // Mansouri Sihem
      '1770110851331': 'AG1331'   // Hichem AZZEGAGH
    }
    
    for (const ecoute of ecoutes) {
      try {
        // D'abord essayer la correspondance directe
        let agentCode = idToCodeMap[ecoute.agent_id]
        let agent = agents.find(a => a.code_agent === agentCode)
        
        // Si pas trouvé, chercher par code_agent direct
        if (!agent) {
          agent = agents.find(a => a.code_agent === ecoute.agent_id)
        }
        
        // Si toujours pas trouvé, essayer par nom
        if (!agent && ecoute.agent_nom) {
          agent = agents.find(a => a.nom.toLowerCase() === ecoute.agent_nom.toLowerCase())
        }
        
        if (agent) {
          const ecouteData = {
            agent_id: agent.id,
            lien_audio: ecoute.lien_audio || null,
            audio_data: ecoute.audio_data || null,
            audio_name: ecoute.audio_name || null,
            date_prise_rdv: ecoute.date_prise_rdv,
            date_rdv: ecoute.date_rdv,
            statut_rdv: ecoute.statut_rdv,
            rdv_qualite: ecoute.rdv_qualite || false,
            rdv_honore: ecoute.rdv_honore || null,
            note_globale: ecoute.note_globale || 5,
            remarques: ecoute.remarques || null,
            numero_client: ecoute.numero_client || null,
            nom_client: ecoute.nom_client || null,
            criteres: ecoute.criteres || {}
          }
          
          const result = await createEcoute(ecouteData)
          if (result) {
            imported++
            addLog(`✅ Écoute importée: ${ecoute.date_rdv} - ${agent.nom} (${agent.code_agent}) [ID: ${ecoute.agent_id} → Code: ${agentCode || ecoute.agent_id}]`)
          } else {
            errors++
            addLog(`❌ Erreur import écoute: ${ecoute.date_rdv}`)
          }
        } else {
          errors++
          addLog(`❌ Agent non trouvé pour l'écoute: ${ecoute.agent_id} → ${agentCode || 'INCONNU'} (nom: ${ecoute.agent_nom || 'N/A'})`)
        }
      } catch (error) {
        errors++
        addLog(`❌ Erreur écoute ${ecoute.date_rdv}: ${error}`)
      }
    }

    return imported
  }

  const migrateBriefings = async (briefings: any[]): Promise<number> => {
    let imported = 0
    let errors = 0

    // Récupérer tous les agents une seule fois
    const agents = await getAgents()
    
    // Utiliser la même table de correspondance
    const idToCodeMap: Record<string, string> = {
      '1768232525223': 'AG5223',  // Sfaihi SAMAH
      '1768232535710': 'AG5710',  // Ouazene DIHIA
      '1768232545890': 'AG5890',  // Mokrani DALILA
      '1768380427249': 'AG7249',  // OUKMAMOU Melissa
      '1768387445024': 'AG5024',  // Attik TINHINANE
      '1768492296704': 'AG6704',  // Benyahia Lamine
      '1768574323981': 'AG3981',  // SAHEL Ines
      '1768820237053': 'AG7053',  // Mansouri Sihem
      '1770110851331': 'AG1331'   // Hichem AZZEGAGH
    }

    for (const briefing of briefings) {
      try {
        // D'abord essayer la correspondance directe
        let agentCode = idToCodeMap[briefing.agent_id]
        let agent = agents.find(a => a.code_agent === agentCode)
        
        // Si pas trouvé, chercher par code_agent direct
        if (!agent) {
          agent = agents.find(a => a.code_agent === briefing.agent_id)
        }
        
        // Si toujours pas trouvé, essayer par nom
        if (!agent && briefing.agent_nom) {
          agent = agents.find(a => a.nom.toLowerCase() === briefing.agent_nom.toLowerCase())
        }
        
        if (agent) {
          const briefingData = {
            agent_id: agent.id,
            date_briefing: briefing.date_briefing,
            type: briefing.type || 'manuel',
            contenu: briefing.contenu || briefing.remarques || ''
          }
          
          const result = await createBriefing(briefingData)
          if (result) {
            imported++
            addLog(`✅ Briefing importé: ${briefing.date_briefing} - ${agent.nom} (${agent.code_agent}) [ID: ${briefing.agent_id} → Code: ${agentCode || briefing.agent_id}]`)
          } else {
            errors++
            addLog(`❌ Erreur import briefing: ${briefing.date_briefing}`)
          }
        } else {
          errors++
          addLog(`❌ Agent non trouvé pour le briefing: ${briefing.agent_id} → ${agentCode || 'INCONNU'} (nom: ${briefing.agent_nom || 'N/A'})`)
        }
      } catch (error) {
        errors++
        addLog(`❌ Erreur briefing ${briefing.date_briefing}: ${error}`)
      }
    }

    return imported
  }

  const startMigration = async () => {
    setIsMigrating(true)
    setLogs([])
    setMigrationComplete(false)

    addLog('🚀 Début de la migration...')

    // Récupérer les données du localStorage
    const { agents, ecoutes, briefings } = getDataFromLocalStorage()
    
    const newStats = { ...stats }
    newStats.agents.total = agents.length
    newStats.ecoutes.total = ecoutes.length
    newStats.briefings.total = briefings.length
    setStats(newStats)

    addLog(`📊 Données trouvées: ${agents.length} agents, ${ecoutes.length} écoutes, ${briefings.length} briefings`)

    try {
      // Migration des agents (d'abord car nécessaires pour les autres)
      if (agents.length > 0) {
        addLog('👥 Migration des agents...')
        const agentsImported = await migrateAgents(agents)
        newStats.agents.imported = agentsImported
        newStats.agents.errors = agents.length - agentsImported
        setStats({ ...newStats })
      }

      // Migration des écoutes
      if (ecoutes.length > 0) {
        addLog('🎧 Migration des écoutes...')
        const ecoutesImported = await migrateEcoutes(ecoutes)
        newStats.ecoutes.imported = ecoutesImported
        newStats.ecoutes.errors = ecoutes.length - ecoutesImported
        setStats({ ...newStats })
      }

      // Migration des briefings
      if (briefings.length > 0) {
        addLog('📝 Migration des briefings...')
        const briefingsImported = await migrateBriefings(briefings)
        newStats.briefings.imported = briefingsImported
        newStats.briefings.errors = briefings.length - briefingsImported
        setStats({ ...newStats })
      }

      addLog('✅ Migration terminée!')
      setMigrationComplete(true)

    } catch (error) {
      addLog(`❌ Erreur générale de migration: ${error}`)
    } finally {
      setIsMigrating(false)
    }
  }

  const clearLocalStorage = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer les données du localStorage ? Cette action est irréversible.')) {
      localStorage.removeItem('gbs-agents')
      localStorage.removeItem('gbs-ecoutes')
      localStorage.removeItem('gbs-briefings')
      addLog('🗑️ Données localStorage effacées')
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Migration des Données"
        description="Transférez vos données du localStorage vers Supabase"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a2e]">Agents</h3>
              <p className="text-sm text-[#6b7280]">Total: {stats.agents.total}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Importés:</span>
              <span className="text-green-600 font-medium">{stats.agents.imported}</span>
            </div>
            <div className="flex justify-between">
              <span>Erreurs:</span>
              <span className="text-red-600 font-medium">{stats.agents.errors}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a2e]">Écoutes</h3>
              <p className="text-sm text-[#6b7280]">Total: {stats.ecoutes.total}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Importés:</span>
              <span className="text-green-600 font-medium">{stats.ecoutes.imported}</span>
            </div>
            <div className="flex justify-between">
              <span>Erreurs:</span>
              <span className="text-red-600 font-medium">{stats.ecoutes.errors}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a2e]">Briefings</h3>
              <p className="text-sm text-[#6b7280]">Total: {stats.briefings.total}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Importés:</span>
              <span className="text-green-600 font-medium">{stats.briefings.imported}</span>
            </div>
            <div className="flex justify-between">
              <span>Erreurs:</span>
              <span className="text-red-600 font-medium">{stats.briefings.errors}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Actions
          </h3>
          <div className="space-y-4">
            <button
              onClick={diagnoseData}
              disabled={isMigrating}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Diagnostiquer les données
            </button>

            <button
              onClick={startMigration}
              disabled={isMigrating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Migration en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Lancer la migration
                </>
              )}
            </button>

            <a 
              href="/migration/reset"
              className="btn-danger w-full flex items-center justify-center gap-2 text-center"
            >
              <Trash2 className="w-4 h-4" />
              Réinitialiser Supabase (⚠️)
            </a>

            {migrationComplete && (
              <button
                onClick={clearLocalStorage}
                className="btn-secondary w-full"
              >
                🗑️ Effacer le localStorage
              </button>
            )}

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Important:</strong> Après la migration réussie, vous pouvez effacer le localStorage pour libérer de l'espace.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Logs de migration</h3>
          <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">Aucun log. Lancez la migration pour voir les détails.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
