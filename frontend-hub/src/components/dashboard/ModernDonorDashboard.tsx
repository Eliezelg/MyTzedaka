'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, TrendingUp, Calendar, Award, Download, Filter,
  CreditCard, Users, Target, Clock, ArrowUp, ArrowDown,
  Gift, Star, Trophy, Zap, BarChart3, PieChart,
  Receipt, Settings, Bell, ChevronRight, MoreVertical,
  CheckCircle, AlertCircle, Info, Share2, Eye
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DonorDashboardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    memberSince: string;
    donorLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  };
}

const ModernDonorDashboard: React.FC<DonorDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('year');
  const [showDetails, setShowDetails] = useState(false);

  // Mock data
  const stats = {
    totalDonated: 12500,
    totalDonatedChange: 15,
    monthlyAverage: 250,
    monthlyAverageChange: -5,
    associationsSupported: 8,
    associationsSupportedChange: 2,
    impactScore: 95,
    impactScoreChange: 8,
    currentStreak: 6,
    longestStreak: 12,
    totalReceipts: 24,
    nextMilestone: 15000,
    rank: 142,
    totalDonors: 10000
  };

  const recentDonations = [
    {
      id: 1,
      association: "Association Éducation Pour Tous",
      amount: 100,
      date: "2024-01-15",
      status: "completed",
      type: "monthly",
      campaign: "Rentrée Scolaire 2024"
    },
    {
      id: 2,
      association: "Fondation Santé Solidaire",
      amount: 250,
      date: "2024-01-10",
      status: "completed",
      type: "once",
      campaign: "Urgence Médicale"
    },
    {
      id: 3,
      association: "Aide Alimentaire Locale",
      amount: 50,
      date: "2024-01-05",
      status: "completed",
      type: "monthly",
      campaign: null
    },
    {
      id: 4,
      association: "Protection Enfance",
      amount: 150,
      date: "2024-01-01",
      status: "pending",
      type: "once",
      campaign: "Noël Solidaire"
    }
  ];

  const favoriteAssociations = [
    {
      id: 1,
      name: "Association Éducation Pour Tous",
      logo: "/logo1.png",
      totalDonated: 2400,
      lastDonation: "Il y a 5 jours",
      activeCampaign: true
    },
    {
      id: 2,
      name: "Fondation Santé Solidaire",
      logo: "/logo2.png",
      totalDonated: 1800,
      lastDonation: "Il y a 2 semaines",
      activeCampaign: false
    },
    {
      id: 3,
      name: "Aide Alimentaire Locale",
      logo: "/logo3.png",
      totalDonated: 600,
      lastDonation: "Il y a 1 mois",
      activeCampaign: true
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "Donateur Régulier",
      description: "6 mois de dons consécutifs",
      icon: Calendar,
      unlocked: true,
      progress: 100
    },
    {
      id: 2,
      title: "Bienfaiteur",
      description: "Plus de €10,000 donnés",
      icon: Trophy,
      unlocked: true,
      progress: 100
    },
    {
      id: 3,
      title: "Ambassadeur",
      description: "Parrainez 5 nouveaux donateurs",
      icon: Users,
      unlocked: false,
      progress: 60
    },
    {
      id: 4,
      title: "Impact Majeur",
      description: "Soutenez 10 associations",
      icon: Target,
      unlocked: false,
      progress: 80
    }
  ];

  // Chart data
  const donationChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Dons mensuels',
        data: [300, 250, 400, 350, 500, 450, 600, 550, 700, 650, 800, 750],
        fill: true,
        backgroundColor: 'rgba(72, 101, 129, 0.1)',
        borderColor: '#486581',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const categoryChartData = {
    labels: ['Éducation', 'Santé', 'Urgence', 'Environnement', 'Social'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#334e68',
          '#486581',
          '#627d98',
          '#17b897',
          '#048271'
        ],
        borderWidth: 0
      }
    ]
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Bronze': return 'from-orange-600 to-orange-800';
      case 'Silver': return 'from-gray-400 to-gray-600';
      case 'Gold': return 'from-yellow-500 to-yellow-700';
      case 'Platinum': return 'from-purple-600 to-purple-800';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'donations', label: 'Mes dons', icon: Heart },
    { id: 'associations', label: 'Associations', icon: Users },
    { id: 'impact', label: 'Mon impact', icon: TrendingUp },
    { id: 'receipts', label: 'Reçus fiscaux', icon: Receipt },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#102a43] via-[#243b53] to-[#334e68] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl p-1">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#17b897] to-[#048271] rounded-xl flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r ${getLevelColor(user.donorLevel)} text-white text-xs font-bold rounded-full`}>
                  {user.donorLevel}
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2">Bonjour, {user.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-200">
                  <span>Membre depuis {user.memberSince}</span>
                  <span>•</span>
                  <span>Rang #{stats.rank} sur {stats.totalDonors.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-[#17b897] hover:bg-[#079a82] text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Faire un don
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-[#5fe3c0]" />
                <span className={`text-xs flex items-center gap-1 ${stats.totalDonatedChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalDonatedChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(stats.totalDonatedChange)}%
                </span>
              </div>
              <p className="text-2xl font-bold">€{stats.totalDonated.toLocaleString()}</p>
              <p className="text-xs text-gray-300">Total donné</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-[#5fe3c0]" />
                <span className={`text-xs flex items-center gap-1 ${stats.monthlyAverageChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.monthlyAverageChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(stats.monthlyAverageChange)}%
                </span>
              </div>
              <p className="text-2xl font-bold">€{stats.monthlyAverage}</p>
              <p className="text-xs text-gray-300">Moyenne mensuelle</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-[#5fe3c0]" />
                <span className="text-xs text-green-400">+{stats.associationsSupportedChange}</span>
              </div>
              <p className="text-2xl font-bold">{stats.associationsSupported}</p>
              <p className="text-xs text-gray-300">Associations soutenues</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-[#5fe3c0]" />
                <span className={`text-xs flex items-center gap-1 ${stats.impactScoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.impactScoreChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(stats.impactScoreChange)}
                </span>
              </div>
              <p className="text-2xl font-bold">{stats.impactScore}</p>
              <p className="text-xs text-gray-300">Score d'impact</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#334e68] border-b-2 border-[#17b897]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Donation Trends */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#102a43]">Évolution de vos dons</h2>
                    <select 
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#17b897]"
                    >
                      <option value="week">Cette semaine</option>
                      <option value="month">Ce mois</option>
                      <option value="year">Cette année</option>
                      <option value="all">Tout</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <Line 
                      data={donationChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              display: true,
                              color: '#e5e7eb'
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Recent Donations */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#102a43]">Derniers dons</h2>
                    <button className="text-[#17b897] hover:text-[#079a82] font-medium text-sm">
                      Voir tout
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentDonations.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            donation.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            {donation.status === 'completed' ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Clock className="w-6 h-6 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#102a43]">{donation.association}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{new Date(donation.date).toLocaleDateString('fr-FR')}</span>
                              {donation.campaign && (
                                <>
                                  <span>•</span>
                                  <span>{donation.campaign}</span>
                                </>
                              )}
                              {donation.type === 'monthly' && (
                                <span className="px-2 py-0.5 bg-[#17b897] text-white text-xs rounded-full">
                                  Mensuel
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#102a43]">€{donation.amount}</p>
                          <button className="text-sm text-gray-500 hover:text-[#17b897]">
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-[#102a43] mb-6">Vos accomplissements</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          achievement.unlocked 
                            ? 'border-[#17b897] bg-gradient-to-br from-[#17b897]/5 to-[#048271]/5' 
                            : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            achievement.unlocked ? 'bg-[#17b897]' : 'bg-gray-300'
                          }`}>
                            <achievement.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1 ${
                              achievement.unlocked ? 'text-[#102a43]' : 'text-gray-500'
                            }`}>
                              {achievement.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">{achievement.description}</p>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  achievement.unlocked 
                                    ? 'bg-gradient-to-r from-[#17b897] to-[#048271]' 
                                    : 'bg-gray-400'
                                }`}
                                style={{ width: `${achievement.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Next Milestone */}
                <div className="bg-gradient-to-br from-[#334e68] to-[#048271] rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Prochain objectif</h3>
                    <Trophy className="w-6 h-6 text-[#5fe3c0]" />
                  </div>
                  <p className="text-3xl font-bold mb-2">€{stats.nextMilestone.toLocaleString()}</p>
                  <p className="text-sm text-gray-200 mb-4">
                    Plus que €{(stats.nextMilestone - stats.totalDonated).toLocaleString()} pour atteindre le statut Platinum
                  </p>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#5fe3c0] to-[#17b897] transition-all duration-500"
                      style={{ width: `${(stats.totalDonated / stats.nextMilestone) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Donation Streak */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-[#102a43] mb-4">Série de dons</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-[#17b897]">{stats.currentStreak}</p>
                      <p className="text-sm text-gray-500">mois consécutifs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-gray-400">{stats.longestStreak}</p>
                      <p className="text-xs text-gray-500">Record personnel</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded ${
                          i < stats.currentStreak * 4 
                            ? 'bg-gradient-to-br from-[#17b897] to-[#048271]' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-[#102a43] mb-4">Répartition par catégorie</h3>
                  <div className="h-48">
                    <Doughnut 
                      data={categoryChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 15,
                              font: {
                                size: 11
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Favorite Associations */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-[#102a43] mb-4">Associations favorites</h3>
                  <div className="space-y-3">
                    {favoriteAssociations.map((association) => (
                      <div key={association.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#334e68] to-[#627d98] rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[#102a43] text-sm">{association.name}</p>
                            <p className="text-xs text-gray-500">{association.lastDonation}</p>
                          </div>
                        </div>
                        {association.activeCampaign && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-[#17b897] hover:text-[#079a82] font-medium text-sm">
                    Gérer les favoris
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[#102a43] mb-4">Actions rapides</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-[#17b897]" />
                        <span className="font-medium text-[#102a43]">Télécharger les reçus</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <Share2 className="w-5 h-5 text-[#17b897]" />
                        <span className="font-medium text-[#102a43]">Inviter des amis</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-[#17b897]" />
                        <span className="font-medium text-[#102a43]">Gérer les paiements</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tabs content can be added here */}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernDonorDashboard;