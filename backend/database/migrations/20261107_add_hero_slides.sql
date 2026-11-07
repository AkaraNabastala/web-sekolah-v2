ALTER TABLE website_settings
  ADD COLUMN hero_slides JSON DEFAULT NULL AFTER hero_image;
