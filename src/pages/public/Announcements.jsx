import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { SEO } from '../../components/common/SEO';
import { RichTextContent } from '../../components/common/RichTextEditor';
import { schoolApi } from '../../services/api';
import { CalendarDays, Bell } from 'lucide-react';
export const Announcements = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { schoolApi.getAnnouncements().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
    return _jsxs("div", { className: "min-h-screen bg-stone-50", children: [_jsx(SEO, { title: "Pengumuman Sekolah", description: "Informasi dan pengumuman sekolah yang dapat dikelola melalui panel admin." }), _jsx(PageHeader, { title: "Pengumuman", subtitle: "Informasi resmi dari sekolah.", breadcrumbs: [{ label: 'Beranda', href: '/' }, { label: 'Pengumuman' }] }), _jsx("section", { className: "mx-auto max-w-5xl space-y-4 px-4 py-12 sm:px-6", children: loading ? _jsx("p", { className: "py-12 text-center text-sm text-stone-500", children: "Memuat pengumuman\u2026" }) : items.length ? items.map(item => _jsxs("article", { className: "rounded-2xl border border-stone-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-3 flex flex-wrap items-center gap-2 text-xs text-emerald-800", children: [_jsx(Bell, { size: 14 }), _jsx("span", { children: item.category || 'Umum' }), item.published_at && _jsxs(_Fragment, { children: [_jsx("span", { children: "\u00B7" }), _jsx(CalendarDays, { size: 13 }), _jsx("time", { children: new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) })] })] }), _jsx("h2", { className: "text-xl font-bold text-stone-900", children: item.title }), item.summary && _jsx("p", { className: "mt-2 text-sm text-stone-600", children: item.summary }), _jsx(RichTextContent, { value: item.content, className: "mt-4 text-sm leading-7 text-stone-700" })] }, item.id)) : _jsx("div", { className: "rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm text-stone-500", children: "Belum ada pengumuman yang diterbitkan." }) })] });
};
