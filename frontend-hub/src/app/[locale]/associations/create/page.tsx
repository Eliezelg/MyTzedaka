'use client';

import { AssociationSignupFlow } from '@/components/onboarding/AssociationSignupFlow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Info, Heart, Users, Shield, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateAssociationPage() {
  const router = useRouter();

  const handleSuccess = (data: any) => {
    // Redirect to the new association page or admin
    router.push(`/associations/${data.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/associations" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux associations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Nouveau
          </Badge>
          
          <h1 className="text-3xl font-bold mb-4">
            Ajoutez votre association à MyTzedaka
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez notre plateforme et bénéficiez d'une visibilité accrue 
            pour vos collectes de dons
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="p-4">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Visibilité</h3>
              <p className="text-sm text-gray-600">
                Touchez des milliers de donateurs potentiels
              </p>
            </Card>

            <Card className="p-4">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Sécurité</h3>
              <p className="text-sm text-gray-600">
                Paiements sécurisés et conformité garantie
              </p>
            </Card>

            <Card className="p-4">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Simplicité</h3>
              <p className="text-sm text-gray-600">
                Gestion facile de vos dons et donateurs
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Info Banner */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Inscription gratuite sur la plateforme
              </h3>
              <p className="text-sm text-blue-800">
                L'inscription sur MyTzedaka est entièrement gratuite. Vous bénéficiez d'une page dédiée 
                sur notre plateforme avec toutes les fonctionnalités de base pour collecter des dons.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-blue-700">
                <li>✓ Page association personnalisée</li>
                <li>✓ Collecte de dons sécurisée</li>
                <li>✓ Reçus fiscaux automatiques</li>
                <li>✓ Gestion des donateurs</li>
                <li>✓ Commission de 1% sur les dons + frais bancaires</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Signup Form */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Formulaire d'inscription
          </h2>
          
          <AssociationSignupFlow 
            mode="embedded" 
            defaultPlan="free"
            onSuccess={handleSuccess}
          />
        </Card>

        {/* Premium Upgrade Option */}
        <Card className="p-6 mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="text-center">
            <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Option Premium
            </Badge>
            
            <h3 className="text-xl font-bold mb-2">
              Vous souhaitez un site web personnalisé?
            </h3>
            
            <p className="text-gray-700 mb-4">
              Passez au plan Premium et obtenez votre propre site web avec domaine personnalisé, 
              thème sur mesure et toutes les fonctionnalités avancées.
            </p>
            
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">10€</p>
                <p className="text-sm text-gray-600">par mois</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">100€</p>
                <p className="text-sm text-gray-600">par an (-17%)</p>
              </div>
            </div>
            
            <Button className="mt-4" asChild>
              <Link href="/signup">
                En savoir plus sur le Premium →
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}