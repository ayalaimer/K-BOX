-- Add business hours translations
INSERT INTO public.translations (component, category, key, he, en) VALUES 
('ContactSection', 'hours', 'contact.hours.sunday-thursday', 'ראשון - חמישי', 'Sunday - Thursday'),
('ContactSection', 'hours', 'contact.hours.friday', 'שישי', 'Friday'),
('ContactSection', 'hours', 'contact.hours.saturday', 'שבת', 'Saturday'),
('ContactSection', 'hours', 'contact.hours.time1', '16:00 - 02:00', '16:00 - 02:00'),
('ContactSection', 'hours', 'contact.hours.time2', '14:00 - 03:00', '14:00 - 03:00'),
('ContactSection', 'hours', 'contact.hours.time3', '20:00 - 03:00', '20:00 - 03:00')

ON CONFLICT (key) DO UPDATE SET
  component = EXCLUDED.component,
  category = EXCLUDED.category,
  he = EXCLUDED.he,
  en = EXCLUDED.en;