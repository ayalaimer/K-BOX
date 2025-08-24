-- Add missing footer translations
INSERT INTO translations (key, he, en, category) VALUES
('footer.legal', 'מידע משפטי', 'Legal Information', 'footer'),
('footer.quickLinks', 'קישורים מהירים', 'Quick Links', 'footer'),
('footer.social', 'עקבו אחרינו', 'Follow Us', 'footer')
ON CONFLICT (key) DO UPDATE SET
  he = EXCLUDED.he,
  en = EXCLUDED.en,
  category = EXCLUDED.category;