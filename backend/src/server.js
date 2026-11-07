import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import './config/env.js';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';
import { checkConnection } from './config/database.js';
import { logger } from './utils/logger.js';
import { runMigrations } from './scripts/migrate.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
// CORS memakai allowlist origin yang dikonfigurasi eksplisit.
// Development memiliki default untuk Vite; production wajib menentukan domain sendiri.
const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const allowedOrigins = configuredOrigins.length > 0
    ? configuredOrigins
    : process.env.NODE_ENV === 'production'
        ? []
        : ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('CORS_ORIGINS wajib diisi dengan daftar origin frontend pada production.');
}
app.use(cors({
    origin: (origin, callback) => {
        // Permintaan non-browser (tanpa Origin) tetap diizinkan.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Origin di luar allowlist tidak mendapat header CORS.
        return callback(null, false);
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Static uploads
const uploadsDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
// API routes
app.use('/api', apiRouter);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        school: 'Website Sekolah',
        server_time: new Date().toISOString()
    });
});
app.get('/api/system/database-status', async (_req, res) => {
    const check = await checkConnection();
    // Jangan bocorkan host, port, nama database, atau detail koneksi internal.
    res.json({
        success: true,
        mysql: {
            connected: check.connected
        }
    });
});
// Production static files (if built frontend placed in ../frontend/dist)
const clientDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('{*path}', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}
// Centralized API error handling: async route failures are logged and returned as JSON.
app.use((err, req, res, next) => {
    logger.error('ApiError', 'Permintaan API gagal diproses.', {
        method: req.method,
        path: req.path,
        code: err?.code,
        sqlState: err?.sqlState,
        message: err?.message
    });
    if (res.headersSent)
        return next(err);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan periksa log backend.'
    });
});
async function start() {
    logger.info('ServerBootstrap', 'Starting Website Sekolah Backend Service...');
    const dbCheck = await checkConnection();
    if (dbCheck.connected) {
        logger.info('Database', dbCheck.message);
        // Jalankan migrasi tabel secara otomatis saat database terhubung
        const migration = await runMigrations();
        if (!migration.success) {
            throw new Error(`Database migration failed: ${migration.message}`);
        }
    }
    else {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(`MySQL wajib tersedia pada production: ${dbCheck.message}`);
        }
        logger.warn('Database', `${dbCheck.message} Endpoint yang membutuhkan data tidak akan tersedia sampai MySQL terhubung.`);
    }
    const server = app.listen(PORT, '0.0.0.0', () => {
        logger.info('ServerBootstrap', `Service running successfully on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
    const shutdown = (signal) => {
        logger.info('ServerBootstrap', `Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            logger.info('ServerBootstrap', 'HTTP server closed.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
process.on('unhandledRejection', (reason) => {
    logger.error('UnhandledRejection', reason?.message || String(reason), reason);
});
process.on('uncaughtException', (err) => {
    logger.error('UncaughtException', err.message, err);
    process.exit(1);
});
start().catch(err => {
    logger.error('BackendStartupError', err.message, err);
    process.exit(1);
});
