-- Add translations for PromotionsSection and ReviewsSection
INSERT INTO public.translations (key, he, en, category) VALUES
-- Promotions section
('promotions.badge', '🔥 מבצעים חמים', '🔥 Hot Deals', 'promotions'),
('promotions.title', 'מבצעים מיוחדים', 'Special Promotions', 'promotions'),
('promotions.subtitle', 'תיהנו ממחירים מיוחדים וחבילות בלעדיות שיהפכו את הערב שלכם לבלתי נשכח', 'Enjoy special prices and exclusive packages that will make your evening unforgettable', 'promotions'),
('promotions.popular', 'פופולרי', 'Popular', 'promotions'),
('promotions.discount', 'הנחה', 'Off', 'promotions'),
('promotions.whatsIncluded', 'מה כלול במחיר:', 'What''s Included:', 'promotions'),
('promotions.bookNow', 'הזמן עכשיו', 'Book Now', 'promotions'),
('promotions.termsTitle', 'תנאים וביטולים', 'Terms & Cancellations', 'promotions'),

-- Reviews section
('reviews.badge', 'ביקורות לקוחות', 'Customer Reviews', 'reviews'),
('reviews.title', 'מה הלקוחות שלנו אומרים', 'What Our Customers Say', 'reviews'),
('reviews.subtitle', 'אנחנו גאים ברמת השירות והחוויה שאנו מעניקים ללקוחותינו', 'We take pride in the level of service and experience we provide to our customers', 'reviews'),
('reviews.verified', 'מאומת', 'Verified', 'reviews'),
('reviews.averageRating', 'דירוג ממוצע', 'Average Rating', 'reviews'),
('reviews.totalReviews', 'סה"כ ביקורות', 'Total Reviews', 'reviews'),
('reviews.satisfiedCustomers', 'לקוחות מרוצים', 'Satisfied Customers', 'reviews'),
('reviews.returningCustomers', 'לקוחות חוזרים', 'Returning Customers', 'reviews'),
('reviews.seeAllReviews', 'צפה בכל הביקורות', 'See All Reviews', 'reviews'),
('reviews.outOf5', 'מתוך 5', 'out of 5', 'reviews'),

-- Contact section 
('contact.title', 'בואו נתחיל לתכנן את הערב המושלם שלכם', 'Let''s Start Planning Your Perfect Evening', 'contact'),
('contact.subtitle', 'צרו איתנו קשר ואנחנו נדאג לכל הפרטים כדי שתוכלו פשוט ליהנות', 'Contact us and we''ll take care of all the details so you can just enjoy', 'contact'),
('contact.phone', 'טלפון', 'Phone', 'contact'),
('contact.whatsapp', 'וואטסאפ', 'WhatsApp', 'contact'),
('contact.email', 'אימייל', 'Email', 'contact'),
('contact.location', 'המיקום שלנו', 'Our Location', 'contact'),
('contact.businessHours', 'שעות פעילות', 'Business Hours', 'contact'),
('contact.openNow', 'פתוח עכשיו', 'Open Now', 'contact'),
('contact.closingSoon', 'נסגר בקרוב', 'Closing Soon', 'contact'),
('contact.getQuote', 'קבלת הצעת מחיר ותיאום', 'Get Quote & Coordination', 'contact'),
('contact.form.name', 'שם מלא', 'Full Name', 'contact'),
('contact.form.phone', 'טלפון', 'Phone', 'contact'),
('contact.form.email', 'אימייל', 'Email', 'contact'),
('contact.form.message', 'ספרו לנו על האירוע שלכם...', 'Tell us about your event...', 'contact'),
('contact.form.submit', 'שלח הודעה וקבל הצעת מחיר', 'Send Message & Get Quote', 'contact'),
('contact.social.instagram', 'עמוד האינסטגרם שלנו', 'Our Instagram page', 'contact'),
('contact.social.facebook', 'עמוד הפייסבוק שלנו', 'Our Facebook page', 'contact'),
('contact.social.whatsapp', 'שלח הודעה בוואטסאפ', 'Send WhatsApp message', 'contact')

ON CONFLICT (key) DO UPDATE SET 
  he = EXCLUDED.he,
  en = EXCLUDED.en,
  category = EXCLUDED.category,
  updated_at = now();