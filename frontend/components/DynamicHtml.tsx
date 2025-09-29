'use client'

import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useEffect } from 'react'

export function DynamicHtml() {
  const { language, direction } = useLanguage()
  const { settings } = useSettings()

  useEffect(() => {
    const html = document.documentElement
    html.lang = language
    html.dir = direction

    const body = document.body
    body.classList.remove('font-sm', 'font-md', 'font-lg')
    body.classList.add(`font-${settings.fontSize}`)

    body.classList.remove('rtl', 'ltr')
    body.classList.add(direction)

  }, [language, direction, settings.fontSize])

  return null
}