-- ==============================================================================
-- SKEMA DATABASE TEMPLATE WEBSITE SEKOLAH (MySQL 8.0+)
-- Profil Sekolah, Akademik, Sistem Informasi & Statistik Kunjungan Terpadu
-- Catatan: Eksekusi tabel menggunakan database aktif pada sesi koneksi.
-- ==============================================================================

-- 1. Tabel Administrator & Peran (Role-Based Access)
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('superadmin', 'admin_konten', 'admin_ppdb') NOT NULL DEFAULT 'superadmin',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `auth_version` INT NOT NULL DEFAULT 0,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_username` (`username`),
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Profil Lembaga Sekolah
CREATE TABLE IF NOT EXISTS `school_profile` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL DEFAULT 'Nama Sekolah Anda',
  `npsn` VARCHAR(30) DEFAULT NULL,
  `education_level` VARCHAR(60) DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT NULL,
  `accreditation` VARCHAR(20) DEFAULT NULL,
  `founding_year` VARCHAR(10) DEFAULT NULL,
  `headmaster_name` VARCHAR(120) DEFAULT NULL,
  `headmaster_photo` VARCHAR(255) DEFAULT NULL,
  `headmaster_welcome` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `village` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `regency` VARCHAR(100) DEFAULT NULL,
  `province` VARCHAR(100) DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `phone` VARCHAR(40) DEFAULT NULL,
  `whatsapp` VARCHAR(40) DEFAULT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `maps_embed_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Sejarah & Kilas Balik Sekolah
CREATE TABLE IF NOT EXISTS `school_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(180) NOT NULL DEFAULT 'Sejarah Berdirinya Nama Sekolah Anda',
  `content` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(255) DEFAULT NULL,
  `milestones` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Visi, Misi, Tujuan & Nilai Inti
CREATE TABLE IF NOT EXISTS `school_vision_mission` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vision` TEXT NOT NULL,
  `vision_motto` VARCHAR(255) DEFAULT NULL,
  `missions` JSON NOT NULL,
  `goals` JSON DEFAULT NULL,
  `core_values` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Struktur Organisasi & Pengurus
CREATE TABLE IF NOT EXISTS `school_organization` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `position` VARCHAR(120) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `nip` VARCHAR(50) DEFAULT '-',
  `photo` VARCHAR(255) DEFAULT NULL,
  `level` INT NOT NULL DEFAULT 1,
  `parent_id` INT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_org_order` (`display_order`),
  CONSTRAINT `fk_org_parent` FOREIGN KEY (`parent_id`) REFERENCES `school_organization`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Pendidik (Guru)
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `title` VARCHAR(50) DEFAULT NULL,
  `nip` VARCHAR(50) DEFAULT '-',
  `photo` VARCHAR(255) DEFAULT NULL,
  `position` VARCHAR(100) DEFAULT 'Guru Mapel',
  `subject` VARCHAR(100) NOT NULL,
  `last_education` VARCHAR(100) DEFAULT NULL,
  `short_bio` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_teacher_active` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tenaga Kependidikan (Staf TU, Pustakawan, Laboran, Keamanan)
