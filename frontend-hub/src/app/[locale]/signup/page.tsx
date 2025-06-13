'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomSelect } from '@/components/ui/custom-select'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  userType: 'DONATOR' | 'ASSOCIATION_ADMIN'
  associationName: string
  associationDescription: string
}

export default function SignupPage() {
  const { register, isLoading, error } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'DONATOR',
    associationName: '',
    associationDescription: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name?: string; value: string } }) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }))
  }

  const validateStep1 = () => {
    const { email, password, confirmPassword } = formData
    
    if (!email || !password || !confirmPassword) {
      return false
    }
    
    if (password !== confirmPassword) {
      return false
    }
    
    if (password.length < 8) {
      return false
    }
    
    return true
  }

  const validateStep2 = () => {
    const { firstName, lastName, userType, associationName } = formData
    
    if (!firstName || !lastName) {
      return false
    }
    
    if (userType === 'ASSOCIATION_ADMIN' && !associationName) {
      return false
    }
    
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) {
      return
    }
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      })
      // Redirection vers login après inscription réussie
      router.push('/login?message=inscription-reussie')
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">MyTzedaka</h1>
          <p className="mt-2 text-gray-600">Rejoignez le hub des associations caritatives</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Étape {step} sur 2 : {step === 1 ? 'Sécurité' : 'Profil'}
            </CardDescription>
            <div className="flex space-x-2">
              <div className={`h-2 rounded-full flex-1 ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`h-2 rounded-full flex-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="votre@email.com"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
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
                    <p className="text-xs text-gray-500">Minimum 8 caractères</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
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
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full"
                    disabled={!validateStep1()}
                  >
                    Continuer
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="Prénom"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Nom"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="userType">Type de compte</Label>
                    <CustomSelect
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      placeholder="Choisissez votre type de compte"
                      options={[
                        { value: 'DONATOR', label: 'Donateur' },
                        { value: 'ASSOCIATION_ADMIN', label: 'Responsable d\'association' }
                      ]}
                    />
                  </div>

                  {formData.userType === 'ASSOCIATION_ADMIN' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="associationName">Nom de l'association</Label>
                        <Input
                          id="associationName"
                          name="associationName"
                          value={formData.associationName}
                          onChange={handleInputChange}
                          required
                          placeholder="Nom de votre association"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="associationDescription">Description (optionnel)</Label>
                        <textarea
                          id="associationDescription"
                          name="associationDescription"
                          value={formData.associationDescription}
                          onChange={handleInputChange}
                          placeholder="Décrivez brièvement votre association..."
                          disabled={isLoading}
                          className="w-full p-2 border rounded-md resize-none h-20"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || !validateStep2()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Créer mon compte
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Déjà un compte ?{' '}
                  <Link 
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Se connecter
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          En créant un compte, vous acceptez nos{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            conditions d'utilisation
          </Link>
          {' '}et notre{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  )
}
