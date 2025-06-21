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
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export function DonorProfile() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Récupération du profil donateur pour les stats seulement
  const { data: donorStats } = useDonorProfile(user?.email)

  // État local pour l'édition - initialisé avec les données du user
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: '',
    preferences: {
      emailNotifications: true,
      donationReceipts: true,
      newsletterUpdates: false,
      campaignUpdates: true
    }
  })

  // Initialiser les données d'édition avec les données du user
  React.useEffect(() => {
    if (user && !isEditing) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        preferences: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          donationReceipts: user.preferences?.donationReceipts ?? true,
          newsletterUpdates: user.preferences?.newsletterUpdates ?? false,
          campaignUpdates: user.preferences?.campaignUpdates ?? true
        }
      })
    }
  }, [user, isEditing])

  const handleSave = async () => {
    if (!user?.email) return

    setIsUpdating(true)
    try {
      await updateProfile({
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        addressLine1: editData.addressLine1,
        addressLine2: editData.addressLine2,
        city: editData.city,
        postalCode: editData.postalCode,
        country: editData.country,
        preferences: editData.preferences,
      })
      
      setIsEditing(false)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Réinitialiser les données d'édition avec les données du user
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        preferences: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          donationReceipts: user.preferences?.donationReceipts ?? true,
          newsletterUpdates: user.preferences?.newsletterUpdates ?? false,
          campaignUpdates: user.preferences?.campaignUpdates ?? true
        }
      })
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Veuillez vous connecter pour voir votre profil</p>
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
                disabled={isUpdating}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
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
                    value={isEditing ? editData.firstName : (user?.firstName || '')}
                    onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={isEditing ? editData.lastName : (user?.lastName || '')}
                    onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
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
                  value={isEditing ? editData.phone : (user?.phone || '')}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              {/* Section Adresse */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Adresse postale</h4>
                
                <div>
                  <Label htmlFor="addressLine1">Adresse ligne 1</Label>
                  <Input
                    id="addressLine1"
                    value={isEditing ? editData.addressLine1 : (user?.addressLine1 || '')}
                    onChange={(e) => setEditData(prev => ({ ...prev, addressLine1: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Numéro et nom de rue"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">Adresse ligne 2 (optionnel)</Label>
                  <Input
                    id="addressLine2"
                    value={isEditing ? editData.addressLine2 : (user?.addressLine2 || '')}
                    onChange={(e) => setEditData(prev => ({ ...prev, addressLine2: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Complément d'adresse, bâtiment, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={isEditing ? editData.postalCode : (user?.postalCode || '')}
                      onChange={(e) => setEditData(prev => ({ ...prev, postalCode: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="75001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={isEditing ? editData.city : (user?.city || '')}
                      onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Paris"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={isEditing ? editData.country : (user?.country || '')}
                      onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="France"
                    />
                  </div>
                </div>
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
                    checked={isEditing ? editData.preferences.emailNotifications : (user?.preferences?.emailNotifications ?? true)}
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
                    checked={isEditing ? editData.preferences.donationReceipts : (user?.preferences?.donationReceipts ?? true)}
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
                    checked={isEditing ? editData.preferences.newsletterUpdates : (user?.preferences?.newsletterUpdates ?? false)}
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
                    checked={isEditing ? editData.preferences.campaignUpdates : (user?.preferences?.campaignUpdates ?? true)}
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
                <div className="text-2xl font-bold">{donorStats?.totalDonations || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Montant total</div>
                <div className="text-2xl font-bold">{(donorStats?.totalAmount || 0).toFixed(2)}€</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Don moyen</div>
                <div className="text-2xl font-bold">{donorStats?.totalDonations > 0 ? ((donorStats?.totalAmount || 0) / donorStats.totalDonations).toFixed(2) : '0.00'}€</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-gray-500">Associations</div>
                <div className="text-2xl font-bold">{donorStats?.favoriteAssociations?.length || 0}</div>
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
                {(donorStats?.totalDonations ?? 0) >= 1 && (
                  <Badge variant="secondary">🎯 Premier don</Badge>
                )}
                {(donorStats?.totalDonations ?? 0) >= 5 && (
                  <Badge variant="secondary">⭐ Donateur régulier</Badge>
                )}
                {(donorStats?.totalDonations ?? 0) >= 10 && (
                  <Badge variant="secondary">💎 Soutien fidèle</Badge>
                )}
                {(donorStats?.totalAmount ?? 0) >= 100 && (
                  <Badge variant="secondary">🏆 Généreux donateur</Badge>
                )}
                {(donorStats?.favoriteAssociations?.length ?? 0) >= 3 && (
                  <Badge variant="secondary">🌟 Diversifié</Badge>
                )}
                
                {(!donorStats?.totalDonations || donorStats.totalDonations === 0) && (
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
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dernière activité</span>
                <span>{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Statut</span>
                <Badge variant={user?.isActive ? 'default' : 'secondary'}>
                  {user?.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
