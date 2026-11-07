CREATE TABLE IF NOT EXISTS content_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scope ENUM('program','facility') NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_content_category_scope_slug (scope, slug),
  UNIQUE KEY uq_content_category_scope_name (scope, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO content_categories (scope, name, slug)
SELECT 'program', category, LOWER(REPLACE(TRIM(category), ' ', '-'))
FROM programs WHERE category IS NOT NULL AND TRIM(category) <> '';

INSERT IGNORE INTO content_categories (scope, name, slug)
SELECT 'facility', category, LOWER(REPLACE(TRIM(category), ' ', '-'))
FROM facilities WHERE category IS NOT NULL AND TRIM(category) <> '';
