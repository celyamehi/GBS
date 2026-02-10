'use client'

import { useState } from 'react'
import { useAgents } from '@/hooks/useSupabaseData'
import { useEcoutes } from '@/hooks/useSupabaseData'
import { Calendar, Clock, User, Mail, Phone, MapPin, Euro, Shield, Heart, Activity, Users, FileText } from 'lucide-react'

export default function AgentFormulairePage() {
  const { agents, loading: agentsLoading } = useAgents()
  const { createEcoute } = useEcoutes()
  
  const [formData, setFormData] = useState({
    agent_id: '',
    projet: 'GBS Conseille',
    date_prise_rdv: new Date().toISOString().split('T')[0],
    date_rdv: '',
    date_heure_rdv: '',
    type_rdv: 'Téléphonique',
    numero_client: '',
    nom_client: '',
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
    age: null as number | null,
    nombre_personnes: null as number | null,
    code_postal: '',
    adresse_email: '',
    remarques: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const activeAgents = agents.filter(a => a.actif)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.agent_id || !formData.date_rdv || !formData.nom_client) {
      setMessage('Veuillez remplir les champs obligatoires')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      await createEcoute({
        agent_id: formData.agent_id,
        projet: formData.projet,
        lien_audio: null,
        audio_data: null,
        audio_name: null,
        date_prise_rdv: formData.date_prise_rdv,
        date_rdv: formData.date_rdv,
        statut_rdv: 'En attente',
        rdv_qualite: false,
        rdv_honore: null,
        suivi: null,
        confirmation: null,
        note_globale: 5,
        remarques: formData.remarques || null,
        numero_client: formData.numero_client || null,
        nom_client: formData.nom_client || null,
        est_nouveau_rdv: true,
        
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

      setMessage('✅ RDV enregistré avec succès !')
      
      // Réinitialiser le formulaire
      setFormData({
        agent_id: '',
        projet: 'GBS Conseille',
        date_prise_rdv: new Date().toISOString().split('T')[0],
        date_rdv: '',
        date_heure_rdv: '',
        type_rdv: 'Téléphonique',
        numero_client: '',
        nom_client: '',
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
        age: null,
        nombre_personnes: null,
        code_postal: '',
        adresse_email: '',
        remarques: ''
      })

    } catch (error) {
      setMessage('❌ Erreur lors de l\'enregistrement. Veuillez réessayer.')
      console.error('Erreur:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (agentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto mb-4"></div>
          <p className="text-[#6b7280]">Chargement des agents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête complètement isolé */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">
            Formulaire de Prise de RDV
          </h1>
          <p className="text-[#6b7280]">
            Remplissez les informations pour enregistrer un nouveau rendez-vous client
          </p>
        </div>

        {/* Message de confirmation */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            {/* Sélection de l'agent */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#7c3aed]" />
                Agent
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Agent * <span className="text-xs text-gray-500">(obligatoire)</span>
                  </label>
                  <select
                    value={formData.agent_id}
                    onChange={(e) => handleInputChange('agent_id', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Sélectionner un agent</option>
                    {activeAgents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Projet
                  </label>
                  <input
                    type="text"
                    value={formData.projet}
                    onChange={(e) => handleInputChange('projet', e.target.value)}
                    className="input-field"
                    placeholder="Nom du projet"
                  />
                </div>
              </div>
            </div>

            {/* Informations RDV */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#7c3aed]" />
                Informations du Rendez-vous
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Date prise RDV
                  </label>
                  <input
                    type="date"
                    value={formData.date_prise_rdv}
                    onChange={(e) => handleInputChange('date_prise_rdv', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Date RDV * <span className="text-xs text-gray-500">(obligatoire)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_rdv}
                    onChange={(e) => handleInputChange('date_rdv', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Heure RDV
                  </label>
                  <input
                    type="time"
                    value={formData.date_heure_rdv}
                    onChange={(e) => handleInputChange('date_heure_rdv', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Type RDV
                  </label>
                  <input
                    type="text"
                    value={formData.type_rdv}
                    onChange={(e) => handleInputChange('type_rdv', e.target.value)}
                    className="input-field"
                    placeholder="Type de rendez-vous"
                  />
                </div>
              </div>
            </div>

            {/* Informations Client */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#7c3aed]" />
                Informations Client
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Nom client * <span className="text-xs text-gray-500">(obligatoire)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nom_client}
                    onChange={(e) => handleInputChange('nom_client', e.target.value)}
                    className="input-field"
                    placeholder="Nom du client"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Numéro client
                  </label>
                  <input
                    type="tel"
                    value={formData.numero_client}
                    onChange={(e) => handleInputChange('numero_client', e.target.value)}
                    className="input-field"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.adresse_email}
                    onChange={(e) => handleInputChange('adresse_email', e.target.value)}
                    className="input-field"
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    className="input-field"
                    placeholder="123 rue de la République"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.code_postal}
                    onChange={(e) => handleInputChange('code_postal', e.target.value)}
                    className="input-field"
                    placeholder="75001"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                    placeholder="35"
                    min="0"
                    max="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Nombre de personnes
                  </label>
                  <input
                    type="number"
                    value={formData.nombre_personnes || ''}
                    onChange={(e) => handleInputChange('nombre_personnes', e.target.value ? parseInt(e.target.value) : null)}
                    className="input-field"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Informations Mutuelle */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#7c3aed]" />
                Informations Mutuelle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Mutuelle actuelle
                  </label>
                  <input
                    type="text"
                    value={formData.mutuelle_actuelle}
                    onChange={(e) => handleInputChange('mutuelle_actuelle', e.target.value)}
                    className="input-field"
                    placeholder="Nom de la mutuelle actuelle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Prix actuel (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prix_actuel || ''}
                    onChange={(e) => handleInputChange('prix_actuel', e.target.value ? parseFloat(e.target.value) : null)}
                    className="input-field"
                    placeholder="45.50"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Garantie souhaitée
                  </label>
                  <input
                    type="text"
                    value={formData.garantie}
                    onChange={(e) => handleInputChange('garantie', e.target.value)}
                    className="input-field"
                    placeholder="Garantie souhaitée"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Optique
                  </label>
                  <input
                    type="text"
                    value={formData.optique}
                    onChange={(e) => handleInputChange('optique', e.target.value)}
                    className="input-field"
                    placeholder="Couverture optique"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Dentaire
                  </label>
                  <input
                    type="text"
                    value={formData.dentaire}
                    onChange={(e) => handleInputChange('dentaire', e.target.value)}
                    className="input-field"
                    placeholder="Couverture dentaire"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Dépassements honoraires
                  </label>
                  <input
                    type="text"
                    value={formData.depassements_honoraires}
                    onChange={(e) => handleInputChange('depassements_honoraires', e.target.value)}
                    className="input-field"
                    placeholder="Dépassements honoraires"
                  />
                </div>
              </div>
            </div>

            {/* Santé et Préférences */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#7c3aed]" />
                Santé et Préférences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    ALD
                  </label>
                  <input
                    type="text"
                    value={formData.ald}
                    onChange={(e) => handleInputChange('ald', e.target.value)}
                    className="input-field"
                    placeholder="Affection Longue Durée"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Médecine douce
                  </label>
                  <input
                    type="text"
                    value={formData.medecine_douce}
                    onChange={(e) => handleInputChange('medecine_douce', e.target.value)}
                    className="input-field"
                    placeholder="Médecine douce"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Hospitalisation
                  </label>
                  <input
                    type="text"
                    value={formData.hospitalisation}
                    onChange={(e) => handleInputChange('hospitalisation', e.target.value)}
                    className="input-field"
                    placeholder="Type d'hospitalisation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Appareillage
                  </label>
                  <input
                    type="text"
                    value={formData.appareillage}
                    onChange={(e) => handleInputChange('appareillage', e.target.value)}
                    className="input-field"
                    placeholder="Type d'appareillage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Régime
                  </label>
                  <input
                    type="text"
                    value={formData.regime}
                    onChange={(e) => handleInputChange('regime', e.target.value)}
                    className="input-field"
                    placeholder="Régime sécurité sociale"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6b7280] mb-2">
                    Satisfaction actuelle
                  </label>
                  <input
                    type="text"
                    value={formData.satisfaction}
                    onChange={(e) => handleInputChange('satisfaction', e.target.value)}
                    className="input-field"
                    placeholder="Niveau de satisfaction"
                  />
                </div>
              </div>
            </div>

            {/* Remarques */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7c3aed]" />
                Remarques
              </h2>
              <div>
                <label className="block text-sm font-medium text-[#6b7280] mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  value={formData.remarques}
                  onChange={(e) => handleInputChange('remarques', e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Ajoutez des remarques ou notes importantes..."
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2 px-8 py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Enregistrer le RDV
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-secondary px-8 py-3"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </form>

        {/* Pied de page simple */}
        <div className="text-center mt-8 text-[#6b7280] text-sm">
          <p>Formulaire de prise de RDV - GBS Qualité</p>
        </div>
      </div>
    </div>
  )
}
