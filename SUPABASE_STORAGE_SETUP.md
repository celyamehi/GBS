# Configuration Supabase Storage pour les fichiers audio

## Étape 1 : Créer le bucket dans Supabase

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Dans le menu latéral, cliquez sur **Storage**
3. Cliquez sur **New bucket**
4. Configurez le bucket :
   - **Name** : `audio-ecoutes`
   - **Public bucket** : ✅ Cochez cette option (pour que les fichiers soient accessibles publiquement)
   - Cliquez sur **Create bucket**

## Étape 2 : Configurer les politiques d'accès (RLS)

Par défaut, même avec un bucket public, vous devez configurer les politiques d'accès.

1. Cliquez sur le bucket `audio-ecoutes`
2. Allez dans l'onglet **Policies**
3. Cliquez sur **New policy**

### Politique 1 : Upload (INSERT)
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'audio-ecoutes');
```

### Politique 2 : Lecture (SELECT)
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-ecoutes');
```

### Politique 3 : Mise à jour (UPDATE)
```sql
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'audio-ecoutes');
```

### Politique 4 : Suppression (DELETE)
```sql
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'audio-ecoutes');
```

## Étape 3 : Vérifier la configuration

1. Retournez dans votre application
2. Créez une nouvelle écoute et uploadez un fichier audio
3. Si l'upload réussit, vous verrez le fichier dans Supabase Storage
4. Le fichier sera accessible via une URL publique

## Structure des fichiers

Les fichiers audio sont stockés avec la structure suivante :
```
audio-ecoutes/
  └── ecoutes/
      ├── 1234567890.mp3
      ├── 1234567891.wav
      └── ...
```

Chaque fichier est nommé avec l'ID de l'écoute + l'extension du fichier original.

## Dépannage

### Erreur : "new row violates row-level security policy"
- Vérifiez que les politiques RLS sont bien configurées
- Assurez-vous que le bucket est bien public

### Erreur : "Bucket not found"
- Vérifiez que le bucket `audio-ecoutes` existe bien
- Vérifiez l'orthographe exacte du nom du bucket

### Erreur : "Invalid API key"
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont bien configurés dans `.env.local`
- Redémarrez le serveur de développement après modification du `.env.local`

## Sécurité (optionnel)

Pour une meilleure sécurité, vous pouvez :

1. Désactiver le bucket public
2. Configurer des politiques RLS plus restrictives basées sur l'authentification
3. Ajouter une authentification Supabase à votre application

Exemple de politique avec authentification :
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-ecoutes');
```
