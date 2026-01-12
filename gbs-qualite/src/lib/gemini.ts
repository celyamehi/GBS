const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function generateBriefing(
  agentNom: string,
  rdvAnnules: number,
  problemesRecurrents: string[],
  remarques: string[]
): Promise<string> {
  const prompt = `Tu es superviseur qualité en centre d'appel pour GBS Conseil (télésales mutuelle santé).
À partir de ces informations (RDV annulés de la journée pour cet agent), génère un briefing opérationnel pour la journée de demain :

**Nom agent:** ${agentNom}
**Nombre de RDV annulés:** ${rdvAnnules}
**Problèmes récurrents:** ${problemesRecurrents.length > 0 ? problemesRecurrents.join(', ') : 'Aucun problème identifié'}
**Remarques qualiticienne:** ${remarques.length > 0 ? remarques.join(' | ') : 'Aucune remarque'}

Donne :
- 3 à 5 axes prioritaires de travail
- Des exemples de formulations à utiliser
- Des consignes concrètes pour le prochain jour de production

Sois concis, bienveillant mais direct. Le briefing doit être actionnable.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('Réponse vide de Gemini')
    }

    return text
  } catch (error) {
    console.error('Erreur lors de la génération du briefing:', error)
    throw error
  }
}

export async function generateManualBriefing(
  agentNom: string,
  remarques: string
): Promise<string> {
  const prompt = `Tu es superviseur qualité en centre d'appel pour GBS Conseil (télésales mutuelle santé).
Génère un briefing personnalisé pour cet agent basé sur les remarques suivantes :

**Nom agent:** ${agentNom}
**Remarques:** ${remarques}

Donne :
- 3 à 5 axes prioritaires de travail
- Des exemples de formulations à utiliser
- Des consignes concrètes pour améliorer la performance

Sois concis, bienveillant mais direct. Le briefing doit être actionnable.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('Réponse vide de Gemini')
    }

    return text
  } catch (error) {
    console.error('Erreur lors de la génération du briefing manuel:', error)
    throw error
  }
}
