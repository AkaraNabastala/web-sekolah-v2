import { getPool, checkConnection } from '../config/database.js';
import { StatisticsService } from '../services/StatisticsService.js';
import { logger } from '../utils/logger.js';
const toNumber = (value) => Number(value || 0);
export async function getDashboardStatistics(_req, res) {
    try {
        const connection = await checkConnection();
        if (!connection.connected) {
            return res.status(503).json({
                success: false,
                message: 'Statistik dashboard membutuhkan koneksi MySQL yang aktif.'
            });
        }
        const pool = getPool();
        const [countRows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM news) AS totalNews,
        (SELECT COUNT(*) FROM teachers WHERE is_active = 1) AS totalTeachers,
        (SELECT COUNT(*) FROM staff WHERE is_active = 1) AS totalStaff,
        (SELECT COUNT(*) FROM gallery_media) AS totalGallery,
        (SELECT COUNT(*) FROM achievements) AS totalAchievements,
        (SELECT COUNT(*) FROM facilities) AS totalFacilities,
        (SELECT COUNT(*) FROM contact_messages) AS totalMessages,
        (SELECT COUNT(*) FROM contact_messages WHERE is_read = 0) AS unreadMessages
    `);
        const summary = await StatisticsService.getSummaryMetrics();
        const analytics = await StatisticsService.getDetailedAnalytics(30);
        const [categoryRows] = await pool.query(`
      SELECT c.name, COUNT(n.id) AS count
      FROM news_categories c
      LEFT JOIN news n ON n.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC, c.name ASC
    `);
        const counts = countRows[0] || {};
        return res.json({
            success: true,
            data: {
                totalVisitors: toNumber(summary.all_time.total_unique_visitors),
                visitorsToday: toNumber(summary.today.unique_visitors_today),
                visitorsThisMonth: toNumber(summary.last_30_days.unique_visitors_30d),
                totalNews: toNumber(counts.totalNews),
                totalTeachers: toNumber(counts.totalTeachers),
                totalStaff: toNumber(counts.totalStaff),
                totalGallery: toNumber(counts.totalGallery),
                totalAchievements: toNumber(counts.totalAchievements),
                totalFacilities: toNumber(counts.totalFacilities),
                totalMessages: toNumber(counts.totalMessages),
                unreadMessages: toNumber(counts.unreadMessages),
                visitorTraffic: analytics.trends.map((item) => ({
                    date: item.date instanceof Date ? item.date.toISOString().slice(0, 10) : String(item.date).slice(0, 10),
                    visitors: toNumber(item.unique_visitors),
                    pageViews: toNumber(item.pageviews)
                })),
                categoryBreakdown: categoryRows.map((item) => ({
                    name: item.name,
                    count: toNumber(item.count)
                }))
            }
        });
    }
    catch (error) {
        logger.error('DashboardController', 'Gagal memuat statistik dashboard.', {
            code: error?.code
        });
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat statistik dashboard.'
        });
    }
}
export async function getDashboardActivities(_req, res) {
    try {
        const connection = await checkConnection();
        if (!connection.connected) {
            return res.status(503).json({
                success: false,
                message: 'Riwayat aktivitas dashboard membutuhkan koneksi MySQL yang aktif.'
            });
        }
        const pool = getPool();
        const [rows] = await pool.query(`
      SELECT
        activity.id,
        activity.admin_id,
        admin.full_name AS admin_name,
        activity.action,
        activity.description,
        activity.ip_hash AS ip_address,
        activity.created_at
      FROM admin_activities AS activity
      LEFT JOIN admins AS admin ON admin.id = activity.admin_id
      ORDER BY activity.created_at DESC
      LIMIT 20
    `);
        return res.json({ success: true, data: rows });
    }
    catch (error) {
        logger.error('DashboardController', 'Gagal memuat riwayat aktivitas administrator.', {
            code: error?.code
        });
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat riwayat aktivitas administrator.'
        });
    }
}
