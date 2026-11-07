import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Eye, Activity, Download, Smartphone, FileText, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
export const VisitorStats = () => {
    const [summary, setSummary] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [days, setDays] = useState(30);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    useEffect(() => {
        loadStatistics();
    }, [days]);
    const loadStatistics = async () => {
        setIsLoading(true);
        try {
            const [sumRes, anaRes] = await Promise.all([
                api.get('/admin/statistics/summary'),
                api.get('/admin/statistics/analytics', { params: { days } })
            ]);
            setSummary(sumRes.data.data);
            setAnalytics(anaRes.data.data);
        }
        catch (err) {
            console.error('Gagal mengambil data statistik:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDownloadXlsx = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/admin/statistics/export/xlsx', {
                params: { days },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `statistik_website_sekolah_${days}hari.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
        catch (err) {
            alert('Gagal mengunduh laporan XLSX.');
        }
        finally {
            setIsExporting(false);
        }
    };
    const handleDownloadCsv = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/admin/statistics/export/csv', {
                params: { days },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `statistik_website_sekolah_${days}hari.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
        catch (err) {
            alert('Gagal mengunduh laporan CSV.');
        }
        finally {
            setIsExporting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Statistik Pengunjung Website" }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Pantau jumlah tayangan, pengunjung unik, dan sesi interaksi secara akurat & menjaga privasi." })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("div", { className: "flex items-center gap-2 bg-slate-100 p-1 rounded-xl", children: [7, 30, 90].map((d) => (_jsx("button", { onClick: () => setDays(d), className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${days === d
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'}`, children: d === 7 ? '7 Hari' : d === 30 ? '30 Hari' : '3 Bulan' }, d))) }), _jsxs("button", { onClick: handleDownloadXlsx, disabled: isExporting, className: "flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50", children: [_jsx(Download, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Unduh Excel" })] }), _jsxs("button", { onClick: handleDownloadCsv, disabled: isExporting, className: "flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50", children: [_jsx(Download, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Unduh CSV" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Hari Ini" }), _jsx("span", { className: "p-2 bg-emerald-50 text-emerald-700 rounded-xl", children: _jsx(Users, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-2xl font-bold text-slate-900", children: summary?.today?.unique_visitors_today ?? 0 }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: ["Pengunjung Unik (", summary?.today?.pageviews_today ?? 0, " Views)"] })] })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "7 Hari Terakhir" }), _jsx("span", { className: "p-2 bg-blue-50 text-blue-700 rounded-xl", children: _jsx(TrendingUp, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-2xl font-bold text-slate-900", children: summary?.last_7_days?.unique_visitors_7d ?? 0 }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [summary?.last_7_days?.pageviews_7d ?? 0, " Total Tayangan Halaman"] })] })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "30 Hari Terakhir" }), _jsx("span", { className: "p-2 bg-amber-50 text-amber-700 rounded-xl", children: _jsx(Activity, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-2xl font-bold text-slate-900", children: summary?.last_30_days?.unique_visitors_30d ?? 0 }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [summary?.last_30_days?.pageviews_30d ?? 0, " Total Tayangan Halaman"] })] })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Sepanjang Waktu" }), _jsx("span", { className: "p-2 bg-purple-50 text-purple-700 rounded-xl", children: _jsx(Eye, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-2xl font-bold text-slate-900", children: summary?.all_time?.total_pageviews ?? 0 }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [summary?.all_time?.total_unique_visitors ?? 0, " Pengunjung Unik Akumulasi"] })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsx("h2", { className: "text-base font-bold text-slate-900 mb-4", children: "Grafik Kunjungan & Page Views Harian" }), _jsx("div", { className: "h-72 w-full", children: analytics?.trends && analytics.trends.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: analytics.trends, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#E2E8F0" }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 11 } }), _jsx(YAxis, { tick: { fontSize: 11 } }), _jsx(Tooltip, {}), _jsx(Legend, { wrapperStyle: { fontSize: 12 } }), _jsx(Line, { type: "monotone", dataKey: "pageviews", name: "Page Views", stroke: "#15803D", strokeWidth: 2, dot: false }), _jsx(Line, { type: "monotone", dataKey: "unique_visitors", name: "Unique Visitors", stroke: "#0284C7", strokeWidth: 2, dot: false }), _jsx(Line, { type: "monotone", dataKey: "sessions", name: "Sessions", stroke: "#EAB308", strokeWidth: 2, dot: false })] }) })) : (_jsx("div", { className: "h-full flex items-center justify-center text-slate-400 text-sm", children: "Belum ada riwayat kunjungan pada periode ini." })) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("h2", { className: "text-base font-bold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-emerald-700" }), _jsx("span", { children: "Halaman Paling Populer" })] }), _jsx("div", { className: "space-y-3", children: analytics?.popular_pages && analytics.popular_pages.length > 0 ? (analytics.popular_pages.map((p, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm", children: [_jsx("span", { className: "font-mono text-slate-700 truncate max-w-[280px]", children: p.path }), _jsxs("span", { className: "font-bold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full text-xs", children: [p.views, " views"] })] }, idx)))) : (_jsx("p", { className: "text-slate-400 text-xs py-4 text-center", children: "Belum ada data tayangan halaman." })) })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsxs("h2", { className: "text-base font-bold text-slate-900 mb-4 flex items-center gap-2", children: [_jsx(Smartphone, { className: "w-4 h-4 text-emerald-700" }), _jsx("span", { children: "Perangkat & Browser Pengunjung" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2", children: "Tipe Perangkat" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: analytics?.devices && analytics.devices.length > 0 ? (analytics.devices.map((d, idx) => (_jsxs("div", { className: "p-3 bg-slate-50 rounded-xl text-center", children: [_jsx("span", { className: "text-xs text-slate-500 capitalize", children: d.device_type }), _jsx("div", { className: "text-lg font-bold text-slate-800", children: d.count })] }, idx)))) : (_jsx("p", { className: "text-slate-400 text-xs col-span-3 text-center py-2", children: "Tidak ada data" })) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2", children: "Browser Terbanyak" }), _jsx("div", { className: "space-y-1.5", children: analytics?.browsers && analytics.browsers.length > 0 ? (analytics.browsers.map((b, idx) => (_jsxs("div", { className: "flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg", children: [_jsx("span", { className: "text-slate-700", children: b.browser }), _jsxs("span", { className: "font-semibold text-slate-900", children: [b.count, " sesi"] })] }, idx)))) : (_jsx("p", { className: "text-slate-400 text-xs text-center py-2", children: "Tidak ada data" })) })] })] })] })] })] }));
};
export default VisitorStats;
