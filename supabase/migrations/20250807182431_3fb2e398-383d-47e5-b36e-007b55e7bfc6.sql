-- Add missing translations for Contact page
INSERT INTO public.translations (component, category, key, he, en) VALUES 
('ContactSection', 'info', 'contact.info.business', 'פרטי העסק', 'Business Information'),
('ContactSection', 'form', 'contact.form.subject', 'נושא', 'Subject'),
('ContactSection', 'form', 'contact.form.required', '* שדות חובה - נחזור אליכם תוך 24 שעות', '* Required fields - we will get back to you within 24 hours'),
('ContactSection', 'directions', 'contact.directions.title', 'הוראות הגעה', 'Directions'),
('ContactSection', 'directions', 'contact.directions.car', '🚗 בנסיעה ברכב:', '🚗 By Car:'),
('ContactSection', 'directions', 'contact.directions.carInfo', 'חניה זמינה ברחוב הרצל או בחניון דיזנגוף סנטר (10 דקות הליכה). יציאה מכביש 4 למחלף השלום.', 'Parking available on Herzl Street or at Dizengoff Center parking (10 minutes walk). Exit from Highway 4 to Hashalom Interchange.'),
('ContactSection', 'directions', 'contact.directions.public', '🚌 בתחבורה ציבורית:', '🚌 By Public Transport:'),
('ContactSection', 'directions', 'contact.directions.publicInfo', 'קווי אוטובוס 4, 5, 72, 142 - תחנת "דיזנגוף סנטר". רכבת - תחנת השלום (15 דקות הליכה).', 'Bus lines 4, 5, 72, 142 - "Dizengoff Center" station. Train - Hashalom station (15 minutes walk).'),
('ContactSection', 'hours', 'contact.hours.tip', '💡 טיפ: בשישי ושבת מומלץ להזמין מראש', '💡 Tip: We recommend booking in advance on Friday and Saturday'),
('ContactSection', 'map', 'contact.map.title', 'המיקום שלנו במפה', 'Our Location on Map'),
('ContactSection', 'map', 'contact.map.placeholder', 'כאן תוטמע מפת Google Maps', 'Google Maps will be embedded here'),
('ContactSection', 'map', 'contact.map.address', 'רחוב הרצל 123, תל אביב-יפו', 'Herzl Street 123, Tel Aviv-Yafo'),
('ContactSection', 'map', 'contact.map.open', 'פתחו ב-Google Maps', 'Open in Google Maps')

ON CONFLICT (key) DO UPDATE SET
  component = EXCLUDED.component,
  category = EXCLUDED.category,
  he = EXCLUDED.he,
  en = EXCLUDED.en;