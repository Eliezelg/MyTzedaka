'use client';

import React, { useEffect, useState } from 'react';
import { HeroSection } from '../sections/HeroSection';
import { PrayerTimesSection } from '../sections/PrayerTimesSection';
import { EventsSection } from '../sections/EventsSection';
import { DonationSection } from '../sections/DonationSection';
import { motion } from 'framer-motion';
import { Heart, Calendar } from 'lucide-react';

interface TemplateData {
  hero?: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    buttons?: Array<{
      text: string;
      href: string;
      variant?: 'primary' | 'secondary' | 'outline';
    }>;
  };
  prayers?: {
    enabled: boolean;
    title?: string;
    subtitle?: string;
    location?: string;
    times: Array<{
      name: string;
      hebrewName?: string;
      icon?: string;
      color?: string;
      times: Array<{
        day: string;
        time: string;
        isSpecial?: boolean;
      }>;
    }>;
  };
  events?: {
    enabled: boolean;
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'list';
    items: Array<{
      id: string;
      title: string;
      description: string;
      image?: string;
      date: string;
      time?: string;
      location?: string;
      category: string;
      categoryColor?: string;
      price?: string;
      link?: string;
    }>;
  };
  about?: {
    enabled: boolean;
    title?: string;
    content?: string;
    image?: string;
    stats?: Array<{
      label: string;
      value: string;
      icon?: React.ReactNode;
    }>;
  };
  donation?: {
    enabled: boolean;
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    quickAmounts?: number[];
  };
  contact?: {
    enabled: boolean;
    address?: string;
    phone?: string;
    email?: string;
    hours?: Array<{
      day: string;
      hours: string;
    }>;
  };
}

interface SynagogueDynamicTemplateProps {
  tenantId: string;
  data?: TemplateData;
}

// Données par défaut pour la démo
const defaultData: TemplateData = {
  hero: {
    title: 'Synagogue Beth Shalom',
    subtitle: 'Un lieu de prière, d\'étude et de rassemblement communautaire',
    backgroundImage: 'https://images.unsplash.com/photo-1560306843-33986aebaf12?q=80&w=2874',
    buttons: [
      {
        text: 'Faire un don',
        href: '/donate',
        variant: 'primary'
      },
      {
        text: 'Horaires des offices',
        href: '#prayers',
        variant: 'outline'
      }
    ]
  },
  prayers: {
    enabled: true,
    title: 'Horaires des Offices',
    subtitle: 'Rejoignez-nous pour les prières quotidiennes',
    location: '123 Rue de la Paix, 75001 Paris',
    times: [
      {
        name: 'Shaharit',
        hebrewName: 'שחרית',
        icon: '☀️',
        color: 'blue',
        times: [
          { day: 'Dimanche - Vendredi', time: '7h00' },
          { day: 'Shabbat', time: '9h00', isSpecial: true },
          { day: 'Jours de fête', time: '9h30', isSpecial: true }
        ]
      },
      {
        name: 'Minha',
        hebrewName: 'מנחה',
        icon: '🌅',
        color: 'orange',
        times: [
          { day: 'Dimanche - Jeudi', time: '18h30' },
          { day: 'Vendredi', time: 'Variable' },
          { day: 'Shabbat', time: '17h00', isSpecial: true }
        ]
      },
      {
        name: 'Arvit',
        hebrewName: 'ערבית',
        icon: '🌙',
        color: 'purple',
        times: [
          { day: 'Dimanche - Jeudi', time: '19h30' },
          { day: 'Motzei Shabbat', time: '20h30', isSpecial: true },
          { day: 'Jours de fête', time: 'Variable' }
        ]
      }
    ]
  },
  events: {
    enabled: true,
    title: 'Événements à Venir',
    subtitle: 'Participez à la vie de notre communauté',
    layout: 'grid',
    items: [
      {
        id: '1',
        title: 'Cours de Torah Hebdomadaire',
        description: 'Rejoignez le Rabbin pour une étude approfondie de la paracha de la semaine',
        image: 'https://images.unsplash.com/photo-1490650404312-a2175773bbf5?q=80&w=2870',
        date: 'Tous les mercredis',
        time: '20h00',
        location: 'Salle d\'étude',
        category: 'Étude',
        categoryColor: 'blue',
        link: '/events/torah-study'
      },
      {
        id: '2',
        title: 'Kiddouch Communautaire',
        description: 'Partageons ensemble un moment convivial après l\'office du Shabbat matin',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2870',
        date: 'Ce Shabbat',
        time: 'Après l\'office',
        location: 'Salle de réception',
        category: 'Communauté',
        categoryColor: 'green',
        link: '/events/kiddouch'
      },
      {
        id: '3',
        title: 'Programme Jeunesse',
        description: 'Activités éducatives et ludiques pour les enfants de la communauté',
        image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=2869',
        date: 'Dimanche',
        time: '14h00 - 17h00',
        location: 'Salle des jeunes',
        category: 'Jeunesse',
        categoryColor: 'purple',
        price: '10€',
        link: '/events/youth-program'
      }
    ]
  },
  about: {
    enabled: true,
    title: 'À Propos de Notre Synagogue',
    content: 'Depuis plus de 50 ans, notre synagogue est un pilier de la communauté juive locale. Nous offrons un espace chaleureux et accueillant pour la prière, l\'étude et les célébrations.',
    image: 'https://images.unsplash.com/photo-1595133403068-57dc3a661c8d?q=80&w=2940',
    stats: [
      { label: 'Familles membres', value: '250+' },
      { label: 'Années d\'existence', value: '52' },
      { label: 'Cours hebdomadaires', value: '15' },
      { label: 'Événements annuels', value: '100+' }
    ]
  },
  donation: {
    enabled: true,
    title: 'Soutenez Notre Synagogue',
    subtitle: 'Votre générosité nous permet de maintenir nos services et programmes communautaires',
    backgroundImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2940',
    quickAmounts: [18, 36, 72, 180, 360]
  },
  contact: {
    enabled: true,
    address: '123 Rue de la Paix, 75001 Paris',
    phone: '01 23 45 67 89',
    email: 'contact@synagogue-beth-shalom.fr',
    hours: [
      { day: 'Dimanche - Jeudi', hours: '9h00 - 18h00' },
      { day: 'Vendredi', hours: '9h00 - 14h00' },
      { day: 'Shabbat', hours: 'Fermé' }
    ]
  }
};

