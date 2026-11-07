import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useSchool } from '../../context/SchoolContext';
import { SEO } from '../../components/common/SEO';
import { ShieldCheck } from 'lucide-react';
export const Profile = () => {
    const { profile } = useSchool();
    const details = [
        { label: 'NPSN', value: profile?.npsn },
        { label: 'Jenjang Pendidikan', value: profile?.education_level },
        { label: 'Status Sekolah', value: profile?.status },
        { label: 'Akreditasi', value: profile?.accreditation },
        { label: 'Tahun Berdiri', value: profile?.founding_year },
        { label: 'Kepala Sekolah', value: profile?.headmaster_name },
        { label: 'Telepon', value: profile?.phone },
        { label: 'Email', value: profile?.email }
    ].filter(item => item.value != null && String(item.value).trim() !== '');
    return (_jsxs("div", { className: "font-['Poppins',sans-serif] bg-[#FAF8F5] text-[#2C332D] min-h-screen pb-24", children: [_jsx(SEO, { title: "Profil Sekolah", description: profile?.description || 'Profil dan identitas sekolah.' }), _jsx(PageHeader, { title: "Profil Sekolah", subtitle: "Identitas dan informasi sekolah.", badge: "Tentang Sekolah", breadcrumbs: [{ label: 'Profil Sekolah' }] }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 -mt-8 relative z-20 space-y-12", children: [(profile?.name || details.length > 0 || profile?.address) && (_jsxs("section", { className: "bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#E7E2D8]", children: [_jsxs("div", { className: "border-b border-[#EFECE6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[#2A5C40] font-bold text-xs uppercase tracking-wider", children: "Data Pokok Pendidikan" }), _jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-[#1F2621] mt-1", children: profile?.name || 'Identitas Sekolah' })] }), profile?.status && (_jsxs("div", { className: "bg-[#E8EFEA] text-[#1D4A32] border border-[#D1E0D5] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-[#2A5C40]" }), _jsx("span", { children: profile.status })] }))] }), details.length > 0 && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: details.map(item => (_jsxs("div", { className: "p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1", children: [_jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-stone-400", children: item.label }), _jsx("p", { className: "text-base font-bold text-stone-900 break-words", children: item.value })] }, item.label))) })), profile?.address && (_jsxs("div", { className: "mt-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1", children: [_jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-emerald-800", children: "Alamat Sekolah" }), _jsx("p", { className: "text-sm font-medium text-stone-800", children: profile.address })] }))] })), profile?.description && (_jsxs("section", { className: "bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-100 space-y-6", children: [_jsx("h3", { className: "text-2xl font-bold text-stone-900", children: "Tentang Sekolah" }), _jsx("div", { className: "w-16 h-1 bg-amber-400 rounded-full" }), _jsx("p", { className: "text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line", children: profile.description })] }))] })] }));
};
