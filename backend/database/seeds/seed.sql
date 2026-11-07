-- ==============================================================================
-- DATA DEMO GENERIK - TEMPLATE WEBSITE SEKOLAH
-- Hanya untuk instalasi baru / database demo. Tidak berisi identitas sekolah nyata.
-- Buat database baru untuk memulai demo; jangan jalankan ulang pada database berisi data.
-- ==============================================================================
INSERT INTO `school_profile` (
  `id`, `name`, `npsn`, `education_level`, `status`, `accreditation`, `founding_year`,
  `headmaster_name`, `headmaster_photo`, `headmaster_welcome`, `description`,
  `address`, `village`, `district`, `regency`, `province`, `postal_code`,
  `phone`, `whatsapp`, `email`, `maps_embed_url`
) VALUES (
  1, 'Nama Sekolah Anda', NULL, NULL, NULL, NULL, NULL,
  'Nama Kepala Sekolah', NULL,
  'Selamat datang di website resmi sekolah kami. Informasi ini dapat disesuaikan melalui panel pengelola.',
  'Deskripsi singkat sekolah Anda. Ganti teks contoh ini dengan profil, keunggulan, dan informasi resmi sekolah.',
  'Alamat sekolah belum diisi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
) ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `news_categories` (`id`, `name`, `slug`, `description`)
VALUES
  (1, 'Kegiatan Sekolah', 'kegiatan-sekolah', 'Contoh kategori untuk kegiatan dan aktivitas sekolah.'),
  (2, 'Prestasi', 'prestasi', 'Contoh kategori untuk pencapaian akademik dan nonakademik.'),
  (3, 'Informasi', 'informasi', 'Contoh kategori untuk informasi dan pengumuman sekolah.')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `website_settings` (
  `id`, `school_name`, `tagline`, `logo_url`, `favicon_url`,
  `hero_title`, `hero_subtitle`, `primary_color`, `secondary_color`,
  `seo_title`, `seo_description`, `footer_text`
) VALUES (
  1,
  'Nama Sekolah Anda',
  'Mewujudkan Generasi Unggul, Berkarakter, dan Berprestasi',
  NULL,
  NULL,
  'Selamat Datang di Website Resmi Sekolah',
  'Temukan informasi profil, program pendidikan, kegiatan, prestasi, dan layanan sekolah dalam satu portal.',
  '#1B3B2B',
  '#E5C178',
  'Website Resmi Nama Sekolah Anda',
  'Portal informasi dan layanan resmi sekolah. Silakan sesuaikan identitas dan konten melalui panel pengelola.',
  '© Nama Sekolah Anda. Seluruh hak cipta dilindungi.'
) ON DUPLICATE KEY UPDATE `id`=`id`;
