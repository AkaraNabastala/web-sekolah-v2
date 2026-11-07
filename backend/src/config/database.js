import mysql from 'mysql2/promise';
import './env.js';
import { logger } from '../utils/logger.js';
if (process.env.NODE_ENV === 'production') {
    const requiredDatabaseVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingDatabaseVariables = requiredDatabaseVariables.filter(name => !process.env[name]?.trim());
    if (missingDatabaseVariables.length > 0) {
        throw new Error(`Konfigurasi database production belum lengkap: ${missingDatabaseVariables.join(', ')}.`);
    }
}
export const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_website_demo',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 4000
};
let pool = null;
let isConnected = false;
let lastError = null;
try {
    pool = mysql.createPool(dbConfig);
}
catch (err) {
    logger.error('DatabaseConfig', `MySQL Init Error: ${err.message}`, { error: err.message });
    lastError = err.message;
}
export async function checkConnection() {
    if (!pool) {
        return { connected: false, message: 'MySQL Pool is null' };
    }
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        isConnected = true;
        lastError = null;
        return {
            connected: true,
            message: `Terhubung ke MySQL [${dbConfig.database}] pada ${dbConfig.host}:${dbConfig.port}`
        };
    }
    catch (err) {
        isConnected = false;
        lastError = err.message;
        return {
            connected: false,
            message: `Gagal terhubung ke MySQL (${err.code || err.message}).`
        };
    }
}
// Alias kompatibilitas dengan server.ts
export const testMySQLConnection = checkConnection;
export const getMySQLStatus = getStatus;
export function getPool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}
export function getStatus() {
    return {
        configured: true,
        connected: isConnected,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        lastError
    };
}
export default pool;
