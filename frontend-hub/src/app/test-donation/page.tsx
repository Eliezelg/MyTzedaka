'use client';

import React from 'react';
import { DonationWidget, DonationHistory } from '@/components/donation';

export default function TestDonationPage() {
  // ID de test (remplacez par un vrai tenant ID)
  const testTenantId = 'test-tenant-id';
  const testCampaignId = 'test-campaign-id';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test du Widget de Donation
          </h1>
          <p className="text-lg text-gray-600">
            Interface de test pour les donations Stripe multi-tenant
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Widget de donation */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Widget de Donation</h2>
            <DonationWidget
              tenantId={testTenantId}
              campaignId={testCampaignId}
              title="Soutenir cette cause"
              description="Votre don aide à financer des projets importants"
              suggestedAmounts={[10, 25, 50, 100]}
              minAmount={5}
              maxAmount={10000}
              currency="EUR"
            />
          </div>

          {/* Historique des donations */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Historique des Donations</h2>
            <DonationHistory />
          </div>
        </div>

        {/* Instructions de test */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Instructions de Test
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Assurez-vous que les variables d'environnement Stripe sont configurées</p>
            <p>• Le backend doit être en cours d'exécution sur le port 3001</p>
            <p>• Remplacez testTenantId par un vrai ID de tenant configuré</p>
            <p>• Utilisez les cartes de test Stripe pour les paiements :</p>
            <ul className="ml-4 mt-2 space-y-1">
              <li>• Succès : 4242 4242 4242 4242</li>
              <li>• Décliné : 4000 0000 0000 0002</li>
              <li>• Authentification requise : 4000 0025 0000 3155</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
