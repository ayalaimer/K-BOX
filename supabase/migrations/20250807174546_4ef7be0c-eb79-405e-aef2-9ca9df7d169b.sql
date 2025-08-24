-- Clean up conflicting translation keys
-- Remove keys that conflict with nested structures

-- First, let's see what conflicts we have by checking for keys that have both a direct value and nested children
-- For example: 'contact.social.instagram' (direct) vs 'contact.social.instagram.label' (nested)

-- Remove conflicting nested keys where we already have direct values
DELETE FROM translations 
WHERE key IN (
  'contact.social.instagram.label',
  'contact.social.facebook.label', 
  'contact.social.whatsapp.label'
);