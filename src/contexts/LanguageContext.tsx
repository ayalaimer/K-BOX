import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'he' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect language from URL path
  const getLanguageFromPath = () => {
    const path = window.location.pathname;
    if (path.startsWith('/en')) return 'en';
    if (path.startsWith('/he')) return 'he';
    return 'he'; // default to Hebrew
  };

  const [language, setLanguage] = useState<Language>(getLanguageFromPath);

  const isRTL = language === 'he';

  // Update document direction and language
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update body classes for styling
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
  }, [language, isRTL]);

  // Listen to browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setLanguage(getLanguageFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};