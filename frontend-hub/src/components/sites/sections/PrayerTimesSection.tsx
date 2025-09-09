'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, MapPin } from 'lucide-react';

export interface PrayerTime {
  name: string;
  hebrewName?: string;
  icon?: string;
  times: Array<{
    day: string;
    time: string;
    isSpecial?: boolean;
  }>;
  color?: string;
}

export interface PrayerTimesSectionProps {
  title?: string;
  subtitle?: string;
  prayers: PrayerTime[];
  showLocation?: boolean;
  location?: string;
  nextPrayer?: {
    name: string;
    time: string;
  };
}

export function PrayerTimesSection({
  title = "Horaires des Offices",
  subtitle = "Rejoignez-nous pour les prières quotidiennes",
  prayers = [],
  showLocation = true,
  location,
  nextPrayer
}: PrayerTimesSectionProps) {
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

  const getColorClasses = (color?: string) => {
    const colors: Record<string, { border: string; bg: string; text: string }> = {
      blue: { 
        border: 'border-t-blue-600', 
        bg: 'bg-gradient-to-br from-blue-50 to-white',
        text: 'text-blue-600'
      },
      orange: { 
        border: 'border-t-orange-500', 
        bg: 'bg-gradient-to-br from-orange-50 to-white',
        text: 'text-orange-600'
      },
      purple: { 
        border: 'border-t-purple-600', 
        bg: 'bg-gradient-to-br from-purple-50 to-white',
        text: 'text-purple-600'
      },
      green: { 
        border: 'border-t-green-600', 
        bg: 'bg-gradient-to-br from-green-50 to-white',
        text: 'text-green-600'
      }
    };
    return colors[color || 'blue'] || colors.blue;
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          {...fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Next Prayer Banner */}
        {nextPrayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center shadow-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="h-6 w-6" />
                <span className="text-lg font-medium">Prochain Office</span>
              </div>
              <div className="text-3xl font-bold">{nextPrayer.name}</div>
              <div className="text-xl mt-2">{nextPrayer.time}</div>
            </div>
          </motion.div>
        )}

        {/* Location Info */}
        {showLocation && location && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center mb-8 text-gray-600"
          >
            <MapPin className="h-5 w-5 mr-2" />
            <span className="text-lg">{location}</span>
          </motion.div>
        )}

        {/* Prayer Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {prayers && prayers.length > 0 && prayers.map((prayer, index) => {
            const colors = getColorClasses(prayer.color);
            
            return (
              <motion.div key={index} variants={fadeInUp}>
                <Card className={`h-full hover:shadow-2xl transition-all duration-300 border-t-4 ${colors.border} overflow-hidden group`}>
                  <CardHeader className={`${colors.bg} pb-4`}>
                    <CardTitle className="flex items-center text-2xl">
                      {prayer.icon && (
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-md group-hover:scale-110 transition-transform">
                          <span className="text-2xl">{prayer.icon}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{prayer.name}</div>
                        {prayer.hebrewName && (
                          <div className="text-sm text-gray-600 font-hebrew">{prayer.hebrewName}</div>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {prayer.times.map((time, timeIndex) => (
                        <div 
                          key={timeIndex} 
                          className={`flex justify-between items-center py-3 ${
                            timeIndex !== prayer.times.length - 1 ? 'border-b border-gray-100' : ''
                          } hover:bg-gray-50 -mx-2 px-2 rounded transition-colors`}
                        >
                          <span className={`font-medium ${time.isSpecial ? 'text-gray-900' : 'text-gray-700'}`}>
                            {time.day}
                          </span>
                          <span className={`text-lg font-bold ${colors.text} ${
                            time.isSpecial ? 'text-xl' : ''
                          }`}>
                            {time.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            <Calendar className="inline h-4 w-4 mr-2" />
            Les horaires sont mis à jour chaque semaine selon le calendrier hébraïque
          </p>
        </motion.div>
      </div>
    </section>
  );
}