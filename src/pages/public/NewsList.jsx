import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { schoolApi } from '../../services/api';
import { SEO } from '../../components/common/SEO';
import { Calendar, Eye, Search, ChevronRight } from 'lucide-react';
export const NewsList = () => {
    const [news, setNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCat = searchParams.get('kategori') || 'semua';
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        Promise.all([schoolApi.getNews(), schoolApi.getNewsCategories()])
            .then(([nRes, cRes]) => {
            setNews(nRes);
            setCategories(cRes);
        })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);
    const filteredNews = useMemo(() => {
        return news.filter(item => {
            const matchCat = selectedCat === 'semua' || item.category_slug === selectedCat;
            const matchQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.summary.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchQuery;
        });
    }, [news, selectedCat, searchQuery]);
    return (_jsxs("div", { className: "font-poppins bg-stone-50 min-h-screen pb-24", children: [_jsx(SEO, { title: "Berita & Artikel", description: "Berita, artikel, liputan kegiatan, prestasi, dan pengumuman terbaru dari sekolah." }), _jsx(PageHeader, { title: "Berita, Artikel & Pengumuman", subtitle: "Informasi terbaru, kegiatan, prestasi peserta didik, dan pengumuman sekolah.", badge: "Warta Sekolah", breadcrumbs: [{ label: 'Berita & Artikel' }] }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8", children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-xl border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 w-full md:w-auto", children: [_jsx("button", { onClick: () => setSearchParams({}), className: `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCat === 'semua'
                                            ? 'bg-emerald-700 text-white shadow-sm'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`, children: "Semua Berita" }), categories.map((cat) => (_jsx("button", { onClick: () => setSearchParams({ kategori: cat.slug }), className: `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCat === cat.slug
                                            ? 'bg-emerald-700 text-white shadow-sm'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`, children: cat.name }, cat.id)))] }), _jsxs("div", { className: "relative w-full md:w-72", children: [_jsx(Search, { className: "w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Cari judul warta...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 transition-colors bg-stone-50/50" })] })] }), filteredNews.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: filteredNews.map((article) => (_jsxs("div", { className: "bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col group", children: [_jsxs("div", { className: "relative aspect-[16/10] overflow-hidden bg-stone-100", children: [_jsx("img", { src: article.thumbnail || '/demo/demo-event.svg', alt: article.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }), _jsx("div", { className: "absolute top-3 left-3 bg-emerald-700/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm", children: article.category_name || 'Berita' })] }), _jsxs("div", { className: "p-6 flex flex-col flex-1 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-[11px] text-stone-400 font-medium", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), new Date(article.published_at || article.created_at || '').toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Eye, { className: "w-3.5 h-3.5" }), article.views_count || 0] })] }), _jsx("h3", { className: "font-bold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors", children: _jsx(Link, { to: `/berita/${article.slug}`, children: article.title }) }), _jsx("p", { className: "text-xs text-stone-500 leading-relaxed line-clamp-3 font-normal", children: article.summary }), _jsxs("div", { className: "pt-3 mt-auto border-t border-stone-100 flex items-center justify-between", children: [_jsxs("span", { className: "text-[11px] text-stone-400 font-medium", children: ["Oleh: ", article.author || 'Admin'] }), _jsxs(Link, { to: `/berita/${article.slug}`, className: "text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform", children: [_jsx("span", { children: "Baca" }), _jsx(ChevronRight, { className: "w-3.5 h-3.5" })] })] })] })] }, article.id))) })) : (_jsxs("div", { className: "bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-100 space-y-3", children: [_jsx("p", { className: "text-stone-400 text-sm", children: "Tidak ditemukan artikel pada kategori atau pencarian ini." }), _jsx("button", { onClick: () => {
                                    setSearchParams({});
                                    setSearchQuery('');
                                }, className: "text-xs font-bold text-emerald-700 underline", children: "Reset Filter" })] }))] })] }));
};
