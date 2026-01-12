'use client'

import { useState } from 'react'
import { Search, Plus, Copy, Sparkles, Check } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { mockAgents, mockBriefings } from '@/data/mockData'
import { Agent, Briefing } from '@/lib/supabase'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function BriefingsPage() {
  const [agents] = useLocalStorage<Agent[]>('gbs-agents', mockAgents)
  const [briefings, setBriefings] = useLocalStorage<Briefing[]>('gbs-briefings', mockBriefings)
  const [filterAgent, setFilterAgent] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [newBriefingData, setNewBriefingData] = useState({
    agent_id: '',
    remarques: ''
  })

  const activeAgents = agents.filter(a => a.actif)

  const filteredBriefings = briefings.filter(briefing => {
    const matchesAgent = !filterAgent || briefing.agent_id === filterAgent
    const matchesType = !filterType || briefing.type === filterType
    const matchesDate = !filterDate || briefing.date_briefing === filterDate
    return matchesAgent && matchesType && matchesDate
  })

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.nom || 'Agent inconnu'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const openDetail = (briefing: Briefing) => {
    setSelectedBriefing(briefing)
    setIsDetailOpen(true)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateBriefing = async () => {
    if (!newBriefingData.agent_id || !newBriefingData.remarques) return
    
    setIsGenerating(true)
    
    const agent = agents.find(a => a.id === newBriefingData.agent_id)
    
    const generatedContent = `**Briefing pour ${agent?.nom || 'Agent'} - ${formatDate(new Date().toISOString().split('T')[0])}**

**Basé sur vos remarques :**
${newBriefingData.remarques}

**Axes prioritaires de travail :**
1. **Amélioration de la découverte** - Approfondir les questions sur les besoins du prospect
2. **Reformulation systématique** - Valider la compréhension avant de proposer
3. **Gestion des objections** - Préparer des réponses adaptées aux objections fréquentes
4. **Sécurisation du RDV** - Renforcer la confirmation avec rappel des bénéfices

**Exemples de formulations :**
- "Si je comprends bien, vous recherchez une mutuelle qui couvre particulièrement..."
- "Qu'est-ce qui est le plus important pour vous en matière de santé ?"
- "Je comprends votre hésitation, permettez-moi de vous expliquer..."

**Consignes concrètes :**
- Prendre des notes pendant l'appel
- Utiliser le prénom du prospect
- Terminer sur une note positive
- Confirmer le RDV avec tous les détails`

    const newBriefing: Briefing = {
      id: Date.now().toString(),
      agent_id: newBriefingData.agent_id,
      date_briefing: new Date().toISOString().split('T')[0],
      type: 'manuel',
      contenu: generatedContent,
      created_at: new Date().toISOString()
    }

    setBriefings([newBriefing, ...briefings])
    setIsGenerating(false)
    setIsModalOpen(false)
    setNewBriefingData({ agent_id: '', remarques: '' })
    
    setSelectedBriefing(newBriefing)
    setIsDetailOpen(true)
  }

  const generateDailyBriefings = async () => {
    setIsGenerating(true)
    
    const today = new Date().toISOString().split('T')[0]
    const newBriefings: Briefing[] = []

    for (const agent of activeAgents) {
      const existingToday = briefings.find(
        b => b.agent_id === agent.id && b.date_briefing === today && b.type === 'automatique'
      )
      
      if (!existingToday) {
        const briefing: Briefing = {
          id: Date.now().toString() + agent.id,
          agent_id: agent.id,
          date_briefing: today,
          type: 'automatique',
          contenu: `**Briefing automatique pour ${agent.nom} - ${formatDate(today)}**

**Analyse de la journée précédente :**
Briefing généré automatiquement basé sur les performances récentes.

**Axes prioritaires de travail :**
1. **Respect du script** - Suivre toutes les étapes du script GBS V7
2. **Qualification approfondie** - Vérifier tous les critères HC
3. **Découverte des besoins** - Explorer optique, dentaire, hospitalisation
4. **Sécurisation** - Confirmer et valoriser chaque RDV

**Rappels importants :**
- Avis enregistrement RGPD obligatoire
- Question clé avant proposition
- Récapitulatif complet en fin d'appel

**Objectif du jour :**
Maintenir un taux de qualité élevé et sécuriser les RDV pris.`,
          created_at: new Date().toISOString()
        }
        newBriefings.push(briefing)
      }
    }

    if (newBriefings.length > 0) {
      setBriefings([...newBriefings, ...briefings])
    }
    
    setIsGenerating(false)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Briefings IA"
        description="Consultez et créez des briefings pour vos agents"
        action={
          <div className="flex gap-3">
            <button 
              onClick={generateDailyBriefings}
              disabled={isGenerating}
              className="btn-secondary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Génération...' : 'Générer briefings du jour'}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau briefing manuel
            </button>
          </div>
        }
      />

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field"
            />
          </div>
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
            <label className="block text-sm font-medium text-[#6b7280] mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="">Tous les types</option>
              <option value="automatique">Automatique</option>
              <option value="manuel">Manuel</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBriefings.length === 0 ? (
          <div className="col-span-full card p-8 text-center text-[#6b7280]">
            Aucun briefing trouvé pour cette date
          </div>
        ) : (
          filteredBriefings.map(briefing => (
            <div 
              key={briefing.id} 
              className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetail(briefing)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#1a1a2e]">{getAgentName(briefing.agent_id)}</h3>
                  <p className="text-sm text-[#6b7280]">{formatDate(briefing.date_briefing)}</p>
                </div>
                <span className={`badge ${briefing.type === 'automatique' ? 'badge-info' : 'badge-warning'}`}>
                  {briefing.type === 'automatique' ? 'Auto' : 'Manuel'}
                </span>
              </div>
              <p className="text-sm text-[#6b7280] line-clamp-3">
                {briefing.contenu.substring(0, 150)}...
              </p>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau briefing manuel"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
              Agent *
            </label>
            <select
              value={newBriefingData.agent_id}
              onChange={(e) => setNewBriefingData({ ...newBriefingData, agent_id: e.target.value })}
              className="input-field"
            >
              <option value="">Sélectionner un agent</option>
              {activeAgents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
              Remarques / Points à aborder *
            </label>
            <textarea
              value={newBriefingData.remarques}
              onChange={(e) => setNewBriefingData({ ...newBriefingData, remarques: e.target.value })}
              className="input-field min-h-[150px]"
              placeholder="Décrivez les points à améliorer, les erreurs observées, les axes de travail..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button 
              onClick={handleGenerateBriefing}
              disabled={isGenerating || !newBriefingData.agent_id || !newBriefingData.remarques}
              className="btn-primary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Génération...' : 'Générer le briefing'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedBriefing ? `Briefing - ${getAgentName(selectedBriefing.agent_id)}` : 'Briefing'}
        size="lg"
      >
        {selectedBriefing && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e8e8e8]">
              <div>
                <p className="text-sm text-[#6b7280]">{formatDate(selectedBriefing.date_briefing)}</p>
                <span className={`badge mt-1 ${selectedBriefing.type === 'automatique' ? 'badge-info' : 'badge-warning'}`}>
                  {selectedBriefing.type === 'automatique' ? 'Automatique' : 'Manuel'}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(selectedBriefing.contenu)}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-[#1a1a2e] leading-relaxed">
                {selectedBriefing.contenu}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
