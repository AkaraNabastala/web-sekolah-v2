import { getPool } from '../config/database.js';
import { logger } from '../utils/logger.js';
// Catat mutasi admin yang berhasil tanpa menyimpan isi form, password, atau token.
export function adminActivityLogger(req, res, next) {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }
    res.once('finish', () => {
        const authenticatedRequest = req;
        if (res.statusCode < 400 && authenticatedRequest.user?.id) {
            const description = `${req.method} ${req.originalUrl}`.slice(0, 1000);
            getPool().query('INSERT INTO admin_activities (admin_id, action, description, ip_hash) VALUES (?, ?, ?, NULL)', [authenticatedRequest.user.id, req.method, description]).catch((error) => {
                logger.error('AdminActivity', 'Gagal menyimpan log aktivitas administrator.', {
                    code: error.code
                });
            });
        }
    });
    next();
}
