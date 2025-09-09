'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Search, Heart, Users, TrendingUp, Star, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

const ModernHeroSection = () => {
  const t = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const slides = [
    {
      title: "Transformez la générosité en impact",
      subtitle: "Connectez-vous avec des associations qui changent des vies",
      image: "/images/hero-1.jpg",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      title: "Chaque don compte",
      subtitle: "Rejoignez une communauté de donateurs engagés",
      image: "/images/hero-2.jpg",
      gradient: "from-blue-600 to-teal-600"
    },
    {
      title: "Transparence totale",
      subtitle: "Suivez l'impact de vos dons en temps réel",
      image: "/images/hero-3.jpg",
      gradient: "from-teal-600 to-green-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { icon: Users, value: "10,000+", label: "Donateurs actifs" },
    { icon: Heart, value: "€2.5M", label: "Collectés ce mois" },
    { icon: TrendingUp, value: "150+", label: "Associations" },
    { icon: Star, value: "4.9/5", label: "Satisfaction" }
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Sécurisé",
      description: "Paiements cryptés et protégés"
    },
    {
      icon: Heart,
      title: "Impact Direct",
      description: "Votre don va directement aux bénéficiaires"
    },
    {
      icon: Star,
      title: "Reçus Fiscaux",
      description: "Automatiques pour chaque donation"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient}`}
          />
        </AnimatePresence>
        
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero Text */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative max-w-2xl mx-auto">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une association, une cause..."
                  className="w-full px-6 py-5 pl-14 pr-32 text-lg rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Rechercher
                </button>
              </div>
              
              {/* Quick search tags */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['Éducation', 'Santé', 'Urgence', 'Enfance', 'Environnement'].map((tag) => (
                  <button
                    key={tag}
                    className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 text-sm font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/associations">
              <button className="group px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                Découvrir les associations
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/campaigns">
              <button className="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Voir les campagnes actives
              </button>
            </Link>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-600" />
    </div>
  );
};

export default ModernHeroSection;