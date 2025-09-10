'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, Eye, EyeOff, FileText, Image, Link, Type, List, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useTenant } from '@/providers/tenant-provider'

interface Page {
  id: string
  title: string
  slug: string
  content: any
  isActive: boolean
  status: string
  createdAt: string
  updatedAt: string
  seo?: {
    title?: string
    description?: string
  }
}

interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'button' | 'spacer'
  content: any
}

export function ContentManager() {
  const { tenant } = useTenant()
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: { blocks: [] },
    metaTitle: '',
    metaDescription: '',
    isActive: false,
    status: 'DRAFT'
  })

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])

  useEffect(() => {
    fetchPages()
  }, [tenant])

  const fetchPages = async () => {
    if (!tenant?.id) return
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/pages`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setPages(data)
      } else {
        throw new Error('Failed to fetch pages')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des pages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant?.id) return
    
    try {
      const token = localStorage.getItem('accessToken')
      
      if (editingPage) {
        // Mise à jour
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/pages/${editingPage.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
              title: formData.title,
              slug: formData.slug,
              content: formData.content,
              metaTitle: formData.metaTitle,
              metaDescription: formData.metaDescription,
              isActive: formData.isActive,
              status: formData.status
            })
          }
        )
        
        if (response.ok) {
          toast.success('Page mise à jour')
          fetchPages()
        } else {
          throw new Error('Failed to update page')
        }
      } else {
        // Création
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/pages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
              title: formData.title,
              slug: formData.slug,
              content: formData.content,
              metaTitle: formData.metaTitle,
              metaDescription: formData.metaDescription,
              isActive: formData.isActive,
              status: formData.status
            })
          }
        )
        
        if (response.ok) {
          toast.success('Page créée avec succès')
          fetchPages()
        } else {
          throw new Error('Failed to create page')
        }
      }
      
      resetForm()
      setIsCreating(false)
      setEditingPage(null)
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
      console.error(error)
    }
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.seo?.title || '',
      metaDescription: page.seo?.description || '',
      isActive: page.isActive,
      status: page.status
    })
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!tenant?.id) return
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/pages/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
        )
        
        if (response.ok) {
          toast.success('Page supprimée')
          fetchPages()
        } else {
          throw new Error('Failed to delete page')
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression')
        console.error(error)
      }
    }
  }

  const handleTogglePublish = async (page: Page) => {
    if (!tenant?.id) return
    
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}/pages/${page.id}/publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ publish: !page.isActive })
        }
      )
      
      if (response.ok) {
        toast.success(page.isActive ? 'Page dépubliée' : 'Page publiée')
        fetchPages()
      } else {
        throw new Error('Failed to toggle publish status')
      }
    } catch (error) {
      toast.error('Erreur lors du changement de statut')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: { blocks: [] },
      metaTitle: '',
      metaDescription: '',
      isActive: false,
      status: 'DRAFT'
    })
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? { text: '' } 
        : type === 'image' ? { url: '', alt: '' }
        : type === 'button' ? { text: 'Cliquez ici', url: '#' }
        : type === 'spacer' ? { height: 50 }
        : {}
    }
    setContentBlocks([...contentBlocks, newBlock])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion du contenu</h2>
          <p className="text-gray-600">Créez et modifiez les pages de votre site</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingPage(null)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Modifier la page' : 'Créer une nouvelle page'}
              </DialogTitle>
              <DialogDescription>
                Créez ou modifiez le contenu de votre page
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de la page</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          title: e.target.value,
                          slug: generateSlug(e.target.value)
                        }))
                      }}
                      placeholder="Ex: À propos de nous"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL de la page</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">/t/{tenant.slug}/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="a-propos"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="content">Contenu</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addContentBlock('text')}
                        >
                          <Type className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addContentBlock('image')}
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addContentBlock('button')}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Écrivez le contenu de votre page..."
                      rows={10}
                      required
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Titre SEO</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Titre pour les moteurs de recherche"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.metaTitle.length}/60 caractères
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Description SEO</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Description pour les moteurs de recherche"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.metaDescription.length}/160 caractères
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isActive">Publier la page</Label>
                      <p className="text-sm text-gray-600">
                        Rendre la page visible sur votre site
                      </p>
                    </div>
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-5 w-5"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreating(false)
                  setEditingPage(null)
                  resetForm()
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingPage ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune page</h3>
            <p className="text-gray-600 mb-4">Créez votre première page</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{page.title}</h3>
                      {page.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Publiée
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Brouillon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      URL: /t/{tenant.slug}/{page.slug}
                    </p>
                    <p className="text-sm text-gray-500">
                      Dernière modification: {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTogglePublish(page)}
                    >
                      {page.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(page.id)}
                      disabled={page.slug === 'home'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}