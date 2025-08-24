import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Translation {
  key: string;
  he: string | null;
  en: string | null;
  category: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Fetch all translations from database
    const { data: translations, error } = await supabaseClient
      .from('translations')
      .select('key, he, en, category')
      .order('key');

    if (error) {
      console.error('Error fetching translations:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch translations' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert to nested object structure for both languages
    const heTranslations: any = {};
    const enTranslations: any = {};

    translations?.forEach((translation: Translation) => {
      const keys = translation.key.split('.');
      
      // Build Hebrew translations
      let heTarget = heTranslations;
      let enTarget = enTranslations;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!heTarget[keys[i]]) heTarget[keys[i]] = {};
        if (!enTarget[keys[i]]) enTarget[keys[i]] = {};
        heTarget = heTarget[keys[i]];
        enTarget = enTarget[keys[i]];
      }
      
      heTarget[keys[keys.length - 1]] = translation.he || translation.key;
      enTarget[keys[keys.length - 1]] = translation.en || translation.key;
    });

    const result = {
      he: heTranslations,
      en: enTranslations,
      lastUpdated: new Date().toISOString(),
      totalTranslations: translations?.length || 0
    };

    return new Response(
      JSON.stringify(result, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});