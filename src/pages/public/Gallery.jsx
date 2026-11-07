import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { schoolApi } from '../../services/api';
import { SEO } from '../../components/common/SEO';
import { Play, X, Filter } from 'lucide-react';
const getYouTubeEmbedUrl = (value) => {
    try {
        const url = new URL(value);
        const host = url.hostname.replace(/^www\./, '').toLowerCase();
        const id = host === 'youtu.be'
            ? url.pathname.split('/').filter(Boolean)[0] || ''
            : host === 'youtube.com' || host === 'm.youtube.com'
                ? url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop() || ''
                : '';
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
    }
    catch {
        return null;
    }
};
export const Gallery = () => {
    const [mediaList, setMediaList] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [category, setCategory] = useState('Semua');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        schoolApi.getGallery(category)
            .then(res => setMediaList(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [category]);
    const categories = ['Semua', ...Array.from(new Set(mediaList.map(item => item.category).filter(Boolean)))];
    const isYouTubeUrl = Boolean(selectedMedia?.video_url && /(?:youtube\.com|youtu\.be)/i.test(selectedMedia.video_url));
    const youtubeEmbedUrl = selectedMedia?.video_url ? getYouTubeEmbedUrl(selectedMedia.video_url) : null;
    useEffect(() => {
        if (!selectedMedia)
            return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const closeOnEscape = (event) => {
            if (event.key === 'Escape')
                setSelectedMedia(null);
        };
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [selectedMedia]);
    return (_jsxs("div", { className: "font-poppins bg-stone-50 min-h-screen pb-24", children: [_jsx(SEO, { title: "Galeri Foto & Video", description: "Dokumentasi kegiatan belajar, program sekolah, aktivitas peserta didik, dan lingkungan sekolah." }), _jsx(PageHeader, { title: "Galeri Foto & Video", subtitle: "Dokumentasi kegiatan belajar dan keseharian siswa.", badge: "Dokumentasi Sekolah", breadcrumbs: [{ label: 'Galeri' }] }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8", children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-xl border border-stone-100 flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-emerald-700" }), _jsx("span", { className: "text-xs font-bold text-stone-700", children: "Kategori Album:" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((cat) => (_jsx("button", { onClick: () => setCategory(cat), className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${category === cat
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`, children: cat }, cat))) })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: mediaList.map((item) => (_jsxs("div", { onClick: () => setSelectedMedia(item), className: "group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 cursor-pointer flex flex-col", children: [_jsxs("div", { className: "relative aspect-[4/3] overflow-hidden bg-stone-100", children: [_jsx("img", { src: item.file_url, alt: item.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }), item.media_type === 'video' && (_jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center", children: _jsx("div", { className: "w-12 h-12 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", children: _jsx(Play, { className: "w-5 h-5 ml-0.5 fill-current" }) }) })), _jsx("div", { className: "absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md", children: item.category })] }), _jsxs("div", { className: "p-5 space-y-1", children: [_jsx("h4", { className: "font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1", children: item.title }), item.caption && (_jsx("p", { className: "text-xs text-stone-500 font-normal line-clamp-2 leading-relaxed", children: item.caption }))] })] }, item.id))) }), selectedMedia && (_jsx("div", { className: "fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-5", onClick: () => setSelectedMedia(null), children: _jsxs("div", { className: "bg-white rounded-2xl max-w-6xl w-full max-h-[94vh] overflow-hidden shadow-2xl border border-white/10 relative flex flex-col md:flex-row", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setSelectedMedia(null), className: "absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors", "aria-label": "Tutup Preview", children: _jsx(X, { className: "w-5 h-5" }) }), _jsx("div", { className: "w-full md:w-[62%] h-[42vh] md:h-[88vh] max-h-[88vh] bg-stone-950 flex items-center justify-center overflow-hidden shrink-0", children: selectedMedia.media_type === 'video' && selectedMedia.video_url ? (_jsx("div", { className: "w-full h-full aspect-video", children: isYouTubeUrl ? (youtubeEmbedUrl ? (_jsx("iframe", { src: youtubeEmbedUrl, title: selectedMedia.title, className: "w-full h-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", referrerPolicy: "strict-origin-when-cross-origin", allowFullScreen: true })) : (_jsx("div", { className: "flex h-full items-center justify-center p-6 text-center text-sm text-white/80", children: "Tautan video YouTube tidak valid." }))) : (_jsx("video", { src: selectedMedia.video_url, controls: true, className: "w-full h-full object-contain" })) })) : (_jsx("img", { src: selectedMedia.file_url, alt: selectedMedia.title, className: "w-full h-full object-contain" })) }), _jsxs("div", { className: "flex-1 min-w-0 overflow-y-auto p-6 sm:p-8 space-y-4 text-left", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded", children: selectedMedia.category }), _jsx("span", { className: "text-xs text-stone-400", children: "Dokumentasi sekolah" })] }), _jsx("h3", { className: "text-lg font-bold text-stone-900", children: selectedMedia.title }), selectedMedia.caption && (_jsx("p", { className: "text-sm text-stone-600 font-normal leading-7 whitespace-pre-line", children: selectedMedia.caption }))] })] }) }))] })] }));
};
