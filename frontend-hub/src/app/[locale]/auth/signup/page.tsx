'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, User, Mail, Lock, Phone, Building } from 'lucide-react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  tenantSlug?: string
}

export default function UnifiedSignupPage() {
  const { register, isLoading, error, isSiteMode, currentTenantSlug } = useUnifiedAuth()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    tenantSlug: currentTenantSlug || ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setValidationError('')
  }

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas')
      return false
    }
    
    if (formData.password.length < 8) {
      setValidationError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }
    
    // Validation du mot de passe fort
    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasLowerCase = /[a-z]/.test(formData.password)
    const hasNumber = /\d/.test(formData.password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    
    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
      setValidationError('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      // Le register unifié gère automatiquement les redirections
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        tenantSlug: isSiteMode ? currentTenantSlug : formData.tenantSlug
      })
    } catch (error) {
      // L'erreur est gérée par le context
      console.error('Erreur d\'inscription:', error)
    }
  }

  // Déterminer le titre et la description selon le contexte
  const getPageContent = () => {
    if (isSiteMode && currentTenantSlug) {
      return {
        title: t('signup.titleSite'),
        subtitle: t('signup.subtitleSite'),
        showTenantField: false
      }
    }
    return {
      title: t('signup.title'),
      subtitle: t('signup.subtitle'),
      showTenantField: true
    }
  }

  const { title, subtitle, showTenantField } = getPageContent()
  const locale = pathname?.split('/')[1] || 'fr'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isSiteMode ? currentTenantSlug?.toUpperCase() : 'MyTzedaka'}
          </h1>
          <p className="text-gray-600">{tCommon('header.tagline')}</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || validationError) && (
                <Alert variant="destructive">
                  <AlertDescription>{error || validationError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    <User className="inline h-4 w-4 mr-1" />
                    {t('signup.firstName')}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    <User className="inline h-4 w-4 mr-1" />
                    {t('signup.lastName')}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  {t('signup.email')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="exemple@email.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  {t('signup.phone')} ({t('common.optional')})
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+33 6 12 34 56 78"
                  disabled={isLoading}
                />
              </div>

              {showTenantField && (
                <div className="space-y-2">
                  <Label htmlFor="tenantSlug">
                    <Building className="inline h-4 w-4 mr-1" />
                    Code Association ({t('common.optional')})
                  </Label>
                  <Input
                    id="tenantSlug"
                    name="tenantSlug"
                    type="text"
                    value={formData.tenantSlug}
                    onChange={handleInputChange}
                    placeholder="ex: kehilat-paris"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Laissez vide pour créer un compte donateur général
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="inline h-4 w-4 mr-1" />
                  {t('signup.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pr-10"
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
                <p className="text-xs text-gray-500">
                  Au moins 8 caractères, avec majuscules, minuscules, chiffres et symboles
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  <Lock className="inline h-4 w-4 mr-1" />
                  {t('signup.confirmPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('signup.signupButton')}...
                  </>
                ) : (
                  t('signup.signupButton')
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  {t('signup.alreadyHaveAccount')}{' '}
                  <Link 
                    href={`/${locale}/auth/login`}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {t('signup.loginLink')}
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
      </div>
    </div>
  )
}