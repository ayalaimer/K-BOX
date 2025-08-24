-- Add component column to translations table
ALTER TABLE public.translations 
ADD COLUMN component text;

-- Update existing translations with component values
UPDATE public.translations 
SET component = CASE 
  WHEN key LIKE 'header.%' THEN 'Header'
  WHEN key LIKE 'footer.%' THEN 'Footer'
  WHEN key LIKE 'hero.%' THEN 'HeroSection'
  WHEN key LIKE 'booking.%' THEN 'BookingSection'
  WHEN key LIKE 'contact.%' THEN 'ContactSection'
  WHEN key LIKE 'reviews.%' THEN 'ReviewsSection'
  WHEN key LIKE 'promotions.%' THEN 'PromotionsSection'
  WHEN key LIKE 'blog.%' THEN 'BlogSection'
  WHEN key LIKE 'common.%' THEN 'Common'
  WHEN key LIKE 'nav.%' THEN 'Navigation'
  WHEN key LIKE 'bookingDialog.%' THEN 'BookingDialog'
  ELSE 'General'
END;

-- Insert all missing translation keys with proper component organization
INSERT INTO public.translations (component, category, key, he, en) VALUES 
-- Header translations
('Header', 'nav', 'header.nav.home', 'בית', 'Home'),
('Header', 'nav', 'header.nav.blog', 'בלוג', 'Blog'),
('Header', 'nav', 'header.nav.promotions', 'מבצעים', 'Promotions'),
('Header', 'nav', 'header.nav.reviews', 'ביקורות', 'Reviews'),
('Header', 'nav', 'header.nav.contact', 'צור קשר', 'Contact'),
('Header', 'contact', 'header.contact.phone', '054-123-4567', '054-123-4567'),
('Header', 'action', 'header.booking.quick', 'הזמנה מהירה', 'Quick Booking'),
('Header', 'menu', 'header.menu.toggle', 'תפריט', 'Menu'),

-- Footer translations
('Footer', 'company', 'footer.company.description', 'שירותי ניקיון מקצועיים ואמינים', 'Professional and reliable cleaning services'),
('Footer', 'company', 'footer.company.rating', 'דירוג 5 כוכבים', '5 Star Rating'),
('Footer', 'contact', 'footer.contact.phone', 'טלפון', 'Phone'),
('Footer', 'contact', 'footer.contact.email', 'אימייל', 'Email'),
('Footer', 'contact', 'footer.contact.address', 'כתובת', 'Address'),
('Footer', 'hours', 'footer.hours.title', 'שעות פעילות', 'Business Hours'),
('Footer', 'hours', 'footer.hours.open', 'פתוח עכשיו', 'Open Now'),
('Footer', 'hours', 'footer.hours.closed', 'סגור עכשיו', 'Closed Now'),
('Footer', 'newsletter', 'footer.newsletter.title', 'הרשמה לעדכונים', 'Newsletter Signup'),
('Footer', 'newsletter', 'footer.newsletter.placeholder', 'הכנס את האימייל שלך', 'Enter your email'),
('Footer', 'newsletter', 'footer.newsletter.subscribe', 'הרשם', 'Subscribe'),
('Footer', 'social', 'footer.social.facebook', 'Facebook', 'Facebook'),
('Footer', 'social', 'footer.social.instagram', 'Instagram', 'Instagram'),
('Footer', 'legal', 'footer.legal.copyright', 'כל הזכויות שמורות', 'All rights reserved'),
('Footer', 'legal', 'footer.legal.privacy', 'מדיניות פרטיות', 'Privacy Policy'),
('Footer', 'legal', 'footer.legal.terms', 'תנאי שימוש', 'Terms of Use'),
('Footer', 'legal', 'footer.legal.cancellation', 'מדיניות ביטולים', 'Cancellation Policy'),
('Footer', 'legal', 'footer.legal.accessibility', 'נגישות', 'Accessibility'),

-- HeroSection translations
('HeroSection', 'badge', 'hero.badge.professional', 'שירות מקצועי', 'Professional Service'),
('HeroSection', 'main', 'hero.title', 'שירותי ניקיון מקצועיים ואמינים', 'Professional and Reliable Cleaning Services'),
('HeroSection', 'main', 'hero.subtitle', 'אנחנו מתמחים בניקיון יסודי ומקצועי של בתים ומשרדים. עם ניסיון רב שנים ושירות מותאם אישית.', 'We specialize in thorough and professional cleaning of homes and offices. With years of experience and personalized service.'),
('HeroSection', 'features', 'hero.features.experience', 'ניסיון של +10 שנים', '10+ Years Experience'),
('HeroSection', 'features', 'hero.features.insured', 'מבוטח במלואה', 'Fully Insured'),
('HeroSection', 'features', 'hero.features.satisfaction', 'ערבות שביעות רצון', 'Satisfaction Guarantee'),
('HeroSection', 'features', 'hero.features.available', 'זמין 24/7', 'Available 24/7'),
('HeroSection', 'cta', 'hero.cta.book', 'הזמן עכשיו', 'Book Now'),
('HeroSection', 'cta', 'hero.cta.learn', 'למד עוד', 'Learn More'),
('HeroSection', 'stats', 'hero.stats.clients', 'לקוחות מרוצים', 'Happy Clients'),
('HeroSection', 'stats', 'hero.stats.projects', 'פרויקטים הושלמו', 'Projects Completed'),
('HeroSection', 'stats', 'hero.stats.years', 'שנות ניסיון', 'Years Experience'),
('HeroSection', 'scroll', 'hero.scroll.indicator', 'גלול למטה', 'Scroll Down'),

