'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Eye, ExternalLink, Headphones, Upload, Play, X, FileAudio, Trash2 } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { mockAgents, mockEcoutes, PROJETS } from '@/data/mockData'
import { Agent, Ecoute, BLOCS_CRITERES, STATUTS_RDV } from '@/lib/supabase'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { uploadAudioFile } from '@/lib/storage'
import Link from 'next/link'

export default function EcoutesPage() {
  const [agents] = useLocalStorage<Agent[]>('gbs-agents', mockAgents)
  const [ecoutes, setEcoutes] = useLocalStorage<Ecoute[]>('gbs-ecoutes', mockEcoutes)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEcoute, setEditingEcoute] = useState<Ecoute | null>(null)
  
  const [formData, setFormData] = useState({
    agent_id: '',
    lien_audio: '',
    audio_data: '' as string | null,
    audio_name: '' as string | null,
    date_prise_rdv: '',
    date_rdv: '',
    statut_rdv: STATUTS_RDV[0],
    rdv_qualite: false,
    rdv_honore: null as boolean | null,
    note_globale: 5,
    remarques: '',
    numero_client: '',
    nom_client: ''
  })

  const [criteres, setCriteres] = useState<Record<string, { respecte: boolean; commentaire: string }>>({})
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const activeAgents = agents.filter(a => a.actif)

  const filteredEcoutes = ecoutes.filter(ecoute => {
    const agent = agents.find(a => a.id === ecoute.agent_id)
    const matchesSearch = agent?.nom.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesAgent = !filterAgent || ecoute.agent_id === filterAgent
    const matchesStatut = !filterStatut || ecoute.statut_rdv === filterStatut
    return matchesSearch && matchesAgent && matchesStatut
  })

  const initCriteres = () => {
    const initial: Record<string, { respecte: boolean; commentaire: string }> = {}
    Object.entries(BLOCS_CRITERES).forEach(([blocKey, bloc]) => {
      bloc.criteres.forEach(critere => {
        initial[`${blocKey}_${critere}`] = { respecte: false, commentaire: '' }
      })
    })
    return initial
  }

  const openModal = (ecoute?: Ecoute) => {
    // Reset audio states
    setAudioFile(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    
    if (ecoute) {
      setEditingEcoute(ecoute)
      setFormData({
        agent_id: ecoute.agent_id,
        lien_audio: ecoute.lien_audio || '',
        audio_data: null,
        audio_name: ecoute.audio_name || null,
        date_prise_rdv: ecoute.date_prise_rdv,
        date_rdv: ecoute.date_rdv,
        statut_rdv: ecoute.statut_rdv,
        rdv_qualite: ecoute.rdv_qualite,
        rdv_honore: ecoute.rdv_honore,
        note_globale: ecoute.note_globale,
        remarques: ecoute.remarques || '',
        numero_client: ecoute.numero_client || '',
        nom_client: ecoute.nom_client || ''
      })
      setAudioFile(null)
      // Si l'écoute a un lien audio Supabase, l'utiliser directement
      if (ecoute.lien_audio) {
        setAudioUrl(ecoute.lien_audio)
      } else {
        setAudioUrl(null)
      }
      // Restaurer les critères sauvegardés ou initialiser
      console.log('Ecoute criteres:', ecoute.criteres)
      if (ecoute.criteres && Object.keys(ecoute.criteres).length > 0) {
        setCriteres(ecoute.criteres)
      } else {
        setCriteres(initCriteres())
      }
    } else {
      setEditingEcoute(null)
      setFormData({
        agent_id: activeAgents[0]?.id || '',
        lien_audio: '',
        audio_data: null,
        audio_name: null,
        date_prise_rdv: new Date().toISOString().split('T')[0],
        date_rdv: '',
        statut_rdv: STATUTS_RDV[0],
        rdv_qualite: false,
        rdv_honore: null,
        note_globale: 5,
        remarques: '',
        numero_client: '',
        nom_client: ''
      })
      setCriteres(initCriteres())
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agent_id || !formData.date_prise_rdv || !formData.date_rdv) return

    setIsUploading(true)
    let audioUrl = formData.lien_audio
    let audioName = formData.audio_name
    const ecouteId = editingEcoute?.id || Date.now().toString()

    // Si un nouveau fichier audio a été uploadé, l'uploader vers Supabase Storage
    if (audioFile) {
      const uploadedUrl = await uploadAudioFile(audioFile, ecouteId)
      if (uploadedUrl) {
        audioUrl = uploadedUrl
        audioName = audioFile.name
      } else {
        alert('Erreur lors de l\'upload du fichier audio. Vérifiez votre configuration Supabase.')
        setIsUploading(false)
        return
      }
    }

    if (editingEcoute) {
      const updatedEcoute: Ecoute = {
        ...editingEcoute,
        agent_id: formData.agent_id,
        date_prise_rdv: formData.date_prise_rdv,
        date_rdv: formData.date_rdv,
        statut_rdv: formData.statut_rdv,
        rdv_qualite: formData.rdv_qualite,
        rdv_honore: formData.rdv_honore,
        note_globale: formData.note_globale,
        remarques: formData.remarques || null,
        numero_client: formData.numero_client || null,
        nom_client: formData.nom_client || null,
        audio_data: null,
        audio_name: audioName || editingEcoute.audio_name,
        lien_audio: audioUrl || editingEcoute.lien_audio || null,
        criteres: { ...criteres }
      }
      setEcoutes(ecoutes.map(ec => 
        ec.id === editingEcoute.id ? updatedEcoute : ec
      ))
    } else {
      const newEcoute: Ecoute = {
        id: ecouteId,
        agent_id: formData.agent_id,
        lien_audio: audioUrl || null,
        audio_data: null,
        audio_name: audioName,
        date_prise_rdv: formData.date_prise_rdv,
        date_rdv: formData.date_rdv,
        statut_rdv: formData.statut_rdv,
        rdv_qualite: formData.rdv_qualite,
        rdv_honore: formData.rdv_honore,
        note_globale: formData.note_globale,
        remarques: formData.remarques || null,
        numero_client: formData.numero_client || null,
        nom_client: formData.nom_client || null,
        criteres: { ...criteres },
        created_at: new Date().toISOString()
      }
      setEcoutes([...ecoutes, newEcoute])
    }
    
    setIsUploading(false)
    setIsModalOpen(false)
  }

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.nom || 'Agent inconnu'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const toggleQualite = (ecouteId: string) => {
    setEcoutes(ecoutes.map(ec => 
      ec.id === ecouteId ? { ...ec, rdv_qualite: !ec.rdv_qualite } : ec
    ))
  }

  const deleteEcoute = (ecouteId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette écoute ?')) {
      setEcoutes(ecoutes.filter(ec => ec.id !== ecouteId))
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Écoutes / RDV"
        description="Créez et évaluez les écoutes de vos agents"
        action={
          <button 
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle écoute
          </button>
        }
      />

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Rechercher par agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-11"
              />
            </div>
          </div>
          <div className="w-48">
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
                <th>Numéro client</th>
                <th>Nom client</th>
                <th>Statut</th>
                <th>Qualité</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEcoutes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#6b7280]">
                    Aucune écoute trouvée
                  </td>
                </tr>
              ) : (
                filteredEcoutes.map(ecoute => (
                  <tr key={ecoute.id}>
                    <td className="font-medium">{getAgentName(ecoute.agent_id)}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_prise_rdv)}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_rdv)}</td>
                    <td className="text-[#6b7280]">{ecoute.numero_client || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.nom_client || '-'}</td>
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
                      <button
                        onClick={() => toggleQualite(ecoute.id)}
                        className={`badge cursor-pointer hover:opacity-80 transition-opacity ${ecoute.rdv_qualite ? 'badge-success' : 'badge-danger'}`}
                        title="Cliquer pour changer"
                      >
                        {ecoute.rdv_qualite ? 'Qualité' : 'Non qualité'}
                      </button>
                    </td>
                    <td>
                      <span className="font-semibold text-[#7c3aed]">{ecoute.note_globale}/10</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(ecoute)}
                          className="p-2 rounded-lg hover:bg-[#ede9fe] transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 text-[#7c3aed]" />
                        </button>
                        {ecoute.lien_audio && (
                          <a
                            href={ecoute.lien_audio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-[#c1e3ff] transition-colors"
                            title="Écouter l'audio"
                          >
                            <ExternalLink className="w-4 h-4 text-[#1e40af]" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteEcoute(ecoute.id)}
                          className="p-2 rounded-lg hover:bg-[#ffd6e0] transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-[#ef4444]" />
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEcoute ? 'Modifier l\'écoute' : 'Nouvelle écoute'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Audio - Upload direct */}
          <div className="bg-gradient-to-r from-[#e8d5f2] to-[#ede9fe] rounded-xl p-4 mb-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Headphones className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a2e]">Enregistrement de l'appel</h3>
                <p className="text-xs text-[#6b7280]">Uploadez le fichier audio de l'appel</p>
              </div>
            </div>
            
            <div className="mb-2 p-3 bg-[#d1f4e0] border border-[#10b981] rounded-lg">
              <p className="text-xs text-[#065f46]">
                ✓ Les fichiers audio sont stockés dans Supabase Storage de manière permanente.
              </p>
            </div>
            
            {!audioFile && !audioUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#7c3aed] rounded-xl cursor-pointer bg-white hover:bg-[#faf9f7] transition-colors">
                <Upload className="w-8 h-8 text-[#7c3aed] mb-2" />
                <p className="text-sm font-medium text-[#1a1a2e]">
                  Cliquez pour uploader un fichier audio
                </p>
                <p className="text-xs text-[#6b7280] mt-1">
                  MP3, WAV, M4A (max 50MB)
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setAudioFile(file)
                      const url = URL.createObjectURL(file)
                      setAudioUrl(url)
                    }
                  }}
                />
              </label>
            ) : (
              <div className="bg-white rounded-xl p-4 border border-[#e8e8e8]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ede9fe] flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-[#7c3aed]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1a1a2e] text-sm">
                        {audioFile?.name || formData.audio_name || 'Audio enregistré'}
                      </p>
                      {audioFile ? (
                        <p className="text-xs text-[#6b7280]">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      ) : formData.audio_data && (
                        <p className="text-xs text-[#10b981]">Audio disponible</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioFile(null)
                      if (audioUrl && !formData.audio_data) URL.revokeObjectURL(audioUrl)
                      setAudioUrl(null)
                      setFormData({ ...formData, lien_audio: '', audio_data: null, audio_name: null })
                    }}
                    className="p-2 rounded-lg hover:bg-[#ffd6e0] transition-colors"
                  >
                    <X className="w-4 h-4 text-[#ef4444]" />
                  </button>
                </div>
                
                {audioUrl && (
                  <div className="mt-3">
                    <audio controls className="w-full h-10" src={audioUrl}>
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Agent *
              </label>
              <select
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Sélectionner un agent</option>
                {activeAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Date de prise de RDV *
              </label>
              <input
                type="date"
                value={formData.date_prise_rdv}
                onChange={(e) => setFormData({ ...formData, date_prise_rdv: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Date du RDV *
              </label>
              <input
                type="date"
                value={formData.date_rdv}
                onChange={(e) => setFormData({ ...formData, date_rdv: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Statut RDV
              </label>
              <select
                value={formData.statut_rdv}
                onChange={(e) => setFormData({ ...formData, statut_rdv: e.target.value })}
                className="input-field"
              >
                {STATUTS_RDV.map(statut => (
                  <option key={statut} value={statut}>{statut}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Numéro client
              </label>
              <input
                type="text"
                value={formData.numero_client}
                onChange={(e) => setFormData({ ...formData, numero_client: e.target.value })}
                className="input-field"
                placeholder="Numéro de téléphone du client"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Nom client
              </label>
              <input
                type="text"
                value={formData.nom_client}
                onChange={(e) => setFormData({ ...formData, nom_client: e.target.value })}
                className="input-field"
                placeholder="Nom du client"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                Note globale (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.note_globale}
                onChange={(e) => setFormData({ ...formData, note_globale: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
              Remarques qualiticienne
            </label>
            <textarea
              value={formData.remarques}
              onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
              className="input-field min-h-[100px]"
              placeholder="Vos observations sur cet appel..."
            />
          </div>

          <div className="border-t border-[#e8e8e8] pt-6">
            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-4">Grille d'évaluation</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(BLOCS_CRITERES).map(([blocKey, bloc]) => {
                const allChecked = bloc.criteres.every(critere => criteres[`${blocKey}_${critere}`]?.respecte)
                const toggleAll = (checked: boolean) => {
                  const newCriteres = { ...criteres }
                  bloc.criteres.forEach(critere => {
                    const key = `${blocKey}_${critere}`
                    newCriteres[key] = { ...newCriteres[key], respecte: checked }
                  })
                  setCriteres(newCriteres)
                }
                return (
                <div key={blocKey} className="criteria-block">
                  <div 
                    className="criteria-header flex items-center justify-between"
                    style={{ backgroundColor: bloc.couleur }}
                  >
                    <span>{bloc.titre}</span>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-normal">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="checkbox-custom"
                      />
                      Tout cocher
                    </label>
                  </div>
                  {bloc.criteres.map(critere => {
                    const key = `${blocKey}_${critere}`
                    return (
                      <div key={key} className="criteria-item">
                        <input
                          type="checkbox"
                          checked={criteres[key]?.respecte || false}
                          onChange={(e) => setCriteres({
                            ...criteres,
                            [key]: { ...criteres[key], respecte: e.target.checked }
                          })}
                          className="checkbox-custom"
                        />
                        <span className="flex-1 text-sm">{critere}</span>
                        <input
                          type="text"
                          value={criteres[key]?.commentaire || ''}
                          onChange={(e) => setCriteres({
                            ...criteres,
                            [key]: { ...criteres[key], commentaire: e.target.value }
                          })}
                          className="input-field w-40 text-xs"
                          placeholder="Commentaire..."
                        />
                      </div>
                    )
                  })}
                </div>
              )})}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e8e8e8]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isUploading}
            >
              {isUploading ? 'Upload en cours...' : (editingEcoute ? 'Enregistrer' : 'Créer l\'écoute')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
