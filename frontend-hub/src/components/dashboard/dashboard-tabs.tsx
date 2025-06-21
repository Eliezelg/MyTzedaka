'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, History, Search, UserCircle, Receipt } from 'lucide-react'
import { DashboardOverview } from './dashboard-overview'
import { DonationHistory } from '@/components/donor-portal/donation-history'
import { DonorProfile } from '@/components/donor-portal/donor-profile'
import { AssociationDirectory } from '@/components/donor-portal/association-directory'
import { TaxReceiptsList } from '@/components/tax-receipts/tax-receipts-list'

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Vue d'ensemble
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Historique
        </TabsTrigger>
        <TabsTrigger value="receipts" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Reçus fiscaux
        </TabsTrigger>
        <TabsTrigger value="directory" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Associations
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          Mon Profil
        </TabsTrigger>
      </TabsList>

      {/* Onglet Vue d'ensemble */}
      <TabsContent value="overview" className="space-y-8 mt-6">
        <DashboardOverview />
      </TabsContent>

      {/* Onglet Historique */}
      <TabsContent value="history" className="mt-6">
        <DonationHistory />
      </TabsContent>

      {/* Onglet Reçus fiscaux */}
      <TabsContent value="receipts" className="mt-6">
        <TaxReceiptsList mode="donor" showYearlyView={true} />
      </TabsContent>

      {/* Onglet Répertoire d'associations */}
      <TabsContent value="directory" className="mt-6">
        <AssociationDirectory />
      </TabsContent>

      {/* Onglet Profil */}
      <TabsContent value="profile" className="mt-6">
        <DonorProfile />
      </TabsContent>
    </Tabs>
  )
}