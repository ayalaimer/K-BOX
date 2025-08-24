import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'karaoke2024!'
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = localStorage.getItem('blog_admin_token');
      setIsAuthenticated(!!token || !!session);
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session || !!localStorage.getItem('blog_admin_token'));
    });

    init();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (username: string, password: string): boolean => {
    const ok = username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
    if (ok) {
      localStorage.setItem('blog_admin_token', 'authenticated');
      setIsAuthenticated(true);
      try { import('@/lib/logging').then(m => m.logInfo('Legacy admin login success', { component: 'useAuth' })); } catch {}
      return true;
    }
    try { import('@/lib/logging').then(m => m.logWarn('Legacy admin login failed', { component: 'useAuth' })); } catch {}
    return false;
  };

  const logout = () => {
    // Sign out from Supabase (if logged in) and clear legacy token
    supabase.auth.signOut().finally(() => {
      localStorage.removeItem('blog_admin_token');
      setIsAuthenticated(false);
      try { import('@/lib/logging').then(m => m.logInfo('Logout', { component: 'useAuth' })); } catch {}
    });
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};