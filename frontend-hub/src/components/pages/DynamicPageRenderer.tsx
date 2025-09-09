'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, Heart, Share2, 
  ChevronRight, Star, MessageCircle, Image as ImageIcon,
  Play, Download, ExternalLink, Info, CheckCircle
} from 'lucide-react';
import { AnimatedCounter, CelebrationProgress } from '../animations/AnimatedComponents';

interface DynamicPageProps {
  page: {
    id: string;
    title: string;
    slug: string;
    type: string;
    content: string;
    template?: string;
    settings?: any;
    seo?: any;
    metadata?: any;
  };
}

const DynamicPageRenderer: React.FC<DynamicPageProps> = ({ page }) => {
  // Render different templates based on page type and template
  const renderPageContent = () => {
    switch (page.type) {
      case 'STATIC':
        return <StaticPageTemplate page={page} />;
      case 'BLOG':
        return <BlogPageTemplate page={page} />;
      case 'GALLERY':
        return <GalleryPageTemplate page={page} />;
      case 'EVENTS':
        return <EventsPageTemplate page={page} />;
      case 'FAQ':
        return <FAQPageTemplate page={page} />;
      case 'CONTACT':
        return <ContactPageTemplate page={page} />;
      case 'CUSTOM':
        return <CustomPageTemplate page={page} />;
      default:
        return <StaticPageTemplate page={page} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPageContent()}
    </div>
  );
};

