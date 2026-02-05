'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { supabase } from '@/lib/supabase'

export default function ResetMigrationPage() {
  const [isResetting, setIsResetting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const resetAllData = async () => {
    if (!confirm('⚠️ ATTENTION: Cette action va supprimer TOUTES les données de Supabase (agents, écoutes, briefings). Cette action est IRRÉVERSIBLE. Voulez-vous continuer ?')) {
      return
    }

    setIsResetting(true)
    setLogs([])
    addLog('🗑️ DÉBUT DE LA RÉINITIALISATION COMPLÈTE')

    try {
      // Supprimer tous les agents
      addLog('📋 Suppression des agents...')
      const { error: agentsError } = await supabase.from('agents').delete().neq('id', '')
      if (agentsError) {
        addLog(`❌ Erreur suppression agents: ${agentsError.message}`)
      } else {
        addLog('✅ Tous les agents supprimés')
      }

      // Supprimer toutes les écoutes
      addLog('🎧 Suppression des écoutes...')
      const { error: ecoutesError } = await supabase.from('ecoutes').delete().neq('id', '')
      if (ecoutesError) {
        addLog(`❌ Erreur suppression écoutes: ${ecoutesError.message}`)
      } else {
        addLog('✅ Toutes les écoutes supprimées')
      }

      // Supprimer tous les briefings
      addLog('📝 Suppression des briefings...')
      const { error: briefingsError } = await supabase.from('briefings').delete().neq('id', '')
      if (briefingsError) {
        addLog(`❌ Erreur suppression briefings: ${briefingsError.message}`)
      } else {
        addLog('✅ Tous les briefings supprimés')
      }

      addLog('✅ Réinitialisation terminée ! Vous pouvez maintenant relancer la migration normale.')
      
    } catch (error) {
      addLog(`❌ Erreur lors de la réinitialisation: ${error}`)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Réinitialisation Supabase"
        description="Supprimez toutes les données pour recommencer la migration"
      />

      <div className="max-w-2xl mx-auto">
        <div className="card p-6 mb-6 border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-800">⚠️ ACTION DANGEREUSE</h3>
              <p className="text-red-700 text-sm">
                Cette page va supprimer <strong>TOUTES</strong> les données de Supabase :
                agents, écoutes, briefings, et fichiers audio.
              </p>
              <p className="text-red-700 text-sm mt-2">
                Utilisez cette page uniquement si la migration a échoué et que vous voulez tout recommencer depuis le début.
              </p>
            </div>
          </div>

          <button
            onClick={resetAllData}
            disabled={isResetting}
            className="btn-danger w-full flex items-center justify-center gap-2"
          >
            {isResetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Réinitialisation en cours...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Supprimer toutes les données Supabase
              </>
            )}
          </button>

          <div className="mt-4 text-sm text-red-600">
            <p>Après cette action :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Retournez sur la page de migration normale</li>
              <li>Relancez la migration avec les données du localStorage</li>
              <li>Vos données seront correctement importées avec les bonnes correspondances</li>
            </ul>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-[#1a1a2e] mb-4">Logs de réinitialisation</h3>
          <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">Aucun log. Lancez la réinitialisation pour voir les détails.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <a 
            href="/migration" 
            className="btn-secondary inline-flex items-center gap-2"
          >
            ← Retour à la migration normale
          </a>
        </div>
      </div>
    </div>
  )
}
