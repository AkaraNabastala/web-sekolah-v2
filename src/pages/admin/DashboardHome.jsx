import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schoolApi } from '../../services/api';
import { Users, Eye, Calendar, Newspaper, Award, Landmark, Mail, ArrowUpRight, Clock, Image, Edit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
export const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [recentMessages, setRecentMessages] = useState([]);
    const [recentNews, setRecentNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);
    useEffect(() => {
        let mounted = true;
        const loadDashboard = async () => {
            const results = await Promise.allSettled([
                schoolApi.getDashboardStats(),
                schoolApi.getAdminActivities(),
                schoolApi.getAdminMessages(),
                schoolApi.getAdminNews()
            ]);
            if (!mounted)
                return;
            const [statsResult, activitiesResult, messagesResult, newsResult] = results;
            if (statsResult.status === 'fulfilled') {
                setStats(statsResult.value);
            }
            else {
                console.error('Dashboard statistics failed:', statsResult.reason);
                setStatsError('Statistik belum dapat dimuat. Periksa koneksi MySQL dan endpoint dashboard.');
            }
            if (activitiesResult.status === 'fulfilled') {
                setActivities(activitiesResult.value.slice(0, 8));
            }
            else {
                console.error('Dashboard activities failed:', activitiesResult.reason);
            }
            if (messagesResult.status === 'fulfilled') {
                setRecentMessages(messagesResult.value.slice(0, 5));
            }
            else {
                console.error('Dashboard messages failed:', messagesResult.reason);
            }
            if (newsResult.status === 'fulfilled') {
                setRecentNews(newsResult.value.slice(0, 5));
            }
            else {
                console.error('Dashboard news failed:', newsResult.reason);
            }
            setLoading(false);
        };
        loadDashboard().catch(error => {
            console.error('Unexpected dashboard loading error:', error);
            if (mounted) {
                setStatsError('Dashboard mengalami kendala saat memuat data.');
                setLoading(false);
            }
        });
        return () => {
            mounted = false;
        };
    }, []);
    // 8 Specific Metric Counters required by user specification:
    // Ringkasan jumlah berita, artikel/kategori, guru, galeri, prestasi, fasilitas, dan pesan masuk + pengunjung
    const statCards = [
        {
            label: 'Berita & Artikel',
            value: stats?.totalNews ?? null,
            sub: 'Publikasi aktif & draft',
            icon: Newspaper,
            color: 'emerald',
            link: '/admin/berita'
        },
        {
            label: 'Guru & Tenaga Staf',
            value: stats ? stats.totalTeachers + stats.totalStaff : null,
            sub: stats ? `${stats.totalTeachers} Guru, ${stats.totalStaff} Tenaga Kependidikan` : 'Data belum tersedia',
            icon: Users,
            color: 'sky',
            link: '/admin/guru-staf'
        },
        {
            label: 'Galeri & Media',
            value: stats?.totalGallery ?? null,
            sub: 'Foto kegiatan & dokumentasi',
            icon: Image,
            color: 'indigo',
            link: '/admin/galeri'
        },
        {
            label: 'Prestasi Siswa',
            value: stats?.totalAchievements ?? null,
            sub: 'Akademik & non-akademik',
            icon: Award,
            color: 'amber',
            link: '/admin/prestasi'
        },
        {
            label: 'Sarana & Fasilitas',
            value: stats?.totalFacilities ?? null,
            sub: 'Ruang belajar & penunjang',
            icon: Landmark,
            color: 'teal',
            link: '/admin/fasilitas'
        },
        {
            label: 'Pesan Masuk',
            value: stats?.totalMessages ?? null,
            sub: stats ? `${stats.unreadMessages} belum dibaca` : 'Data belum tersedia',
            icon: Mail,
            color: stats?.unreadMessages ? 'rose' : 'stone',
            link: '/admin/pesan',
            alert: (stats?.unreadMessages || 0) > 0
        },
        {
            label: 'Pengunjung Hari Ini',
            value: stats?.visitorsToday ?? null,
            sub: 'Pengunjung unik hari ini',
            icon: Calendar,
            color: 'emerald',
            link: '/admin/statistik'
        },
        {
            label: 'Total Pengunjung',
            value: stats?.totalVisitors ?? null,
            sub: 'Akumulasi seluruh kunjungan',
            icon: Eye,
            color: 'sky',
            link: '/admin/statistik'
        }
    ];
    return (_jsxs("div", { className: "space-y-8 font-poppins pb-12", children: [statsError && (_jsx("div", { role: "alert", className: "rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900", children: statsError })), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-bold text-stone-900", children: "Ringkasan Entitas & Trafik" }), _jsx("span", { className: "text-[11px] text-stone-500 font-medium", children: loading ? "Memuat data..." : "Data terbaru" })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5", children: statCards.map((card, idx) => {
                            const Icon = card.icon;
                            return (_jsxs(Link, { to: card.link, className: "bg-white rounded-2xl p-5 shadow-sm border border-stone-200/80 flex flex-col justify-between space-y-3 hover:shadow-md transition-all hover:border-emerald-300 group", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-[11px] font-bold uppercase text-stone-500 tracking-wider", children: card.label }), _jsx("div", { className: `w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${card.alert
                                                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                                                    : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'}`, children: _jsx(Icon, { className: "w-4 h-4" }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight", children: card.value === null ? '—' : card.value.toLocaleString('id-ID') }), _jsx("p", { className: "text-[11px] text-stone-400 font-normal mt-1 truncate", children: card.sub })] })] }, idx));
                        }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsxs("div", { className: "lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-stone-900", children: "Statistik Pengunjung 30 Hari Terakhir" }), _jsx("p", { className: "text-xs text-stone-400 font-normal", children: "Jumlah kunjungan unik dan tayangan halaman website" })] }), _jsx("span", { className: "text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200", children: "Realtime Logs" })] }), _jsx("div", { className: "h-64 sm:h-72 w-full pt-4", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: stats?.visitorTraffic || [], children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "visitorGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#059669", stopOpacity: 0.4 }), _jsx("stop", { offset: "95%", stopColor: "#059669", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#E5E7EB" }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 11, fill: '#6B7280' } }), _jsx(YAxis, { tick: { fontSize: 11, fill: '#6B7280' } }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '12px' } }), _jsx(Area, { type: "monotone", dataKey: "visitors", name: "Pengunjung", stroke: "#059669", strokeWidth: 2.5, fillOpacity: 1, fill: "url(#visitorGrad)" })] }) }) })] }), _jsxs("div", { className: "lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-stone-900", children: "Distribusi Kategori Berita" }), _jsx("p", { className: "text-xs text-stone-400 font-normal", children: "Jumlah berita per kategori" })] }), _jsx("div", { className: "h-60 w-full pt-2", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: stats?.categoryBreakdown || [], layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false, stroke: "#E5E7EB" }), _jsx(XAxis, { type: "number", tick: { fontSize: 10, fill: '#6B7280' } }), _jsx(YAxis, { dataKey: "name", type: "category", width: 95, tick: { fontSize: 10, fill: '#374151' } }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '11px' } }), _jsx(Bar, { dataKey: "count", name: "Jumlah", fill: "#10B981", radius: [0, 6, 6, 0], children: stats?.categoryBreakdown?.map((_, i) => (_jsx(Cell, { fill: ['#059669', '#EAB308', '#0284C7', '#F97316', '#6366F1'][i % 5] }, i))) })] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsxs("div", { className: "lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Newspaper, { className: "w-4 h-4 text-emerald-700" }), _jsx("h3", { className: "text-base font-bold text-stone-900", children: "Daftar Berita & Warta Terbaru" })] }), _jsxs(Link, { to: "/admin/berita", className: "text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1", children: [_jsx("span", { children: "Kelola Semua" }), _jsx(ArrowUpRight, { className: "w-3.5 h-3.5" })] })] }), _jsx("div", { className: "space-y-3", children: recentNews.length > 0 ? (recentNews.map((item) => (_jsxs("div", { className: "p-3 rounded-2xl border border-stone-100 hover:border-emerald-200 transition-all flex items-center gap-3.5 bg-stone-50/50 hover:bg-emerald-50/30", children: [_jsx("img", { src: item.thumbnail || '/demo/demo-event.svg', alt: item.title, className: "w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800", children: item.category_name }), _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`, children: item.status === 'published' ? 'Terbit' : 'Draft' }), _jsx("span", { className: "text-[10px] text-stone-400 ml-auto hidden sm:inline", children: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) })] }), _jsx("h4", { className: "text-xs font-bold text-stone-900 truncate", children: item.title }), _jsx("p", { className: "text-[11px] text-stone-500 font-normal truncate mt-0.5", children: item.summary })] }), _jsx(Link, { to: "/admin/berita", className: "p-2 rounded-xl text-stone-400 hover:text-emerald-700 hover:bg-white transition-colors shrink-0", title: "Ubah Berita", children: _jsx(Edit, { className: "w-4 h-4" }) })] }, item.id)))) : (_jsx("p", { className: "text-xs text-stone-400 text-center py-8", children: "Belum ada berita yang diterbitkan." })) })] }), _jsxs("div", { className: "lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-emerald-700" }), _jsx("h3", { className: "text-base font-bold text-stone-900", children: "Pesan Pengunjung Terbaru" })] }), _jsx(Link, { to: "/admin/pesan", className: "text-xs font-bold text-emerald-700 hover:underline", children: "Semua Pesan" })] }), _jsx("div", { className: "space-y-3", children: recentMessages.length > 0 ? (recentMessages.map((msg) => (_jsxs("div", { className: `p-3.5 rounded-2xl border transition-all ${!msg.is_read ? 'bg-amber-50/70 border-amber-200 shadow-xs' : 'bg-stone-50/60 border-stone-100'}`, children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "font-bold text-stone-900", children: msg.name }), _jsx("span", { className: "text-[10px] text-stone-400", children: new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) })] }), _jsx("p", { className: "text-xs font-semibold text-emerald-800 mt-0.5 truncate", children: msg.subject }), _jsx("p", { className: "text-xs text-stone-500 line-clamp-1 font-normal mt-1", children: msg.message })] }, msg.id)))) : (_jsx("p", { className: "text-xs text-stone-400 text-center py-8", children: "Belum ada pesan pengunjung." })) })] })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-emerald-700" }), _jsx("h3", { className: "text-base font-bold text-stone-900", children: "Aktivitas Audit Log Pengelola" })] }), _jsx("span", { className: "text-[10px] bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full font-mono", children: "Keamanan & Audit Terverifikasi" })] }), _jsx("div", { className: "space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar", children: activities.length > 0 ? (activities.map((act) => (_jsxs("div", { className: "flex items-start gap-3 text-xs p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-colors", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsx("span", { className: "font-bold text-stone-900 mr-2", children: act.action }), _jsx("span", { className: "text-stone-500 font-normal", children: act.description })] }), _jsx("span", { className: "text-[10px] text-stone-400 shrink-0 font-mono", children: new Date(act.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) })] }, act.id)))) : (_jsx("p", { className: "text-xs text-stone-400 text-center py-6", children: "Belum ada catatan aktivitas." })) })] })] }));
};
