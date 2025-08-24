
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * RequireAdmin route guard
 * - Allows access if a legacy local token exists (blog_admin_token)
 * - Otherwise requires a Supabase session AND an 'admin' role in user_roles
 */
export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const legacyToken = localStorage.getItem("blog_admin_token");
      if (legacyToken) {
        if (!cancelled) {
          setAllowed(true);
          setChecked(true);
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) {
          setAllowed(false);
          setChecked(true);
        }
        return;
      }

      // Check if user has 'admin' role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setAllowed(!!data && !error);
        setChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;
  if (!allowed) return <Navigate to="/auth" state={{ from: location }} replace />;
  return <>{children}</>;
};

export default RequireAdmin;
