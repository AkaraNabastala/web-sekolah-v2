import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { schoolApi } from '../../services/api';
import { SEO } from '../../components/common/SEO';
import { Trophy } from 'lucide-react';
export const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('Semua');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        schoolApi.getAchievements()
            .then(res => setAchievements(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);
    const levels = ['Semua', 'Kabupaten', 'Provinsi', 'Nasional'];
    const filtered = selectedLevel === 'Semua'
        ? achievements
        : achievements.filter(a => a.level === selectedLevel);
    return (_jsxs("div", { className: "font-poppins bg-stone-50 min-h-screen pb-24", children: [_jsx(SEO, { title: "Prestasi & Kejuaraan Siswa", description: "Dokumentasi prestasi dan penghargaan peserta didik di berbagai bidang dan tingkatan." }), _jsx(PageHeader, { title: "Prestasi & Penghargaan", subtitle: "Rangkaian capaian gemilang peserta didik dan lembaga di bidang akademik, sains, seni, keagamaan, dan olahraga.", badge: "Catatan Emas", breadcrumbs: [{ label: 'Prestasi' }] }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8", children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-xl border border-stone-100 flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-4 h-4 text-amber-500" }), _jsx("span", { className: "text-xs font-bold text-stone-700", children: "Tingkat Kompetisi:" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: levels.map((lvl) => (_jsx("button", { onClick: () => setSelectedLevel(lvl), className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedLevel === lvl
                                        ? 'bg-amber-500 text-emerald-950 shadow-sm font-bold'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`, children: lvl }, lvl))) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((ach) => (_jsxs("div", { className: "bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col group", children: [ach.photo && (_jsxs("div", { className: "relative aspect-[16/10] overflow-hidden bg-stone-100", children: [_jsx("img", { src: ach.photo, alt: ach.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }), _jsx("div", { className: "absolute top-3 left-3 bg-amber-400 text-emerald-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm", children: ach.rank }), _jsxs("div", { className: "absolute bottom-3 right-3 bg-emerald-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded", children: ["Tahun ", ach.year] })] })), _jsxs("div", { className: "p-6 flex flex-col flex-1 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-stone-400", children: [_jsxs("span", { className: "text-emerald-700 font-bold uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded", children: ["Tingkat ", ach.level] }), _jsx("span", { className: "font-semibold text-stone-500", children: ach.category })] }), _jsx("h3", { className: "font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug", children: ach.title }), _jsxs("div", { className: "space-y-1 text-xs text-stone-600 font-normal", children: [_jsxs("p", { children: [_jsx("span", { className: "font-semibold text-stone-700", children: "Penerima:" }), " ", ach.student_or_team] }), _jsxs("p", { children: [_jsx("span", { className: "font-semibold text-stone-700", children: "Penyelenggara:" }), " ", ach.organizer] })] }), ach.description && (_jsxs("p", { className: "text-xs text-stone-500 font-normal italic leading-relaxed pt-2 border-t border-stone-100", children: ["\"", ach.description, "\""] }))] })] }, ach.id))) })] })] }));
};