// Static Page Template
const StaticPageTemplate: React.FC<{ page: any }> = ({ page }) => {
  const hasHero = page.template === 'hero';
  const hasSidebar = page.template === 'sidebar';

  return (
    <>
      {hasHero && (
        <div className="relative h-96 bg-gradient-to-br from-[#334e68] to-[#048271] overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {page.title}
              </h1>
              {page.metadata?.subtitle && (
                <p className="text-xl text-white/90">
                  {page.metadata.subtitle}
                </p>
              )}
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className={hasSidebar ? 'grid lg:grid-cols-3 gap-8' : 'max-w-4xl mx-auto'}>
          <div className={hasSidebar ? 'lg:col-span-2' : ''}>
            {!hasHero && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-[#102a43] mb-8"
              >
                {page.title}
              </motion.h1>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
          
          {hasSidebar && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-[#102a43] mb-4">Informations</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[#627d98]">
                    <Info className="w-5 h-5 text-[#17b897]" />
                    <span>Information importante</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#627d98]">
                    <CheckCircle className="w-5 h-5 text-[#17b897]" />
                    <span>Point clé à retenir</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#17b897] to-[#048271] rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Besoin d'aide ?</h3>
                <p className="mb-4 text-white/90">
                  Notre équipe est là pour vous accompagner
                </p>
                <button className="w-full py-3 bg-white text-[#17b897] font-semibold rounded-lg hover:shadow-lg transition-all">
                  Nous contacter
                </button>
              </div>
            </motion.aside>
          )}
        </div>
      </div>
    </>
  );
};

// Blog Page Template
const BlogPageTemplate: React.FC<{ page: any }> = ({ page }) => {
  const posts = page.metadata?.posts || [];
  const isGrid = page.template === 'grid';

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-[#102a43] mb-4">{page.title}</h1>
        <p className="text-xl text-[#627d98] max-w-2xl mx-auto">
          Découvrez nos derniers articles et actualités
        </p>
      </motion.div>

      <div className={isGrid ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'max-w-4xl mx-auto space-y-8'}>
        {posts.map((post: any, index: number) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            {post.image && (
              <div className="h-48 bg-gradient-to-br from-[#334e68] to-[#048271]" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-4 text-sm text-[#627d98] mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('fr-FR')}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments || 0}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#102a43] mb-3">{post.title}</h2>
              <p className="text-[#627d98] mb-4 line-clamp-3">{post.excerpt}</p>
              <a 
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-[#17b897] hover:text-[#079a82] font-semibold"
              >
                Lire la suite
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};

// Gallery Page Template
const GalleryPageTemplate: React.FC<{ page: any }> = ({ page }) => {
  const images = page.metadata?.images || [];
  const isMasonry = page.template === 'masonry';

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-[#102a43] mb-4">{page.title}</h1>
        <p className="text-xl text-[#627d98]">
          Découvrez nos moments forts en images
        </p>
      </motion.div>

      <div className={isMasonry ? 'columns-1 md:columns-2 lg:columns-3 gap-4' : 'grid md:grid-cols-2 lg:grid-cols-3 gap-4'}>
        {images.map((image: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative overflow-hidden rounded-xl ${isMasonry ? 'break-inside-avoid mb-4' : ''}`}
          >
            <div className={`bg-gradient-to-br from-[#334e68] to-[#048271] ${
              isMasonry ? `h-${['48', '64', '80'][index % 3]}` : 'h-64'
            }`}>
              {/* Image would go here */}
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button className="p-3 bg-white rounded-full text-[#334e68] hover:scale-110 transition-transform">
                <Play className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white rounded-full text-[#334e68] hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </button>
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white font-medium">{image.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Events Page Template
const EventsPageTemplate: React.FC<{ page: any }> = ({ page }) => {
  const events = page.metadata?.events || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-[#102a43] mb-4">{page.title}</h1>
        <p className="text-xl text-[#627d98]">
          Participez à nos prochains événements
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6">
        {events.map((event: any, index: number) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 flex gap-6"
          >
            <div className="w-24 text-center">
              <div className="bg-gradient-to-br from-[#17b897] to-[#048271] text-white rounded-lg p-3">
                <div className="text-2xl font-bold">{new Date(event.date).getDate()}</div>
                <div className="text-sm">
                  {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#102a43] mb-2">{event.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-[#627d98] mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.attendees || 0} participants
                </span>
              </div>
              <p className="text-[#627d98] mb-4">{event.description}</p>
              <button className="px-6 py-2 bg-[#17b897] text-white font-semibold rounded-lg hover:bg-[#079a82] transition-colors">
                S'inscrire
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// FAQ Page Template
const FAQPageTemplate: React.FC<{ page: any }> = ({ page }) => {
  const [openItems, setOpenItems] = React.useState<number[]>([]);
  const faqs = page.metadata?.faqs || [];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-[#102a43] mb-4">{page.title}</h1>
        <p className="text-xl text-[#627d98]">
          Trouvez rapidement des réponses à vos questions
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-4"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#102a43]">{faq.question}</h3>
                <ChevronRight className={`w-5 h-5 text-[#627d98] transition-transform ${
                  openItems.includes(index) ? 'rotate-90' : ''
                }`} />
              </div>
            </button>
            {openItems.includes(index) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 rounded-b-xl px-6 py-4 -mt-2"
              >
                <p className="text-[#627d98]">{faq.answer}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Contact Page Template
const ContactPageTemplate: React.FC<{ page: any }> = ({ page }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-[#102a43] mb-4">{page.title}</h1>
        <p className="text-xl text-[#627d98]">
          Nous sommes là pour vous aider
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#334e68] mb-2">
                Nom complet
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17b897]"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334e68] mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17b897]"
                placeholder="jean@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334e68] mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17b897]"
                placeholder="Votre message..."
              />
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-[#334e68] to-[#048271] text-white font-semibold rounded-lg hover:shadow-lg transition-all">
              Envoyer le message
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#102a43] mb-4">Informations de contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#17b897]" />
                <span className="text-[#627d98]">123 Rue Example, 75001 Paris</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#17b897]" />
                <span className="text-[#627d98]">Lun-Ven: 9h-18h</span>
              </div>
            </div>
          </div>

          {page.template === 'map' && (
            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Custom Page Template (for custom HTML)
const CustomPageTemplate: React.FC<{ page: any }> = ({ page }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
};

export default DynamicPageRenderer;