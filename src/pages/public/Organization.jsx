import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { schoolApi } from '../../services/api';
import { SEO } from '../../components/common/SEO';
import { Users } from 'lucide-react';
const OrganizationNode = ({ member, members, depth = 0 }) => {
    const children = members
        .filter(item => item.parent_id === member.id)
        .sort((a, b) => a.display_order - b.display_order);
    return (_jsxs("div", { className: "flex min-w-0 flex-col items-center", children: [_jsxs("article", { className: `w-full max-w-sm rounded-2xl border p-5 text-center shadow-sm transition-shadow hover:shadow-md ${depth === 0 ? 'border-[var(--school-secondary)] bg-white' : 'border-stone-200 bg-stone-50'}`, children: [member.photo && (_jsx("img", { src: member.photo, alt: member.name, className: "mx-auto mb-3 h-20 w-20 rounded-full border-2 border-white object-cover shadow-sm" })), _jsx("p", { className: "text-xs font-semibold text-[var(--school-primary)]", children: member.position }), _jsx("h3", { className: "mt-1 text-sm font-bold text-stone-900", children: member.name }), member.nip && member.nip !== '-' && _jsxs("p", { className: "mt-1 text-[11px] text-stone-400", children: ["NIP: ", member.nip] }), member.description && _jsx("p", { className: "mt-2 text-xs leading-relaxed text-stone-500", children: member.description })] }), children.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-6 w-px bg-stone-300", "aria-hidden": "true" }), _jsx("div", { className: "grid w-full grid-cols-1 justify-items-center gap-4 border-t border-stone-200 pt-5 sm:grid-cols-2 xl:grid-cols-3", children: children.map(child => _jsx(OrganizationNode, { member: child, members: members, depth: depth + 1 }, child.id)) })] }))] }));
};
export const Organization = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        schoolApi.getOrganization()
            .then(res => setMembers(res))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);
    const hasExplicitHierarchy = members.some(member => member.parent_id != null);
    const legacyCommittee = members.find(member => member.level === 1);
    const legacyPrincipal = members.find(member => member.level === 2);
    const hierarchy = hasExplicitHierarchy
        ? members
        : members.map(member => ({
            ...member,
            parent_id: member.level === 2 ? (legacyCommittee?.id ?? null) : member.level >= 3 ? (legacyPrincipal?.id ?? legacyCommittee?.id ?? null) : null
        }));
    const roots = hierarchy.filter(member => member.parent_id == null).sort((a, b) => a.display_order - b.display_order);
    return (_jsxs("div", { className: "min-h-screen bg-stone-50 pb-24 font-poppins", children: [_jsx(SEO, { title: "Struktur Organisasi", description: "Susunan jabatan dan hubungan kerja di lingkungan sekolah." }), _jsx(PageHeader, { title: "Struktur Organisasi", subtitle: "Susunan kepemimpinan dan unit kerja sekolah.", badge: "Tata Kelola", breadcrumbs: [{ label: 'Profil', href: '/profil' }, { label: 'Struktur Organisasi' }] }), _jsx("main", { className: "relative z-10 mx-auto -mt-8 max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8", children: _jsxs("section", { className: "rounded-3xl border border-stone-100 bg-white p-5 shadow-xl sm:p-10", children: [_jsxs("div", { className: "mx-auto mb-8 max-w-xl text-center", children: [_jsx("div", { className: "mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-[var(--school-primary)]", children: _jsx(Users, { className: "h-5 w-5" }) }), _jsx("h2", { className: "text-xl font-bold text-stone-900 sm:text-2xl", children: "Bagan Organisasi Sekolah" })] }), loading ? (_jsx("p", { className: "py-12 text-center text-sm text-stone-500", children: "Memuat struktur organisasi..." })) : roots.length ? (_jsx("div", { className: "space-y-8", children: roots.map(root => _jsx(OrganizationNode, { member: root, members: hierarchy }, root.id)) })) : (_jsx("p", { className: "py-12 text-center text-sm text-stone-500", children: "Struktur organisasi belum tersedia." }))] }) })] }));
};
