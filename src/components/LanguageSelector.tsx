
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/hooks/useLanguage'
import { Globe } from 'lucide-react'

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'hi', name: 'हिंदी' }
  ]

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <Select value={language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelector
