// Script simple pour récupérer uniquement les agents de Supabase
// SANS supprimer aucune donnée existante

console.log('🔍 RÉCUPÉRATION SÉCURISÉE DES AGENTS');
console.log('Ce script NE SUPPRIME AUCUNE DONNÉE existante');

async function recupererAgents() {
  try {
    // Récupérer tous les agents
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return;
    }
    
    console.log(`✅ ${data.length} agents récupérés avec succès :`);
    console.log('');
    
    // Afficher chaque agent avec ses informations
    data.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.nom}`);
      console.log(`   ID Supabase: ${agent.id}`);
      console.log(`   Code agent: ${agent.code_agent}`);
      console.log(`   Projet: ${agent.projet || 'Non défini'}`);
      console.log(`   Actif: ${agent.actif ? 'Oui' : 'Non'}`);
      console.log(`   Créé le: ${new Date(agent.created_at).toLocaleString('fr-FR')}`);
      console.log('');
    });
    
    // Créer un objet copiable pour la correspondance ID → Code
    const correspondance = {};
    data.forEach(agent => {
      if (agent.code_agent) {
        correspondance[agent.id] = agent.code_agent;
      }
    });
    
    console.log('📋 TABLE DE CORRESPONDANCE ID → CODE (à copier) :');
    console.log('const idToCodeMap = {');
    Object.entries(correspondance).forEach(([id, code]) => {
      console.log(`  '${id}': '${code}',`);
    });
    console.log('};');
    console.log('');
    console.log('✅ Récupération terminée ! Vous pouvez maintenant utiliser ces informations.');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter la récupération
recupererAgents();
