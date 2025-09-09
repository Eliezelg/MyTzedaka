'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssociationSignupFlow } from '@/components/onboarding/AssociationSignupFlow';
import { 
  Heart, 
  Building2, 
  Users, 
  Globe,
  Shield,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  CreditCard,
  BarChart3,
  Lock,
  Smartphone,
  Palette,
  Clock,
  HeartHandshake,
  Menu,
  X
} from 'lucide-react';

export default function HomePage() {
  const [showSignup, setShowSignup] = useState(false);
  const [defaultPlan, setDefaultPlan] = useState<'free' | 'premium'>('free');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = {
    associations: 156,
    totalRaised: 2500000,
    donors: 12000,
    countries: 6
  };

  const features = {
    platform: [
      { icon: Heart, title: "Collecte de dons", description: "Système de paiement sécurisé" },
      { icon: Users, title: "Gestion des donateurs", description: "Base de données centralisée" },
      { icon: Shield, title: "Reçus fiscaux", description: "Génération automatique CERFA" },
      { icon: BarChart3, title: "Statistiques", description: "Tableaux de bord détaillés" }
    ],
    premium: [
      { icon: Globe, title: "Site personnalisé", description: "Votre propre site web" },
      { icon: Palette, title: "Design sur mesure", description: "Thème personnalisable" },
      { icon: Sparkles, title: "Modules avancés", description: "Parnass, Zmanim, événements" },
      { icon: Zap, title: "Sans commission", description: "100% des dons vous reviennent" }
    ]
  };

  const testimonials = [
    {
      name: "Rabbi David Cohen",
      role: "Synagogue Beth Shalom",
      content: "MyTzedaka a transformé notre collecte de fonds. Nous avons doublé nos dons en 6 mois.",
      avatar: "DC"
    },
    {
      name: "Sarah Levy",
      role: "Association Ahavat Israël",
      content: "Le site personnalisé nous a donné une vraie identité en ligne. Nos donateurs adorent!",
      avatar: "SL"
    },
    {
      name: "Michel Azoulay",
      role: "Yeshiva Torah Chaim",
      content: "La gestion automatique des reçus fiscaux nous fait gagner un temps précieux.",
      avatar: "MA"
    }
  ];

  const handleSignup = (plan: 'free' | 'premium') => {
    setDefaultPlan(plan);
    setShowSignup(true);
  };

  if (showSignup) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowSignup(false)}
            className="mb-6"
          >
            ← Retour
          </Button>
          <AssociationSignupFlow 
            mode="standalone" 
            defaultPlan={defaultPlan}
            onSuccess={(data) => {
              console.log('Signup success:', data);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Heart className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">MyTzedaka</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/associations" className="text-gray-700 hover:text-primary">
                Associations
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary">
                À propos
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary">
                Tarifs
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary">
                Contact
              </Link>
              <Button variant="outline" asChild>
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button onClick={() => handleSignup('free')}>
                Commencer gratuitement
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <Link href="/associations" className="block py-2 text-gray-700">
                Associations
              </Link>
              <Link href="/about" className="block py-2 text-gray-700">
                À propos
              </Link>
              <Link href="/pricing" className="block py-2 text-gray-700">
                Tarifs
              </Link>
              <Link href="/contact" className="block py-2 text-gray-700">
                Contact
              </Link>
              <div className="pt-2 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button className="w-full" onClick={() => handleSignup('free')}>
                  Commencer gratuitement
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Plateforme de collecte de dons pour associations juives
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transformez votre collecte de{' '}
              <span className="text-primary">Tzedaka</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Créez votre présence en ligne, collectez des dons et gérez vos donateurs 
              avec la plateforme tout-en-un dédiée aux associations juives
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleSignup('free')}>
                <Heart className="h-5 w-5 mr-2" />
                Inscription gratuite
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleSignup('premium')}>
                <Sparkles className="h-5 w-5 mr-2" />
                Découvrir le site personnalisé
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.associations}+</p>
                <p className="text-sm text-gray-600">Associations actives</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {(stats.totalRaised / 1000000).toFixed(1)}M€
                </p>
                <p className="text-sm text-gray-600">Collectés</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.donors.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Donateurs</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.countries}</p>
                <p className="text-sm text-gray-600">Pays</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Choisissez votre formule
            </h2>
            <p className="text-xl text-gray-600">
              Commencez gratuitement ou optez pour un site personnalisé
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">Gratuit</Badge>
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Plateforme MyTzedaka</h3>
              <p className="text-gray-600 mb-6">
                Rejoignez la plateforme et commencez à collecter des dons immédiatement
              </p>
              
              <div className="mb-8">
                <p className="text-4xl font-bold">
                  0€
                  <span className="text-base font-normal text-gray-600">/mois</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Commission de 5% sur les dons
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.platform.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleSignup('free')}
              >
                Commencer gratuitement
              </Button>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 relative border-primary shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Star className="h-3 w-3 mr-1" />
                  Plus populaire
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <Badge>Premium</Badge>
                <Globe className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Site Personnalisé</h3>
              <p className="text-gray-600 mb-6">
                Votre propre site web avec domaine personnalisé et design sur mesure
              </p>
              
              <div className="mb-8">
                <p className="text-4xl font-bold">
                  10€
                  <span className="text-base font-normal text-gray-600">/mois</span>
                </p>
                <p className="text-sm text-green-600 mt-2 font-medium">
                  ✓ Aucune commission sur les dons
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="font-medium text-primary mb-2">
                  Tout de la formule gratuite, plus:
                </li>
                {features.premium.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full"
                onClick={() => handleSignup('premium')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Essai gratuit 30 jours
              </Button>
              
              <p className="text-xs text-center text-gray-500 mt-3">
                Sans engagement, annulation à tout moment
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Une plateforme complète pour gérer votre association
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CreditCard className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Paiements sécurisés</h3>
              <p className="text-gray-600">
                Intégration Stripe pour des paiements sécurisés avec support 
                multi-devises et dons récurrents
              </p>
            </Card>

            <Card className="p-6">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reçus fiscaux automatiques</h3>
              <p className="text-gray-600">
                Génération automatique de reçus CERFA conformes pour la 
                déduction fiscale de vos donateurs
              </p>
            </Card>

            <Card className="p-6">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tableaux de bord</h3>
              <p className="text-gray-600">
                Suivez vos performances avec des statistiques détaillées 
                et des rapports personnalisables
              </p>
            </Card>

            <Card className="p-6">
              <Star className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Module Parnass</h3>
              <p className="text-gray-600">
                Système de parrainage quotidien, mensuel et annuel avec 
                affichage des sponsors
              </p>
            </Card>

            <Card className="p-6">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Zmanim & Calendrier</h3>
              <p className="text-gray-600">
                Horaires de prières automatiques, calendrier juif et 
                gestion des événements communautaires
              </p>
            </Card>

            <Card className="p-6">
              <Smartphone className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">100% Responsive</h3>
              <p className="text-gray-600">
                Sites optimisés pour tous les appareils: ordinateurs, 
                tablettes et smartphones
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez ce que nos associations disent de MyTzedaka
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à transformer votre collecte de fonds?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les {stats.associations}+ associations qui font confiance à MyTzedaka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => handleSignup('free')}
            >
              Commencer gratuitement
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white/20"
              onClick={() => handleSignup('premium')}
            >
              Voir les tarifs premium
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-white">Fonctionnalités</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Tarifs</Link></li>
                <li><Link href="/demo" className="hover:text-white">Démo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Associations</h4>
              <ul className="space-y-2">
                <li><Link href="/associations" className="hover:text-white">Annuaire</Link></li>
                <li><Link href="/success-stories" className="hover:text-white">Témoignages</Link></li>
                <li><Link href="/resources" className="hover:text-white">Ressources</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:text-white">Centre d'aide</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-white">CGU</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Confidentialité</Link></li>
                <li><Link href="/legal" className="hover:text-white">Mentions légales</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; 2024 MyTzedaka. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}