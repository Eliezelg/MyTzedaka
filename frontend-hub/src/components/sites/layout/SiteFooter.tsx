'use client';

import Link from 'next/link';
import { useTenant, useDynamicNavigation } from '@/providers/tenant-provider';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function SiteFooter() {
  const { tenant } = useTenant();
  const navigation = useDynamicNavigation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">{tenant.name}</h3>
            <p className="text-sm">
              {tenant.settings?.description || tenant.settings?.tagline || 
               'Ensemble, construisons un monde meilleur par la générosité et la solidarité.'}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {tenant.settings?.social?.facebook && (
                <a 
                  href={tenant.settings.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {tenant.settings?.social?.twitter && (
                <a 
                  href={tenant.settings.social.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {tenant.settings?.social?.instagram && (
                <a 
                  href={tenant.settings.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {tenant.settings?.social?.linkedin && (
                <a 
                  href={tenant.settings.social.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              {navigation.footerMenu.map((item: any) => (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Nos Services</h4>
            <ul className="space-y-2">
              {navigation.mainMenu
                .filter((item: any) => item.path !== '/')
                .slice(0, 5)
                .map((item: any) => (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {tenant.settings?.contact?.email && (
                <li className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 mt-0.5" />
                  <a 
                    href={`mailto:${tenant.settings.contact.email}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {tenant.settings.contact.email}
                  </a>
                </li>
              )}
              {tenant.settings?.contact?.phone && (
                <li className="flex items-start space-x-2">
                  <Phone className="h-4 w-4 mt-0.5" />
                  <a 
                    href={`tel:${tenant.settings.contact.phone}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {tenant.settings.contact.phone}
                  </a>
                </li>
              )}
              {tenant.settings?.contact?.address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">
                    {tenant.settings.contact.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {currentYear} {tenant.name}. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Conditions
              </Link>
              <Link href="/legal" className="hover:text-white transition-colors">
                Mentions Légales
              </Link>
            </div>
          </div>
          
          {/* Platform Credit */}
          <div className="mt-4 text-center text-xs text-gray-500">
            Propulsé par{' '}
            <a 
              href="https://mytzedaka.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors"
            >
              MyTzedaka
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}