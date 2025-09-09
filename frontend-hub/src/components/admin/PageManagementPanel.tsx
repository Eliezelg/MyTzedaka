'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Edit3, Trash2, Eye, EyeOff, Search,
  Settings, Globe, Tag, Calendar, BarChart, ChevronRight,
  Layout, Image, MessageSquare, HelpCircle, Mail, Code,
  Save, X, Check, AlertCircle, Copy, ExternalLink, 
  Move, Type, Palette, Shield, Star, TrendingUp
} from 'lucide-react';
import { RippleButton, ShimmerSkeleton, Toast } from '../animations/AnimatedComponents';

interface Page {
  id: string;
  title: string;
  slug: string;
  type: 'STATIC' | 'BLOG' | 'GALLERY' | 'EVENTS' | 'FAQ' | 'CONTACT' | 'CUSTOM';
  content: string;
  isActive: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
  settings: {
    showInNavbar?: boolean;
    showInFooter?: boolean;
    requireAuth?: boolean;
    icon?: string;
    navOrder?: number;
    template?: string;
  };
  tags: string[];
}

const PageManagementPanel: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setPages([
        {
          id: '1',
          title: 'À propos',
          slug: 'about',
          type: 'STATIC',
          content: '<h1>À propos de nous</h1><p>Notre histoire...</p>',
          isActive: true,
          status: 'PUBLISHED',
          views: 1234,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15',
          publishedAt: '2024-01-02',
          seo: {
            title: 'À propos - MyTzedaka',
            description: 'Découvrez notre mission',
            keywords: 'association, charité, aide'
          },
          settings: {
            showInNavbar: true,
            showInFooter: true,
            requireAuth: false,
            icon: 'Info',
            navOrder: 4,
            template: 'default'
          },
          tags: ['info', 'association']
        },
        {
          id: '2',
          title: 'Blog',
          slug: 'blog',
          type: 'BLOG',
          content: '',
          isActive: true,
          status: 'PUBLISHED',
          views: 5678,
          createdAt: '2024-01-05',
          updatedAt: '2024-01-20',
          publishedAt: '2024-01-06',
          seo: {
            title: 'Blog - Actualités',
            description: 'Les dernières nouvelles'
          },
          settings: {
            showInNavbar: true,
            showInFooter: false,
            requireAuth: false,
            icon: 'MessageSquare',
            navOrder: 5,
            template: 'grid'
          },
          tags: ['actualités', 'blog']
        },
        {
          id: '3',
          title: 'Galerie',
          slug: 'gallery',
          type: 'GALLERY',
          content: '',
          isActive: false,
          status: 'DRAFT',
          views: 0,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10',
          seo: {},
          settings: {
            showInNavbar: false,
            showInFooter: false,
            requireAuth: false,
            icon: 'Image',
            navOrder: 6,
            template: 'masonry'
          },
          tags: ['photos', 'événements']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const pageTypeIcons = {
    STATIC: Layout,
    BLOG: MessageSquare,
    GALLERY: Image,
    EVENTS: Calendar,
    FAQ: HelpCircle,
    CONTACT: Mail,
    CUSTOM: Code
  };

  const pageTypeColors = {
    STATIC: 'bg-blue-100 text-blue-700',
    BLOG: 'bg-purple-100 text-purple-700',
    GALLERY: 'bg-pink-100 text-pink-700',
    EVENTS: 'bg-yellow-100 text-yellow-700',
    FAQ: 'bg-green-100 text-green-700',
    CONTACT: 'bg-indigo-100 text-indigo-700',
    CUSTOM: 'bg-gray-100 text-gray-700'
  };

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-red-100 text-red-700'
  };

  const togglePageStatus = (pageId: string) => {
    setPages(pages.map(page => 
      page.id === pageId 
        ? { ...page, isActive: !page.isActive }
        : page
    ));
    
    const page = pages.find(p => p.id === pageId);
    setToastMessage(`Page "${page?.title}" ${page?.isActive ? 'désactivée' : 'activée'}`);
    setToastType('success');
    setShowToast(true);
  };

  const deletePage = (pageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      const page = pages.find(p => p.id === pageId);
      setPages(pages.filter(p => p.id !== pageId));
      setToastMessage(`Page "${page?.title}" supprimée`);
      setToastType('success');
      setShowToast(true);
    }
  };

  const duplicatePage = (page: Page) => {
    const newPage = {
      ...page,
      id: Date.now().toString(),
      title: `${page.title} (copie)`,
      slug: `${page.slug}-copy`,
      status: 'DRAFT' as const,
      isActive: false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined
    };
    
    setPages([...pages, newPage]);
    setToastMessage(`Page "${page.title}" dupliquée`);
    setToastType('success');
    setShowToast(true);
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || page.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || page.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#102a43] mb-2">Gestion des Pages</h1>
          <p className="text-[#627d98]">
            Créez et gérez les pages de votre site. Activez ou désactivez-les pour contrôler leur visibilité.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-[#17b897]" />
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold text-[#102a43]">{pages.length}</p>
            <p className="text-sm text-[#627d98]">Pages totales</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-[#334e68]" />
              <span className="text-xs text-green-600 font-medium">+5%</span>
            </div>
            <p className="text-2xl font-bold text-[#102a43]">
              {pages.filter(p => p.isActive).length}
            </p>
            <p className="text-sm text-[#627d98]">Pages actives</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-[#048271]" />
              <span className="text-xs text-green-600 font-medium">+18%</span>
            </div>
            <p className="text-2xl font-bold text-[#102a43]">
              {pages.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
            </p>
            <p className="text-sm text-[#627d98]">Vues totales</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Edit3 className="w-8 h-8 text-[#de911d]" />
              <span className="text-xs text-[#de911d] font-medium">
                {pages.filter(p => p.status === 'DRAFT').length}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#102a43]">
              {pages.filter(p => p.status === 'PUBLISHED').length}
            </p>
            <p className="text-sm text-[#627d98]">Pages publiées</p>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une page..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17b897]"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17b897]"
              >
                <option value="ALL">Tous les types</option>
                <option value="STATIC">Statique</option>
                <option value="BLOG">Blog</option>
                <option value="GALLERY">Galerie</option>
                <option value="EVENTS">Événements</option>
                <option value="FAQ">FAQ</option>
                <option value="CONTACT">Contact</option>
                <option value="CUSTOM">Personnalisé</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17b897]"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
              
              <RippleButton
                onClick={() => setIsCreating(true)}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelle page
              </RippleButton>
            </div>
          </div>
        </div>

        {/* Pages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <ShimmerSkeleton key={i} height="250px" className="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPages.map((page, index) => {
                const IconComponent = pageTypeIcons[page.type];
                return (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    {/* Page Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${pageTypeColors[page.type]}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#102a43]">{page.title}</h3>
                            <p className="text-sm text-[#627d98]">/{page.slug}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => togglePageStatus(page.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            page.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {page.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[page.status]}`}>
                          {page.status}
                        </span>
                        {page.settings.showInNavbar && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Menu
                          </span>
                        )}
                        {page.settings.showInFooter && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            Footer
                          </span>
                        )}
                        {page.settings.requireAuth && (
                          <Shield className="w-4 h-4 text-[#de911d]" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#627d98]">
                        <div className="flex items-center gap-1">
                          <BarChart className="w-4 h-4" />
                          {page.views.toLocaleString()} vues
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Page Actions */}
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="flex gap-2">
                        {page.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-white rounded text-xs text-[#627d98]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedPage(page);
                            setIsEditing(true);
                          }}
                          className="p-2 text-[#627d98] hover:text-[#17b897] hover:bg-white rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicatePage(page)}
                          className="p-2 text-[#627d98] hover:text-[#17b897] hover:bg-white rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                          className="p-2 text-[#627d98] hover:text-[#17b897] hover:bg-white rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePage(page.id)}
                          className="p-2 text-[#627d98] hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Navigation Settings Indicator */}
                    {(page.settings.showInNavbar || page.settings.showInFooter) && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Navigation Preview */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#102a43] mb-4">Aperçu de la Navigation</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#627d98] mb-2">Menu Principal</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#334e68] text-white rounded-lg text-sm">Accueil</span>
                <span className="px-3 py-1 bg-[#334e68] text-white rounded-lg text-sm">Associations</span>
                <span className="px-3 py-1 bg-[#334e68] text-white rounded-lg text-sm">Campagnes</span>
                {pages
                  .filter(p => p.isActive && p.settings.showInNavbar && p.status === 'PUBLISHED')
                  .sort((a, b) => (a.settings.navOrder || 999) - (b.settings.navOrder || 999))
                  .map(page => (
                    <span key={page.id} className="px-3 py-1 bg-[#17b897] text-white rounded-lg text-sm flex items-center gap-1">
                      {page.title}
                      {page.settings.requireAuth && <Shield className="w-3 h-3" />}
                    </span>
                  ))
                }
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-[#627d98] mb-2">Menu Footer</h3>
              <div className="flex flex-wrap gap-2">
                {pages
                  .filter(p => p.isActive && p.settings.showInFooter && p.status === 'PUBLISHED')
                  .map(page => (
                    <span key={page.id} className="px-3 py-1 bg-gray-200 text-[#334e68] rounded-lg text-sm">
                      {page.title}
                    </span>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default PageManagementPanel;