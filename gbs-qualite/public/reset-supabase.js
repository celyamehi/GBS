// Script de réinitialisation Supabase
// Ouvrez la console du navigateur (F12) sur https://gbs-qualite.vercel.app
// Copiez-collez ce code entier et appuyez sur Entrée

console.log('🚀 DÉBUT DE LA RÉINITIALISATION SUPABASE');

async function resetSupabase() {
  try {
    // Supprimer tous les agents
    console.log('📋 Suppression des agents...');
    const { error: agentsError } = await supabase.from('agents').delete().neq('id', '');
    if (agentsError) {
      console.error('❌ Erreur suppression agents:', agentsError.message);
    } else {
      console.log('✅ Tous les agents supprimés');
    }

    // Supprimer toutes les écoutes
    console.log('🎧 Suppression des écoutes...');
    const { error: ecoutesError } = await supabase.from('ecoutes').delete().neq('id', '');
    if (ecoutesError) {
      console.error('❌ Erreur suppression écoutes:', ecoutesError.message);
    } else {
      console.log('✅ Toutes les écoutes supprimées');
    }

    // Supprimer tous les briefings
    console.log('📝 Suppression des briefings...');
    const { error: briefingsError } = await supabase.from('briefings').delete().neq('id', '');
    if (briefingsError) {
      console.error('❌ Erreur suppression briefings:', briefingsError.message);
    } else {
      console.log('✅ Tous les briefings supprimés');
    }

    console.log('✅ Réinitialisation terminée ! Vous pouvez maintenant relancer la migration normale.');
    console.log('🔄 Allez sur https://gbs-qualite.vercel.app/migration et cliquez sur "Lancer la migration"');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  }
}

// Exécuter la réinitialisation
resetSupabase();
