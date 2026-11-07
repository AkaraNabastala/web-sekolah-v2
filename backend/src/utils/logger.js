import fs from 'fs';
import path from 'path';
class Logger {
    logDir;
    logFile;
    maxFileSize = 5 * 1024 * 1024; // 5MB limit before rotation
    constructor() {
        this.logDir = path.resolve(process.cwd(), 'logs');
        this.logFile = path.join(this.logDir, 'app.log');
        this.ensureLogDir();
    }
    ensureLogDir() {
        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }
        }
        catch {
            // In read-only or restricted environments, stderr fallback will be used
        }
    }
    sanitize(data) {
        if (!data)
            return data;
        if (typeof data !== 'object')
            return data;
        const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'authorization', 'cookie', 'db_password', 'key'];
        const sanitized = Array.isArray(data) ? [...data] : { ...data };
        for (const key of Object.keys(sanitized)) {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
                sanitized[key] = '[REDACTED]';
            }
            else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
                sanitized[key] = this.sanitize(sanitized[key]);
            }
        }
        return sanitized;
    }
    rotateIfNeeded() {
        try {
            if (fs.existsSync(this.logFile)) {
                const stats = fs.statSync(this.logFile);
                if (stats.size >= this.maxFileSize) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const archivePath = path.join(this.logDir, `app-${timestamp}.log`);
                    fs.renameSync(this.logFile, archivePath);
                }
            }
        }
        catch {
            // Fail safely without throwing
        }
    }
    log(level, moduleName, message, meta) {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const sanitizedMeta = this.sanitize(meta);
        // Format human-readable string: [2026-11-04 10:00:00] [ERROR] [StatisticsService] Table visitor_sessions does not exist
        let formattedMsg = `[${now}] [${level}] [${moduleName}] ${message}`;
        if (sanitizedMeta) {
            if (sanitizedMeta instanceof Error) {
                formattedMsg += `\n  Error: ${sanitizedMeta.message}`;
                if (sanitizedMeta.stack) {
                    formattedMsg += `\n  Stack: ${sanitizedMeta.stack}`;
                }
            }
            else if (typeof sanitizedMeta === 'object') {
                try {
                    formattedMsg += `\n  Details: ${JSON.stringify(sanitizedMeta)}`;
                }
                catch {
                    formattedMsg += `\n  Details: [Unserializable Object]`;
                }
            }
            else {
                formattedMsg += ` (${sanitizedMeta})`;
            }
        }
        // 1. Output to standard streams (stdout / stderr for container / hosting logs)
        if (level === 'ERROR') {
            console.error(formattedMsg);
        }
        else if (level === 'WARN') {
            console.warn(formattedMsg);
        }
        else {
            console.log(formattedMsg);
        }
        // 2. Append to log file with rotation
        try {
            this.rotateIfNeeded();
            fs.appendFileSync(this.logFile, formattedMsg + '\n', 'utf8');
        }
        catch {
            // File write failure must never crash the service
        }
    }
    info(moduleName, message, meta) {
        this.log('INFO', moduleName, message, meta);
    }
    warn(moduleName, message, meta) {
        this.log('WARN', moduleName, message, meta);
    }
    error(moduleName, message, meta) {
        this.log('ERROR', moduleName, message, meta);
    }
    debug(moduleName, message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('DEBUG', moduleName, message, meta);
        }
    }
}
export const logger = new Logger();
