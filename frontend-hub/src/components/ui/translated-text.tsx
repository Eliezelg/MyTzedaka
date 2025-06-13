'use client'

import { useTranslations } from 'next-intl'
import { type TranslationNamespace } from '@/lib/translations'

interface TranslatedTextProps {
  namespace: TranslationNamespace
  tKey: string
  values?: Record<string, string | number>
  fallback?: string
  className?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}

export function TranslatedText({
  namespace,
  tKey,
  values,
  fallback,
  className,
  as: Component = 'span'
}: TranslatedTextProps) {
  const t = useTranslations(namespace)
  
  try {
    const text = t(tKey, values)
    return <Component className={className}>{text}</Component>
  } catch (error) {
    console.warn(`Missing translation: ${namespace}.${tKey}`)
    return <Component className={className}>{fallback || tKey}</Component>
  }
}

// Composants spécialisés pour une utilisation plus simple
export function CommonText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="common"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}

export function NavigationText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="navigation"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}

export function FormText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="forms"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}

export function AssociationText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="associations"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}

export function CampaignText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="campaigns"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}

export function DonationText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="donations"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}

export function AuthText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="auth"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}

export function ErrorText({ tKey, values, fallback, className, as }: Omit<TranslatedTextProps, 'namespace'>) {
  return (
    <TranslatedText
      namespace="errors"
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={as}
    />
  )
}
