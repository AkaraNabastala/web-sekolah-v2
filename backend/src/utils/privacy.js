import crypto from 'crypto';
export function getClientIp(req) {
    // Gunakan IP yang telah diproses Express. Dengan trust proxy nonaktif secara default,
    // header X-Forwarded-For dari klien tidak dipercaya dan tidak dapat dipalsukan untuk statistik.
    return req.ip || req.socket.remoteAddress || '127.0.0.1';
}
export function hashVisitor(req) {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'UnknownAgent';
    const today = new Date().toISOString().split('T')[0];
    const salt = process.env.JWT_SECRET || 'school-website-local-privacy-salt';
    // Hashing per hari: tidak menyimpan IP mentah, privasi terjaga
    const visitorHash = crypto
        .createHash('sha256')
        .update(`${ip}-${userAgent}-${today}-${salt}`)
        .digest('hex');
    const ipHash = crypto
        .createHash('sha256')
        .update(`${ip}-${salt}`)
        .digest('hex');
    return { visitorHash, ipHash };
}
export function parseDeviceAndBrowser(userAgent) {
    const ua = userAgent.toLowerCase();
    // Deteksi Bot
    if (/bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(ua)) {
        return { deviceType: 'bot', browser: 'Bot/Crawler' };
    }
    // Deteksi Perangkat
    let deviceType = 'desktop';
    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
        deviceType = 'tablet';
    }
    else if (/mobile|iphone|ipod|android.*mobile|blackberry|phone/i.test(ua)) {
        deviceType = 'mobile';
    }
    // Deteksi Browser
    let browser = 'Other';
    if (ua.includes('edg/')) {
        browser = 'Microsoft Edge';
    }
    else if (ua.includes('chrome/') && !ua.includes('edg/')) {
        browser = 'Google Chrome';
    }
    else if (ua.includes('safari/') && !ua.includes('chrome/')) {
        browser = 'Apple Safari';
    }
    else if (ua.includes('firefox/')) {
        browser = 'Mozilla Firefox';
    }
    else if (ua.includes('opera/') || ua.includes('opr/')) {
        browser = 'Opera';
    }
    return { deviceType, browser };
}
