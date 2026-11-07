import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { schoolApi } from '../../services/api';
import { SEO } from '../../components/common/SEO';
import { RichTextContent } from '../../components/common/RichTextEditor';
import { Building } from 'lucide-react';
export const Facilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [selectedCat, setSelectedCat] = useState('Semua');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        schoolApi.getFacilities()
            .then(res => setFacilities(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);
    const categories = ['Semua', 'Ruang Belajar', 'Laboratorium', 'Fasilitas Ibadah', 'Perpustakaan', 'Lapangan'];
    const filtered = selectedCat === 'Semua'
        ? facilities
        : facilities.filter(f => f.category === selectedCat || (selectedCat === 'Fasilitas Lain' && !categories.includes(f.category)));
    return (_jsxs("div", { className: "font-poppins bg-stone-50 min-h-screen pb-24", children: [_jsx(SEO, { title: "Sarana & Fasilitas Sekolah", description: "Daftar sarana dan prasarana sekolah, seperti ruang kelas, laboratorium, perpustakaan, ruang kegiatan, dan area olahraga." }), _jsx(PageHeader, { title: "Sarana & Fasilitas Sekolah", subtitle: "Fasilitas sekolah untuk mendukung kegiatan belajar siswa.", badge: "Infrastruktur Kampus", breadcrumbs: [{ label: 'Fasilitas' }] }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8", children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-xl border border-stone-100 flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building, { className: "w-4 h-4 text-emerald-700" }), _jsx("span", { className: "text-xs font-bold text-stone-700", children: "Kategori Sarana:" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((cat) => (_jsx("button", { onClick: () => setSelectedCat(cat), className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCat === cat
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`, children: cat }, cat))) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: filtered.map((fac) => (_jsxs("div", { className: "bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col group", children: [_jsxs("div", { className: "relative aspect-[16/11] overflow-hidden bg-stone-100", children: [_jsx("img", { src: fac.photo, alt: fac.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }), _jsx("div", { className: "absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md", children: fac.category }), _jsx("div", { className: "absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded shadow-sm", children: fac.condition_status || 'Sangat Baik' })] }), _jsxs("div", { className: "p-6 flex flex-col flex-1 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors", children: fac.name }), fac.capacity && (_jsxs("span", { className: "text-[11px] text-stone-400 font-medium shrink-0 ml-2", children: ["Kapasitas: ", fac.capacity] }))] }), _jsx(RichTextContent, { value: fac.description, className: "text-xs text-stone-600 font-normal leading-relaxed" })] })] }, fac.id))) })] })] }));
};
