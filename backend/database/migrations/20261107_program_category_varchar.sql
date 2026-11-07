-- Allow each school to define its own program and extracurricular categories.
-- Existing category values are preserved.
ALTER TABLE programs
  MODIFY COLUMN category VARCHAR(100) NOT NULL DEFAULT 'unggulan';