CREATE TABLE IF NOT EXISTS `staff` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `position` VARCHAR(100) NOT NULL,
  `department` VARCHAR(100) DEFAULT 'Tata Usaha',
  `last_education` VARCHAR(100) DEFAULT NULL,
  `short_bio` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_staff_active` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Kategori Berita & Artikel
CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kategori terpusat untuk program dan fasilitas.
CREATE TABLE IF NOT EXISTS `content_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `scope` ENUM('program','facility') NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_content_category_scope_slug` (`scope`, `slug`),
  UNIQUE KEY `uq_content_category_scope_name` (`scope`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Berita, Artikel & Pengumuman
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(280) NOT NULL UNIQUE,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `thumbnail` VARCHAR(255) DEFAULT NULL,
  `author` VARCHAR(100) DEFAULT 'Tim Redaksi',
  `views_count` INT NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_news_slug` (`slug`),
  INDEX `idx_news_status` (`status`, `published_at`),
  CONSTRAINT `fk_news_cat` FOREIGN KEY (`category_id`) REFERENCES `news_categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9a. Pengumuman sekolah terpisah dari berita dan agenda
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(280) NOT NULL UNIQUE,
  `summary` TEXT DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Umum',
  `cover_image` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_announcements_status_date` (`status`, `published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Album Galeri
CREATE TABLE IF NOT EXISTS `gallery_albums` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(140) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `cover_image` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(50) DEFAULT 'Akademik',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Media Galeri (Foto & Video)
CREATE TABLE IF NOT EXISTS `gallery_media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `album_id` INT DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `media_type` ENUM('photo', 'video') NOT NULL DEFAULT 'photo',
  `file_url` VARCHAR(255) NOT NULL,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `caption` TEXT DEFAULT NULL,
  `category` VARCHAR(50) DEFAULT 'Umum',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_gallery_album` FOREIGN KEY (`album_id`) REFERENCES `gallery_albums`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Prestasi Sekolah
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `student_or_team` VARCHAR(150) NOT NULL,
  `level` ENUM('Kecamatan', 'Kabupaten', 'Karesidenan', 'Provinsi', 'Nasional', 'Internasional') NOT NULL DEFAULT 'Kabupaten',
  `category` VARCHAR(100) DEFAULT 'Akademik',
  `rank` VARCHAR(80) NOT NULL,
  `year` VARCHAR(10) NOT NULL,
  `organizer` VARCHAR(150) DEFAULT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_achieve_year` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Sarana & Fasilitas Sekolah
CREATE TABLE IF NOT EXISTS `facilities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Ruang Belajar',
  `description` TEXT NOT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `capacity` VARCHAR(60) DEFAULT NULL,
  `condition_status` ENUM('Sangat Baik', 'Baik', 'Perbaikan') NOT NULL DEFAULT 'Sangat Baik',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Informasi & Prosedur PPDB
CREATE TABLE IF NOT EXISTS `ppdb_information` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `academic_year` VARCHAR(30) NOT NULL DEFAULT '2026/2027',
  `is_open` TINYINT(1) NOT NULL DEFAULT 1,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `banner_image` VARCHAR(255) DEFAULT NULL,
  `overview` LONGTEXT DEFAULT NULL,
  `requirements` JSON DEFAULT NULL,
  `schedules` JSON DEFAULT NULL,
  `steps` JSON DEFAULT NULL,
  `show_fees` TINYINT(1) NOT NULL DEFAULT 1,
  `fees_description` TEXT DEFAULT NULL,
  `fees_items` JSON DEFAULT NULL,
  `contact_person` VARCHAR(120) DEFAULT NULL,
  `contact_phone` VARCHAR(40) DEFAULT NULL,
  `contact_whatsapp` VARCHAR(40) DEFAULT NULL,
  `registration_url` VARCHAR(255) DEFAULT '/ppdb#daftar-online',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14a. Data pendaftaran peserta didik dan verifikasi berkas
CREATE TABLE IF NOT EXISTS `admission_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_code` VARCHAR(40) NOT NULL UNIQUE,
  `candidate_name` VARCHAR(150) NOT NULL,
  `national_id` VARCHAR(32) DEFAULT NULL,
  `birth_place` VARCHAR(100) DEFAULT NULL,
  `birth_date` DATE DEFAULT NULL,
  `gender` ENUM('L','P') DEFAULT NULL,
  `origin_school` VARCHAR(180) NOT NULL,
  `parent_name` VARCHAR(150) NOT NULL,
  `parent_phone` VARCHAR(40) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `program` VARCHAR(120) DEFAULT 'Reguler',
  `notes` TEXT DEFAULT NULL,
  `documents` JSON DEFAULT NULL,
  `status` ENUM('received','verified','accepted','rejected') NOT NULL DEFAULT 'received',
  `admin_notes` TEXT DEFAULT NULL,
  `academic_year` VARCHAR(30) DEFAULT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admission_status` (`status`, `submitted_at`),
  INDEX `idx_admission_candidate` (`candidate_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Pesan Kontak Masuk dari Pengunjung
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(40) DEFAULT NULL,
  `subject` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `reply_status` ENUM('unread', 'read', 'replied') NOT NULL DEFAULT 'unread',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Pengaturan Tampilan & Identitas Website
CREATE TABLE IF NOT EXISTS `website_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_name` VARCHAR(150) NOT NULL DEFAULT 'Nama Sekolah Anda',
  `tagline` VARCHAR(255) DEFAULT 'Membentuk Generasi Qurani, Cerdas & Berkarakter',
  `logo_url` VARCHAR(255) DEFAULT '/src/assets/logo.png',
  `favicon_url` VARCHAR(255) DEFAULT '/src/assets/logo.png',
  `hero_title` VARCHAR(255) DEFAULT 'Selamat Datang di Website Sekolah',
  `hero_subtitle` TEXT DEFAULT NULL,
  `hero_image` VARCHAR(255) DEFAULT NULL,
  `hero_slides` JSON DEFAULT NULL,
  `primary_color` VARCHAR(20) DEFAULT '#15803D',
  `secondary_color` VARCHAR(20) DEFAULT '#EAB308',
  `accent_orange` VARCHAR(20) DEFAULT '#F97316',
  `accent_blue` VARCHAR(20) DEFAULT '#0284C7',
  `feature_flags` JSON DEFAULT NULL,
  `facebook_url` VARCHAR(255) DEFAULT NULL,
  `instagram_url` VARCHAR(255) DEFAULT NULL,
  `youtube_url` VARCHAR(255) DEFAULT NULL,
  `tiktok_url` VARCHAR(255) DEFAULT NULL,
  `seo_title` VARCHAR(220) DEFAULT 'Nama Sekolah Anda - Website Resmi Profil & Informasi',
  `seo_description` TEXT DEFAULT NULL,
  `footer_text` TEXT DEFAULT NULL,
  `stats_students` INT DEFAULT 0,
  `stats_teachers` INT DEFAULT 0,
  `stats_alumni` INT DEFAULT 0,
  `stats_achievements` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Sesi Pengunjung Unik (Unique Sessions & Visitors dengan Hashing Anonim)
CREATE TABLE IF NOT EXISTS `visitor_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL UNIQUE,
  `visitor_hash` VARCHAR(64) NOT NULL,
  `device_type` ENUM('desktop', 'tablet', 'mobile', 'bot', 'other') NOT NULL DEFAULT 'desktop',
  `browser` VARCHAR(80) DEFAULT 'Unknown',
  `referrer` VARCHAR(255) DEFAULT NULL,
  `visit_date` DATE NOT NULL,
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_active_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_session_visitor` (`visitor_hash`, `visit_date`),
  INDEX `idx_session_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Tayangan Halaman Pengunjung (Page Views)
CREATE TABLE IF NOT EXISTS `visitor_pageviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `path` VARCHAR(255) NOT NULL,
  `page_title` VARCHAR(180) DEFAULT NULL,
  `viewed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pv_session` (`session_id`),
  INDEX `idx_pv_path` (`path`),
  INDEX `idx_pv_time` (`viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Riwayat Aktivitas Administrator
CREATE TABLE IF NOT EXISTS `admin_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `ip_hash` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_act_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Berkas Terunggah (Media Upload Repository)
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `original_name` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(60) NOT NULL,
  `file_size` INT NOT NULL,
  `uploaded_by` VARCHAR(100) DEFAULT 'Administrator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Agenda Kegiatan & Kalender Akademik Sekolah
CREATE TABLE IF NOT EXISTS `agendas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `description` TEXT,
  `event_date` DATE NOT NULL,
  `start_time` VARCHAR(20) DEFAULT '08:00',
  `end_time` VARCHAR(20) DEFAULT 'Selesai',
  `location` VARCHAR(150) NOT NULL DEFAULT 'Lokasi Sekolah',
  `organizer` VARCHAR(100) DEFAULT 'Panitia Sekolah',
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_agenda_date` (`event_date`),
  INDEX `idx_agenda_pub` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Program Unggulan & Ekstrakurikuler
CREATE TABLE IF NOT EXISTS `programs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(180) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL DEFAULT 'unggulan',
  `description` TEXT,
  `photo` VARCHAR(255) DEFAULT NULL,
  `schedule_info` VARCHAR(150) DEFAULT NULL,
  `instructor` VARCHAR(120) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_prog_cat` (`category`),
  INDEX `idx_prog_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

