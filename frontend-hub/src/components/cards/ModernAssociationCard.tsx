'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Heart, Users, Target, TrendingUp, Share2, 
  Bookmark, CheckCircle, MapPin, Calendar,
  DollarSign, Award, Eye, Star
} from 'lucide-react';

interface AssociationCardProps {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  category: string;
  location?: string;
  totalRaised: number;
  donorsCount: number;
  campaignsCount: number;
  rating?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  currentCampaign?: {
    title: string;
    goal: number;
    raised: number;
    daysLeft: number;
  };
}

const ModernAssociationCard: React.FC<AssociationCardProps> = ({
  id,
  name,
  description,
  logo,
  coverImage,
  category,
  location,
  totalRaised,
  donorsCount,
  campaignsCount,
  rating = 4.5,
  isVerified = false,
  isFeatured = false,
  tags = [],
  currentCampaign
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const progressPercentage = currentCampaign 
    ? (currentCampaign.raised / currentCampaign.goal) * 100 
    : 0;

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(1)}K`;
    }
    return `€${amount}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description,
          url: `/associations/${id}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-4 left-4 z-20">
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              En vedette
            </div>
          </div>
        )}

        {/* Bookmark Button */}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Bookmark 
            className={`w-5 h-5 transition-colors duration-300 ${
              isBookmarked ? 'fill-purple-600 text-purple-600' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Cover Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-500 overflow-hidden">
          {coverImage && (
            <>
              <div className={`absolute inset-0 bg-gray-200 ${imageLoaded ? 'hidden' : 'animate-pulse'}`} />
              <img
                src={coverImage}
                alt={name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
              />
            </>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">
              {category}
            </span>
          </div>

          {/* View Count */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">2.3K vues</span>
          </div>
        </div>

        {/* Logo */}
        <div className="absolute top-36 left-6 w-20 h-20 bg-white rounded-2xl shadow-xl p-2 border-4 border-white">
          {logo ? (
            <img src={logo} alt={name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 pt-12">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  {name}
                  {isVerified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {location}
                    </div>
                  )}
                  {rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-2">
              {description}
            </p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Current Campaign */}
          {currentCampaign && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Target className="w-4 h-4 text-purple-600" />
                  Campagne active
                </h4>
                <span className="text-xs text-gray-500">
                  {currentCampaign.daysLeft} jours restants
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                {currentCampaign.title}
              </p>
              <div className="mb-2">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-purple-700">{formatAmount(currentCampaign.raised)}</span>
                  <span className="text-gray-500">{formatAmount(currentCampaign.goal)}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{formatAmount(totalRaised)}</p>
              <p className="text-xs text-gray-500">Collectés</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{donorsCount}</p>
              <p className="text-xs text-gray-500">Donateurs</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{campaignsCount}</p>
              <p className="text-xs text-gray-500">Campagnes</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/associations/${id}`} className="flex-1">
              <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Voir détails
              </button>
            </Link>
            <button
              onClick={handleShare}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent pointer-events-none transition-opacity duration-300"
        />
      </div>

      {/* Quick Action Tooltip on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-full whitespace-nowrap z-30"
          >
            Cliquez pour en savoir plus
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModernAssociationCard;