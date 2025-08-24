-- Add footer businessHours.* status translations for compatibility
INSERT INTO public.translations (component, category, key, he, en) VALUES 
('Footer', 'hours', 'businessHours.openNow', 'פתוח עכשיו', 'Open now'),
('Footer', 'hours', 'businessHours.closed', 'סגור', 'Closed'),
('Footer', 'hours', 'businessHours.closesIn', 'נסגר בעוד', 'Closes in'),
('Footer', 'hours', 'businessHours.opensIn', 'נפתח בעוד', 'Opens in'),
('Footer', 'hours', 'businessHours.hours', 'שעות', 'hours'),
('Footer', 'hours', 'businessHours.hour', 'שעה', 'hour'),
('Footer', 'hours', 'businessHours.minutes', 'דקות', 'minutes')
ON CONFLICT (key) DO UPDATE SET component = EXCLUDED.component, category = EXCLUDED.category, he = EXCLUDED.he, en = EXCLUDED.en;