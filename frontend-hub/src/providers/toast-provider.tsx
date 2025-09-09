'use client';

import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Provider pour les notifications toast avec react-hot-toast
 */

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Durée par défaut
          duration: 4000,
          
          // Styles par défaut
          style: {
            background: '#fff',
            color: '#363636',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            maxWidth: '400px'
          },
          
          // Styles pour success
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          
          // Styles pour error
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
        }}
      />
    </>
  );
}

/**
 * Service de notifications centralisé
 */
class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Notification de succès
   */
  public success(message: string, options?: any) {
    return toast.success(message, {
      icon: <CheckCircle className="h-5 w-5" />,
      ...options
    });
  }

  /**
   * Notification d'erreur
   */
  public error(message: string, options?: any) {
    return toast.error(message, {
      icon: <XCircle className="h-5 w-5" />,
      ...options
    });
  }

  /**
   * Notification d'avertissement
   */
  public warning(message: string, options?: any) {
    return toast(message, {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
      ...options
    });
  }

  /**
   * Notification d'information
   */
  public info(message: string, options?: any) {
    return toast(message, {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      style: {
        background: '#DBEAFE',
        color: '#1E40AF',
      },
      ...options
    });
  }

  /**
   * Notification de chargement
   */
  public loading(message: string, options?: any) {
    return toast.loading(message, options);
  }

  /**
   * Notification de promesse
   */
  public promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: any
  ) {
    return toast.promise(promise, messages, options);
  }

  /**
   * Notification custom
   */
  public custom(renderer: (t: any) => React.ReactNode, options?: any) {
    return toast.custom(renderer, options);
  }

  /**
   * Notification de donation réussie
   */
  public donationSuccess(amount: number, association?: string) {
    const message = association 
      ? `Merci pour votre don de ${amount}€ à ${association} !`
      : `Merci pour votre don de ${amount}€ !`;
    
    return this.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Don réussi !
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {message}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Un reçu fiscal vous sera envoyé par email.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Fermer
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  }

  /**
   * Notification de connexion
   */
  public loginSuccess(userName?: string) {
    const message = userName 
      ? `Bienvenue ${userName} !`
      : 'Connexion réussie !';
    
    return this.success(message);
  }

  /**
   * Notification de déconnexion
   */
  public logoutSuccess() {
    return this.info('Vous êtes déconnecté');
  }

  /**
   * Notification de copie dans le presse-papier
   */
  public clipboardSuccess(text?: string) {
    const message = text 
      ? `"${text}" copié dans le presse-papier`
      : 'Copié dans le presse-papier';
    
    return this.success(message, { duration: 2000 });
  }

  /**
   * Notification de sauvegarde
   */
  public saveSuccess(itemName?: string) {
    const message = itemName 
      ? `${itemName} enregistré avec succès`
      : 'Enregistrement réussi';
    
    return this.success(message);
  }

  /**
   * Notification de suppression
   */
  public deleteSuccess(itemName?: string) {
    const message = itemName 
      ? `${itemName} supprimé`
      : 'Suppression réussie';
    
    return this.warning(message);
  }

  /**
   * Notification d'erreur réseau
   */
  public networkError() {
    return this.error('Erreur de connexion. Vérifiez votre connexion internet.');
  }

  /**
   * Notification d'erreur de validation
   */
  public validationError(field?: string) {
    const message = field 
      ? `Veuillez corriger le champ ${field}`
      : 'Veuillez corriger les erreurs dans le formulaire';
    
    return this.error(message);
  }

  /**
   * Notification de permission refusée
   */
  public permissionDenied() {
    return this.error('Vous n\'avez pas les permissions nécessaires');
  }

  /**
   * Notification de session expirée
   */
  public sessionExpired() {
    return this.warning('Votre session a expiré. Veuillez vous reconnecter.');
  }

  /**
   * Fermer une notification
   */
  public dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  /**
   * Fermer toutes les notifications
   */
  public dismissAll() {
    toast.dismiss();
  }
}

// Export du singleton
export const notify = NotificationService.getInstance();

// Export des méthodes utilitaires directes
export const showSuccess = (message: string) => notify.success(message);
export const showError = (message: string) => notify.error(message);
export const showWarning = (message: string) => notify.warning(message);
export const showInfo = (message: string) => notify.info(message);
export const showLoading = (message: string) => notify.loading(message);

// Hook React personnalisé
export function useToast() {
  return notify;
}