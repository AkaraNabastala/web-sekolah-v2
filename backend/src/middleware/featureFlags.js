import { getPool } from '../config/database.js';
// Feature flag diperiksa di server; menyembunyikan menu di frontend bukan kontrol akses.
export function requireFeatureEnabled(feature) {
    return async (_req, res, next) => {
        try {
            const [rows] = await getPool().query('SELECT feature_flags FROM website_settings ORDER BY id ASC LIMIT 1');
            if (!rows?.[0]) {
                return res.status(503).json({ success: false, code: 'FEATURE_FLAG_UNAVAILABLE', message: 'Konfigurasi modul belum tersedia.' });
            }
            let flags = rows[0].feature_flags ?? {};
            if (typeof flags === 'string') {
                try {
                    flags = JSON.parse(flags);
                }
                catch {
                    return res.status(503).json({ success: false, code: 'FEATURE_FLAG_UNAVAILABLE', message: 'Konfigurasi modul tidak valid.' });
                }
            }
            if (!flags || typeof flags !== 'object' || Array.isArray(flags)) {
                return res.status(503).json({ success: false, code: 'FEATURE_FLAG_UNAVAILABLE', message: 'Konfigurasi modul tidak valid.' });
            }
            if (flags && flags[feature] === false) {
                return res.status(403).json({
                    success: false,
                    code: 'FEATURE_DISABLED',
                    message: 'Modul ini sedang dinonaktifkan melalui pengaturan website.'
                });
            }
            return next();
        }
        catch (error) {
            // Fail closed: jika status flag tidak dapat diverifikasi, jangan izinkan perubahan data.
            return res.status(503).json({
                success: false,
                code: 'FEATURE_FLAG_UNAVAILABLE',
                message: 'Status modul belum dapat diverifikasi. Silakan coba kembali.'
            });
        }
    };
}
