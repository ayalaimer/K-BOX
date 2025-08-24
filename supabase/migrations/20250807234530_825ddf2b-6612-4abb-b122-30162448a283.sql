-- Add image_url column to rooms for storing a public image link
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS image_url text NULL;