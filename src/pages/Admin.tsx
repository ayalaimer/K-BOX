import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, FileUp, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/blog/LoginForm";
import { Helmet } from "react-helmet-async";
import { AdminNav } from "@/components/admin/AdminNav";

const Admin = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>כניסה לאדמין | K-Box Admin</title>
          <meta name="description" content="התחברות לאזור הניהול של האתר" />
          <link rel="canonical" href={`${window.location.origin}/admin`} />
        </Helmet>
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-6">כניסה לאדמין</h1>
            <LoginForm />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>לוח ניהול | K-Box Admin</title>
        <meta name="description" content="ניהול בלוג ותרגומים" />
        <link rel="canonical" href={`${window.location.origin}/admin`} />
      </Helmet>
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-10">לוח ניהול</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  דשבורד ראשי
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  סטטיסטיקות יומיות וקישורים מהירים לניהול המערכת
                </p>
                <Button asChild variant="secondary">
                  <Link to="/admin/dashboard">כניסה</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="w-5 h-5" />
                  ניהול בלוג / העלאת Markdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  העלאה וניהול פוסטים לקידום אורגני (SEO)
                </p>
                <Button asChild>
                  <Link to="/admin/blog/new">כניסה</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  ניהול תרגומים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  עריכה, הוספה ומחיקה של מחרוזות התרגום באתר
                </p>
                <Button asChild variant="outline">
                  <Link to="/admin/translations">כניסה</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  ניהול הזמנות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  צפייה בהזמנות יומיות
                </p>
                <Button asChild variant="secondary">
                  <Link to="/admin/bookings">כניסה</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  ניהול חדרים ומחירים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  הוספה ועריכה של חדרים, קיבולת ומחיר לשעה
                </p>
                <Button asChild variant="secondary">
                  <Link to="/admin/rooms">כניסה</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
