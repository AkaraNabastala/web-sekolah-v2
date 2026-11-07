import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { RichTextContent } from '../../components/common/RichTextEditor';
import { SEO } from '../../components/common/SEO';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { schoolApi } from '../../services/api';
import { Clock, Users } from 'lucide-react';
export const Programs = () => {
    const { pathname } = useLocation();
    const routeCategory = pathname === '/kurikulum'
        ? 'akademik'
        : pathname === '/ekstrakurikuler'
            ? 'ekstrakurikuler'
            : 'unggulan';
    const pageTitle = pathname === '/kurikulum'
        ? 'Kurikulum & Program Akademik'
        : pathname === '/ekstrakurikuler'
            ? 'Ekstrakurikuler'
            : 'Program Unggulan';
    const pageDescription = pathname === '/kurikulum'
        ? 'Kurikulum dan program akademik sekolah.'
        : pathname === '/ekstrakurikuler'
            ? 'Daftar kegiatan ekstrakurikuler yang dikelola dan dipublikasikan sekolah.'
            : 'Program unggulan sekolah yang dikelola dan dipublikasikan melalui sistem informasi sekolah.';
    const [programs, setPrograms] = useState([]);
    const [selectedCat, setSelectedCat] = useState(routeCategory);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    useEffect(() => {
        setSelectedCat(routeCategory);
        setLoading(true);
        schoolApi.getPrograms()
            .then(res => setPrograms(res))
            .catch(err => {
            console.error('Gagal memuat daftar program:', err);
            setLoadError('Daftar program belum dapat dimuat. Silakan coba beberapa saat lagi.');
            setPrograms([]);
        })
            .finally(() => setLoading(false));
    }, [routeCategory]);
    const categories = [
        { id: 'all', label: 'Semua Program' },
        { id: 'unggulan', label: 'Program Unggulan' },
        { id: 'keagamaan', label: 'Keagamaan & Adab' },
        { id: 'akademik', label: 'Akademik & Sains' },
        { id: 'ekstrakurikuler', label: 'Ekstrakurikuler' }
    ];
    const filtered = selectedCat === 'all'
        ? programs
        : programs.filter(p => p.category === selectedCat);
    return (_jsxs("div", { className: "font-['Poppins',sans-serif] bg-[#FAF8F5] min-h-screen text-[#2C332D]", children: [_jsx(SEO, { title: pageTitle, description: pageDescription }), _jsx(PageHeader, { title: pageTitle, subtitle: pageDescription, breadcrumbs: [
                    { label: 'Beranda', href: '/' },
                    { label: 'Akademik', href: '#' },
                    { label: pageTitle, href: pathname }
                ] }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 space-y-12", children: [_jsx(ScrollReveal, { animation: "fade-up", className: "flex flex-wrap items-center justify-center gap-2", children: categories.map((c) => (_jsx("button", { onClick: () => setSelectedCat(c.id), className: `px-5 py-2.5 rounded-full text-xs font-bold transition-all ${selectedCat === c.id
                                ? 'bg-[#1B3B2B] text-white shadow-md'
                                : 'bg-white text-[#5C645D] hover:bg-[#E8EFEA] hover:text-[#1D4A32] border border-[#ECE7DD]'}`, children: c.label }, c.id))) }), loading ? (_jsx("div", { className: "py-16 text-center text-sm text-[#7A827B]", children: "Memuat daftar program..." })) : loadError ? (_jsx("div", { role: "alert", className: "py-12 text-center text-sm text-amber-800", children: loadError })) : filtered.length === 0 ? (_jsx("div", { className: "py-16 text-center text-sm text-[#7A827B]", children: "Belum ada data untuk kategori ini." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: filtered.map((item, idx) => (_jsxs(ScrollReveal, { animation: "fade-up", delay: idx * 100, className: "bg-white rounded-3xl overflow-hidden border border-[#ECE7DD] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "aspect-[16/10] overflow-hidden bg-[#EAE5DC] relative", children: [_jsx("img", { src: item.photo || '/demo/demo-classroom.svg', alt: item.name, className: "w-full h-full object-cover hover:scale-105 transition-transform duration-700" }), _jsx("span", { className: "absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold bg-[#132A1E]/85 text-white backdrop-blur-md uppercase tracking-wide", children: item.category })] }), _jsxs("div", { className: "p-6 space-y-3", children: [_jsx("h3", { className: "font-bold text-lg text-[#1F2621]", children: item.name }), _jsx(RichTextContent, { value: item.description, className: "text-xs text-[#5C645D] leading-relaxed font-normal" })] })] }), _jsxs("div", { className: "p-6 pt-0 space-y-2 border-t border-[#F2EFE9] mt-4", children: [item.schedule_info && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-[#2A5C40] pt-3", children: [_jsx(Clock, { className: "w-3.5 h-3.5 shrink-0" }), _jsx("span", { className: "font-medium", children: item.schedule_info })] })), item.instructor && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-[#7A827B]", children: [_jsx(Users, { className: "w-3.5 h-3.5 shrink-0" }), _jsx("span", { children: item.instructor })] }))] })] }, item.id))) }))] })] }));
};
export default Programs;
