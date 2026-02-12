'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Eye, ExternalLink, Headphones, Upload, Play, X, FileAudio, Trash2, Check, FileText } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { Agent, Ecoute, STATUTS_RDV } from '@/lib/supabase'
import { useAgents, useEcoutes } from '@/hooks/useSupabaseData'
import { uploadAudioFile } from '@/lib/storage'
import { PROJETS } from '@/data/mockData'
import Link from 'next/link'

export default function EcoutesPage() {
  const { agents, loading: agentsLoading, error: agentsError } = useAgents()
  const { ecoutes, loading: ecoutesLoading, error: ecoutesError, createEcoute, updateEcoute, deleteEcoute, toggleQualite: toggleQualiteSupabase } = useEcoutes()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [filterProjet, setFilterProjet] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterDateRdvDebut, setFilterDateRdvDebut] = useState('')
  const [filterDateRdvFin, setFilterDateRdvFin] = useState('')
  const [filterDatePriseDebut, setFilterDatePriseDebut] = useState('')
  const [filterDatePriseFin, setFilterDatePriseFin] = useState('')
  const [filterEstNouveauRdv, setFilterEstNouveauRdv] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEcoute, setEditingEcoute] = useState<Ecoute | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  
  const [formData, setFormData] = useState({
    agent_id: '',
    projet: 'GBS Conseille',
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
    nom_client: '',
    est_nouveau_rdv: true, // true = nouveau RDV, false = relance
    
    // Informations complémentaires RDV
    adresse: '',
    mutuelle_actuelle: '',
    prix_actuel: null as number | null,
    garantie: '',
    optique: '',
    dentaire: '',
    depassements_honoraires: '',
    ald: '',
    medecine_douce: '',
    hospitalisation: '',
    appareillage: '',
    regime: '',
    satisfaction: '',
    date_heure_rdv: '',
    type_rdv: 'Téléphonique', // ex: Téléphonique
    age: null as number | null,
    nombre_personnes: null as number | null,
    code_postal: '',
    adresse_email: ''
  })

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const activeAgents = agents.filter(a => a.actif)

  const filteredEcoutes = ecoutes.filter(ecoute => {
    const agent = agents.find(a => a.id === ecoute.agent_id)
    
    // Recherche globale dans tous les champs
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      agent?.nom.toLowerCase().includes(searchLower) ||
      ecoute.numero_client?.toLowerCase().includes(searchLower) ||
      ecoute.nom_client?.toLowerCase().includes(searchLower) ||
      ecoute.statut_rdv.toLowerCase().includes(searchLower)
    
    const matchesAgent = !filterAgent || ecoute.agent_id === filterAgent
    const matchesProjet = !filterProjet || ecoute.projet === filterProjet
    const matchesStatut = !filterStatut || ecoute.statut_rdv === filterStatut
    const matchesEstNouveauRdv = !filterEstNouveauRdv || 
      (filterEstNouveauRdv === 'true' && ecoute.est_nouveau_rdv) ||
      (filterEstNouveauRdv === 'false' && !ecoute.est_nouveau_rdv)
    
    // Filtres par date RDV
    const matchesDateRdvDebut = !filterDateRdvDebut || ecoute.date_rdv >= filterDateRdvDebut
    const matchesDateRdvFin = !filterDateRdvFin || ecoute.date_rdv <= filterDateRdvFin
    
    // Filtres par date de prise de RDV
    const matchesDatePriseDebut = !filterDatePriseDebut || ecoute.date_prise_rdv >= filterDatePriseDebut
    const matchesDatePriseFin = !filterDatePriseFin || ecoute.date_prise_rdv <= filterDatePriseFin
    
    return matchesSearch && matchesAgent && matchesProjet && matchesStatut && 
           matchesEstNouveauRdv &&
           matchesDateRdvDebut && matchesDateRdvFin && 
           matchesDatePriseDebut && matchesDatePriseFin
  })

  // Logique de pagination
  const totalPages = Math.ceil(filteredEcoutes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEcoutes = filteredEcoutes.slice(startIndex, endIndex)

  const openModal = (ecoute?: Ecoute) => {
    // Reset audio states
    setAudioFile(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    
    if (ecoute) {
      setEditingEcoute(ecoute)
      setFormData({
        agent_id: ecoute.agent_id,
        projet: ecoute.projet || 'GBS Conseille',
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
        nom_client: ecoute.nom_client || '',
        est_nouveau_rdv: ecoute.est_nouveau_rdv ?? true,
        
        // Informations complémentaires RDV
        adresse: ecoute.adresse || '',
        mutuelle_actuelle: ecoute.mutuelle_actuelle || '',
        prix_actuel: ecoute.prix_actuel || null,
        garantie: ecoute.garantie || '',
        optique: ecoute.optique || '',
        dentaire: ecoute.dentaire || '',
        depassements_honoraires: ecoute.depassements_honoraires || '',
        ald: ecoute.ald || '',
        medecine_douce: ecoute.medecine_douce || '',
        hospitalisation: ecoute.hospitalisation || '',
        appareillage: ecoute.appareillage || '',
        regime: ecoute.regime || '',
        satisfaction: ecoute.satisfaction || '',
        date_heure_rdv: ecoute.date_heure_rdv || '',
        type_rdv: ecoute.type_rdv || 'Téléphonique',
        age: ecoute.age || null,
        nombre_personnes: ecoute.nombre_personnes || null,
        code_postal: ecoute.code_postal || '',
        adresse_email: ecoute.adresse_email || ''
      })
      setAudioFile(null)
      // Si l'écoute a un lien audio Supabase, l'utiliser directement
      if (ecoute.lien_audio) {
        setAudioUrl(ecoute.lien_audio)
      } else {
        setAudioUrl(null)
      }
    } else {
      setEditingEcoute(null)
      setFormData({
        agent_id: activeAgents[0]?.id || '',
        projet: 'GBS Conseille',
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
        nom_client: '',
        est_nouveau_rdv: true,
        
        // Informations complémentaires RDV
        adresse: '',
        mutuelle_actuelle: '',
        prix_actuel: null,
        garantie: '',
        optique: '',
        dentaire: '',
        depassements_honoraires: '',
        ald: '',
        medecine_douce: '',
        hospitalisation: '',
        appareillage: '',
        regime: '',
        satisfaction: '',
        date_heure_rdv: '',
        type_rdv: 'Téléphonique',
        age: null,
        nombre_personnes: null,
        code_postal: '',
        adresse_email: ''
      })
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
      await updateEcoute(editingEcoute.id, {
        agent_id: formData.agent_id,
        projet: formData.projet,
        date_prise_rdv: formData.date_prise_rdv,
        lien_audio: audioUrl || editingEcoute.lien_audio || null,
        audio_data: null,
        audio_name: audioName || editingEcoute.audio_name,
        date_rdv: formData.date_rdv,
        statut_rdv: formData.statut_rdv,
        rdv_qualite: formData.rdv_qualite,
        rdv_honore: formData.rdv_honore,
        note_globale: formData.note_globale,
        remarques: formData.remarques || null,
        numero_client: formData.numero_client || null,
        nom_client: formData.nom_client || null,
        est_nouveau_rdv: formData.est_nouveau_rdv,
        
        // Informations complémentaires RDV
        adresse: formData.adresse || null,
        mutuelle_actuelle: formData.mutuelle_actuelle || null,
        prix_actuel: formData.prix_actuel || null,
        garantie: formData.garantie || null,
        optique: formData.optique || null,
        dentaire: formData.dentaire || null,
        depassements_honoraires: formData.depassements_honoraires || null,
        ald: formData.ald || null,
        medecine_douce: formData.medecine_douce || null,
        hospitalisation: formData.hospitalisation || null,
        appareillage: formData.appareillage || null,
        regime: formData.regime || null,
        satisfaction: formData.satisfaction || null,
        date_heure_rdv: formData.date_heure_rdv || null,
        type_rdv: formData.type_rdv || null,
        age: formData.age || null,
        nombre_personnes: formData.nombre_personnes || null,
        code_postal: formData.code_postal || null,
        adresse_email: formData.adresse_email || null,
        
        criteres: editingEcoute.criteres || {}
      })
    } else {
      await createEcoute({
        agent_id: formData.agent_id,
        projet: formData.projet,
        lien_audio: audioUrl || null,
        audio_data: null,
        audio_name: audioName,
        date_prise_rdv: formData.date_prise_rdv,
        date_rdv: formData.date_rdv,
        statut_rdv: formData.statut_rdv,
        rdv_qualite: formData.rdv_qualite,
        rdv_honore: formData.rdv_honore,
        suivi: null,
        confirmation: null,
        note_globale: formData.note_globale,
        remarques: formData.remarques || null,
        numero_client: formData.numero_client || null,
        nom_client: formData.nom_client || null,
        est_nouveau_rdv: formData.est_nouveau_rdv,
        
        // Informations complémentaires RDV
        adresse: formData.adresse || null,
        mutuelle_actuelle: formData.mutuelle_actuelle || null,
        prix_actuel: formData.prix_actuel || null,
        garantie: formData.garantie || null,
        optique: formData.optique || null,
        dentaire: formData.dentaire || null,
        depassements_honoraires: formData.depassements_honoraires || null,
        ald: formData.ald || null,
        medecine_douce: formData.medecine_douce || null,
        hospitalisation: formData.hospitalisation || null,
        appareillage: formData.appareillage || null,
        regime: formData.regime || null,
        satisfaction: formData.satisfaction || null,
        date_heure_rdv: formData.date_heure_rdv || null,
        type_rdv: formData.type_rdv || null,
        age: formData.age || null,
        nombre_personnes: formData.nombre_personnes || null,
        code_postal: formData.code_postal || null,
        adresse_email: formData.adresse_email || null,
        
        criteres: {}
      })
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

  const handleToggleQualite = async (ecouteId: string) => {
    try {
      await toggleQualiteSupabase(ecouteId)
    } catch (error) {
      console.error('Erreur lors du changement de qualité:', error)
    }
  }

  const handleUpdateStatutRdv = async (ecouteId: string, statutRdv: string) => {
    try {
      await updateEcoute(ecouteId, { statut_rdv: statutRdv })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut RDV:', error)
    }
  }

  const handleDeleteEcoute = async (ecouteId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette écoute ?')) {
      try {
        await deleteEcoute(ecouteId)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
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
        title="Écoutes / RDV"
        description="Créez et évaluez les écoutes de vos agents"
        action={
          <div className="flex gap-3">
            <button 
              onClick={() => openModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle écoute
            </button>
            <a 
              href="/formulaire-isole.html"
              target="_blank"
              className="btn-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Formulaire RDV
            </a>
          </div>
        }
      />

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7280] w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
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
          <div className="w-40">
            <input
              type="date"
              value={filterDatePriseDebut}
              onChange={(e) => setFilterDatePriseDebut(e.target.value)}
              className="input-field"
              placeholder="Date prise début"
            />
          </div>
          <div className="w-40">
            <input
              type="date"
              value={filterDatePriseFin}
              onChange={(e) => setFilterDatePriseFin(e.target.value)}
              className="input-field"
              placeholder="Date prise fin"
            />
          </div>
          <div className="w-40">
            <input
              type="date"
              value={filterDateRdvDebut}
              onChange={(e) => setFilterDateRdvDebut(e.target.value)}
              className="input-field"
              placeholder="Date RDV début"
            />
          </div>
          <div className="w-40">
            <input
              type="date"
              value={filterDateRdvFin}
              onChange={(e) => setFilterDateRdvFin(e.target.value)}
              className="input-field"
              placeholder="Date RDV fin"
            />
          </div>
          <div className="w-48">
            <select
              value={filterEstNouveauRdv}
              onChange={(e) => setFilterEstNouveauRdv(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les RDV</option>
              <option value="true">Nouveaux RDV</option>
              <option value="false">Relances</option>
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
                <th>Projet</th>
                <th>Date prise RDV</th>
                <th>Date RDV</th>
                <th>Heure RDV</th>
                <th>Type RDV</th>
                <th>Numéro client</th>
                <th>Nom client</th>
                <th>Adresse</th>
                <th>Mutuelle actuelle</th>
                <th>Prix actuel</th>
                <th>Garantie</th>
                <th>Optique</th>
                <th>Dentaire</th>
                <th>Dépassements</th>
                <th>ALD</th>
                <th>Médecine douce</th>
                <th>Hospitalisation</th>
                <th>Appareillage</th>
                <th>Régime</th>
                <th>Satisfaction</th>
                <th>Âge</th>
                <th>Nb personnes</th>
                <th>Code postal</th>
                <th>Email</th>
                <th>Statut RDV</th>
                <th>Note</th>
                <th>Remarques</th>
                <th>Audio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEcoutes.length === 0 ? (
                <tr>
                  <td colSpan={25} className="text-center py-8 text-[#6b7280]">
                    Aucune écoute trouvée
                  </td>
                </tr>
              ) : (
                currentEcoutes.map(ecoute => (
                  <tr key={ecoute.id}>
                    <td className="font-medium">{getAgentName(ecoute.agent_id)}</td>
                    <td className="text-[#6b7280]">{ecoute.projet || '-'}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_prise_rdv)}</td>
                    <td className="text-[#6b7280]">{formatDate(ecoute.date_rdv)}</td>
                    <td className="text-[#6b7280]">{ecoute.date_heure_rdv || '-'}</td>
                    <td>
                      <span className={`badge ${ecoute.est_nouveau_rdv ? 'badge-success' : 'badge-warning'}`}>
                        {ecoute.est_nouveau_rdv ? 'Nouveau RDV' : 'Relance'}
                      </span>
                    </td>
                    <td className="text-[#6b7280]">{ecoute.numero_client || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.nom_client || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.adresse || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.mutuelle_actuelle || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.prix_actuel ? `${ecoute.prix_actuel}€` : '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.garantie || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.optique || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.dentaire || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.depassements_honoraires || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.ald || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.medecine_douce || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.hospitalisation || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.appareillage || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.regime || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.satisfaction || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.age ? `${ecoute.age} ans` : '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.nombre_personnes || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.code_postal || '-'}</td>
                    <td className="text-[#6b7280]">{ecoute.adresse_email || '-'}</td>
                    <td>
                      <select
                        value={ecoute.statut_rdv}
                        onChange={(e) => handleUpdateStatutRdv(ecoute.id, e.target.value)}
                        className={`w-full min-w-[120px] text-sm border rounded-md px-2 py-1 font-medium focus:outline-none focus:ring-2 ${
                          ecoute.statut_rdv === 'Validé qualité' ? 'bg-green-50 border-green-300 text-green-800 focus:ring-green-500' :
                          ecoute.statut_rdv === '2ème passage' ? 'bg-yellow-50 border-yellow-300 text-yellow-800 focus:ring-yellow-500' :
                          ecoute.statut_rdv === 'Annulé' ? 'bg-red-50 border-red-300 text-red-800 focus:ring-red-500' :
                          'bg-white border-gray-300 text-gray-700 focus:ring-blue-500'
                        }`}
                      >
                        {STATUTS_RDV.map(statut => (
                          <option key={statut} value={statut}>{statut}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-center">
                      <span className={`font-semibold ${
                        ecoute.note_globale >= 7 ? 'text-[#10b981]' :
                        ecoute.note_globale >= 5 ? 'text-[#f59e0b]' :
                        'text-[#ef4444]'
                      }`}>
                        {ecoute.note_globale}/10
                      </span>
                    </td>
                    <td className="max-w-[150px] truncate text-sm text-[#6b7280]">
                      {ecoute.remarques || '-'}
                    </td>
                    <td className="text-center">
                      {ecoute.lien_audio ? (
                        <a
                          href={ecoute.lien_audio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7c3aed] hover:text-[#5b21b6] transition-colors"
                        >
                          <Headphones className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-[#6b7280]">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(ecoute)}
                          className="p-1 rounded hover:bg-[#f3f4f6] transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 text-[#6b7280]" />
                        </button>
                        <button
                          onClick={() => handleToggleQualite(ecoute.id)}
                          className={`p-1 rounded transition-colors ${
                            ecoute.rdv_qualite ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={ecoute.rdv_qualite ? 'Retirer qualité' : 'Marquer comme qualité'}
                        >
                          <Check className="w-4 h-4 text-[#10b981]" />
                        </button>
                        <button
                          onClick={() => handleDeleteEcoute(ecoute.id)}
                          className="p-1 rounded hover:bg-[#fee2e2] transition-colors"
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
        
        {/* Contrôles de pagination */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <div className="pagination-info">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEcoutes.length)} sur {filteredEcoutes.length} écoutes
            </div>
            <div className="pagination-buttons">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Précédent
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        )}
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
                Projet *
              </label>
              <select
                value={formData.projet}
                onChange={(e) => setFormData({ ...formData, projet: e.target.value })}
                className="input-field"
                required
              >
                {PROJETS.map(projet => (
                  <option key={projet} value={projet}>{projet}</option>
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
                Type de contact *
              </label>
              <select
                value={formData.est_nouveau_rdv.toString()}
                onChange={(e) => setFormData({ ...formData, est_nouveau_rdv: e.target.value === 'true' })}
                className="input-field"
                required
              >
                <option value="true">Nouveau RDV</option>
                <option value="false">Relance</option>
              </select>
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

          {/* Informations complémentaires RDV */}
          <div className="border-t border-[#e8e8e8] pt-4">
            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-4">Informations complémentaires RDV</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="input-field"
                  placeholder="Adresse du client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Mutuelle actuelle
                </label>
                <input
                  type="text"
                  value={formData.mutuelle_actuelle}
                  onChange={(e) => setFormData({ ...formData, mutuelle_actuelle: e.target.value })}
                  className="input-field"
                  placeholder="Mutuelle actuelle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Prix actuel (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prix_actuel || ''}
                  onChange={(e) => setFormData({ ...formData, prix_actuel: e.target.value ? parseFloat(e.target.value) : null })}
                  className="input-field"
                  placeholder="45.50"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Garantie souhaitée
                </label>
                <input
                  type="text"
                  value={formData.garantie}
                  onChange={(e) => setFormData({ ...formData, garantie: e.target.value })}
                  className="input-field"
                  placeholder="Garantie souhaitée"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Optique
                </label>
                <input
                  type="text"
                  value={formData.optique}
                  onChange={(e) => setFormData({ ...formData, optique: e.target.value })}
                  className="input-field"
                  placeholder="Couverture optique"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Dentaire
                </label>
                <input
                  type="text"
                  value={formData.dentaire}
                  onChange={(e) => setFormData({ ...formData, dentaire: e.target.value })}
                  className="input-field"
                  placeholder="Couverture dentaire"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Dépassements honoraires
                </label>
                <input
                  type="text"
                  value={formData.depassements_honoraires}
                  onChange={(e) => setFormData({ ...formData, depassements_honoraires: e.target.value })}
                  className="input-field"
                  placeholder="Dépassements honoraires"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  ALD
                </label>
                <input
                  type="text"
                  value={formData.ald}
                  onChange={(e) => setFormData({ ...formData, ald: e.target.value })}
                  className="input-field"
                  placeholder="Affection Longue Durée"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Médecine douce
                </label>
                <input
                  type="text"
                  value={formData.medecine_douce}
                  onChange={(e) => setFormData({ ...formData, medecine_douce: e.target.value })}
                  className="input-field"
                  placeholder="Médecine douce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Hospitalisation
                </label>
                <input
                  type="text"
                  value={formData.hospitalisation}
                  onChange={(e) => setFormData({ ...formData, hospitalisation: e.target.value })}
                  className="input-field"
                  placeholder="Type d'hospitalisation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Appareillage
                </label>
                <input
                  type="text"
                  value={formData.appareillage}
                  onChange={(e) => setFormData({ ...formData, appareillage: e.target.value })}
                  className="input-field"
                  placeholder="Type d'appareillage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Régime
                </label>
                <input
                  type="text"
                  value={formData.regime}
                  onChange={(e) => setFormData({ ...formData, regime: e.target.value })}
                  className="input-field"
                  placeholder="Régime sécurité sociale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Satisfaction actuelle
                </label>
                <input
                  type="text"
                  value={formData.satisfaction}
                  onChange={(e) => setFormData({ ...formData, satisfaction: e.target.value })}
                  className="input-field"
                  placeholder="Niveau de satisfaction"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Heure RDV
                </label>
                <input
                  type="time"
                  value={formData.date_heure_rdv}
                  onChange={(e) => setFormData({ ...formData, date_heure_rdv: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Type de RDV
                </label>
                <input
                  type="text"
                  value={formData.type_rdv}
                  onChange={(e) => setFormData({ ...formData, type_rdv: e.target.value })}
                  className="input-field"
                  placeholder="ex: Téléphonique, Physique, Visioconférence"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Âge
                </label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
                  className="input-field"
                  placeholder="35"
                  min="0"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Nombre de personnes
                </label>
                <input
                  type="number"
                  value={formData.nombre_personnes || ''}
                  onChange={(e) => setFormData({ ...formData, nombre_personnes: e.target.value ? parseInt(e.target.value) : null })}
                  className="input-field"
                  placeholder="1"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.code_postal}
                  onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                  className="input-field"
                  placeholder="75001"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.adresse_email}
                  onChange={(e) => setFormData({ ...formData, adresse_email: e.target.value })}
                  className="input-field"
                  placeholder="email@exemple.com"
                />
              </div>
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