-- ContactSection translations
('ContactSection', 'main', 'contact.title', 'צור קשר', 'Contact Us'),
('ContactSection', 'main', 'contact.subtitle', 'נשמח לעזור לך עם כל שאלה או בקשה', 'We''d love to help you with any questions or requests'),
('ContactSection', 'info', 'contact.phone.title', 'טלפון', 'Phone'),
('ContactSection', 'info', 'contact.phone.value', '054-123-4567', '054-123-4567'),
('ContactSection', 'info', 'contact.email.title', 'אימייל', 'Email'),
('ContactSection', 'info', 'contact.email.value', 'info@cleaningservice.co.il', 'info@cleaningservice.co.il'),
('ContactSection', 'info', 'contact.location.title', 'מיקום', 'Location'),
('ContactSection', 'info', 'contact.location.value', 'תל אביב, ישראל', 'Tel Aviv, Israel'),
('ContactSection', 'hours', 'contact.hours.title', 'שעות פעילות', 'Business Hours'),
('ContactSection', 'hours', 'contact.hours.days', 'ימים', 'Days'),
('ContactSection', 'hours', 'contact.hours.time', 'שעות', 'Hours'),
('ContactSection', 'form', 'contact.form.title', 'שלח הודעה', 'Send Message'),
('ContactSection', 'form', 'contact.form.name', 'שם מלא', 'Full Name'),
('ContactSection', 'form', 'contact.form.phone', 'טלפון', 'Phone'),
('ContactSection', 'form', 'contact.form.email', 'אימייל', 'Email'),
('ContactSection', 'form', 'contact.form.message', 'הודעה', 'Message'),
('ContactSection', 'form', 'contact.form.submit', 'שלח הודעה', 'Send Message'),
('ContactSection', 'social', 'contact.social.title', 'עקוב אחרינו', 'Follow Us'),
('ContactSection', 'social', 'contact.social.instagram', 'Instagram', 'Instagram'),
('ContactSection', 'social', 'contact.social.facebook', 'Facebook', 'Facebook'),
('ContactSection', 'social', 'contact.social.whatsapp', 'WhatsApp', 'WhatsApp'),

-- BookingDialog translations
('BookingDialog', 'main', 'bookingDialog.title', 'הזמנת שירות', 'Book Service'),

-- Common translations
('Common', 'actions', 'common.loading', 'טוען...', 'Loading...'),
('Common', 'actions', 'common.save', 'שמור', 'Save'),
('Common', 'actions', 'common.cancel', 'ביטול', 'Cancel'),
('Common', 'actions', 'common.delete', 'מחק', 'Delete'),
('Common', 'actions', 'common.edit', 'עריכה', 'Edit'),
('Common', 'actions', 'common.close', 'סגור', 'Close'),
('Common', 'navigation', 'common.back', 'חזור', 'Back'),
('Common', 'navigation', 'common.next', 'הבא', 'Next'),
('Common', 'navigation', 'common.previous', 'הקודם', 'Previous'),

-- Reviews page
('ReviewsSection', 'main', 'reviews.title', 'ביקורות לקוחות', 'Customer Reviews'),
('ReviewsSection', 'main', 'reviews.subtitle', 'מה הלקוחות שלנו אומרים עלינו', 'What our customers say about us'),

-- Promotions page  
('PromotionsSection', 'main', 'promotions.title', 'מבצעים חמים', 'Hot Deals'),
('PromotionsSection', 'main', 'promotions.subtitle', 'הצעות מיוחדות ומבצעים שלא כדאי לפספס', 'Special offers and deals you don''t want to miss'),

-- Pages
('PrivacyPolicy', 'main', 'privacyPolicy.title', 'מדיניות פרטיות', 'Privacy Policy'),
('PrivacyPolicy', 'main', 'privacyPolicy.subtitle', 'איך אנחנו מגינים על הפרטיות שלך', 'How we protect your privacy'),

('TermsOfUse', 'main', 'termsOfUse.title', 'תנאי שימוש', 'Terms of Use'),
('TermsOfUse', 'main', 'termsOfUse.subtitle', 'התנאים לשימוש באתר ובשירותים שלנו', 'Terms for using our website and services'),

('CancellationPolicy', 'main', 'cancellationPolicy.title', 'מדיניות ביטולים', 'Cancellation Policy'),
('CancellationPolicy', 'main', 'cancellationPolicy.subtitle', 'תנאי ביטול והחזר', 'Cancellation and refund terms'),

('Accessibility', 'main', 'accessibility.title', 'הצהרת נגישות', 'Accessibility Statement'),
('Accessibility', 'main', 'accessibility.subtitle', 'המחויבות שלנו לנגישות דיגיטלית', 'Our commitment to digital accessibility')

ON CONFLICT (key) DO UPDATE SET
  component = EXCLUDED.component,
  category = EXCLUDED.category,
  he = EXCLUDED.he,
  en = EXCLUDED.en;