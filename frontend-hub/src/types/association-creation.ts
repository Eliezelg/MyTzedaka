// Types pour la création progressive d'associations

export type AssociationCategory = 
  | 'GENERAL' 
  | 'HUMANITAIRE' 
  | 'EDUCATION' 
  | 'SANTE' 
  | 'CULTURE' 
  | 'SPORT' 
  | 'ENVIRONNEMENT' 
  | 'SOCIAL'
  | 'RELIGIEUX'
  | 'AUTRE'

export type CompletionLevel = 1 | 2 | 3 | 4 | 5

export interface MinimalAssociationInfo {
  // Identité de base (obligatoire)
  name: string
  email: string
  country: string
  
  // Mission courte (obligatoire)
  shortDescription: string
  category: AssociationCategory
  
  // Responsable créateur (obligatoire)
  creatorInfo: {
    firstName: string
    lastName: string
    email: string
    role: 'PRESIDENT' | 'FOUNDER' | 'COORDINATOR'
  }
  
  // Accords légaux (obligatoire)
  termsAccepted: boolean
  dataProtectionCompliance: boolean
}

export interface ExtendedContactInfo {
  phone?: string
  website?: string
  address?: {
    street: string
    postalCode: string
    city: string
    region?: string
  }
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

export interface DetailedMissionInfo {
  fullDescription: string
  objectives: string[]
  targetAudience: string[]
  actionAreas: string[]
  geographicScope: 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL'
  mainActivities: string[]
}

export interface GovernanceInfo {
  boardMembers: Array<{
    firstName: string
    lastName: string
    email: string
    role: 'PRESIDENT' | 'VICE_PRESIDENT' | 'TREASURER' | 'SECRETARY' | 'MEMBER'
  }>
  hasGeneralAssembly: boolean
  meetingFrequency?: string
  decisionMakingProcess?: string
}

export interface FullProfileInfo {
  financial?: {
    estimatedAnnualBudget?: number
    fundingSources: string[]
    bankAccount?: {
      iban: string
      bic: string
      bankName: string
    }
    taxExemptStatus?: boolean
  }
  legal?: {
    registrationNumber?: string
    registrationDate?: string
    legalDocuments?: File[]
  }
  branding?: {
    logo?: File
    colors?: {
      primary: string
      secondary?: string
    }
    photos?: File[]
  }
}

// Types spécifiques par pays
export interface FranceLegalInfo {
  associationType: 'LOI_1901' | 'ALSACE_MOSELLE' | 'CULTUELLE'
  rnaNumber?: string
  siretNumber?: string
  prefecture: string
  jorfReference?: string
  statuts?: File
  pvCreation?: File
  rescritFiscal?: boolean
  dugaNumber?: string
}

export interface BelgiumLegalInfo {
  associationType: 'ASBL' | 'FONDATION' | 'ASSOCIATION_FAIT'
  enterpriseNumber?: string
  tribunal: string
  monitorBelgeReference?: string
  region: 'WALLONIE' | 'FLANDRE' | 'BRUXELLES'
  language: 'FR' | 'NL' | 'DE'
  actesConstitutifs?: File
  publicationPreuve?: File
}

export interface SwitzerlandLegalInfo {
  associationType: 'ASSOCIATION_SIMPLE' | 'ASSOCIATION_BUT_IDEAL'
  canton: string
  ideNumber?: string
  registreCommerce?: boolean
  exonerationFiscale?: boolean
  ccpAccount?: string
}

export interface CanadaLegalInfo {
  incorporationType: 'FEDERAL' | 'PROVINCIAL'
  province?: string
  businessNumber?: string
  charityNumber?: string
  corporationsCanada?: boolean
  revenuCanada?: boolean
  officialLanguages: ('EN' | 'FR')[]
}

export type CountrySpecificLegalInfo = 
  | FranceLegalInfo 
  | BelgiumLegalInfo 
  | SwitzerlandLegalInfo 
  | CanadaLegalInfo

export interface ProgressiveAssociationCreation {
  // Niveau 1 (20%) - Obligatoire
  basicInfo: MinimalAssociationInfo
  
  // Niveau 2 (40%) - Optionnel
  extendedContact?: ExtendedContactInfo
  
  // Niveau 3 (60%) - Optionnel
  detailedMission?: DetailedMissionInfo
  
  // Niveau 4 (80%) - Optionnel
  governance?: GovernanceInfo
  countrySpecific?: CountrySpecificLegalInfo
  
  // Niveau 5 (100%) - Optionnel
  fullProfile?: FullProfileInfo
  
  // Métadonnées
  completionLevel: CompletionLevel
  createdAt: Date
  lastUpdated: Date
}

export interface CompletionStep {
  level: CompletionLevel
  title: string
  description: string
  required: boolean
  completed: boolean
  fields: string[]
  estimatedTime: string // "2 min", "5 min", etc.
}

export const COUNTRIES = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'UK', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'OTHER', name: 'Autre', flag: '🌍' }
] as const

export const CATEGORIES: Array<{ value: AssociationCategory; label: string; description: string }> = [
  { value: 'GENERAL', label: 'Général', description: 'Association généraliste' },
  { value: 'HUMANITAIRE', label: 'Humanitaire', description: 'Aide humanitaire et secours' },
  { value: 'EDUCATION', label: 'Éducation', description: 'Enseignement et formation' },
  { value: 'SANTE', label: 'Santé', description: 'Santé et bien-être' },
  { value: 'CULTURE', label: 'Culture', description: 'Arts et culture' },
  { value: 'SPORT', label: 'Sport', description: 'Activités sportives' },
  { value: 'ENVIRONNEMENT', label: 'Environnement', description: 'Protection de la nature' },
  { value: 'SOCIAL', label: 'Social', description: 'Action sociale et solidarité' },
  { value: 'RELIGIEUX', label: 'Religieux', description: 'Organisations religieuses' },
  { value: 'AUTRE', label: 'Autre', description: 'Autre domaine d\'activité' }
]
