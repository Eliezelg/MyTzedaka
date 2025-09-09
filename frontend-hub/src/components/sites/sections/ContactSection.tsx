import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactSectionProps {
  email?: string;
  phone?: string;
  address?: string;
  mapUrl?: string;
  hours?: {
    weekdays?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

export function ContactSection({ 
  email, 
  phone, 
  address, 
  mapUrl,
  hours 
}: ContactSectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Contactez-Nous</h2>
          <p className="text-lg text-gray-600">
            Nous sommes là pour répondre à vos questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-6">Informations de Contact</h3>
              
              <div className="space-y-4">
                {email && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a 
                        href={`mailto:${email}`}
                        className="text-primary hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <a 
                        href={`tel:${phone}`}
                        className="text-primary hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {address && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-gray-600">{address}</p>
                      {mapUrl && (
                        <a 
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm mt-1 inline-block"
                        >
                          Voir sur la carte →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {hours && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Horaires d'ouverture</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        {hours.weekdays && (
                          <p>Lundi - Jeudi: {hours.weekdays}</p>
                        )}
                        {hours.friday && (
                          <p>Vendredi: {hours.friday}</p>
                        )}
                        {hours.saturday && (
                          <p>Samedi: {hours.saturday}</p>
                        )}
                        {hours.sunday && (
                          <p>Dimanche: {hours.sunday}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t">
                <Button className="w-full" asChild>
                  <a href="/contact">
                    Envoyer un message
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Map or Contact Form */}
          <div>
            {mapUrl ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full min-h-[400px]">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-semibold mb-6">Envoyez-nous un message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Prénom"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Nom"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone (optionnel)"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Votre message"
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit" className="w-full">
                    Envoyer le message
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}