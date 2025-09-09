'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, LogIn, User, Mail, Lock } from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'

export default function UnifiedLoginPage() {
  const { login, isLoading, error, isSiteMode, currentTenantSlug } = useUnifiedAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Le login unifié gère automatiquement les redirections
      await login(formData)
    } catch (error) {
      // L'erreur est gérée par le context
      console.error('Erreur de connexion:', error)
    }
  }

  // Déterminer le titre et la description selon le contexte
  const getPageContent = () => {
    if (isSiteMode && currentTenantSlug) {
      return {
        title: t('login.title'),
        subtitle: 'Accédez à votre espace sur cette association',
        signupLink: `/sites/${currentTenantSlug}/auth/register`,
        forgotPasswordLink: `/sites/${currentTenantSlug}/auth/forgot-password`
      }
    }
    
    return {
      title: t('login.title'),
      subtitle: t('login.subtitle'),
      signupLink: `/${pathname?.split('/')[1] || 'fr'}/signup`,
      forgotPasswordLink: '/forgot-password'
    }
  }

  const content = getPageContent()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">MyTzedaka</h1>
          <p className="mt-2 text-gray-600">{tCommon('header.tagline')}</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{content.title}</CardTitle>
            <CardDescription className="text-center">
              {content.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('login.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="exemple@email.com"
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  href={content.forgotPasswordLink}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('login.loginButton')}...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('login.loginButton')}
                  </>
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {t('login.noAccount')}{' '}
                  <Link 
                    href={content.signupLink}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {t('login.signupLink')}
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          {tCommon('legal.bySigningUp')}{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            {tCommon('legal.termsOfService')}
          </Link>
          {' '}{tCommon('legal.and')}{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            {tCommon('legal.privacyPolicy')}
          </Link>
        </div>

        {/* Indication du mode pour debug (à retirer en production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center text-xs text-gray-400">
            Mode: {isSiteMode ? `Site (${currentTenantSlug})` : 'Hub Central'}
          </div>
        )}
      </div>
    </div>
  )
}