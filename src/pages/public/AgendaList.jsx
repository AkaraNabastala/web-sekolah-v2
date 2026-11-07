import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { SEO } from '../../components/common/SEO';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { RichTextContent } from '../../components/common/RichTextEditor';
import { schoolApi } from '../../services/api';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';
export const AgendaList = () => {
    const { pathname } = useLocation();
    const showPastActivities = pathname === '/kegiatan';
    const pageTitle = showPastActivities ? 'Kegiatan Sekolah' : 'Agenda Kegiatan';
    const [agendas, setAgendas] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    useEffect(() => {
        schoolApi.getAgendas()
            .then(res => setAgendas(res))
            .catch(error => {
            console.error('Gagal memuat agenda kegiatan:', error);
            setLoadError('Informasi kegiatan belum dapat dimuat. Silakan coba beberapa saat lagi.');
            setAgendas([]);
        })
            .finally(() => setLoading(false));
    }, []);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filtered = agendas.filter(a => {
        const isPast = a.event_date < today;
        const matchesPeriod = showPastActivities ? isPast : !isPast;
        const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
            a.location?.toLowerCase().includes(search.toLowerCase()) ||
            a.description?.toLowerCase().includes(search.toLowerCase());
        return matchesPeriod && matchesSearch;
    });
    return (_jsxs("div", { className: "font-['Poppins',sans-serif] bg-[#FAF8F5] min-h-screen text-[#2C332D]", children: [_jsx(SEO, { title: pageTitle, description: showPastActivities ? "Dokumentasi kegiatan sekolah yang telah berlangsung." : "Jadwal kegiatan dan agenda sekolah yang akan datang." }), _jsx(PageHeader, { title: pageTitle, subtitle: showPastActivities ? "Catatan kegiatan sekolah yang telah dilaksanakan." : "Jadwal kegiatan dan agenda sekolah yang akan datang.", breadcrumbs: [
                    { label: 'Beranda', href: '/' },
                    { label: 'Informasi' },
                    { label: pageTitle, href: pathname }
                ] }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 space-y-10", children: [_jsx(ScrollReveal, { animation: "fade-up", className: "max-w-xl mx-auto", children: _jsxs("div", { className: "bg-white rounded-2xl p-3 border border-[#ECE7DD] shadow-sm flex items-center gap-3", children: [_jsx(Search, { className: "w-5 h-5 text-[#2A5C40] ml-2" }), _jsx("input", { type: "text", placeholder: "Cari agenda kegiatan...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full text-sm bg-transparent focus:outline-none text-[#1F2621]" })] }) }), _jsx("div", { className: "space-y-6 max-w-4xl mx-auto", children: loading ? (_jsx("div", { className: "py-16 text-center text-sm text-[#7A827B]", children: "Memuat informasi kegiatan..." })) : loadError ? (_jsx("div", { role: "alert", className: "bg-white rounded-3xl p-8 text-center border border-amber-200 text-sm text-amber-800", children: loadError })) : filtered.length === 0 ? (_jsxs("div", { className: "bg-white rounded-3xl p-12 text-center border border-[#ECE7DD] space-y-3", children: [_jsx(Calendar, { className: "w-12 h-12 text-[#2A5C40]/40 mx-auto" }), _jsx("p", { className: "text-base font-bold text-[#1F2621]", children: showPastActivities ? 'Belum Ada Kegiatan Terdokumentasi' : 'Belum Ada Agenda Terjadwal' }), _jsx("p", { className: "text-xs text-[#5C645D]", children: showPastActivities ? 'Dokumentasi kegiatan akan ditampilkan di halaman ini setelah dipublikasikan.' : 'Informasi agenda berikutnya akan diumumkan di halaman ini.' })] })) : (filtered.map((item, idx) => {
                            const isPast = item.event_date < today;
                            return (_jsxs(ScrollReveal, { animation: "fade-up", delay: idx * 100, className: "bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE7DD] shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6", children: [_jsxs("div", { className: "flex items-start gap-5", children: [_jsxs("div", { className: "w-16 h-16 rounded-2xl bg-[#E8EFEA] text-[#1D4A32] flex flex-col items-center justify-center shrink-0 border border-[#D5E0D7]", children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#2A5C40]", children: new Date(item.event_date).toLocaleDateString('id-ID', { month: 'short' }) }), _jsx("span", { className: "text-xl font-bold text-[#1F2621]", children: new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric' }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPast ? 'bg-[#ECE7DD] text-[#7A827B]' : 'bg-[#E8EFEA] text-[#1D4A32]'}`, children: isPast ? 'Selesai' : 'Mendatang' }), _jsx("span", { className: "text-xs text-[#7A827B]", children: item.organizer || 'Panitia Sekolah' })] }), _jsx("h3", { className: "text-lg font-bold text-[#1F2621]", children: item.title }), item.description && (_jsx(RichTextContent, { value: item.description, className: "text-xs text-[#5C645D] leading-relaxed max-w-xl font-normal" }))] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row md:flex-col gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-[#F0EBE1] shrink-0 text-xs text-[#5C645D]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-[#2A5C40]" }), _jsxs("span", { children: [item.start_time, " - ", item.end_time] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-[#2A5C40]" }), _jsx("span", { children: item.location })] })] })] }, item.id));
                        })) })] })] }));
};
export default AgendaList;
