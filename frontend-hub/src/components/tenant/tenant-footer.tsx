'use client'

import React from 'react'
import Link from 'next/link'
import { useTenant, useDynamicNavigation } from '@/providers/tenant-provider'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function TenantFooter() {
  const { tenant } = useTenant()
  const navigation = useDynamicNavigation()
  const currentYear = new Date().getFullYear()

  // Extraire les infos de contact du tenant
  const contactInfo = tenant.settings?.contact || {}
  const socialLinks = tenant.settings?.socialLinks || {}

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">{tenant.name}</h3>
            <p className="text-gray-400 mb-4">
              {tenant.settings?.description || 
               'Organisation dédiée à faire la différence dans notre communauté.'}
            </p>
            
            {/* Réseaux sociaux */}
            <div className="flex space-x-4">
              {socialLinks.facebook && (
                <a 
                  href={socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a 
                  href={socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a 
                  href={socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              {navigation.footerMenu.map((item: any) => (
                <li key={item.path}>
                  <Link
                    href={`/t/${tenant.slug}${item.path}`}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              {contactInfo.email && (
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-white transition"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo.phone && (
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="hover:text-white transition"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo.address && (
                <li className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            © {currentYear} {tenant.name}. Tous droits réservés.
          </p>
          <p className="mt-2 text-sm">
            Propulsé par{' '}
            <a 
              href="https://mytzedaka.com" 
              className="text-primary hover:text-primary-light transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              MyTzedaka
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}