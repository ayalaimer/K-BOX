-- Add missing translations from scanned components
INSERT INTO public.translations (key, he, en, category) VALUES
-- Header navigation and elements
('header.logo', 'K-Box קריוקי בר', 'K-Box Karaoke Bar', 'header'),
('header.nav.home', 'בית', 'Home', 'header'),
('header.nav.blog', 'בלוג', 'Blog', 'header'),
('header.nav.promotions', 'מבצעים', 'Promotions', 'header'),
('header.nav.reviews', 'ביקורות', 'Reviews', 'header'),
('header.nav.contact', 'צור קשר', 'Contact', 'header'),
('header.phone', '052-123-4567', '052-123-4567', 'header'),
('header.quickBooking', 'הזמנה מהירה', 'Quick Booking', 'header'),

-- Hero section
('hero.badge', '⭐ דירוג 5 כוכבים', '⭐ 5-Star Rated', 'hero'),
('hero.title', 'K-Box', 'K-Box', 'hero'),
('hero.subtitle', 'קריוקי בר', 'Karaoke Bar', 'hero'),
('hero.description', 'החוויה הכי מרגשת של קריוקי בישראל! חדרים פרטיים מעוצבים, ציוד מתקדם ואווירה בלתי נשכחת', 'The most exciting karaoke experience in Israel! Private designed rooms, advanced equipment and unforgettable atmosphere', 'hero'),
('hero.features.capacity', 'עד 15 איש', 'Up to 15 People', 'hero'),
('hero.features.hours', '24/7 פתוח', '24/7 Open', 'hero'),
('hero.features.songs', 'אלפי שירים', 'Thousands of Songs', 'hero'),
('hero.buttons.booking', 'הזמנת חדר', 'Book a Room', 'hero'),
('hero.buttons.tour', 'סיור וירטואלי', 'Virtual Tour', 'hero'),
('hero.stats.rooms', 'חדרים פרטיים', 'Private Rooms', 'hero'),
('hero.stats.customers', 'לקוחות מרוצים', 'Happy Customers', 'hero'),
('hero.stats.hours', 'שעות פעילות', 'Operating Hours', 'hero'),
('hero.stats.rating', 'דירוג ממוצע', 'Average Rating', 'hero'),

-- Footer
('footer.company', 'חברת K-Box', 'K-Box Company', 'footer'),
('footer.phone', '052-123-4567', '052-123-4567', 'footer'),
('footer.email', 'info@kbox.co.il', 'info@kbox.co.il', 'footer'),
('footer.address', 'רחוב הבילויים 123, תל אביב', '123 Entertainment Street, Tel Aviv', 'footer'),
('footer.businessHours', 'שעות פעילות', 'Business Hours', 'footer'),
('footer.newsletter', 'עדכונים ומבצעים', 'Updates & Promotions', 'footer'),
('footer.newsletterDesc', 'הירשמו לקבלת מבצעים בלעדיים ועדכונים על אירועים מיוחדים', 'Subscribe for exclusive deals and special event updates', 'footer'),
('footer.emailPlaceholder', 'כתובת אימייל', 'Email address', 'footer'),
('footer.subscribe', 'הרשמה', 'Subscribe', 'footer'),
('footer.copyright', '© 2024 K-Box. כל הזכויות שמורות.', '© 2024 K-Box. All rights reserved.', 'footer'),
('footer.privacyPolicy', 'מדיניות פרטיות', 'Privacy Policy', 'footer'),
('footer.termsOfUse', 'תנאי שימוש', 'Terms of Use', 'footer'),
('footer.cancellationPolicy', 'מדיניות ביטול', 'Cancellation Policy', 'footer'),
('footer.accessibility', 'נגישות', 'Accessibility', 'footer'),

-- Business hours
('businessHours.sunday', 'ראשון', 'Sunday', 'general'),
('businessHours.monday', 'שני', 'Monday', 'general'),
('businessHours.tuesday', 'שלישי', 'Tuesday', 'general'),
('businessHours.wednesday', 'רביעי', 'Wednesday', 'general'),
('businessHours.thursday', 'חמישי', 'Thursday', 'general'),
('businessHours.friday', 'שישי', 'Friday', 'general'),
('businessHours.saturday', 'שבת', 'Saturday', 'general'),
('businessHours.openNow', 'פתוח עכשיו!', 'Open Now!', 'general'),
('businessHours.closed', 'סגור', 'Closed', 'general')

ON CONFLICT (key) DO UPDATE SET 
  he = EXCLUDED.he,
  en = EXCLUDED.en,
  category = EXCLUDED.category,
  updated_at = now();