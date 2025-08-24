-- Create translations table
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  he TEXT,
  en TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies - allow public read access for translations
CREATE POLICY "Anyone can view translations" 
ON public.translations 
FOR SELECT 
USING (true);

-- Only authenticated users can modify translations (for admin interface)
CREATE POLICY "Authenticated users can insert translations" 
ON public.translations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update translations" 
ON public.translations 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete translations" 
ON public.translations 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing translations from JSON files
INSERT INTO public.translations (key, he, en, category) VALUES
-- Header translations
('header.home', 'בית', 'Home', 'header'),
('header.blog', 'בלוג', 'Blog', 'header'),
('header.promotions', 'מבצעים', 'Promotions', 'header'),
('header.reviews', 'ביקורות', 'Reviews', 'header'),
('header.contact', 'צור קשר', 'Contact', 'header'),
('header.booking', 'הזמנה', 'Booking', 'header'),

-- Booking Dialog
('bookingDialog.title', 'הזמנת חדר', 'Room Booking', 'booking'),

-- General
('general.loading', 'טוען...', 'Loading...', 'general'),
('general.error', 'שגיאה', 'Error', 'general'),
('general.success', 'הצלחה', 'Success', 'general'),
('general.cancel', 'ביטול', 'Cancel', 'general'),
('general.save', 'שמירה', 'Save', 'general'),
('general.edit', 'עריכה', 'Edit', 'general'),
('general.delete', 'מחיקה', 'Delete', 'general'),
('general.add', 'הוספה', 'Add', 'general'),

-- Admin interface
('admin.translations.title', 'ניהול תרגומים', 'Manage Translations', 'admin'),
('admin.translations.key', 'מפתח', 'Key', 'admin'),
('admin.translations.hebrew', 'עברית', 'Hebrew', 'admin'),
('admin.translations.english', 'אנגלית', 'English', 'admin'),
('admin.translations.category', 'קטגוריה', 'Category', 'admin'),
('admin.translations.actions', 'פעולות', 'Actions', 'admin'),
('admin.translations.export', 'ייצא JSON', 'Export JSON', 'admin'),
('admin.translations.addNew', 'הוספת תרגום חדש', 'Add New Translation', 'admin');

-- Create index for better performance
CREATE INDEX idx_translations_category ON public.translations(category);
CREATE INDEX idx_translations_key ON public.translations(key);