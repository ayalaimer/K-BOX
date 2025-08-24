
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Simple route guard:
 * - Allows access if there's a Supabase session
 * - OR if a legacy local token exists (blog_admin_token)
 * Otherwise redirects to /auth
 */
export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const legacyToken = localStorage.getItem("blog_admin_token");
      if (!cancelled) {
        setAllowed(!!session || !!legacyToken);
        setChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;

  if (!allowed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
