'use client'

import { CheckCircle, Heart, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ConfirmationProps {
  amount: number
  campaignTitle: string
  paymentIntentId: string
  onNewDonation: () => void
}

export function Confirmation({ 
  amount, 
  campaignTitle, 
  paymentIntentId,
  onNewDonation 
}: ConfirmationProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `J'ai soutenu ${campaignTitle}`,
          text: `Je viens de faire un don pour soutenir ${campaignTitle}. Rejoignez-moi !`,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback si le partage natif échoue
        copyToClipboard()
      }
    } else {
      // Fallback pour les navigateurs sans support de Web Share API
      copyToClipboard()
    }
    
    setIsSharing(false)
  }

  const copyToClipboard = () => {
    const text = `Je viens de soutenir ${campaignTitle} ! Rejoignez-moi : ${window.location.href}`
    navigator.clipboard.writeText(text)
    // Ici on pourrait ajouter un toast de confirmation
  }

  const downloadReceipt = () => {
    // Ici on implémenterait le téléchargement du reçu fiscal
    // Pour l'instant, on simule avec un log
    console.log('Téléchargement du reçu pour le paiement:', paymentIntentId)
  }

  return (
    <div className="text-center space-y-6">
      {/* Icône de succès animée */}
      <div className="relative">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Heart className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
      </div>

      {/* Message de succès */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-gray-900">
          Merci pour votre générosité !
        </h3>
        <p className="text-lg text-gray-600">
          Votre don de <span className="font-bold text-green-600">{amount.toFixed(2)}€</span> 
          {' '}pour <span className="font-medium">{campaignTitle}</span> a été traité avec succès.
        </p>
      </div>

      {/* Informations sur le suivi */}
      <div className="bg-green-50 p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-center text-green-800 mb-2">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Votre don fait la différence</span>
        </div>
        
        <div className="text-sm text-green-700 space-y-1">
          <p>• Un reçu fiscal vous sera envoyé par email dans les minutes qui suivent</p>
          <p>• Vous recevrez des mises à jour sur l'impact de votre don</p>
          <p>• Votre contribution est déductible des impôts</p>
        </div>
      </div>

      {/* Détails du paiement */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>ID de transaction : {paymentIntentId}</p>
        <p>Date : {new Date().toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={downloadReceipt}
            className="flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Reçu fiscal
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isSharing ? 'Partage...' : 'Partager'}
          </Button>
        </div>

        <Button
          onClick={onNewDonation}
          className="w-full"
        >
          Faire un autre don
        </Button>
      </div>

      {/* Message d'encouragement */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <Heart className="w-4 h-4 inline mr-1" />
          Chaque don compte ! Partagez cette campagne avec vos proches pour 
          maximiser l'impact de votre geste généreux.
        </p>
      </div>
    </div>
  )
}
