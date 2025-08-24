-- Add all missing translations for reviews, business hours, and pages

-- Reviews section translations
INSERT INTO public.translations (component, category, key, he, en) VALUES 
-- Customer reviews
('ReviewsSection', 'reviews', 'reviews.customer1.name', 'שרה כהן', 'Sarah Cohen'),
('ReviewsSection', 'reviews', 'reviews.customer1.text', 'החוויה הייתה מדהימה! השירות היה מקצועי ביותר והתוצאה עלתה על כל הציפיות. ממליצה בחום!', 'Amazing experience! The service was extremely professional and the result exceeded all expectations. Highly recommend!'),
('ReviewsSection', 'reviews', 'reviews.customer1.event', 'יום הולדת 30', '30th Birthday'),

('ReviewsSection', 'reviews', 'reviews.customer2.name', 'מיכל לוי', 'Michelle Levy'),
('ReviewsSection', 'reviews', 'reviews.customer2.text', 'פשוט מושלם! כל פרט היה מדויק ואיכות השירות הייתה יוצאת דופן. בהחלט נחזור שוב.', 'Simply perfect! Every detail was precise and the service quality was exceptional. We will definitely return.'),
('ReviewsSection', 'reviews', 'reviews.customer2.event', 'אירוע חברה', 'Corporate Event'),

('ReviewsSection', 'reviews', 'reviews.customer3.name', 'אבי רוזן', 'Avi Rosen'),
('ReviewsSection', 'reviews', 'reviews.customer3.text', 'שירות מעולה ויחס אישי מדהים. כל הצוות היה נחמד ומקצועי. תודה על ערב בלתי נשכח!', 'Excellent service and amazing personal attention. All staff were nice and professional. Thank you for an unforgettable evening!'),
('ReviewsSection', 'reviews', 'reviews.customer3.event', 'בר מצווה', 'Bar Mitzvah'),

('ReviewsSection', 'reviews', 'reviews.customer4.name', 'רונית ברק', 'Ronit Barak'),
('ReviewsSection', 'reviews', 'reviews.customer4.text', 'המקום מדהים והאווירה פשוט מושלמת. השירות היה מהיר ויעיל. חוויה נהדרת בכל פרמטר.', 'Amazing place and perfect atmosphere. Service was fast and efficient. Great experience in every parameter.'),
('ReviewsSection', 'reviews', 'reviews.customer4.event', 'יום הנישואין', 'Wedding Anniversary'),

('ReviewsSection', 'reviews', 'reviews.customer5.name', 'יוסי כרמי', 'Yossi Karmi'),
('ReviewsSection', 'reviews', 'reviews.customer5.text', 'איכות מעולה ושירות יוצא דופן. הכל היה מאורגן בצורה מושלמת ובזמן. ממליץ בחום!', 'Excellent quality and exceptional service. Everything was perfectly organized and on time. Highly recommend!'),
('ReviewsSection', 'reviews', 'reviews.customer5.event', 'חתונה', 'Wedding'),

('ReviewsSection', 'reviews', 'reviews.customer6.name', 'דנה גולד', 'Dana Gold'),
('ReviewsSection', 'reviews', 'reviews.customer6.text', 'פשוט הטוב ביותר! תשומת לב לפרטים הקטנים והשירות היה ברמה הגבוהה ביותר. תודה רבה!', 'Simply the best! Attention to small details and service was at the highest level. Thank you so much!'),
('ReviewsSection', 'reviews', 'reviews.customer6.event', 'אירוע משפחתי', 'Family Event'),

-- Time-related phrases
('ReviewsSection', 'time', 'reviews.timeAgo.week', 'לפני שבוע', 'a week ago'),
('ReviewsSection', 'time', 'reviews.timeAgo.twoWeeks', 'לפני שבועיים', 'two weeks ago'),
('ReviewsSection', 'time', 'reviews.timeAgo.threeWeeks', 'לפני 3 שבועות', '3 weeks ago'),
('ReviewsSection', 'time', 'reviews.timeAgo.month', 'לפני חודש', 'a month ago'),
('ReviewsSection', 'time', 'reviews.timeAgo.monthAndHalf', 'לפני חודש וחצי', 'a month and a half ago'),
('ReviewsSection', 'time', 'reviews.timeAgo.twoMonths', 'לפני חודשיים', 'two months ago'),

-- Business hours status messages
('ContactSection', 'hours', 'contact.status.openNow', 'פתוח עכשיו', 'Open now'),
('ContactSection', 'hours', 'contact.status.closed', 'סגור', 'Closed'),
('ContactSection', 'hours', 'contact.status.closesIn', 'נסגר בעוד', 'Closes in'),
('ContactSection', 'hours', 'contact.status.opensIn', 'נפתח בעוד', 'Opens in'),
('ContactSection', 'hours', 'contact.status.hours', 'שעות', 'hours'),
('ContactSection', 'hours', 'contact.status.hour', 'שעה', 'hour'),
('ContactSection', 'hours', 'contact.status.minutes', 'דקות', 'minutes'),

