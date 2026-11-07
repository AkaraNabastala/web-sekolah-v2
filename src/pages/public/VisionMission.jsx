import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { schoolApi } from '../../services/api';
import { SEO } from '../../components/common/SEO';
import { RichTextContent } from '../../components/common/RichTextEditor';
import { useSchool } from '../../context/SchoolContext';
import { Compass, Target, HeartHandshake, Smile, GraduationCap, ShieldCheck } from 'lucide-react';
export const VisionMission = () => {
    const [data, setData] = useState(null);
    const { settings } = useSchool();
    useEffect(() => {
        schoolApi.getVisionMission().then(setData).catch(err => console.error(err));
    }, []);
    let featureFlags = {};
    try {
        featureFlags = typeof settings?.feature_flags === 'string'
            ? JSON.parse(settings.feature_flags)
            : (settings?.feature_flags || {});
    }
    catch {
        featureFlags = {};
    }
    const isEnabled = (key) => featureFlags[key] !== false;
    const values = data?.core_values || [];
    const getCoreValueIcon = (title) => {
        const normalized = title.toLowerCase();
        if (normalized.includes('iman') || normalized.includes('taqwa'))
            return _jsx(HeartHandshake, { className: "h-6 w-6" });
        if (normalized.includes('akhlak'))
            return _jsx(Smile, { className: "h-6 w-6" });
        if (normalized.includes('akademik') || normalized.includes('intelektual'))
            return _jsx(GraduationCap, { className: "h-6 w-6" });
        return _jsx(ShieldCheck, { className: "h-6 w-6" });
    };
    return (_jsxs("div", { className: "min-h-screen bg-stone-50 pb-24 font-poppins", children: [_jsx(SEO, { title: "Visi dan Misi", description: "Visi, misi, tujuan, dan nilai utama sekolah." }), _jsx(PageHeader, { title: "Visi dan Misi", subtitle: "Arah pengembangan dan tujuan pendidikan sekolah.", badge: "Profil Sekolah", breadcrumbs: [{ label: 'Profil', href: '/profil' }, { label: 'Visi dan Misi' }] }), _jsxs("main", { className: "relative z-10 mx-auto -mt-8 max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8", children: [isEnabled('vision') && data?.vision && (_jsxs("section", { className: "relative overflow-hidden rounded-3xl bg-[var(--school-primary)] p-8 text-white shadow-xl sm:p-12", children: [_jsx(Compass, { className: "absolute -right-8 -top-8 h-56 w-56 text-white/5" }), _jsxs("div", { className: "relative max-w-4xl space-y-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-[var(--school-secondary)]", children: "Visi Sekolah" }), _jsx(RichTextContent, { value: data.vision, className: "text-2xl font-semibold leading-relaxed sm:text-4xl" }), data.vision_motto && _jsx("p", { className: "text-sm text-white/75", children: data.vision_motto })] })] })), (isEnabled('mission') || isEnabled('goals')) && (_jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [isEnabled('mission') && (data?.missions?.length ?? 0) > 0 && (_jsxs("section", { className: "rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8", children: [_jsxs("div", { className: "mb-6 flex items-center gap-3 border-b border-stone-100 pb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-[var(--school-primary)]", children: _jsx(Compass, { className: "h-5 w-5" }) }), _jsx("h3", { className: "text-xl font-semibold text-stone-900", children: "Misi" })] }), _jsx("ol", { className: "list-decimal space-y-4 pl-5 marker:font-semibold marker:text-[var(--school-primary)]", children: data?.missions.map((mission, index) => _jsx("li", { className: "pl-2 text-sm leading-7 text-stone-700", children: _jsx(RichTextContent, { value: mission }) }, index)) })] })), isEnabled('goals') && (data?.goals?.length ?? 0) > 0 && (_jsxs("section", { className: "rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-8", children: [_jsxs("div", { className: "mb-6 flex items-center gap-3 border-b border-stone-100 pb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-[var(--school-primary)]", children: _jsx(Target, { className: "h-5 w-5" }) }), _jsx("h3", { className: "text-xl font-semibold text-stone-900", children: "Tujuan Sekolah" })] }), _jsx("ol", { className: "list-decimal space-y-4 pl-5 marker:font-semibold marker:text-[var(--school-primary)]", children: data?.goals?.map((goal, index) => _jsx("li", { className: "pl-2 text-sm leading-7 text-stone-700", children: _jsx(RichTextContent, { value: goal }) }, index)) })] }))] })), isEnabled('coreValues') && values.length > 0 && (_jsxs("section", { className: "rounded-3xl border border-stone-100 bg-white p-6 shadow-sm sm:p-10", children: [_jsx("h3", { className: "mb-6 text-xl font-semibold text-stone-900", children: "Nilai Utama Sekolah" }), _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: values.map((value, index) => (_jsxs("article", { className: "rounded-2xl border border-stone-200 bg-stone-50 p-5", children: [_jsx("div", { className: "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--school-primary)] shadow-sm", children: getCoreValueIcon(value.title) }), _jsx("h4", { className: "font-semibold text-stone-900", children: value.title }), _jsx("p", { className: "mt-2 text-sm leading-6 text-stone-600", children: value.desc })] }, index))) })] })), !data && _jsx("p", { className: "rounded-2xl bg-white p-8 text-center text-sm text-stone-500", children: "Memuat informasi visi dan misi..." })] })] }));
};