export function SynagogueDynamicTemplate({ tenantId, data = defaultData }: SynagogueDynamicTemplateProps) {
  const [templateData, setTemplateData] = useState<TemplateData>(data);
  const [loading, setLoading] = useState(false);

  // Charger les données dynamiques depuis l\'API si nécessaire
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        setLoading(true);
        // Ici, vous pouvez charger les données depuis l\'API
        // const response = await fetch(`/api/tenants/${tenantId}/template-data`);
        // const dynamicData = await response.json();
        // setTemplateData(dynamicData);
      } catch (error) {
        console.error('Error loading template data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      // loadDynamicData();
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {templateData.hero && (
        <HeroSection
          title={templateData.hero.title}
          subtitle={templateData.hero.subtitle}
          backgroundImage={templateData.hero.backgroundImage}
          ctaText={templateData.hero.buttons?.[0]?.text}
          ctaLink={templateData.hero.buttons?.[0]?.href}
          secondaryCtaText={templateData.hero.buttons?.[1]?.text}
          secondaryCtaLink={templateData.hero.buttons?.[1]?.href}
        />
      )}

      {/* Prayer Times Section */}
      {templateData.prayers?.enabled && (
        <div id="prayers">
          <PrayerTimesSection
            title={templateData.prayers.title}
            subtitle={templateData.prayers.subtitle}
            prayers={templateData.prayers?.times || []}
            location={templateData.prayers.location}
            showLocation={true}
          />
        </div>
      )}

      {/* Events Section */}
      {templateData.events?.enabled && templateData.events?.items?.length > 0 && (
        <EventsSection
          events={templateData.events.items.map(event => ({
            ...event,
            startDate: event.date,
            type: event.category?.toUpperCase() || 'EVENT'
          }))}
          title={templateData.events.title}
          viewAllLink="/events"
        />
      )}

      {/* About Section */}
      {templateData.about?.enabled && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-6">{templateData.about.title}</h2>
                <p className="text-lg text-gray-600 mb-8">{templateData.about.content}</p>
                
                {templateData.about.stats && (
                  <div className="grid grid-cols-2 gap-6">
                    {templateData.about.stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                        <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
              
              {templateData.about.image && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={templateData.about.image}
                    alt="About us"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Donation CTA Section */}
      {templateData.donation?.enabled && (
        <DonationSection
          title={templateData.donation.title}
          subtitle={templateData.donation.subtitle}
          tenantId={tenantId}
          quickAmounts={templateData.donation.quickAmounts}
          backgroundImage={templateData.donation.backgroundImage}
        />
      )}

      {/* Contact Section */}
      {templateData.contact?.enabled && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">Nous Contacter</h2>
              <p className="text-xl text-gray-600">Nous sommes là pour vous accueillir</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Adresse</h3>
                <p className="text-gray-600">{templateData.contact.address}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Téléphone</h3>
                <p className="text-gray-600">{templateData.contact.phone}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✉️</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Email</h3>
                <p className="text-gray-600">{templateData.contact.email}</p>
              </motion.div>
            </div>

            {templateData.contact.hours && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="mt-12 bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">Heures d\'ouverture</h3>
                <div className="space-y-3">
                  {templateData.contact.hours.map((schedule, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="font-medium">{schedule.day}</span>
                      <span className="text-gray-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}