import { useState, useEffect } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Translations {
  [key: string]: string;
}

export const useTranslation = () => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        
        // Load translations from database
        const { data: dbTranslations, error } = await supabase
          .from('translations')
          .select('key, he, en');

        if (!error && dbTranslations) {
          // Build simple flat key-value map
          const translationMap: Translations = {};
          
          dbTranslations.forEach((translation) => {
            const value = language === 'he' ? translation.he : translation.en;
            translationMap[translation.key] = value || translation.key;
          });
          
          setTranslations(translationMap);
        } else {
          console.error('Failed to load translations from database:', error);
          setTranslations({});
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const t = (key: string): string => {
    // Return empty string during loading to prevent showing keys
    if (loading) return '';

    const value = translations[key];
    if (value === undefined) {
      console.warn('[i18n] Missing translation key:', key, 'lang:', language);
      return key;
    }
    return value;
  };
  return { t, loading, language };
};