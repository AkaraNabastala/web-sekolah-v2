import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database.js';
import { JWT_SECRET, requireAdmin, requireSuperadmin, requireContentAdmin, requirePpdbAdmin, requireCsrf } from '../middleware/auth.js';
import { hashVisitor, parseDeviceAndBrowser } from '../utils/privacy.js';
import { StatisticsService } from '../services/StatisticsService.js';
import { createHash, randomUUID, randomBytes, timingSafeEqual } from 'crypto';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { dashboardRouter } from './dashboardRoutes.js';
import { adminActivityLogger } from '../middleware/adminActivityLogger.js';
import { requireFeatureEnabled } from '../middleware/featureFlags.js';
export const apiRouter = Router();
// Batasi percobaan login untuk mengurangi brute force.
// Percobaan yang berhasil tidak menghabiskan kuota; yang gagal dibatasi per alamat IP.
const trustedAuthOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const effectiveAuthOrigins = trustedAuthOrigins.length > 0
    ? trustedAuthOrigins
    : process.env.NODE_ENV === 'production'
        ? []
        : ['http://localhost:5173', 'http://127.0.0.1:5173'];
const requireTrustedOrigin = (req, res, next) => {
    const origin = req.headers.origin;
    const fetchSite = req.headers['sec-fetch-site'];
    // Izinkan same-origin untuk deployment yang menyajikan frontend dan API
    // dari host/port yang sama (misalnya http://localhost:3000).
    // Untuk frontend terpisah, origin tetap harus tercantum di CORS_ORIGINS.
    let isSameHostOrigin = false;
    if (origin) {
        try {
            isSameHostOrigin = new URL(origin).host.toLowerCase() === String(req.get('host') || '').toLowerCase();
        }
        catch {
            isSameHostOrigin = false;
        }
    }
    if ((origin && !effectiveAuthOrigins.includes(origin) && !isSameHostOrigin) || fetchSite === 'cross-site') {
        return res.status(403).json({ success: false, message: 'Origin permintaan tidak diizinkan.' });
    }
    return next();
};
const SESSION_COOKIE = 'school_admin_session';
const CSRF_COOKIE = 'school_csrf';
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000;
const cookieBase = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE
};
const setAdminSession = (res, admin) => {
    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role, auth_version: Number(admin.auth_version || 0) }, JWT_SECRET, { expiresIn: '8h', algorithm: 'HS256', issuer: 'school-website-cms', audience: 'admin-panel' });
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie(SESSION_COOKIE, token, { ...cookieBase, httpOnly: true });
    res.cookie(CSRF_COOKIE, csrfToken, { ...cookieBase, httpOnly: false });
};
const clearAdminSession = (res) => {
    const options = { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' };
    res.clearCookie(SESSION_COOKIE, { ...options, httpOnly: true });
    res.clearCookie(CSRF_COOKIE, { ...options, httpOnly: false });
};
const firstAdminSetupRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Terlalu banyak percobaan setup. Coba kembali satu jam lagi.' }
});
const publicContactRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak pesan dari jaringan Anda. Silakan coba kembali nanti.' }
});
const visitorLogRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak permintaan pencatatan kunjungan.' }
});
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login. Silakan coba kembali setelah 15 menit.'
    }
});
// Konfigurasi Multer
const routeDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(routeDir, '../../');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(backendRoot, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    // Simpan sementara dengan nama acak; ekstensi final ditentukan dari signature file.
    filename: (_req, _file, cb) => cb(null, `${randomUUID()}.upload`)
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipe berkas tidak didukung. Unggah file gambar, PDF, atau MP4.'));
        }
    }
});
// MAGIC_BYTES_VALIDATION: Jangan mempercayai MIME type browser; periksa signature sebelum file dipublikasikan.
const validateUploadContent = async (req, res, next) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: 'Tidak ada berkas yang diunggah.' });
    }
    let handle;
    try {
        handle = await fs.promises.open(file.path, 'r');
        const header = Buffer.alloc(16);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);
        await handle.close();
        handle = undefined;
        const bytes = header.subarray(0, bytesRead);
        let detected = null;
        if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            detected = { mimetype: 'image/jpeg', extension: '.jpg' };
        }
        else if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
            detected = { mimetype: 'image/png', extension: '.png' };
        }
        else if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))) {
            detected = { mimetype: 'image/gif', extension: '.gif' };
        }
        else if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
            detected = { mimetype: 'image/webp', extension: '.webp' };
        }
        else if (bytes.length >= 5 && bytes.subarray(0, 5).toString('ascii') === '%PDF-') {
            detected = { mimetype: 'application/pdf', extension: '.pdf' };
        }
        else if (bytes.length >= 8 && bytes.subarray(4, 8).toString('ascii') === 'ftyp') {
            detected = { mimetype: 'video/mp4', extension: '.mp4' };
        }
        if (!detected || detected.mimetype !== file.mimetype) {
            await fs.promises.unlink(file.path).catch(() => undefined);
            return res.status(400).json({
                success: false,
                message: 'Isi berkas tidak sesuai dengan tipe yang diizinkan. Unggah gambar, PDF, atau MP4 yang valid.'
            });
        }
        const safeFilename = `${randomUUID()}${detected.extension}`;
        const safePath = path.join(UPLOAD_DIR, safeFilename);
        await fs.promises.rename(file.path, safePath);
        file.filename = safeFilename;
        file.path = safePath;
        file.mimetype = detected.mimetype;
        next();
    }
    catch (err) {
        if (handle)
            await handle.close().catch(() => undefined);
        await fs.promises.unlink(file.path).catch(() => undefined);
        logger.error('UploadValidation', 'Gagal memvalidasi isi berkas unggahan.', {
            message: err?.message
        });
        return res.status(500).json({ success: false, message: 'Berkas gagal divalidasi oleh server.' });
    }
};
const ADMISSION_UPLOAD_DIR = process.env.ADMISSION_UPLOAD_DIR || path.join(backendRoot, 'private-admission-uploads');
const publicUploadPath = path.resolve(UPLOAD_DIR);
const privateAdmissionPath = path.resolve(ADMISSION_UPLOAD_DIR);
const privatePathRelativeToPublic = path.relative(publicUploadPath, privateAdmissionPath);
if (privatePathRelativeToPublic === '' || (!privatePathRelativeToPublic.startsWith('..') && !path.isAbsolute(privatePathRelativeToPublic))) {
    throw new Error('ADMISSION_UPLOAD_DIR harus berada di luar direktori unggahan publik.');
}
if (!fs.existsSync(ADMISSION_UPLOAD_DIR))
    fs.mkdirSync(ADMISSION_UPLOAD_DIR, { recursive: true, mode: 0o700 });
const admissionStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ADMISSION_UPLOAD_DIR),
    filename: (_req, _file, cb) => cb(null, `${randomUUID()}.upload`)
});
const admissionUpload = multer({
    storage: admissionStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error('Dokumen harus berupa PDF, JPG, PNG, atau WebP.'));
    }
});
const validateAdmissionUploadContent = async (req, res, next) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ success: false, message: 'Pilih dokumen terlebih dahulu.' });
    let handle;
    try {
        handle = await fs.promises.open(file.path, 'r');
        const header = Buffer.alloc(16);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);
        await handle.close();
        handle = undefined;
        const bytes = header.subarray(0, bytesRead);
        let detected = null;
        if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
            detected = { mimetype: 'image/jpeg', extension: '.jpg' };
        else if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
            detected = { mimetype: 'image/png', extension: '.png' };
        else if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP')
            detected = { mimetype: 'image/webp', extension: '.webp' };
        else if (bytes.length >= 5 && bytes.subarray(0, 5).toString('ascii') === '%PDF-')
            detected = { mimetype: 'application/pdf', extension: '.pdf' };
        if (!detected || detected.mimetype !== file.mimetype) {
            await fs.promises.unlink(file.path).catch(() => undefined);
            return res.status(400).json({ success: false, message: 'Isi dokumen tidak sesuai dengan tipe file yang diizinkan.' });
        }
        const safeFilename = `${randomUUID()}${detected.extension}`;
        const safePath = path.join(ADMISSION_UPLOAD_DIR, safeFilename);
        await fs.promises.rename(file.path, safePath);
        file.filename = safeFilename;
        file.path = safePath;
        file.mimetype = detected.mimetype;
        return next();
    }
    catch (err) {
        if (handle)
            await handle.close().catch(() => undefined);
        await fs.promises.unlink(file.path).catch(() => undefined);
        logger.error('AdmissionUploadValidation', 'Gagal memvalidasi dokumen pendaftaran.', { message: err?.message });
        return res.status(500).json({ success: false, message: 'Dokumen gagal divalidasi oleh server.' });
    }
};
// ==========================================
// 1. SETUP FIRST ADMIN (ONE-TIME LOCKED)
// ==========================================
apiRouter.get('/setup/status', async (_req, res) => {
    try {
        const pool = getPool();
        let hasAdmin = false;
        try {
            const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM admins');
            hasAdmin = rows[0]?.cnt > 0;
        }
        catch (err) {
            logger.error('SetupRoute', 'Gagal memeriksa administrator di MySQL.', { code: err?.code, sqlState: err?.sqlState, message: err?.message });
            return res.status(500).json({ success: false, message: 'Status administrator tidak dapat diperiksa.' });
        }
        res.json({
            success: true,
            initialized: hasAdmin,
            setupEnabled: (process.env.ADMIN_SETUP_TOKEN || '').length >= 32,
            message: hasAdmin
                ? 'Sistem administrator sudah terinisialisasi. Setup awal terkunci.'
                : 'Sistem belum memiliki administrator. Setup web memerlukan token rahasia dari operator server.'
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
apiRouter.post('/setup/first-admin', requireTrustedOrigin, firstAdminSetupRateLimiter, async (req, res) => {
    // Setup publik hanya boleh dilakukan operator yang memiliki token rahasia dari environment server.
    const configuredToken = process.env.ADMIN_SETUP_TOKEN || '';
    const suppliedToken = req.get('x-admin-setup-token') || '';
    if (configuredToken.length < 32) {
        return res.status(503).json({ success: false, message: 'Setup admin melalui web dinonaktifkan. Gunakan perintah setup-admin di server atau konfigurasi ADMIN_SETUP_TOKEN.' });
    }
    const expectedBuffer = Buffer.from(configuredToken);
    const suppliedBuffer = Buffer.from(suppliedToken);
    if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
        return res.status(403).json({ success: false, message: 'Token setup tidak valid.' });
    }
    const { username, email, password, full_name } = req.body || {};
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedName = typeof full_name === 'string' ? full_name.trim() : '';
    if (!/^[a-z0-9._-]{3,50}$/.test(normalizedUsername) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        normalizedEmail.length > 100 || !normalizedName || normalizedName.length > 100 ||
        typeof password !== 'string' || password.length < 12 || password.length > 128) {
        return res.status(400).json({
            success: false,
            message: 'Data tidak valid. Username 3–50 karakter, email valid, nama maksimal 100 karakter, dan password 12–128 karakter.'
        });
    }
    let connection = null;
    let lockAcquired = false;
    try {
        connection = await getPool().getConnection();
        const [lockRows] = await connection.query('SELECT GET_LOCK(?, 10) AS acquired', ['school_website_first_admin_setup']);
        lockAcquired = Number(lockRows?.[0]?.acquired) === 1;
        if (!lockAcquired) {
            return res.status(503).json({ success: false, message: 'Setup sedang diproses oleh operator lain. Silakan coba kembali.' });
        }
        const [rows] = await connection.query('SELECT COUNT(*) AS cnt FROM admins');
        if (Number(rows?.[0]?.cnt || 0) > 0) {
            return res.status(403).json({
                success: false,
                message: 'Setup terkunci: Administrator sudah terdaftar.'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        await connection.query(`INSERT INTO admins (username, email, password, full_name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, 'superadmin', 1, NOW())`, [normalizedUsername, normalizedEmail, hashedPassword, normalizedName]);
        return res.json({
            success: true,
            message: 'Administrator utama berhasil dibuat. Setup telah terkunci.'
        });
    }
    catch (err) {
        logger.error('SetupRoute', 'Gagal membuat administrator pertama.', { code: err?.code, sqlState: err?.sqlState, message: err?.message });
        return res.status(500).json({ success: false, message: 'Administrator gagal dibuat. Periksa log backend.' });
    }
    finally {
        if (connection) {
            if (lockAcquired) {
                await connection.query('SELECT RELEASE_LOCK(?)', ['school_website_first_admin_setup']).catch(() => undefined);
            }
            connection.release();
        }
    }
});
// ==========================================
// 2. AUTHENTICATION (LOGIN, LOGOUT, PROFILE)
// ==========================================
apiRouter.post('/auth/login', requireTrustedOrigin, loginRateLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }
    try {
        const pool = getPool();
        let adminUser = null;
        try {
            const [rows] = await pool.query('SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1', [
                username.trim().toLowerCase(),
                username.trim().toLowerCase()
            ]);
            adminUser = rows[0];
        }
        catch (err) {
            logger.error('AuthRoute', 'Gagal mencari administrator di MySQL.', { code: err?.code, sqlState: err?.sqlState, message: err?.message });
            return res.status(500).json({ success: false, message: 'Login sementara tidak dapat diproses.' });
        }
        if (!adminUser) {
            return res.status(401).json({ success: false, message: 'Kombinasi kredensial tidak valid.' });
        }
        if (!adminUser.is_active) {
            return res.status(403).json({ success: false, message: 'Akun administrator Anda dinonaktifkan.' });
        }
        const match = await bcrypt.compare(password, adminUser.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Kombinasi kredensial tidak valid.' });
        }
        // Update last_login
        try {
            await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [adminUser.id]);
        }
        catch (err) {
            logger.warn('AuthRoute', 'Gagal memperbarui waktu login terakhir.', { code: err?.code, sqlState: err?.sqlState });
        }
        setAdminSession(res, adminUser);
        const { password: _, ...safeUser } = adminUser;
        res.json({
            success: true,
            message: 'Login berhasil.',
            user: safeUser
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
apiRouter.post('/auth/logout', requireCsrf, (_req, res) => {
    clearAdminSession(res);
    return res.json({ success: true, message: 'Sesi administrator telah diakhiri.' });
});
apiRouter.get('/auth/me', requireAdmin, async (req, res) => {
    try {
        const pool = getPool();
        let admin = null;
        try {
            const [rows] = await pool.query('SELECT id, username, email, full_name, avatar, role, is_active, last_login, created_at FROM admins WHERE id = ?', [req.user?.id]);
            admin = rows[0];
        }
        catch (err) {
            logger.error('AuthRoute', 'Gagal membaca profil administrator dari MySQL.', { code: err?.code, sqlState: err?.sqlState, message: err?.message });
            return res.status(500).json({ success: false, message: 'Profil administrator tidak dapat dimuat.' });
        }
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
        }
        res.json({ success: true, user: admin });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
apiRouter.put('/auth/password', requireAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' });
    }
    try {
        const pool = getPool();
        let currentAdmin = null;
        try {
            const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [req.user?.id]);
            currentAdmin = rows[0];
        }
        catch (err) {
            logger.error('AuthRoute', 'Gagal membaca administrator dari MySQL.', { code: err?.code, sqlState: err?.sqlState, message: err?.message });
            return res.status(500).json({ success: false, message: 'Password tidak dapat diperbarui.' });
        }
        if (!currentAdmin)
            return res.status(404).json({ success: false, message: 'Admin tidak ditemukan.' });
        const match = await bcrypt.compare(currentPassword, currentAdmin.password);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Password saat ini salah.' });
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        try {
            await pool.query('UPDATE admins SET password = ?, auth_version = auth_version + 1 WHERE id = ?', [hashed, req.user?.id]);
        }
        catch (err) {
            logger.error('AuthRoute', 'Gagal menyimpan password ke MySQL.', { code: err?.code, sqlState: err?.sqlState, message: err?.message });
            return res.status(500).json({ success: false, message: 'Password gagal disimpan.' });
        }
        const [sessionRows] = await pool.query('SELECT id, username, role, auth_version FROM admins WHERE id = ? LIMIT 1', [req.user?.id]);
        if (sessionRows?.[0])
            setAdminSession(res, sessionRows[0]);
        res.json({ success: true, message: 'Password berhasil diperbarui. Sesi lain telah dicabut.' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// ==========================================
// 3. STATISTIK PENGUNJUNG (TRACK & ANALYTICS)
// ==========================================
apiRouter.post('/visitor/log', visitorLogRateLimiter, async (req, res) => {
    const { path: visitPath, pageTitle, sessionId } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referrer = (req.body.referrer || req.headers['referer'] || null);
    // Privasi: Hashing anonim
    const { visitorHash } = hashVisitor(req);
    const { deviceType, browser } = parseDeviceAndBrowser(userAgent);
    const sessionSeed = String(sessionId || visitorHash);
    const actualSessionId = createHash('sha256').update(`${sessionSeed}-${new Date().toISOString().split('T')[0]}`).digest('hex');
    await StatisticsService.recordVisit({
        sessionId: actualSessionId,
        visitorHash,
        deviceType,
        browser,
        referrer,
        path: visitPath || '/',
        pageTitle
    });
    res.json({ success: true, sessionId: actualSessionId });
});
apiRouter.use('/admin/dashboard', dashboardRouter);
apiRouter.get('/admin/statistics/summary', requireSuperadmin, async (_req, res) => {
    try {
        const summary = await StatisticsService.getSummaryMetrics();
        res.json({ success: true, data: summary });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
apiRouter.get('/admin/statistics/analytics', requireSuperadmin, async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    try {
        const analytics = await StatisticsService.getDetailedAnalytics(days);
        res.json({ success: true, data: analytics });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
apiRouter.get('/admin/statistics/export/xlsx', requireSuperadmin, async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    try {
        const buffer = await StatisticsService.generateExcelReport(days);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=statistik_website_sekolah_${days}hari.xlsx`);
        res.send(buffer);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
apiRouter.get('/admin/statistics/export/csv', requireSuperadmin, async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    try {
        const csv = await StatisticsService.generateCsvReport(days);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=statistik_website_sekolah_${days}hari.csv`);
        res.send(csv);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// ==========================================
// 4. KONTEN PUBLIK (READ-ONLY)
// ==========================================
// MySQL adalah satu-satunya sumber data saat backend berjalan dengan database.
// Hasil kosong dikembalikan sebagai []/404; kegagalan query tidak dialihkan ke JSON.
const publicQueryError = (res, route, err, message) => {
    logger.error(route, message, {
        code: err?.code,
        sqlState: err?.sqlState,
        message: err?.message
    });
    return res.status(500).json({
        success: false,
        message: 'Data sementara tidak dapat dimuat. Periksa log backend.'
    });
};
apiRouter.get('/school-profile', async (_req, res) => {
    res.set({ 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache', Expires: '0' });
    try {
        const [rows] = await getPool().query('SELECT * FROM school_profile LIMIT 1');
        if (!rows.length)
            return res.status(404).json({ success: false, message: 'Profil sekolah belum dikonfigurasi.' });
        return res.json({ success: true, data: rows[0] });
    }
    catch (err) {
        return publicQueryError(res, 'SchoolProfileRoute', err, 'Gagal membaca profil sekolah dari MySQL.');
    }
});
apiRouter.get('/school-history', requireFeatureEnabled('history'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM school_history LIMIT 1');
        if (!rows.length)
            return res.json({ success: true, data: null });
        return res.json({ success: true, data: rows[0] });
    }
    catch (err) {
        return publicQueryError(res, 'SchoolHistoryRoute', err, 'Gagal membaca sejarah sekolah dari MySQL.');
    }
});
apiRouter.get('/vision-mission', async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM school_vision_mission LIMIT 1');
        if (!rows.length)
            return res.json({ success: true, data: null });
        return res.json({ success: true, data: rows[0] });
    }
    catch (err) {
        return publicQueryError(res, 'VisionMissionRoute', err, 'Gagal membaca visi dan misi dari MySQL.');
    }
});
apiRouter.get('/organization', requireFeatureEnabled('organization'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM school_organization ORDER BY display_order ASC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'OrganizationRoute', err, 'Gagal membaca struktur organisasi dari MySQL.');
    }
});
apiRouter.get('/teachers', requireFeatureEnabled('teachers'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM teachers WHERE is_active = 1 ORDER BY display_order ASC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'TeachersRoute', err, 'Gagal membaca data guru dari MySQL.');
    }
});
apiRouter.get('/staff', requireFeatureEnabled('teachers'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM staff WHERE is_active = 1 ORDER BY display_order ASC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'StaffRoute', err, 'Gagal membaca data staf dari MySQL.');
    }
});
apiRouter.get('/news', requireFeatureEnabled('news'), async (req, res) => {
    const category = req.query.category;
    try {
        let sql = 'SELECT n.*, c.name AS category_name, c.slug AS category_slug FROM news n LEFT JOIN news_categories c ON n.category_id = c.id WHERE n.status = "published" ORDER BY n.published_at DESC';
        const params = [];
        if (category) {
            sql = 'SELECT n.*, c.name AS category_name, c.slug AS category_slug FROM news n LEFT JOIN news_categories c ON n.category_id = c.id WHERE n.status = "published" AND c.slug = ? ORDER BY n.published_at DESC';
            params.push(category);
        }
        const [rows] = await getPool().query(sql, params);
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'NewsRoute', err, 'Gagal membaca berita dari MySQL.');
    }
});
apiRouter.get('/news/categories', requireFeatureEnabled('news'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM news_categories ORDER BY name ASC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'NewsCategoriesRoute', err, 'Gagal membaca kategori berita dari MySQL.');
    }
});
apiRouter.get('/news/:slug', requireFeatureEnabled('news'), async (req, res) => {
    const slug = String(req.params.slug);
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT n.*, c.name AS category_name, c.slug AS category_slug FROM news n LEFT JOIN news_categories c ON n.category_id = c.id WHERE n.slug = ? AND n.status = "published" LIMIT 1', [slug]);
        if (!rows.length)
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan.' });
        await pool.query('UPDATE news SET views_count = views_count + 1 WHERE id = ?', [rows[0].id]);
        return res.json({ success: true, data: rows[0] });
    }
    catch (err) {
        return publicQueryError(res, 'NewsDetailRoute', err, 'Gagal membaca detail berita dari MySQL.');
    }
});
apiRouter.get('/achievements', requireFeatureEnabled('achievements'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM achievements ORDER BY year DESC, id DESC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'AchievementsRoute', err, 'Gagal membaca prestasi dari MySQL.');
    }
});
apiRouter.get('/facilities', requireFeatureEnabled('facilities'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM facilities ORDER BY display_order ASC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'FacilitiesRoute', err, 'Gagal membaca fasilitas dari MySQL.');
    }
});
apiRouter.get('/gallery', requireFeatureEnabled('gallery'), async (req, res) => {
    const category = req.query.category;
    try {
        let sql = 'SELECT * FROM gallery_media ORDER BY display_order ASC, id DESC';
        const params = [];
        if (category && category !== 'Semua') {
            sql = 'SELECT * FROM gallery_media WHERE category = ? ORDER BY display_order ASC, id DESC';
            params.push(category);
        }
        const [rows] = await getPool().query(sql, params);
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'GalleryRoute', err, 'Gagal membaca galeri dari MySQL.');
    }
});
apiRouter.get('/gallery/albums', requireFeatureEnabled('gallery'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM gallery_albums ORDER BY id DESC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'GalleryAlbumsRoute', err, 'Gagal membaca album galeri dari MySQL.');
    }
});
apiRouter.get('/ppdb', requireFeatureEnabled('ppdb'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM ppdb_information LIMIT 1');
        if (!rows.length)
            return res.json({ success: true, data: null });
        return res.json({ success: true, data: rows[0] });
    }
    catch (err) {
        return publicQueryError(res, 'PPDBRoute', err, 'Gagal membaca informasi PPDB dari MySQL.');
    }
});
// Agendas Public Route
apiRouter.get('/agendas', requireFeatureEnabled('agenda'), async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM agendas WHERE is_published = 1 ORDER BY event_date ASC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'AgendasRoute', err, 'Gagal membaca agenda dari MySQL.');
    }
});
// Programs & Extracurricular Public Route
apiRouter.get('/programs', requireFeatureEnabled('programs'), async (req, res) => {
    const category = req.query.category;
    const pool = getPool();
    try {
        let sql = 'SELECT * FROM programs WHERE is_active = 1 ORDER BY display_order ASC';
        const params = [];
        if (category) {
            sql = 'SELECT * FROM programs WHERE is_active = 1 AND category = ? ORDER BY display_order ASC';
            params.push(category);
        }
        const [rows] = await pool.query(sql, params);
        if (rows && rows.length > 0)
            return res.json({ success: true, data: rows });
    }
    catch (err) {
        logger.error('ProgramsRoute', 'Gagal membaca program sekolah dari MySQL.', { code: err.code, sqlState: err.sqlState, message: err.message });
        return res.status(500).json({ success: false, message: 'Program sekolah sementara tidak dapat dimuat.' });
    }
    return res.json({ success: true, data: [] });
});
apiRouter.get('/settings', async (_req, res) => {
    // Identitas dan logo harus selalu dibaca dari konfigurasi terbaru, bukan cache browser/proxy.
    res.set({ 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache', Expires: '0' });
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT * FROM website_settings LIMIT 1');
        if (rows && rows.length > 0)
            return res.json({ success: true, data: rows[0] });
    }
    catch (err) {
        logger.error('SettingsRoute', 'Gagal membaca pengaturan website dari MySQL.', { code: err.code, sqlState: err.sqlState, message: err.message });
        return res.status(500).json({ success: false, message: 'Pengaturan website sementara tidak dapat dimuat.' });
    }
    return res.status(404).json({ success: false, message: 'Pengaturan website belum dikonfigurasi.' });
});
// ==========================================
// 5. UPLOAD FILE
// ==========================================
apiRouter.post('/upload', requireAdmin, upload.single('file'), validateUploadContent, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada berkas yang diunggah.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
        success: true,
        message: 'Berkas berhasil diunggah.',
        fileUrl,
        file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        }
    });
});
apiRouter.use('/admin', adminActivityLogger);
// ==========================================
// 6. ADMIN CRUD OPERATIONS (DASHBOARD)
// ==========================================
// News CRUD
apiRouter.get('/admin/news', requireContentAdmin, requireFeatureEnabled('news'), async (_req, res) => {
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT n.*, c.name AS category_name, c.slug AS category_slug FROM news n LEFT JOIN news_categories c ON n.category_id = c.id ORDER BY n.id DESC');
        if (rows)
            return res.json({ success: true, data: rows });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.post('/admin/news', requireContentAdmin, requireFeatureEnabled('news'), async (req, res) => {
    const pool = getPool();
    const { title, category_id, summary, content, thumbnail } = req.body;
    const status = ['draft', 'published', 'archived'].includes(req.body.status) ? req.body.status : 'draft';
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[-\s]+/g, '-');
    try {
        const [result] = await pool.query(`INSERT INTO news (category_id, title, slug, summary, content, thumbnail, status, published_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, IF(? = 'published', NOW(), NULL), NOW())`, [category_id || 1, title, slug, summary, content, thumbnail || null, status, status]);
        return res.json({ success: true, message: 'Berita berhasil disimpan.', data: { id: result.insertId, slug, title } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.put('/admin/news/:id', requireContentAdmin, requireFeatureEnabled('news'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query(`UPDATE news SET title = ?, category_id = ?, summary = ?, content = ?, thumbnail = ?, status = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, NOW()) ELSE NULL END, updated_at = NOW()
       WHERE id = ?`, [req.body.title, req.body.category_id, req.body.summary, req.body.content, req.body.thumbnail, ['draft', 'published', 'archived'].includes(req.body.status) ? req.body.status : 'draft', ['draft', 'published', 'archived'].includes(req.body.status) ? req.body.status : 'draft', id]);
        return res.json({ success: true, message: 'Berita berhasil diperbarui.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/news/:id', requireContentAdmin, requireFeatureEnabled('news'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM news WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Berita berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Profil Sekolah
apiRouter.put('/admin/school-profile', requireContentAdmin, async (req, res) => {
    const pool = getPool();
    try {
        await pool.query(`UPDATE school_profile SET name = ?, npsn = ?, education_level = ?, status = ?, accreditation = ?, founding_year = ?, headmaster_name = ?, headmaster_photo = ?, headmaster_welcome = ?, description = ?, address = ?, village = ?, district = ?, regency = ?, province = ?, postal_code = ?, phone = ?, whatsapp = ?, email = ?, maps_embed_url = ?, updated_at = NOW() WHERE id = (SELECT id FROM (SELECT id FROM school_profile ORDER BY id ASC LIMIT 1) AS selected_profile)`, [
            req.body.name || 'Nama Sekolah Anda', req.body.npsn || null, req.body.education_level || 'Sekolah Menengah Pertama (SMP)',
            req.body.status || 'Swasta', req.body.accreditation || null, req.body.founding_year || null,
            req.body.headmaster_name || '', req.body.headmaster_photo || null, req.body.headmaster_welcome || '',
            req.body.description || '', req.body.address || '', req.body.village || '', req.body.district || '',
            req.body.regency || '', req.body.province || '', req.body.postal_code || '', req.body.phone || '',
            req.body.whatsapp || '', req.body.email || '', req.body.maps_embed_url || null
        ]);
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
    const [rows] = await pool.query('SELECT * FROM school_profile ORDER BY id ASC LIMIT 1');
    return res.json({ success: true, message: 'Profil sekolah berhasil disimpan.', data: rows[0] ?? null });
});
// Pesan Masuk
apiRouter.get('/admin/messages', requireSuperadmin, async (_req, res) => {
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY id DESC');
        if (rows)
            return res.json({ success: true, data: rows });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.put('/admin/messages/:id/read', requireSuperadmin, async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const { is_read } = req.body;
    const pool = getPool();
    try {
        await pool.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, id]);
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
    return res.json({ success: true, message: 'Status pesan diperbarui.' });
});
apiRouter.delete('/admin/messages/:id', requireSuperadmin, async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
    return res.json({ success: true, message: 'Pesan berhasil dihapus.' });
});
// Teachers & Staff CRUD
apiRouter.post('/admin/teachers', requireContentAdmin, requireFeatureEnabled('teachers'), async (req, res) => {
    const pool = getPool();
    try {
        const [ins] = await pool.query(`INSERT INTO teachers (name, title, nip, photo, position, subject, last_education, short_bio, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`, [req.body.name, req.body.title || '', req.body.nip || '-', req.body.photo || null, req.body.position || 'Guru', req.body.subject, req.body.last_education || '', req.body.short_bio || '', req.body.display_order || 0]);
        return res.json({ success: true, message: 'Data guru berhasil ditambahkan.', data: { id: ins.insertId, ...req.body } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.put('/admin/teachers/:id', requireContentAdmin, requireFeatureEnabled('teachers'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query(`UPDATE teachers SET name = ?, title = ?, nip = ?, photo = ?, position = ?, subject = ?, last_education = ?, short_bio = ?, display_order = ? WHERE id = ?`, [req.body.name, req.body.title || '', req.body.nip || '-', req.body.photo || null, req.body.position || 'Guru', req.body.subject, req.body.last_education || '', req.body.short_bio || '', req.body.display_order || 0, id]);
        return res.json({ success: true, message: 'Data guru berhasil diperbarui.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/teachers/:id', requireContentAdmin, requireFeatureEnabled('teachers'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM teachers WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Data guru berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Admin Users CRUD (Superadmin Only)
apiRouter.get('/admin/users', requireSuperadmin, async (_req, res) => {
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admins');
        if (rows)
            return res.json({ success: true, data: rows });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.post('/admin/users', requireSuperadmin, async (req, res) => {
    const { username, email, full_name, password, role } = req.body;
    if (!username || !email || !password || !full_name) {
        return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi.' });
    }
    if (String(password).length < 8) {
        return res.status(400).json({ success: false, message: 'Password administrator minimal 8 karakter.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const pool = getPool();
    try {
        const [ins] = await pool.query(`INSERT INTO admins (username, email, password, full_name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW())`, [username.trim().toLowerCase(), email.trim().toLowerCase(), hashed, full_name.trim(), role || 'admin_konten']);
        return res.json({ success: true, message: 'Pengguna admin berhasil ditambahkan.', data: { id: ins.insertId, username, full_name, role } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/users/:id', requireSuperadmin, async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    if (id === 1)
        return res.status(400).json({ success: false, message: 'Superadmin utama tidak dapat dihapus.' });
    const pool = getPool();
    try {
        await pool.query('DELETE FROM admins WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Akun admin berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Facilities CRUD
apiRouter.post('/admin/facilities', requireContentAdmin, requireFeatureEnabled('facilities'), async (req, res) => {
    const pool = getPool();
    try {
        const [ins] = await pool.query(`INSERT INTO facilities (name, category, description, photo, capacity, condition_status, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [req.body.name, req.body.category || 'Ruang Belajar', req.body.description || '', req.body.photo || null, req.body.capacity || '', req.body.condition_status || 'Baik', req.body.display_order || 0]);
        return res.json({ success: true, message: 'Fasilitas berhasil ditambahkan.', data: { id: ins.insertId, ...req.body } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.put('/admin/facilities/:id', requireContentAdmin, requireFeatureEnabled('facilities'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query(`UPDATE facilities SET name = ?, category = ?, description = ?, photo = ?, capacity = ?, condition_status = ?, display_order = ? WHERE id = ?`, [req.body.name, req.body.category || 'Ruang Belajar', req.body.description || '', req.body.photo || null, req.body.capacity || '', req.body.condition_status || 'Baik', req.body.display_order || 0, id]);
        return res.json({ success: true, message: 'Fasilitas berhasil diperbarui.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/facilities/:id', requireContentAdmin, requireFeatureEnabled('facilities'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM facilities WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Fasilitas berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Achievements CRUD
apiRouter.post('/admin/achievements', requireContentAdmin, requireFeatureEnabled('achievements'), async (req, res) => {
    const pool = getPool();
    try {
        const [ins] = await pool.query(`INSERT INTO achievements (title, student_or_team, level, category, rank, year, organizer, photo, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.body.title, req.body.student_or_team || '', req.body.level || 'Kabupaten', req.body.category || 'Akademik', req.body.rank || req.body.rank_position || 'Juara 1', req.body.year || '2025', req.body.organizer || '', req.body.photo || null, req.body.description || '']);
        return res.json({ success: true, message: 'Prestasi berhasil disimpan.', data: { id: ins.insertId, ...req.body } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.put('/admin/achievements/:id', requireContentAdmin, requireFeatureEnabled('achievements'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query(`UPDATE achievements SET title = ?, student_or_team = ?, level = ?, category = ?, rank = ?, year = ?, organizer = ?, photo = ?, description = ? WHERE id = ?`, [req.body.title, req.body.student_or_team || '', req.body.level || 'Kabupaten', req.body.category || 'Akademik', req.body.rank || req.body.rank_position || 'Juara 1', req.body.year || '2025', req.body.organizer || '', req.body.photo || null, req.body.description || '', id]);
        return res.json({ success: true, message: 'Prestasi berhasil diperbarui.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/achievements/:id', requireContentAdmin, requireFeatureEnabled('achievements'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM achievements WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Prestasi berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Gallery Media & Albums CRUD
apiRouter.post('/admin/gallery', requireContentAdmin, requireFeatureEnabled('gallery'), async (req, res) => {
    const pool = getPool();
    try {
        const [ins] = await pool.query(`INSERT INTO gallery_media (album_id, title, media_type, file_url, video_url, caption, category, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [req.body.album_id || null, req.body.title, req.body.media_type || 'photo', req.body.file_url, req.body.video_url || null, req.body.caption || '', req.body.category || 'Akademik', req.body.display_order || 0]);
        return res.json({ success: true, message: 'Foto galeri berhasil disimpan.', data: { id: ins.insertId, ...req.body } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/gallery/:id', requireContentAdmin, requireFeatureEnabled('gallery'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM gallery_media WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Foto galeri berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Agendas CRUD
apiRouter.get('/admin/agendas', requireContentAdmin, requireFeatureEnabled('agenda'), async (_req, res) => {
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT * FROM agendas ORDER BY event_date DESC');
        if (rows)
            return res.json({ success: true, data: rows });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.post('/admin/agendas', requireContentAdmin, requireFeatureEnabled('agenda'), async (req, res) => {
    const pool = getPool();
    const slug = (req.body.title || `agenda-${Date.now()}`).toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[-\s]+/g, '-');
    try {
        const [ins] = await pool.query(`INSERT INTO agendas (title, slug, description, event_date, start_time, end_time, location, organizer, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.body.title, slug, req.body.description || '', req.body.event_date, req.body.start_time || '08:00', req.body.end_time || 'Selesai', req.body.location || 'Lokasi Sekolah', req.body.organizer || 'Panitia Sekolah', req.body.is_published ?? 1]);
        return res.json({ success: true, message: 'Agenda berhasil ditambahkan.', data: { id: ins.insertId, ...req.body, slug } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.put('/admin/agendas/:id', requireContentAdmin, requireFeatureEnabled('agenda'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query(`UPDATE agendas SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, organizer = ?, is_published = ? WHERE id = ?`, [req.body.title, req.body.description || '', req.body.event_date, req.body.start_time || '08:00', req.body.end_time || 'Selesai', req.body.location || 'Lokasi Sekolah', req.body.organizer || 'Panitia Sekolah', req.body.is_published ?? 1, id]);
        return res.json({ success: true, message: 'Agenda berhasil diperbarui.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/agendas/:id', requireContentAdmin, requireFeatureEnabled('agenda'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM agendas WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Agenda berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Programs CRUD
apiRouter.get('/admin/programs', requireContentAdmin, requireFeatureEnabled('programs'), async (_req, res) => {
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT * FROM programs ORDER BY display_order ASC');
        if (rows)
            return res.json({ success: true, data: rows });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.post('/admin/programs', requireContentAdmin, requireFeatureEnabled('programs'), async (req, res) => {
    const pool = getPool();
    const slug = (req.body.name || `program-${Date.now()}`).toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[-\s]+/g, '-');
    try {
        const [ins] = await pool.query(`INSERT INTO programs (name, slug, category, description, photo, schedule_info, instructor, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.body.name, slug, req.body.category || 'unggulan', req.body.description || '', req.body.photo || null, req.body.schedule_info || '', req.body.instructor || '', req.body.display_order || 0, req.body.is_active ?? 1]);
        return res.json({ success: true, message: 'Program berhasil disimpan.', data: { id: ins.insertId, ...req.body, slug } });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.put('/admin/programs/:id', requireContentAdmin, requireFeatureEnabled('programs'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query(`UPDATE programs SET name = ?, category = ?, description = ?, photo = ?, schedule_info = ?, instructor = ?, display_order = ?, is_active = ? WHERE id = ?`, [req.body.name, req.body.category || 'unggulan', req.body.description || '', req.body.photo || null, req.body.schedule_info || '', req.body.instructor || '', req.body.display_order || 0, req.body.is_active ?? 1, id]);
        return res.json({ success: true, message: 'Program berhasil diperbarui.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
apiRouter.delete('/admin/programs/:id', requireContentAdmin, requireFeatureEnabled('programs'), async (req, res) => {
    const id = parseInt(String(req.params.id), 10);
    const pool = getPool();
    try {
        await pool.query('DELETE FROM programs WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Program berhasil dihapus.' });
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
});
// Settings & PPDB
apiRouter.put('/admin/ppdb', requirePpdbAdmin, requireFeatureEnabled('ppdb'), async (req, res) => {
    const pool = getPool();
    try {
        await pool.query(`UPDATE ppdb_information SET academic_year = ?, is_open = ?, start_date = ?, end_date = ?, banner_image = ?, overview = ?, requirements = ?, schedules = ?, steps = ?, show_fees = ?, fees_description = ?, fees_items = ?, contact_person = ?, contact_phone = ?, contact_whatsapp = ?, registration_url = ?, updated_at = NOW() WHERE id = (SELECT id FROM (SELECT id FROM ppdb_information ORDER BY id ASC LIMIT 1) AS selected_ppdb)`, [
            req.body.academic_year || 'Belum ditentukan', req.body.is_open ? 1 : 0, req.body.start_date || null,
            req.body.end_date || null, req.body.banner_image || null, req.body.overview || '',
            JSON.stringify(req.body.requirements || []), JSON.stringify(req.body.schedules || []),
            JSON.stringify(req.body.steps || []), req.body.show_fees ? 1 : 0, req.body.fees_description || '',
            JSON.stringify(req.body.fees_items || []), req.body.contact_person || '', req.body.contact_phone || '',
            req.body.contact_whatsapp || '', req.body.registration_url || '/ppdb#daftar-online'
        ]);
    }
    catch (err) {
        logger.error('AdminMySQL', 'Operasi admin gagal saat mengakses MySQL.', {
            code: err?.code,
            sqlState: err?.sqlState,
            message: err?.message
        });
        return res.status(500).json({
            success: false,
            message: 'Operasi gagal. Data tidak disimpan; periksa log backend.'
        });
    }
    const [rows] = await pool.query('SELECT * FROM ppdb_information ORDER BY id ASC LIMIT 1');
    return res.json({ success: true, message: 'Informasi PPDB berhasil diperbarui.', data: rows[0] ?? null });
});
apiRouter.put('/admin/settings', requireSuperadmin, async (req, res) => {
    const pool = getPool();
    try {
        await pool.query(`UPDATE website_settings SET
         school_name = ?, tagline = ?, logo_url = ?, favicon_url = ?, hero_title = ?, hero_subtitle = ?, hero_image = ?, hero_slides = ?,
         primary_color = ?, secondary_color = ?, accent_orange = ?, accent_blue = ?, feature_flags = ?,
         facebook_url = ?, instagram_url = ?, youtube_url = ?, tiktok_url = ?,
         seo_title = ?, seo_description = ?, footer_text = ?,
         stats_students = ?, stats_teachers = ?, stats_alumni = ?, stats_achievements = ?, updated_at = NOW()
       WHERE id = (SELECT id FROM (SELECT id FROM website_settings ORDER BY id ASC LIMIT 1) AS selected_settings)`, [
            req.body.school_name || 'Nama Sekolah Anda', req.body.tagline || '', req.body.logo_url || '',
            req.body.favicon_url || '', req.body.hero_title || '', req.body.hero_subtitle || '', req.body.hero_image || '',
            JSON.stringify(Array.isArray(req.body.hero_slides) ? req.body.hero_slides : []),
            req.body.primary_color || '#1B3B2B', req.body.secondary_color || '#E5C178',
            req.body.accent_orange || '#F97316', req.body.accent_blue || '#0284C7',
            JSON.stringify(req.body.feature_flags || {}), req.body.facebook_url || '',
            req.body.instagram_url || '', req.body.youtube_url || '', req.body.tiktok_url || '',
            req.body.seo_title || '', req.body.seo_description || '', req.body.footer_text || '',
            Number(req.body.stats_students) || 0, Number(req.body.stats_teachers) || 0,
            Number(req.body.stats_alumni) || 0, Number(req.body.stats_achievements) || 0
        ]);
    }
    catch (err) {
        logger.error('SettingsRoute', 'Gagal menyimpan pengaturan website ke MySQL.', { code: err.code, sqlState: err.sqlState, message: err.message });
        return res.status(500).json({ success: false, message: 'Pengaturan website gagal disimpan. Periksa log backend.' });
    }
    const [rows] = await pool.query('SELECT * FROM website_settings LIMIT 1');
    return res.json({ success: true, message: 'Pengaturan website berhasil disimpan.', data: rows[0] });
});
// ==========================================
// 7. ROUTE YANG DIGUNAKAN FORMULIR FRONTEND
// ==========================================
const routeWriteError = (res, route, err) => {
    logger.error(route, 'Operasi MySQL gagal.', {
        code: err?.code, sqlState: err?.sqlState, message: err?.message
    });
    return res.status(500).json({ success: false, message: 'Operasi gagal diproses. Periksa log backend.' });
};
const makeSlug = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
// Contact form
apiRouter.post('/contact', publicContactRateLimiter, async (req, res) => {
    const { name, email, phone, subject, message } = req.body || {};
    if (typeof name !== 'string' || typeof email !== 'string' ||
        typeof subject !== 'string' || typeof message !== 'string' ||
        !name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Nama, email, subjek, dan pesan wajib diisi.' });
    }
    if (name.length > 100 || email.length > 100 || (phone && (typeof phone !== 'string' || phone.length > 40)) ||
        subject.length > 180 || message.length > 5000 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Data pesan tidak valid atau melebihi batas panjang yang diizinkan.' });
    }
    try {
        const [result] = await getPool().query('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)', [String(name).trim(), String(email).trim(), phone || null, String(subject).trim(), String(message).trim()]);
        return res.status(201).json({
            success: true,
            message: 'Pesan berhasil dikirim.',
            data: { id: result.insertId, name, email, phone: phone || null, subject, message, is_read: 0 }
        });
    }
    catch (err) {
        return routeWriteError(res, 'ContactRoute', err);
    }
});
// Update the currently authenticated administrator's own profile.
apiRouter.put('/auth/profile', requireAdmin, async (req, res) => {
    const { username, email, full_name, avatar } = req.body || {};
    if (!username || !email || !full_name) {
        return res.status(400).json({ success: false, message: 'Username, email, dan nama lengkap wajib diisi.' });
    }
    try {
        const pool = getPool();
        const [result] = await pool.query('UPDATE admins SET username = ?, email = ?, full_name = ?, avatar = ? WHERE id = ?', [String(username).trim().toLowerCase(), String(email).trim().toLowerCase(), String(full_name).trim(), avatar || null, req.user?.id]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Akun administrator tidak ditemukan.' });
        const [rows] = await pool.query('SELECT id, username, email, full_name, avatar, role, is_active, last_login, created_at FROM admins WHERE id = ?', [req.user?.id]);
        return res.json({ success: true, message: 'Profil administrator berhasil diperbarui.', user: rows[0] });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Username atau email sudah digunakan.' });
        return routeWriteError(res, 'AuthProfileRoute', err);
    }
});
// School history and vision-mission
apiRouter.put('/admin/school-history', requireContentAdmin, requireFeatureEnabled('history'), async (req, res) => {
    try {
        const pool = getPool();
        const [existing] = await pool.query('SELECT id FROM school_history ORDER BY id ASC LIMIT 1');
        if (existing.length) {
            await pool.query('UPDATE school_history SET title = ?, content = ?, featured_image = ?, milestones = ?, updated_at = NOW() WHERE id = ?', [req.body.title || 'Sejarah Sekolah', req.body.content || '', req.body.featured_image || null, JSON.stringify(req.body.milestones || []), existing[0].id]);
        }
        else {
            await pool.query('INSERT INTO school_history (title, content, featured_image, milestones) VALUES (?, ?, ?, ?)', [req.body.title || 'Sejarah Sekolah', req.body.content || '', req.body.featured_image || null, JSON.stringify(req.body.milestones || [])]);
        }
        const [rows] = await pool.query('SELECT * FROM school_history ORDER BY id ASC LIMIT 1');
        return res.json({ success: true, message: 'Sejarah sekolah berhasil disimpan.', data: rows[0] });
    }
    catch (err) {
        return routeWriteError(res, 'AdminSchoolHistoryRoute', err);
    }
});
apiRouter.put('/admin/vision-mission', requireContentAdmin, async (req, res) => {
    try {
        const pool = getPool();
        const [existing] = await pool.query('SELECT id FROM school_vision_mission ORDER BY id ASC LIMIT 1');
        const values = [
            req.body.vision || '', req.body.vision_motto || '',
            JSON.stringify(req.body.missions || []), JSON.stringify(req.body.goals || []),
            JSON.stringify(req.body.core_values || [])
        ];
        if (existing.length) {
            await pool.query('UPDATE school_vision_mission SET vision = ?, vision_motto = ?, missions = ?, goals = ?, core_values = ?, updated_at = NOW() WHERE id = ?', [...values, existing[0].id]);
        }
        else {
            await pool.query('INSERT INTO school_vision_mission (vision, vision_motto, missions, goals, core_values) VALUES (?, ?, ?, ?, ?)', values);
        }
        const [rows] = await pool.query('SELECT * FROM school_vision_mission ORDER BY id ASC LIMIT 1');
        return res.json({ success: true, message: 'Visi dan misi berhasil disimpan.', data: rows[0] });
    }
    catch (err) {
        return routeWriteError(res, 'AdminVisionMissionRoute', err);
    }
});
// Organization CRUD
apiRouter.post('/admin/organization', requireContentAdmin, requireFeatureEnabled('organization'), async (req, res) => {
    const parentId = req.body.parent_id ? Number(req.body.parent_id) : null;
    if (parentId !== null && (!Number.isInteger(parentId) || parentId < 1 || !(await validateOrganizationParent(null, parentId)))) {
        return res.status(400).json({ success: false, message: 'Atasan organisasi tidak valid.' });
    }
    try {
        const [result] = await getPool().query('INSERT INTO school_organization (position, name, nip, photo, level, parent_id, display_order, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.position, req.body.name, req.body.nip || '-', req.body.photo || null, Number(req.body.level) || 1, req.body.parent_id || null, Number(req.body.display_order) || 0, req.body.description || '']);
        return res.status(201).json({ success: true, message: 'Anggota organisasi berhasil ditambahkan.', data: { id: result.insertId, ...req.body } });
    }
    catch (err) {
        return routeWriteError(res, 'AdminOrganizationRoute', err);
    }
});
apiRouter.put('/admin/organization/:id', requireContentAdmin, requireFeatureEnabled('organization'), async (req, res) => {
    const id = Number(req.params.id);
    const parentId = req.body.parent_id ? Number(req.body.parent_id) : null;
    if (!Number.isInteger(id) || id < 1 || (parentId !== null && (!Number.isInteger(parentId) || parentId < 1 || !(await validateOrganizationParent(id, parentId))))) {
        return res.status(400).json({ success: false, message: 'Hubungan atasan organisasi tidak valid atau membentuk siklus.' });
    }
    try {
        const [result] = await getPool().query('UPDATE school_organization SET position = ?, name = ?, nip = ?, photo = ?, level = ?, parent_id = ?, display_order = ?, description = ? WHERE id = ?', [req.body.position, req.body.name, req.body.nip || '-', req.body.photo || null, Number(req.body.level) || 1, req.body.parent_id || null, Number(req.body.display_order) || 0, req.body.description || '', id]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Data organisasi tidak ditemukan.' });
        return res.json({ success: true, message: 'Data organisasi berhasil diperbarui.' });
    }
    catch (err) {
        return routeWriteError(res, 'AdminOrganizationRoute', err);
    }
});
apiRouter.delete('/admin/organization/:id', requireContentAdmin, requireFeatureEnabled('organization'), async (req, res) => {
    try {
        const [result] = await getPool().query('DELETE FROM school_organization WHERE id = ?', [Number(req.params.id)]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Data organisasi tidak ditemukan.' });
        return res.json({ success: true, message: 'Data organisasi berhasil dihapus.' });
    }
    catch (err) {
        return routeWriteError(res, 'AdminOrganizationRoute', err);
    }
});
// Staff CRUD
apiRouter.post('/admin/staff', requireContentAdmin, requireFeatureEnabled('teachers'), async (req, res) => {
    try {
        const [result] = await getPool().query('INSERT INTO staff (name, photo, position, department, last_education, short_bio, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)', [req.body.name, req.body.photo || null, req.body.position, req.body.department || 'Tata Usaha', req.body.last_education || '', req.body.short_bio || '', Number(req.body.display_order) || 0]);
        return res.status(201).json({ success: true, message: 'Data staf berhasil ditambahkan.', data: { id: result.insertId, ...req.body, is_active: 1 } });
    }
    catch (err) {
        return routeWriteError(res, 'AdminStaffRoute', err);
    }
});
apiRouter.put('/admin/staff/:id', requireContentAdmin, requireFeatureEnabled('teachers'), async (req, res) => {
    try {
        const [result] = await getPool().query('UPDATE staff SET name = ?, photo = ?, position = ?, department = ?, last_education = ?, short_bio = ?, display_order = ? WHERE id = ?', [req.body.name, req.body.photo || null, req.body.position, req.body.department || 'Tata Usaha', req.body.last_education || '', req.body.short_bio || '', Number(req.body.display_order) || 0, Number(req.params.id)]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Data staf tidak ditemukan.' });
        return res.json({ success: true, message: 'Data staf berhasil diperbarui.' });
    }
    catch (err) {
        return routeWriteError(res, 'AdminStaffRoute', err);
    }
});
apiRouter.delete('/admin/staff/:id', requireContentAdmin, requireFeatureEnabled('teachers'), async (req, res) => {
    try {
        const [result] = await getPool().query('DELETE FROM staff WHERE id = ?', [Number(req.params.id)]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Data staf tidak ditemukan.' });
        return res.json({ success: true, message: 'Data staf berhasil dihapus.' });
    }
    catch (err) {
        return routeWriteError(res, 'AdminStaffRoute', err);
    }
});
// News category and gallery album creation/deletion used by the API service.
apiRouter.post('/admin/news/categories', requireContentAdmin, requireFeatureEnabled('news'), async (req, res) => {
    const name = String(req.body.name || '').trim();
    if (!name)
        return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });
    const slug = makeSlug(req.body.slug || name);
    try {
        const [result] = await getPool().query('INSERT INTO news_categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, req.body.description || '']);
        return res.status(201).json({ success: true, message: 'Kategori berita berhasil dibuat.', data: { id: result.insertId, name, slug } });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Nama atau slug kategori sudah digunakan.' });
        return routeWriteError(res, 'AdminNewsCategoryRoute', err);
    }
});
apiRouter.post('/admin/gallery/albums', requireContentAdmin, requireFeatureEnabled('gallery'), async (req, res) => {
    const name = String(req.body.name || '').trim();
    if (!name)
        return res.status(400).json({ success: false, message: 'Nama album wajib diisi.' });
    const slug = makeSlug(req.body.slug || name);
    try {
        const [result] = await getPool().query('INSERT INTO gallery_albums (name, slug, description, cover_image, category) VALUES (?, ?, ?, ?, ?)', [name, slug, req.body.description || '', req.body.cover_image || null, req.body.category || 'Umum']);
        return res.status(201).json({ success: true, message: 'Album galeri berhasil dibuat.', data: { id: result.insertId, name, slug } });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Nama atau slug album sudah digunakan.' });
        return routeWriteError(res, 'AdminGalleryAlbumRoute', err);
    }
});
apiRouter.delete('/admin/gallery/albums/:id', requireContentAdmin, requireFeatureEnabled('gallery'), async (req, res) => {
    try {
        const [result] = await getPool().query('DELETE FROM gallery_albums WHERE id = ?', [Number(req.params.id)]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Album galeri tidak ditemukan.' });
        return res.json({ success: true, message: 'Album galeri berhasil dihapus.' });
    }
    catch (err) {
        return routeWriteError(res, 'AdminGalleryAlbumRoute', err);
    }
});
// Pengumuman sekolah — terpisah dari berita dan agenda.
apiRouter.get('/announcements', requireFeatureEnabled('announcements'), async (_req, res) => {
    try {
        const [rows] = await getPool().query("SELECT id, title, slug, summary, content, category, cover_image, published_at FROM announcements WHERE status = 'published' AND (published_at IS NULL OR published_at <= NOW()) ORDER BY COALESCE(published_at, created_at) DESC");
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return publicQueryError(res, 'AnnouncementsRoute', err, 'Gagal membaca pengumuman sekolah.');
    }
});
apiRouter.get('/admin/announcements', requireContentAdmin, async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM announcements ORDER BY updated_at DESC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return routeWriteError(res, 'AdminAnnouncementsList', err);
    }
});
apiRouter.post('/admin/announcements', requireContentAdmin, async (req, res) => {
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    if (!title || !content)
        return res.status(400).json({ success: false, message: 'Judul dan isi pengumuman wajib diisi.' });
    const slug = makeSlug(req.body.slug || title);
    const status = ['draft', 'published', 'archived'].includes(req.body.status) ? req.body.status : 'draft';
    try {
        const [result] = await getPool().query('INSERT INTO announcements (title, slug, summary, content, category, cover_image, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [title, slug, req.body.summary || '', content, req.body.category || 'Umum', req.body.cover_image || null, status, status === 'published' ? new Date() : null]);
        return res.status(201).json({ success: true, message: 'Pengumuman berhasil dibuat.', data: { id: result.insertId, title, slug, status } });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Slug pengumuman sudah digunakan.' });
        return routeWriteError(res, 'AdminAnnouncementsCreate', err);
    }
});
apiRouter.put('/admin/announcements/:id', requireContentAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    if (!Number.isInteger(id) || id < 1 || !title || !content)
        return res.status(400).json({ success: false, message: 'Data pengumuman tidak valid.' });
    const status = ['draft', 'published', 'archived'].includes(req.body.status) ? req.body.status : 'draft';
    try {
        const [result] = await getPool().query('UPDATE announcements SET title = ?, slug = ?, summary = ?, content = ?, category = ?, cover_image = ?, status = ?, published_at = CASE WHEN ? = \'published\' THEN COALESCE(published_at, NOW()) ELSE NULL END WHERE id = ?', [title, makeSlug(req.body.slug || title), req.body.summary || '', content, req.body.category || 'Umum', req.body.cover_image || null, status, status, id]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan.' });
        return res.json({ success: true, message: 'Pengumuman berhasil diperbarui.' });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Slug pengumuman sudah digunakan.' });
        return routeWriteError(res, 'AdminAnnouncementsUpdate', err);
    }
});
apiRouter.delete('/admin/announcements/:id', requireContentAdmin, async (req, res) => {
    try {
        const [result] = await getPool().query('DELETE FROM announcements WHERE id = ?', [Number(req.params.id)]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan.' });
        return res.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
    }
    catch (err) {
        return routeWriteError(res, 'AdminAnnouncementsDelete', err);
    }
});
// Pendaftaran peserta didik: berkas diunggah terpisah, lalu data pendaftar disimpan.
const admissionUploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false });
const admissionSubmitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const ensureAdmissionPeriodOpen = async (_req, res, next) => {
    try {
        const [rows] = await getPool().query('SELECT is_open, (start_date IS NULL OR start_date <= CURDATE()) AS period_started, (end_date IS NULL OR end_date >= CURDATE()) AS period_active FROM ppdb_information ORDER BY id ASC LIMIT 1');
        const period = rows[0];
        if (!period || !Number(period.is_open) || !Number(period.period_started) || !Number(period.period_active))
            return res.status(403).json({ success: false, message: 'Pendaftaran sedang ditutup atau belum memasuki periode pendaftaran.' });
        return next();
    }
    catch (err) {
        return routeWriteError(res, 'AdmissionPeriodCheck', err);
    }
};
apiRouter.post('/admissions/upload', requireTrustedOrigin, requireFeatureEnabled('ppdb'), admissionUploadLimiter, ensureAdmissionPeriodOpen, admissionUpload.single('file'), validateAdmissionUploadContent, (req, res) => {
    if (!req.file)
        return res.status(400).json({ success: false, message: 'Unggahan tidak berhasil.' });
    return res.status(201).json({ success: true, fileKey: req.file.filename, originalName: req.file.originalname });
});
apiRouter.post('/admissions/applications', requireTrustedOrigin, requireFeatureEnabled('ppdb'), admissionSubmitLimiter, async (req, res) => {
    const body = req.body || {};
    const required = ['candidate_name', 'origin_school', 'parent_name', 'parent_phone'];
    if (required.some(key => typeof body[key] !== 'string' || !body[key].trim())) {
        return res.status(400).json({ success: false, message: 'Nama calon siswa, asal sekolah, nama orang tua, dan nomor telepon wajib diisi.' });
    }
    if (body.candidate_name.length > 150 || body.origin_school.length > 180 || body.parent_name.length > 150 || body.parent_phone.length > 40 || String(body.notes || '').length > 3000) {
        return res.status(400).json({ success: false, message: 'Sebagian data melebihi batas panjang yang diizinkan.' });
    }
    const optionalFieldLimits = {
        national_id: 32, birth_place: 100, address: 5000, program: 120, academic_year: 30
    };
    for (const [field, maxLength] of Object.entries(optionalFieldLimits)) {
        const value = body[field];
        if (value != null && (typeof value !== 'string' || value.length > maxLength)) {
            return res.status(400).json({ success: false, message: 'Sebagian data tambahan tidak valid atau terlalu panjang.' });
        }
    }
    if (body.gender && !['L', 'P'].includes(body.gender)) {
        return res.status(400).json({ success: false, message: 'Pilihan jenis kelamin tidak valid.' });
    }
    if (body.birth_date) {
        const date = typeof body.birth_date === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(body.birth_date)
            ? new Date(`${body.birth_date}T00:00:00.000Z`)
            : null;
        if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== body.birth_date) {
            return res.status(400).json({ success: false, message: 'Format tanggal lahir tidak valid.' });
        }
    }
    const documents = body.documents && typeof body.documents === 'object' && !Array.isArray(body.documents) ? body.documents : {};
    if (Object.keys(documents).length > 8 || Object.values(documents).some((fileKey) => typeof fileKey !== 'string' || !/^[a-f0-9-]{36}\.(pdf|jpg|png|webp)$/i.test(fileKey))) {
        return res.status(400).json({ success: false, message: 'Data dokumen tidak valid.' });
    }
    const applicationCode = `SPMB-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    try {
        const [periodRows] = await getPool().query('SELECT is_open, (start_date IS NULL OR start_date <= CURDATE()) AS period_started, (end_date IS NULL OR end_date >= CURDATE()) AS period_active FROM ppdb_information ORDER BY id ASC LIMIT 1');
        const period = periodRows[0];
        if (!period || !Number(period.is_open) || !Number(period.period_started) || !Number(period.period_active)) {
            return res.status(403).json({ success: false, message: 'Pendaftaran sedang ditutup atau belum memasuki periode pendaftaran.' });
        }
        const [result] = await getPool().query('INSERT INTO admission_applications (application_code, candidate_name, national_id, birth_place, birth_date, gender, origin_school, parent_name, parent_phone, address, program, notes, documents, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [applicationCode, body.candidate_name.trim(), body.national_id || null, body.birth_place || null, body.birth_date || null, ['L', 'P'].includes(body.gender) ? body.gender : null, body.origin_school.trim(), body.parent_name.trim(), body.parent_phone.trim(), body.address || null, body.program || 'Reguler', body.notes || '', JSON.stringify(documents), body.academic_year || null]);
        return res.status(201).json({ success: true, message: 'Pendaftaran berhasil dikirim.', data: { id: result.insertId, application_code: applicationCode, status: 'received' } });
    }
    catch (err) {
        return routeWriteError(res, 'AdmissionApplicationCreate', err);
    }
});
apiRouter.get('/admin/admission-applications/:id/documents/:filename', requirePpdbAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const filename = String(req.params.filename || '');
    if (!Number.isInteger(id) || id < 1 || !/^[a-f0-9-]{36}\.(pdf|jpg|png|webp)$/i.test(filename)) {
        return res.status(400).json({ success: false, message: 'Dokumen tidak valid.' });
    }
    try {
        const [rows] = await getPool().query('SELECT documents FROM admission_applications WHERE id = ? LIMIT 1', [id]);
        if (!rows.length)
            return res.status(404).json({ success: false, message: 'Data pendaftar tidak ditemukan.' });
        let documents = rows[0].documents;
        if (typeof documents === 'string') {
            try {
                documents = JSON.parse(documents);
            }
            catch {
                documents = {};
            }
        }
        if (!documents || !Object.values(documents).includes(filename))
            return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan.' });
        const filePath = path.join(ADMISSION_UPLOAD_DIR, filename);
        if (!fs.existsSync(filePath))
            return res.status(404).json({ success: false, message: 'Berkas dokumen tidak tersedia.' });
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'private, no-store');
        return res.download(filePath, `dokumen-pendaftar-${id}${path.extname(filename)}`);
    }
    catch (err) {
        return routeWriteError(res, 'AdmissionDocumentDownload', err);
    }
});
apiRouter.get('/admin/admission-applications', requirePpdbAdmin, async (_req, res) => {
    try {
        const [rows] = await getPool().query('SELECT * FROM admission_applications ORDER BY submitted_at DESC');
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return routeWriteError(res, 'AdmissionApplicationList', err);
    }
});
apiRouter.put('/admin/admission-applications/:id', requirePpdbAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || '');
    if (!Number.isInteger(id) || id < 1 || !['received', 'verified', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status atau nomor pendaftaran tidak valid.' });
    }
    try {
        const [result] = await getPool().query('UPDATE admission_applications SET status = ?, admin_notes = ? WHERE id = ?', [status, String(req.body.admin_notes || '').slice(0, 5000), id]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Data pendaftar tidak ditemukan.' });
        return res.json({ success: true, message: 'Pemeriksaan pendaftaran berhasil disimpan.' });
    }
    catch (err) {
        return routeWriteError(res, 'AdmissionApplicationUpdate', err);
    }
});
// Kategori konten terpusat: berita, program, dan fasilitas.
apiRouter.get('/admin/content-categories', requireContentAdmin, async (req, res) => {
    const scope = String(req.query.scope || '');
    if (!['news', 'program', 'facility'].includes(scope))
        return res.status(400).json({ success: false, message: 'Jenis kategori tidak valid.' });
    try {
        const [rows] = scope === 'news'
            ? await getPool().query('SELECT id, name, slug, description FROM news_categories ORDER BY name ASC')
            : await getPool().query('SELECT id, name, slug, description FROM content_categories WHERE scope = ? ORDER BY name ASC', [scope]);
        return res.json({ success: true, data: rows });
    }
    catch (err) {
        return routeWriteError(res, 'ContentCategoriesList', err);
    }
});
apiRouter.post('/admin/content-categories', requireContentAdmin, async (req, res) => {
    const scope = String(req.body.scope || '');
    const name = String(req.body.name || '').trim();
    if (!['news', 'program', 'facility'].includes(scope) || !name || name.length > 100)
        return res.status(400).json({ success: false, message: 'Jenis dan nama kategori wajib valid.' });
    const slug = makeSlug(req.body.slug || name);
    try {
        const [result] = scope === 'news'
            ? await getPool().query('INSERT INTO news_categories (name,slug,description) VALUES (?,?,?)', [name, slug, req.body.description || ''])
            : await getPool().query('INSERT INTO content_categories (scope,name,slug,description) VALUES (?,?,?,?)', [scope, name, slug, req.body.description || '']);
        return res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan.', data: { id: result.insertId, name, slug } });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Nama atau slug kategori sudah digunakan.' });
        return routeWriteError(res, 'ContentCategoriesCreate', err);
    }
});
apiRouter.put('/admin/content-categories/:scope/:id', requireContentAdmin, async (req, res) => {
    const scope = String(req.params.scope || '');
    const id = Number(req.params.id);
    const name = String(req.body.name || '').trim();
    if (!['news', 'program', 'facility'].includes(scope) || !Number.isInteger(id) || id < 1 || !name || name.length > 100) {
        return res.status(400).json({ success: false, message: 'Jenis, nomor, dan nama kategori wajib valid.' });
    }
    try {
        const [rows] = scope === 'news'
            ? await getPool().query('SELECT name FROM news_categories WHERE id = ? LIMIT 1', [id])
            : await getPool().query('SELECT name FROM content_categories WHERE id = ? AND scope = ? LIMIT 1', [id, scope]);
        if (!rows.length)
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        const oldName = rows[0].name;
        if (scope === 'news') {
            await getPool().query('UPDATE news_categories SET name = ?, slug = ?, description = ? WHERE id = ?', [name, makeSlug(name), req.body.description || '', id]);
        }
        else {
            await getPool().query('UPDATE content_categories SET name = ?, slug = ?, description = ? WHERE id = ? AND scope = ?', [name, makeSlug(name), req.body.description || '', id, scope]);
            if (scope === 'program')
                await getPool().query('UPDATE programs SET category = ? WHERE category = ?', [name, oldName]);
            if (scope === 'facility')
                await getPool().query('UPDATE facilities SET category = ? WHERE category = ?', [name, oldName]);
        }
        return res.json({ success: true, message: 'Kategori berhasil diperbarui.' });
    }
    catch (err) {
        if (err?.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ success: false, message: 'Nama atau slug kategori sudah digunakan.' });
        return routeWriteError(res, 'ContentCategoriesUpdate', err);
    }
});
apiRouter.delete('/admin/content-categories/:scope/:id', requireContentAdmin, async (req, res) => {
    const scope = String(req.params.scope || '');
    const id = Number(req.params.id);
    if (!['news', 'program', 'facility'].includes(scope) || !Number.isInteger(id) || id < 1)
        return res.status(400).json({ success: false, message: 'Kategori tidak valid.' });
    try {
        if (scope === 'program' || scope === 'facility') {
            const [categoryRows] = await getPool().query('SELECT name FROM content_categories WHERE id = ? AND scope = ? LIMIT 1', [id, scope]);
            if (!categoryRows.length)
                return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
            const table = scope === 'program' ? 'programs' : 'facilities';
            const [usageRows] = await getPool().query('SELECT COUNT(*) AS total FROM ' + table + ' WHERE category = ?', [categoryRows[0].name]);
            if (Number(usageRows[0]?.total || 0) > 0)
                return res.status(409).json({ success: false, message: 'Kategori masih digunakan. Ubah kategori pada konten terkait sebelum menghapusnya.' });
        }
        const [result] = scope === 'news'
            ? await getPool().query('DELETE FROM news_categories WHERE id = ?', [id])
            : await getPool().query('DELETE FROM content_categories WHERE id = ? AND scope = ?', [id, scope]);
        if (!result.affectedRows)
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
        return res.json({ success: true, message: 'Kategori berhasil dihapus.' });
    }
    catch (err) {
        if (err?.code === 'ER_ROW_IS_REFERENCED_2')
            return res.status(409).json({ success: false, message: 'Kategori masih digunakan oleh berita. Ubah kategori berita terkait terlebih dahulu.' });
        return routeWriteError(res, 'ContentCategoriesDelete', err);
    }
});
// Memastikan hubungan induk organisasi valid dan tidak membentuk siklus.
const validateOrganizationParent = async (currentId, parentId) => {
    let cursor = parentId;
    const visited = new Set();
    while (cursor !== null) {
        if (cursor === currentId || visited.has(cursor))
            return false;
        visited.add(cursor);
        const [rows] = await getPool().query('SELECT parent_id FROM school_organization WHERE id = ? LIMIT 1', [cursor]);
        if (!rows.length)
            return false;
        cursor = rows[0].parent_id === null ? null : Number(rows[0].parent_id);
    }
    return true;
};
