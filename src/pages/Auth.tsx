import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type { Session } from "@supabase/supabase-js";
const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess && (location.state as any)?.from) {
        navigate("/admin/dashboard", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.state]);

const handleGoogleAuth = async () => {
  try {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) throw error;
  } catch (error: any) {
    toast({ title: "שגיאת התחברות", description: error.message ?? String(error), variant: "destructive" });
    setLoading(false);
  }
};

const handleSignOut = async () => {
  try {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast({ title: "התנתקת בהצלחה" });
  } catch (error: any) {
    toast({ title: "שגיאת התנתקות", description: error.message ?? String(error), variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>התחברות עם גוגל | K-Box</title>
        <meta name="description" content="התחברות והרשמה עם Google בלבד למערכת הניהול של K-Box" />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">התחברות עם גוגל</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">כניסה למערכת</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session ? (
                <>
                  <p className="text-center text-muted-foreground">את/ה כבר מחובר/ת.</p>
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => navigate("/admin/dashboard")}
                      aria-label="מעבר ללוח הבקרה"
                    >
                      לוח הבקרה
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleSignOut}
                      disabled={loading}
                      aria-label="התנתקות"
                    >
                      התנתקות
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full h-12"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  aria-label="התחברות או הרשמה עם Google"
                >
                  התחברות/הרשמה עם Google
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;

