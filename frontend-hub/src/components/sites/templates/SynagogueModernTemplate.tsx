'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Heart, BookOpen, Star, ChevronRight, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

interface SynagogueModernTemplateProps {
  tenantId: string;
  data?: any;
}

export function SynagogueModernTemplate({ tenantId, data }: SynagogueModernTemplateProps) {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section avec image de fond */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560306843-33986aebaf12?q=80&w=2874')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-white">
          <motion.div 
            className="text-center px-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-lg">
              {data?.name || 'Synagogue Beth Shalom'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {data?.tagline || 'Un lieu de prière, d\'étude et de rassemblement communautaire'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                <Heart className="mr-2 h-5 w-5" />
                Faire un don
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white text-white hover:bg-white/20 text-lg px-8">
                <Calendar className="mr-2 h-5 w-5" />
                Horaires des offices
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Quick Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Prochain office: 18h30</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>123 Rue de la Paix, 75001 Paris</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>01 23 45 67 89</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Horaires des Offices */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Horaires des Offices</h2>
            <p className="text-xl text-gray-600">Rejoignez-nous pour les prières quotidiennes</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Shaharit */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-blue-600">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-2xl">☀️</span>
                    </div>
                    Shaharit
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Dimanche - Vendredi</span>
                      <span className="text-lg font-bold text-blue-600">7h00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Shabbat</span>
                      <span className="text-lg font-bold text-blue-600">9h00</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Jours de fête</span>
                      <span className="text-lg font-bold text-blue-600">9h30</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Minha */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-orange-500">
                <CardHeader className="bg-gradient-to-br from-orange-50 to-white">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-2xl">🌅</span>
                    </div>
                    Minha
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Dimanche - Jeudi</span>
                      <span className="text-lg font-bold text-orange-600">18h30</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Vendredi</span>
                      <span className="text-lg font-bold text-orange-600">Variable</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Shabbat</span>
                      <span className="text-lg font-bold text-orange-600">17h00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Arvit */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-purple-600">
                <CardHeader className="bg-gradient-to-br from-purple-50 to-white">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-2xl">🌙</span>
                    </div>
                    Arvit
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Dimanche - Jeudi</span>
                      <span className="text-lg font-bold text-purple-600">19h30</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Motzei Shabbat</span>
                      <span className="text-lg font-bold text-purple-600">20h30</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Jours de fête</span>
                      <span className="text-lg font-bold text-purple-600">Variable</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section Événements et Actualités */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Événements à Venir</h2>
            <p className="text-xl text-gray-600">Participez à la vie de notre communauté</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Event Card 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1490650404312-a2175773bbf5?q=80&w=2870"
                    alt="Cours de Torah"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-2">
                      Étude
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Cours de Torah Hebdomadaire</h3>
                  <p className="text-gray-600 mb-4">
                    Rejoignez le Rabbin pour une étude approfondie de la paracha de la semaine
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Tous les mercredis à 20h</span>
                  </div>
                  <Button className="w-full group">
                    En savoir plus
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Card 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2870"
                    alt="Kiddouch communautaire"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-2">
                      Communauté
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Kiddouch Communautaire</h3>
                  <p className="text-gray-600 mb-4">
                    Partageons ensemble un moment convivial après l'office du Shabbat matin
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Ce Shabbat après l'office</span>
                  </div>
                  <Button className="w-full group">
                    Participer
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Card 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=2869"
                    alt="Programme jeunesse"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="bg-purple-600 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-2">
                      Jeunesse
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Programme Jeunesse</h3>
                  <p className="text-gray-600 mb-4">
                    Activités éducatives et ludiques pour les enfants de la communauté
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Dimanche 14h-17h</span>
                  </div>
                  <Button className="w-full group">
                    Inscrire mon enfant
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Soutenez Notre Synagogue</h2>
            <p className="text-xl mb-8 text-white/90">
              Votre générosité nous permet de maintenir nos services et programmes communautaires
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
                <Heart className="mr-2 h-5 w-5" />
                Faire un don
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                <Users className="mr-2 h-5 w-5" />
                Devenir membre
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Contact */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-6">Nous Contacter</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-gray-600">123 Rue de la Paix<br />75001 Paris, France</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Téléphone</p>
                    <p className="text-gray-600">01 23 45 67 89</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">contact@synagogue-beth-shalom.fr</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-100 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-4">Heures d'ouverture du bureau</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span>Dimanche - Jeudi</span>
                  <span className="font-semibold">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span>Vendredi</span>
                  <span className="font-semibold">9h00 - 14h00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Shabbat</span>
                  <span className="font-semibold">Fermé</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}