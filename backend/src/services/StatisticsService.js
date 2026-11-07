import { getPool, checkConnection } from '../config/database.js';
import { logger } from '../utils/logger.js';
import ExcelJS from 'exceljs';
export class StatisticsService {
    /**
     * Catat kunjungan publik baru atau perbarui sesi aktif.
     * Catatan Arsitektur:
     * - Menghilangkan split-brain: Jika koneksi MySQL aktif, MySQL menjadi satu-satunya penyimpanan data.
     * - Tidak ada fallback JSON; MySQL merupakan satu-satunya sumber data.
     * - Kesalahan query tidak dialihkan ke penyimpanan alternatif.
     * - Endpoint tetap mengembalikan respons 200 agar rendering halaman publik tidak terganggu.
     */
    static async recordVisit(params) {
        // Abaikan bot crawler
        if (params.deviceType === 'bot')
            return;
        const today = new Date().toISOString().split('T')[0];
        const conn = await checkConnection();
        if (conn.connected) {
            try {
                const pool = getPool();
                // 1. Simpan atau perbarui sesi pengunjung unik
                await pool.query(`INSERT INTO visitor_sessions (session_id, visitor_hash, device_type, browser, referrer, visit_date, started_at, last_active_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE last_active_at = NOW()`, [params.sessionId, params.visitorHash, params.deviceType, params.browser, params.referrer, today]);
                // 2. Simpan Pageview
                await pool.query(`INSERT INTO visitor_pageviews (session_id, path, page_title, viewed_at)
           VALUES (?, ?, ?, NOW())`, [params.sessionId, params.path, params.pageTitle || '']);
                return;
            }
            catch (err) {
                // Catat error ke log tanpa memecah data ke json (mencegah split-brain)
                logger.error('StatisticsService', `Gagal mencatat kunjungan ke MySQL: ${err.message}`, {
                    code: err.code,
                    sessionId: params.sessionId
                });
                return;
            }
        }
        logger.warn('StatisticsService', 'Kunjungan tidak disimpan karena MySQL tidak terhubung. Tidak ada fallback penyimpanan lokal.');
    }
    /**
     * Ambil ringkasan metrik statistik
     */
    static async getSummaryMetrics() {
        const today = new Date().toISOString().split('T')[0];
        const conn = await checkConnection();
        if (conn.connected) {
            try {
                const pool = getPool();
                // Hari Ini
                const [todayRes] = await pool.query(`SELECT 
            COUNT(DISTINCT s.session_id) as sessions_today,
            COUNT(DISTINCT s.visitor_hash) as unique_visitors_today,
            COUNT(p.id) as pageviews_today
           FROM visitor_sessions s
           LEFT JOIN visitor_pageviews p ON s.session_id = p.session_id AND DATE(p.viewed_at) = ?
           WHERE s.visit_date = ?`, [today, today]);
                // 7 Hari Terakhir
                const [last7Res] = await pool.query(`SELECT 
            COUNT(DISTINCT s.session_id) as sessions_7d,
            COUNT(DISTINCT s.visitor_hash) as unique_visitors_7d,
            COUNT(p.id) as pageviews_7d
           FROM visitor_sessions s
           LEFT JOIN visitor_pageviews p ON s.session_id = p.session_id
           WHERE s.visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`);
                // 30 Hari Terakhir
                const [last30Res] = await pool.query(`SELECT 
            COUNT(DISTINCT s.session_id) as sessions_30d,
            COUNT(DISTINCT s.visitor_hash) as unique_visitors_30d,
            COUNT(p.id) as pageviews_30d
           FROM visitor_sessions s
           LEFT JOIN visitor_pageviews p ON s.session_id = p.session_id
           WHERE s.visit_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);
                // Sepanjang Waktu
                const [allTimeRes] = await pool.query(`SELECT 
            COUNT(DISTINCT s.session_id) as total_sessions,
            COUNT(DISTINCT s.visitor_hash) as total_unique_visitors,
            (SELECT COUNT(*) FROM visitor_pageviews) as total_pageviews
           FROM visitor_sessions s`);
                return {
                    today: todayRes[0] || { sessions_today: 0, unique_visitors_today: 0, pageviews_today: 0 },
                    last_7_days: last7Res[0] || { sessions_7d: 0, unique_visitors_7d: 0, pageviews_7d: 0 },
                    last_30_days: last30Res[0] || { sessions_30d: 0, unique_visitors_30d: 0, pageviews_30d: 0 },
                    all_time: allTimeRes[0] || { total_sessions: 0, total_unique_visitors: 0, total_pageviews: 0 }
                };
            }
            catch (err) {
                logger.error('StatisticsService', `MySQL getSummaryMetrics query error: ${err.message}`, { code: err.code });
                throw err;
            }
        }
        throw new Error('Statistik tidak tersedia karena koneksi MySQL tidak aktif.');
    }
    /**
     * Ambil rincian analitik lengkap
     */
    static async getDetailedAnalytics(days = 30) {
        const conn = await checkConnection();
        if (conn.connected) {
            try {
                const pool = getPool();
                // 1. Tren Harian
                const [trendRows] = await pool.query(`SELECT 
            s.visit_date as date,
            COUNT(DISTINCT s.visitor_hash) as unique_visitors,
            COUNT(DISTINCT s.session_id) as sessions,
            COUNT(p.id) as pageviews
           FROM visitor_sessions s
           LEFT JOIN visitor_pageviews p ON s.session_id = p.session_id AND DATE(p.viewed_at) = s.visit_date
           WHERE s.visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
           GROUP BY s.visit_date
           ORDER BY s.visit_date ASC`, [days]);
                // 2. Top Halaman Populer
                const [popularPages] = await pool.query(`SELECT path, COUNT(*) as views
           FROM visitor_pageviews
           WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY path
           ORDER BY views DESC
           LIMIT 10`, [days]);
                // 3. Distribusi Perangkat
                const [deviceDistribution] = await pool.query(`SELECT device_type, COUNT(*) as count
           FROM visitor_sessions
           WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
           GROUP BY device_type`, [days]);
                // 4. Distribusi Browser
                const [browserDistribution] = await pool.query(`SELECT browser, COUNT(*) as count
           FROM visitor_sessions
           WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
           GROUP BY browser
           ORDER BY count DESC
           LIMIT 6`, [days]);
                return {
                    trends: trendRows,
                    popular_pages: popularPages,
                    devices: deviceDistribution,
                    browsers: browserDistribution
                };
            }
            catch (err) {
                logger.error('StatisticsService', `MySQL getDetailedAnalytics query error: ${err.message}`, { code: err.code });
                throw err;
            }
        }
        throw new Error('Analitik tidak tersedia karena koneksi MySQL tidak aktif.');
    }
    /**
     * Ekspor Laporan Excel XLSX
     */
    static async generateExcelReport(days = 30) {
        const analytics = await this.getDetailedAnalytics(days);
        const summary = await this.getSummaryMetrics();
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Website Sekolah';
        workbook.created = new Date();
        // Sheet 1: Ringkasan
        const sheet1 = workbook.addWorksheet('Ringkasan Statistik');
        sheet1.columns = [
            { header: 'Metrik', key: 'metric', width: 35 },
            { header: 'Nilai', key: 'value', width: 25 }
        ];
        sheet1.addRows([
            { metric: 'Periode Analisis', value: `${days} Hari Terakhir` },
            { metric: 'Waktu Pembuatan Dokumen', value: new Date().toLocaleString('id-ID') },
            { metric: 'Total Pengunjung Unik (Hari Ini)', value: summary.today.unique_visitors_today },
            { metric: 'Total Sesi (Hari Ini)', value: summary.today.sessions_today },
            { metric: 'Total Page Views (Hari Ini)', value: summary.today.pageviews_today },
            { metric: 'Total Pengunjung Unik (7 Hari)', value: summary.last_7_days.unique_visitors_7d },
            { metric: 'Total Sesi (7 Hari)', value: summary.last_7_days.sessions_7d },
            { metric: 'Total Page Views (7 Hari)', value: summary.last_7_days.pageviews_7d },
            { metric: 'Total Pengunjung Unik (30 Hari)', value: summary.last_30_days.unique_visitors_30d },
            { metric: 'Total Sesi (30 Hari)', value: summary.last_30_days.sessions_30d },
            { metric: 'Total Page Views (30 Hari)', value: summary.last_30_days.pageviews_30d },
            { metric: 'Total Akumulasi Sesi Sepanjang Waktu', value: summary.all_time.total_sessions },
            { metric: 'Total Akumulasi Pengunjung Unik', value: summary.all_time.total_unique_visitors },
            { metric: 'Total Akumulasi Page Views', value: summary.all_time.total_pageviews }
        ]);
        // Sheet 2: Tren Harian
        const sheet2 = workbook.addWorksheet('Kunjungan Harian');
        sheet2.columns = [
            { header: 'Tanggal', key: 'date', width: 18 },
            { header: 'Unique Visitors', key: 'unique_visitors', width: 18 },
            { header: 'Total Sessions', key: 'sessions', width: 18 },
            { header: 'Total Pageviews', key: 'pageviews', width: 18 }
        ];
        analytics.trends.forEach((t) => {
            sheet2.addRow({
                date: String(t.date).split('T')[0],
                unique_visitors: t.unique_visitors,
                sessions: t.sessions,
                pageviews: t.pageviews
            });
        });
        // Sheet 3: Halaman Populer
        const sheet3 = workbook.addWorksheet('Halaman Terpopuler');
        sheet3.columns = [
            { header: 'Path / URL Halaman', key: 'path', width: 45 },
            { header: 'Jumlah Tayangan (Views)', key: 'views', width: 25 }
        ];
        analytics.popular_pages.forEach((p) => {
            sheet3.addRow({ path: p.path, views: p.views });
        });
        const buf = await workbook.xlsx.writeBuffer();
        return Buffer.from(buf);
    }
    /**
     * Ekspor Laporan CSV
     */
    static async generateCsvReport(days = 30) {
        const analytics = await this.getDetailedAnalytics(days);
        let csv = `Laporan Statistik Pengunjung Website Sekolah\n`;
        csv += `Dibuat Pada,${new Date().toISOString()}\n`;
        csv += `Rentang Hari,${days} Hari Terakhir\n\n`;
        csv += `Tanggal,Unique Visitors,Sessions,Page Views\n`;
        analytics.trends.forEach((t) => {
            csv += `"${String(t.date).split('T')[0]}",${t.unique_visitors},${t.sessions},${t.pageviews}\n`;
        });
        csv += `\nTop Halaman,Jumlah Views\n`;
        analytics.popular_pages.forEach((p) => {
            csv += `"${p.path}",${p.views}\n`;
        });
        return csv;
    }
}
