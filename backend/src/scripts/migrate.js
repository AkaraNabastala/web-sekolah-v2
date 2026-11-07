import { getPool, checkConnection, getStatus } from '../config/database.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
/**
 * Script Migrasi Database MySQL
 * Menjamin seluruh skema tabel yang dibutuhkan sistem dibuat pada database yang sedang aktif
 * secara idempotent (IF NOT EXISTS), tanpa ketergantungan pada perintah 'USE database_lain'.
 */
export async function runMigrations() {
    logger.info('MigrationService', 'Memulai verifikasi dan eksekusi skema database MySQL...');
    const connStatus = await checkConnection();
    if (!connStatus.connected) {
        const msg = `MySQL tidak aktif atau tidak dapat dijangkau: ${connStatus.message}. Migrasi database dilewati.`;
        logger.warn('MigrationService', msg);
        return { success: false, message: msg };
    }
    const pool = getPool();
    const dbInfo = getStatus();
    try {
        // 1. Baca schema.sql utama
        const scriptDir = path.dirname(fileURLToPath(import.meta.url));
        const backendRoot = path.resolve(scriptDir, '../../');
        const schemaPath = path.join(backendRoot, 'database', 'schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Berkas schema.sql tidak ditemukan pada path: ${schemaPath}`);
        }
        const rawSchema = fs.readFileSync(schemaPath, 'utf8');
        // Filter baris yang memuat instruksi 'CREATE DATABASE' atau 'USE' agar migrasi selalu menggunakan database koneksi aktif
        // Hapus komentar SQL sebelum pemisahan statement. Komentar baris sebelumnya
        // membuat CREATE TABLE terbuang jika parser hanya memeriksa awalan statement.
        const schemaWithoutComments = rawSchema
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s*--.*$/gm, '');
        const cleanedStatements = schemaWithoutComments
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => {
            if (!stmt || stmt.length < 5)
                return false;
            const upper = stmt.toUpperCase();
            if (upper.startsWith('CREATE DATABASE') || /^USE\s+/i.test(upper))
                return false;
            return true;
        });
        logger.info('MigrationService', `Menjalankan ${cleanedStatements.length} statement DDL/DML pada database [${dbInfo.database}]...`);
        let executedCount = 0;
        for (const sql of cleanedStatements) {
            await pool.query(sql);
            executedCount++;
        }
        // 1b. Upgrade kolom konfigurasi website secara aman untuk instalasi yang sudah berjalan.
        const [featureFlagColumns] = await pool.query(`SELECT COUNT(*) AS total FROM information_schema.columns
       WHERE table_schema = ? AND table_name = 'website_settings' AND column_name = 'feature_flags'`, [dbInfo.database]);
        if (Number(featureFlagColumns[0]?.total || 0) === 0) {
            await pool.query('ALTER TABLE website_settings ADD COLUMN feature_flags JSON DEFAULT NULL');
            logger.info('MigrationService', 'Kolom website_settings.feature_flags berhasil ditambahkan.');
        }
        // 1c. Tambahkan versi autentikasi untuk pencabutan seluruh sesi setelah perubahan password.
        const [authVersionColumns] = await pool.query(`SELECT COUNT(*) AS total FROM information_schema.columns
       WHERE table_schema = ? AND table_name = 'admins' AND column_name = 'auth_version'`, [dbInfo.database]);
        if (Number(authVersionColumns[0]?.total || 0) === 0) {
            await pool.query('ALTER TABLE admins ADD COLUMN auth_version INT NOT NULL DEFAULT 0');
            logger.info('MigrationService', 'Kolom admins.auth_version berhasil ditambahkan.');
        }
        // 1c. Inisialisasi record minimum yang dibutuhkan formulir admin.
        // Hanya membuat baris jika tabel benar-benar kosong; tidak mengimpor data demo dari data.json.
        await pool.query("INSERT INTO school_profile (name) SELECT 'Nama Sekolah Anda' WHERE NOT EXISTS (SELECT 1 FROM school_profile)");
        await pool.query("INSERT INTO school_history (title, content, milestones) SELECT 'Sejarah Sekolah', '', JSON_ARRAY() WHERE NOT EXISTS (SELECT 1 FROM school_history)");
        await pool.query("INSERT INTO school_vision_mission (vision, missions, goals, core_values) SELECT '', JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY() WHERE NOT EXISTS (SELECT 1 FROM school_vision_mission)");
        await pool.query("INSERT INTO website_settings (school_name, feature_flags) SELECT 'Nama Sekolah Anda', JSON_OBJECT() WHERE NOT EXISTS (SELECT 1 FROM website_settings)");
        await pool.query("INSERT INTO ppdb_information (academic_year, is_open, overview, requirements, schedules, steps, show_fees, fees_items) SELECT 'Belum ditentukan', 0, '', JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), 0, JSON_ARRAY() WHERE NOT EXISTS (SELECT 1 FROM ppdb_information)");
        await pool.query("INSERT INTO news_categories (name, slug, description) SELECT 'Umum', 'umum', 'Kategori umum' WHERE NOT EXISTS (SELECT 1 FROM news_categories)");
        // 2. Buat tabel riwayat migrasi setelah seluruh statement schema berhasil.
        await pool.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(120) NOT NULL UNIQUE,
        batch INT NOT NULL DEFAULT 1,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
        // 3. Jalankan migrasi bertahap satu kali per file. Kolom yang sudah ada dilewati.
        const migrationsDir = path.join(backendRoot, 'database', 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort();
            for (const migrationFile of migrationFiles) {
                const [appliedRows] = await pool.query('SELECT id FROM migration_history WHERE migration_name = ? LIMIT 1', [migrationFile]);
                if (appliedRows.length)
                    continue;
                const migrationRaw = fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf8');
                const migrationSql = migrationRaw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*--.*$/gm, '');
                const statements = migrationSql.split(';').map(statement => statement.trim()).filter(statement => statement.length > 0);
                for (const statement of statements) {
                    // Membuat migrasi ADD COLUMN aman bila schema.sql sudah menyediakan kolom tersebut.
                    const addColumn = statement.match(/^ALTER\s+TABLE\s+`?([a-zA-Z0-9_]+)`?\s+ADD\s+COLUMN\s+`?([a-zA-Z0-9_]+)`?/i);
                    if (addColumn) {
                        const [columnRows] = await pool.query('SELECT COUNT(*) AS total FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?', [dbInfo.database, addColumn[1], addColumn[2]]);
                        if (Number(columnRows[0]?.total || 0) > 0)
                            continue;
                    }
                    await pool.query(statement);
                }
                await pool.query('INSERT INTO migration_history (migration_name, batch) VALUES (?, 2)', [migrationFile]);
                logger.info('MigrationService', `Migrasi ${migrationFile} berhasil diterapkan.`);
            }
        }
        // 4. Verifikasi seluruh tabel aplikasi, bukan hanya beberapa tabel contoh.
        const requiredTables = [
            'admins', 'school_profile', 'school_history', 'school_vision_mission',
            'school_organization', 'teachers', 'staff', 'news_categories', 'news',
            'gallery_albums', 'gallery_media', 'achievements', 'facilities',
            'ppdb_information', 'contact_messages', 'website_settings',
            'visitor_sessions', 'visitor_pageviews', 'admin_activities',
            'uploaded_files', 'agendas', 'programs', 'announcements', 'content_categories', 'admission_applications', 'migration_history'
        ];
        const [rows] = await pool.query(`SELECT table_name FROM information_schema.tables
       WHERE table_schema = ? AND table_name IN (${requiredTables.map(() => '?').join(', ')})`, [dbInfo.database, ...requiredTables]);
        const foundTables = new Set(rows.map(r => String(r.table_name || r.TABLE_NAME).toLowerCase()));
        const missingTables = requiredTables.filter(name => !foundTables.has(name));
        if (missingTables.length > 0) {
            throw new Error(`Verifikasi skema gagal. Tabel wajib belum tersedia: ${missingTables.join(', ')}`);
        }
        // Catat migrasi hanya setelah semua tabel wajib benar-benar tersedia.
        await pool.query(`INSERT INTO migration_history (migration_name, batch)
       VALUES ('001_core_schema_and_visitor_sessions', 1)
       ON DUPLICATE KEY UPDATE executed_at = CURRENT_TIMESTAMP`);
        logger.info('MigrationService', `Verifikasi seluruh ${requiredTables.length} tabel berhasil pada database [${dbInfo.database}].`);
        return {
            success: true,
            message: `Migrasi selesai. ${executedCount} statement berhasil dieksekusi dan ${requiredTables.length} tabel terverifikasi.`
        };
    }
    catch (err) {
        const errorMsg = `Gagal menjalankan migrasi database [${dbInfo.database}]: ${err.message}`;
        logger.error('MigrationService', errorMsg, { code: err.code, sqlState: err.sqlState });
        return { success: false, message: errorMsg, details: err };
    }
}
// Eksekusi langsung jika dipanggil via CLI
if (process.argv[1] && /migrate\.(ts|js)$/.test(process.argv[1])) {
    runMigrations().then((res) => {
        if (!res.success) {
            process.exit(1);
        }
        process.exit(0);
    });
}
