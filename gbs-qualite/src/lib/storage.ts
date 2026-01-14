import { supabase } from './supabase'

/**
 * Upload un fichier audio vers Supabase Storage
 * @param file - Le fichier audio à uploader
 * @param ecouteId - L'ID de l'écoute pour nommer le fichier
 * @returns L'URL publique du fichier uploadé
 */
export async function uploadAudioFile(file: File, ecouteId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${ecouteId}.${fileExt}`
    const filePath = `ecoutes/${fileName}`

    // Upload le fichier vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-ecoutes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Remplace le fichier s'il existe déjà
      })

    if (error) {
      console.error('Erreur upload Supabase Storage:', error)
      return null
    }

    // Récupère l'URL publique du fichier
    const { data: { publicUrl } } = supabase.storage
      .from('audio-ecoutes')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return null
  }
}

/**
 * Supprime un fichier audio de Supabase Storage
 * @param audioUrl - L'URL du fichier à supprimer
 */
export async function deleteAudioFile(audioUrl: string): Promise<boolean> {
  try {
    // Extrait le chemin du fichier depuis l'URL
    const urlParts = audioUrl.split('/storage/v1/object/public/audio-ecoutes/')
    if (urlParts.length < 2) return false
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('audio-ecoutes')
      .remove([filePath])

    if (error) {
      console.error('Erreur suppression Supabase Storage:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return false
  }
}
