'use client';

import React from 'react';
import { 
  Heart, Users, Target, TrendingUp, Award, Shield, 
  CheckCircle, Star, ArrowRight, Zap, Globe, Clock
} from 'lucide-react';

const ShowcasePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section avec nouvelle palette */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#243b53] via-[#334e68] to-[#048271]" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Plateforme de Générosité
              <span className="block text-[#5fe3c0] mt-2">Professionnelle & Élégante</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Une interface sophistiquée avec des couleurs navy blue profondes et des accents teal élégants 
              pour inspirer confiance et professionnalisme.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-[#17b897] hover:bg-[#079a82] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Commencer maintenant
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300">
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Palette de couleurs */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-[#102a43] text-center mb-12">
            Nouvelle Palette Professionnelle
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Primary Colors */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-[#243b53] mb-4">Navy Blue Profond</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#f0f4f8'}}>
                  <span className="text-sm font-medium text-[#334e68]">50</span>
                  <span className="text-xs text-[#627d98]">#f0f4f8</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#d9e2ec'}}>
                  <span className="text-sm font-medium text-[#334e68]">100</span>
                  <span className="text-xs text-[#627d98]">#d9e2ec</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#627d98'}}>
                  <span className="text-sm font-medium text-white">500</span>
                  <span className="text-xs text-white">#627d98</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#334e68'}}>
                  <span className="text-sm font-medium text-white">700</span>
                  <span className="text-xs text-white">#334e68</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#102a43'}}>
                  <span className="text-sm font-medium text-white">900</span>
                  <span className="text-xs text-white">#102a43</span>
                </div>
              </div>
            </div>

            {/* Secondary Colors */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-[#243b53] mb-4">Teal Élégant</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#c6f7e9'}}>
                  <span className="text-sm font-medium text-[#048271]">100</span>
                  <span className="text-xs text-[#048271]">#c6f7e9</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#5fe3c0'}}>
                  <span className="text-sm font-medium text-[#016457]">300</span>
                  <span className="text-xs text-[#016457]">#5fe3c0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#17b897'}}>
                  <span className="text-sm font-medium text-white">500</span>
                  <span className="text-xs text-white">#17b897</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#048271'}}>
                  <span className="text-sm font-medium text-white">700</span>
                  <span className="text-xs text-white">#048271</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#004440'}}>
                  <span className="text-sm font-medium text-white">900</span>
                  <span className="text-xs text-white">#004440</span>
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-[#243b53] mb-4">Couleurs d'Accent</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#0e9f6e'}}>
                  <span className="text-sm font-medium text-white">Success</span>
                  <span className="text-xs text-white">#0e9f6e</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#f05252'}}>
                  <span className="text-sm font-medium text-white">Error</span>
                  <span className="text-xs text-white">#f05252</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded" style={{backgroundColor: '#de911d'}}>
                  <span className="text-sm font-medium text-white">Warning</span>
                  <span className="text-xs text-white">#de911d</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-gradient-to-r from-[#334e68] to-[#048271]">
                  <span className="text-sm font-medium text-white">Gradient</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exemple de cartes avec nouvelle palette */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-[#102a43] text-center mb-12">
            Composants avec la Nouvelle Palette
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-[#334e68] to-[#048271]" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-[#17b897]" />
                  <span className="text-sm font-semibold text-[#17b897]">Association Verified</span>
                </div>
                <h3 className="text-xl font-bold text-[#102a43] mb-2">Association Exemple</h3>
                <p className="text-[#627d98] mb-4">
                  Description professionnelle avec les nouvelles couleurs navy blue et teal.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#243b53]">€50K</p>
                    <p className="text-xs text-[#829ab1]">Collectés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#243b53]">500</p>
                    <p className="text-xs text-[#829ab1]">Donateurs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#243b53]">12</p>
                    <p className="text-xs text-[#829ab1]">Projets</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-[#17b897] hover:bg-[#079a82] text-white font-semibold rounded-lg transition-colors duration-300">
                  Faire un don
                </button>
              </div>
            </div>

            {/* Card 2 - Featured */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-[#17b897]">
              <div className="relative h-48 bg-gradient-to-br from-[#243b53] to-[#334e68]">
                <div className="absolute top-4 right-4 px-3 py-1 bg-[#de911d] text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  En vedette
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-[#0e9f6e]" />
                  <span className="text-sm font-semibold text-[#0e9f6e]">Campagne Active</span>
                </div>
                <h3 className="text-xl font-bold text-[#102a43] mb-2">Projet Prioritaire</h3>
                <p className="text-[#627d98] mb-4">
                  Un projet urgent nécessitant votre soutien immédiat.
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#627d98]">Progression</span>
                    <span className="font-bold text-[#243b53]">75%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#17b897] to-[#048271]" style={{width: '75%'}} />
                  </div>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-[#334e68] to-[#048271] hover:from-[#243b53] hover:to-[#016457] text-white font-semibold rounded-lg transition-all duration-300">
                  Contribuer maintenant
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-[#048271] to-[#17b897]" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#17b897]" />
                  <span className="text-sm font-semibold text-[#17b897]">Impact Élevé</span>
                </div>
                <h3 className="text-xl font-bold text-[#102a43] mb-2">Initiative Sociale</h3>
                <p className="text-[#627d98] mb-4">
                  Programme d'aide communautaire avec impact mesurable.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#f0f4f8] text-[#334e68] rounded-full text-xs font-medium">
                    Éducation
                  </span>
                  <span className="px-3 py-1 bg-[#f0f4f8] text-[#334e68] rounded-full text-xs font-medium">
                    Urgence
                  </span>
                  <span className="px-3 py-1 bg-[#f0f4f8] text-[#334e68] rounded-full text-xs font-medium">
                    Local
                  </span>
                </div>
                <button className="w-full py-3 border-2 border-[#17b897] text-[#17b897] hover:bg-[#17b897] hover:text-white font-semibold rounded-lg transition-all duration-300">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-br from-[#102a43] via-[#243b53] to-[#334e68] rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold text-center mb-12">Notre Impact Collectif</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-[#5fe3c0]" />
                <p className="text-4xl font-bold mb-2">10,000+</p>
                <p className="text-[#9fb3c8]">Donateurs actifs</p>
              </div>
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-[#5fe3c0]" />
                <p className="text-4xl font-bold mb-2">€2.5M</p>
                <p className="text-[#9fb3c8]">Collectés ce mois</p>
              </div>
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-[#5fe3c0]" />
                <p className="text-4xl font-bold mb-2">150+</p>
                <p className="text-[#9fb3c8]">Associations</p>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-[#5fe3c0]" />
                <p className="text-4xl font-bold mb-2">98%</p>
                <p className="text-[#9fb3c8]">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#102a43] mb-6">
            Prêt à faire la différence ?
          </h2>
          <p className="text-xl text-[#627d98] mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté de donateurs et associations pour créer un impact durable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#17b897] hover:bg-[#079a82] text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              Commencer à donner
              <Heart className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-[#334e68] hover:bg-[#243b53] text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              Créer une association
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShowcasePage;