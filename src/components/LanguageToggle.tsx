import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const switchLanguage = (newLanguage: 'he' | 'en') => {
    if (newLanguage === language) return;
    
    setLanguage(newLanguage);
    
    // Update URL path
    const currentPath = location.pathname;
    let newPath = '/';
    
    // Remove current language prefix if exists  
    if (currentPath.startsWith('/he/')) {
      newPath = currentPath.substring(3) || '/';
    } else if (currentPath.startsWith('/en/')) {
      newPath = currentPath.substring(3) || '/';
    } else if (currentPath === '/he' || currentPath === '/en') {
      newPath = '/';
    } else {
      newPath = currentPath;
    }
    
    // Add new language prefix
    newPath = `/${newLanguage}${newPath === '/' ? '' : newPath}`;
    
    navigate(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-muted/50 transition-smooth"
          aria-label={t('language.select')}
        >
          <span className="text-xl">{currentLanguage?.flag}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-background border z-50">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code as 'he' | 'en')}
            className={`flex items-center gap-3 cursor-pointer hover:bg-muted/50 ${
              language === lang.code ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};