-- Terms of Use translations
('TermsOfUse', 'content', 'termsOfUse.intro', 'שימוש באתר זה כפוף לתנאי השימוש המפורטים להלן. אנא קראו בעיון לפני השימוש באתר.', 'Use of this website is subject to the terms of use detailed below. Please read carefully before using the site.'),
('TermsOfUse', 'content', 'termsOfUse.generalTerms.title', 'תנאים כלליים', 'General Terms'),
('TermsOfUse', 'content', 'termsOfUse.generalTerms.content', 'השימוש באתר מהווה הסכמה מלאה לתנאי השימוש. אנו שומרים לעצמנו את הזכות לעדכן את התנאים מעת לעת.', 'Using the site constitutes full agreement to the terms of use. We reserve the right to update the terms from time to time.'),
('TermsOfUse', 'content', 'termsOfUse.bookings.title', 'הזמנות', 'Bookings'),
('TermsOfUse', 'content', 'termsOfUse.bookings.content', 'כל ההזמנות כפופות לזמינות ולאישור מראש. יש לבצע ביטול לפחות 24 שעות לפני מועד האירוע.', 'All bookings are subject to availability and advance confirmation. Cancellation must be made at least 24 hours before the event date.'),
('TermsOfUse', 'content', 'termsOfUse.pricing.title', 'תמחור', 'Pricing'),
('TermsOfUse', 'content', 'termsOfUse.pricing.content', 'המחירים כפופים לשינויים ללא הודעה מראש. התשלום נדרש במלואו בעת ההזמנה.', 'Prices are subject to change without prior notice. Full payment is required at the time of booking.'),
('TermsOfUse', 'content', 'termsOfUse.conduct.title', 'התנהגות', 'Conduct'),
('TermsOfUse', 'content', 'termsOfUse.conduct.content', 'אנו שומרים לעצמנו את הזכות לסרב לשירות במקרה של התנהגות בלתי הולמת.', 'We reserve the right to refuse service in case of inappropriate behavior.'),
('TermsOfUse', 'content', 'termsOfUse.liability.title', 'אחריות', 'Liability'),
('TermsOfUse', 'content', 'termsOfUse.liability.content', 'אחריותנו מוגבלת לשווי השירות שניתן. איננו אחראים לנזקים עקיפים.', 'Our liability is limited to the value of the service provided. We are not responsible for indirect damages.'),
('TermsOfUse', 'content', 'termsOfUse.changes.title', 'שינויים', 'Changes'),
('TermsOfUse', 'content', 'termsOfUse.changes.content', 'אנו רשאים לשנות את התנאים בכל עת. שינויים ייכנסו לתוקף מיד עם פרסומם באתר.', 'We may change these terms at any time. Changes will take effect immediately upon publication on the site.'),
('TermsOfUse', 'content', 'termsOfUse.contact.title', 'יצירת קשר', 'Contact'),
('TermsOfUse', 'content', 'termsOfUse.contact.content', 'לשאלות או הבהרות בנוגע לתנאי השימוש, אנא צרו קשר באמצעות פרטי הקשר באתר.', 'For questions or clarifications regarding the terms of use, please contact us using the contact details on the site.'),

-- Privacy Policy translations
('PrivacyPolicy', 'content', 'privacyPolicy.intro', 'אנו מכבדים את פרטיותכם ומתחייבים להגן על המידע האישי שלכם. מדיניות פרטיות זו מסבירה כיצד אנו אוספים ומשתמשים במידע שלכם.', 'We respect your privacy and are committed to protecting your personal information. This privacy policy explains how we collect and use your information.'),
('PrivacyPolicy', 'content', 'privacyPolicy.dataCollection.title', 'איסוף מידע', 'Data Collection'),
('PrivacyPolicy', 'content', 'privacyPolicy.dataCollection.content', 'אנו אוספים מידע שאתם מספקים בעת יצירת קשר או הזמנת שירותים, כולל שם, טלפון ואימייל.', 'We collect information you provide when contacting us or booking services, including name, phone, and email.'),
('PrivacyPolicy', 'content', 'privacyPolicy.dataUse.title', 'שימוש במידע', 'Data Use'),
('PrivacyPolicy', 'content', 'privacyPolicy.dataUse.content', 'אנו משתמשים במידע שלכם כדי לספק שירותים, לתאם הזמנות ולתקשר עמכם בנוגע לשירותינו.', 'We use your information to provide services, coordinate bookings, and communicate with you regarding our services.'),
('PrivacyPolicy', 'content', 'privacyPolicy.dataSharing.title', 'שיתוף מידע', 'Data Sharing'),
('PrivacyPolicy', 'content', 'privacyPolicy.dataSharing.content', 'איננו משתפים את המידע האישי שלכם עם צדדים שלישיים ללא הסכמתכם המפורשת.', 'We do not share your personal information with third parties without your explicit consent.'),
('PrivacyPolicy', 'content', 'privacyPolicy.userRights.title', 'זכויות המשתמש', 'User Rights'),
('PrivacyPolicy', 'content', 'privacyPolicy.userRights.content', 'יש לכם זכות לגשת למידע שלכם, לעדכן אותו או לבקש למחוק אותו. צרו קשר לביצוע בקשות אלו.', 'You have the right to access your information, update it, or request its deletion. Contact us to make these requests.'),
('PrivacyPolicy', 'content', 'privacyPolicy.contact.title', 'יצירת קשר', 'Contact'),
('PrivacyPolicy', 'content', 'privacyPolicy.contact.content', 'לשאלות בנוגע למדיניות הפרטיות, אנא צרו קשר באמצעות פרטי הקשר באתר.', 'For questions regarding the privacy policy, please contact us using the contact details on the site.')

ON CONFLICT (key) DO UPDATE SET
  component = EXCLUDED.component,
  category = EXCLUDED.category,
  he = EXCLUDED.he,
  en = EXCLUDED.en;