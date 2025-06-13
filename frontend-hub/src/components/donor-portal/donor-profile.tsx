'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDonorProfile, useUpdateDonorProfile } from '@/hooks/use-donor-profile'
import { toast } from 'sonner'

// Placeholder for auth context
const useAuth = () => ({
  user: { email: 'test@example.com' }
})

export function DonorProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  
  // Récupération du profil donateur
  const { data: profile, isLoading, error } = useDonorProfile(user?.email)
  
  // Mutation pour mise à jour
  const updateProfile = useUpdateDonorProfile()

  // État local pour l'édition
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    preferences: {
      emailNotifications: true,
      donationReceipts: true,
      newsletterUpdates: false,
      campaignUpdates: true
    }
  })

  // Initialiser les données d'édition quand le profil est chargé
  React.useEffect(() => {
    if (profile && !isEditing) {
      setEditData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        preferences: {
          emailNotifications: profile.preferences?.emailNotifications ?? true,
          donationReceipts: profile.preferences?.donationReceipts ?? true,
          newsletterUpdates: profile.preferences?.newsletterUpdates ?? false,
          campaignUpdates: profile.preferences?.campaignUpdates ?? true
        }
      })
    }
  }, [profile, isEditing])

  const handleSave = async () => {
    if (!user?.email) return

    try {
      await updateProfile.mutateAsync({
        email: user.email,
        data: editData
      })
      
      setIsEditing(false)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Réinitialiser les données d'édition
    if (profile) {
      setEditData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        preferences: {
          emailNotifications: profile.preferences?.emailNotifications ?? true,
          donationReceipts: profile.preferences?.donationReceipts ?? true,
          newsletterUpdates: profile.preferences?.newsletterUpdates ?? false,
          campaignUpdates: profile.preferences?.campaignUpdates ?? true
        }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Erreur lors du chargement du profil</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et préférences</p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={updateProfile.isPending}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Informations</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Ces informations seront utilisées pour vos reçus fiscaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={isEditing ? editData.firstName : (profile?.firstName || '')}
                    onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={isEditing ? editData.lastName : (profile?.lastName || '')}
                    onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={isEditing ? editData.phone : (profile?.phone || '')}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biographie (optionnel)</Label>
                <Textarea
                  id="bio"
                  value={isEditing ? editData.bio : (profile?.bio || '')}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Parlez-nous de vous et de vos motivations..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de communication</CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez être informé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Notifications par email</div>
                    <div className="text-sm text-gray-500">
                      Recevoir des notifications importantes par email
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.preferences.emailNotifications : (profile?.preferences?.emailNotifications ?? true)}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailNotifications: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Reçus de dons automatiques</div>
                    <div className="text-sm text-gray-500">
                      Recevoir automatiquement les reçus fiscaux
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.preferences.donationReceipts : (profile?.preferences?.donationReceipts ?? true)}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, donationReceipts: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Newsletter</div>
                    <div className="text-sm text-gray-500">
                      Recevoir les actualités et nouveautés de la plateforme
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.preferences.newsletterUpdates : (profile?.preferences?.newsletterUpdates ?? false)}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, newsletterUpdates: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Mises à jour des campagnes</div>
                    <div className="text-sm text-gray-500">
                      Être informé des progrès des campagnes que vous soutenez
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.preferences.campaignUpdates : (profile?.preferences?.campaignUpdates ?? true)}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, campaignUpdates: e.target.checked }
                    }))}
                    disabled={!isEditing}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Total des dons</div>
                <div className="text-2xl font-bold">{profile?.stats?.totalDonations || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Montant total</div>
                <div className="text-2xl font-bold">{(profile?.stats?.totalAmount || 0).toFixed(2)}€</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Don moyen</div>
                <div className="text-2xl font-bold">{(profile?.stats?.averageDonation || 0).toFixed(2)}€</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Associations</div>
                <div className="text-2xl font-bold">{profile?.stats?.associationsCount || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Badges et réalisations</CardTitle>
              <CardDescription>
                Vos contributions reconnues par la communauté
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(profile?.stats?.totalDonations ?? 0) >= 1 && (
                  <Badge variant="secondary">🎯 Premier don</Badge>
                )}
                {(profile?.stats?.totalDonations ?? 0) >= 5 && (
                  <Badge variant="secondary">⭐ Donateur régulier</Badge>
                )}
                {(profile?.stats?.totalDonations ?? 0) >= 10 && (
                  <Badge variant="secondary">💎 Soutien fidèle</Badge>
                )}
                {(profile?.stats?.totalAmount ?? 0) >= 100 && (
                  <Badge variant="secondary">🏆 Généreux donateur</Badge>
                )}
                {(profile?.stats?.associationsCount ?? 0) >= 3 && (
                  <Badge variant="secondary">🌟 Diversifié</Badge>
                )}
                
                {(!profile?.stats?.totalDonations || profile.stats.totalDonations === 0) && (
                  <p className="text-gray-500">Aucun badge pour le moment. Faites votre premier don !</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Membre depuis</span>
                <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dernière activité</span>
                <span>{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Statut</span>
                <Badge variant={profile?.isActive ? 'default' : 'secondary'}>
                  {profile?.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
