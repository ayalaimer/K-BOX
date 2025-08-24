import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import CancellationPolicy from "./pages/CancellationPolicy";
import Accessibility from "./pages/Accessibility";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogAdmin from "./pages/BlogAdmin";
import { TranslationsAdmin } from "./pages/TranslationsAdmin";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import RoomsAdmin from "./pages/RoomsAdmin";
import BookingsAdmin from "./pages/BookingsAdmin";
import AdminLayout from "./layouts/AdminLayout";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLogs from "./pages/AdminLogs";
import RequireAdmin from "./components/route/RequireAdmin";
import EmailTemplatesAdmin from "./pages/EmailTemplatesAdmin";
import BusinessSettingsAdmin from "./pages/BusinessSettingsAdmin";
import ReviewsAdmin from "./pages/ReviewsAdmin";
import Reviews from "./pages/Reviews";
import { MessagesAdmin } from "./pages/MessagesAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Redirect root to Hebrew */}
            <Route path="/" element={<Navigate to="/he" replace />} />
            
            {/* Hebrew routes */}
            <Route path="/he" element={<Index />} />
            <Route path="/he/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/he/terms-of-use" element={<TermsOfUse />} />
            <Route path="/he/cancellation-policy" element={<CancellationPolicy />} />
            <Route path="/he/accessibility" element={<Accessibility />} />
            <Route path="/he/reviews" element={<Reviews />} />
            <Route path="/he/blog" element={<Blog />} />
            <Route path="/he/blog/:slug" element={<BlogPost />} />
            
            {/* English routes */}
            <Route path="/en" element={<Index />} />
            <Route path="/en/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/en/terms-of-use" element={<TermsOfUse />} />
            <Route path="/en/cancellation-policy" element={<CancellationPolicy />} />
            <Route path="/en/accessibility" element={<Accessibility />} />
            <Route path="/en/reviews" element={<Reviews />} />
            <Route path="/en/blog" element={<Blog />} />
            <Route path="/en/blog/:slug" element={<BlogPost />} />
            
            {/* Admin routes - protected */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="bookings" element={<BookingsAdmin />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="rooms" element={<RoomsAdmin />} />
              <Route path="blog">
                <Route path="new" element={<BlogAdmin />} />
              </Route>
              <Route path="messages" element={<MessagesAdmin />} />
              <Route path="translations" element={<TranslationsAdmin />} />
              <Route path="email-templates" element={<EmailTemplatesAdmin />} />
              <Route path="settings" element={<BusinessSettingsAdmin />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>
            
            {/* Legacy redirects for old URLs */}
            <Route path="/privacy-policy" element={<Navigate to="/he/privacy-policy" replace />} />
            <Route path="/terms-of-use" element={<Navigate to="/he/terms-of-use" replace />} />
            <Route path="/cancellation-policy" element={<Navigate to="/he/cancellation-policy" replace />} />
            <Route path="/accessibility" element={<Navigate to="/he/accessibility" replace />} />
            <Route path="/blog" element={<Navigate to="/he/blog" replace />} />
            <Route path="/blog/:slug" element={<Navigate to="/he/blog/:slug" replace />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
