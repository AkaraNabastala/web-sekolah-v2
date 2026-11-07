import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, Search, X } from 'lucide-react';
import { ADMISSION_LABEL } from '../../config/admissions';
import { schoolApi } from '../../services/api';
import { toast } from '../../hooks/useToast';
const statusLabels = {
    received: 'Masuk',
    verified: 'Terverifikasi',
    accepted: 'Lulus seleksi',
    rejected: 'Tidak diterima'
};
const statusStyles = {
    received: 'bg-blue-50 text-blue-700',
    verified: 'bg-amber-50 text-amber-700',
    accepted: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700'
};
const parseDocuments = (value) => {
    if (!value)
        return {};
    if (typeof value !== 'string')
        return value;
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    }
    catch {
        return {};
    }
};
const formatDate = (value) => {
    if (!value)
        return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};
export const ManageAdmissionApplications = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        try {
            setItems(await schoolApi.getAdmissionApplications());
        }
        catch {
            toast.error('Data pendaftar gagal dimuat.');
        }
    };
    useEffect(() => {
        void load();
    }, []);
    const filtered = useMemo(() => items.filter(item => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || [
            item.candidate_name,
            item.application_code,
            item.parent_name,
            item.origin_school,
            item.parent_phone
        ].some(value => String(value || '').toLowerCase().includes(query));
        return matchesSearch && (statusFilter === 'all' || item.status === statusFilter);
    }), [items, search, statusFilter]);
    const save = async () => {
        if (!selected)
            return;
        setSaving(true);
        try {
            await schoolApi.updateAdmissionApplication(selected.id, {
                status: selected.status,
                admin_notes: selected.admin_notes || ''
            });
            toast.success('Pemeriksaan pendaftaran diperbarui.');
            setSelected(null);
            await load();
        }
        catch {
            toast.error('Perubahan gagal disimpan.');
        }
        finally {
            setSaving(false);
        }
    };
    const exportCsv = () => {
        const fields = [
            'application_code', 'candidate_name', 'national_id', 'birth_place', 'birth_date',
            'gender', 'origin_school', 'parent_name', 'parent_phone', 'address',
            'program', 'status', 'submitted_at', 'admin_notes'
        ];
        const quote = (value) => {
            let raw = String(value ?? '');
            if (/^[=+\-@]/.test(raw))
                raw = `'${raw}`;
            const q = String.fromCharCode(34);
            return q + raw.split(q).join(q + q) + q;
        };
        const csv = [
            fields.join(','),
            ...filtered.map(item => fields.map(field => quote(item[field])).join(','))
        ].join(String.fromCharCode(13, 10));
        const blob = new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data-pendaftar.csv';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("h1", { className: "text-2xl font-bold text-stone-900", children: ["Pendaftar ", ADMISSION_LABEL] }), _jsxs("button", { onClick: exportCsv, className: "inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700", children: [_jsx(Download, { size: 15 }), " Ekspor CSV"] })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsxs("label", { className: "flex flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5", children: [_jsx(Search, { size: 16, className: "text-stone-400" }), _jsx("input", { "aria-label": "Cari pendaftar", className: "w-full text-sm outline-none", placeholder: "Cari nama, nomor, sekolah, atau kontak", value: (search) ?? '', onChange: event => setSearch(event.target.value) })] }), _jsxs("select", { "aria-label": "Filter status pendaftaran", className: "rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm", value: (statusFilter) ?? '', onChange: event => setStatusFilter(event.target.value), children: [_jsx("option", { value: "all", children: "Semua status" }), Object.entries(statusLabels).map(([value, label]) => _jsx("option", { value: (value) ?? '', children: label }, value))] })] }), _jsxs("div", { className: "overflow-x-auto rounded-2xl border border-stone-200 bg-white", children: [_jsxs("div", { className: "border-b border-stone-100 px-4 py-3 text-xs text-stone-500", children: [filtered.length, " dari ", items.length, " pendaftar"] }), _jsxs("table", { className: "w-full min-w-[760px] text-left text-sm", children: [_jsx("thead", { className: "bg-stone-50 text-xs uppercase text-stone-500", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4", children: "Nomor / Calon Siswa" }), _jsx("th", { className: "p-4", children: "Asal Sekolah" }), _jsx("th", { className: "p-4", children: "Orang Tua" }), _jsx("th", { className: "p-4", children: "Tanggal Masuk" }), _jsx("th", { className: "p-4", children: "Status" }), _jsx("th", { className: "p-4", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100", children: filtered.map(item => (_jsxs("tr", { children: [_jsxs("td", { className: "p-4", children: [_jsx("div", { className: "font-semibold text-stone-900", children: item.candidate_name }), _jsx("div", { className: "text-xs text-stone-500", children: item.application_code })] }), _jsx("td", { className: "p-4", children: item.origin_school || '-' }), _jsxs("td", { className: "p-4", children: [_jsx("div", { children: item.parent_name || '-' }), _jsx("div", { className: "text-xs text-stone-500", children: item.parent_phone || '-' })] }), _jsx("td", { className: "p-4 whitespace-nowrap", children: formatDate(item.submitted_at) }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status] || 'bg-stone-100 text-stone-600'}`, children: statusLabels[item.status] || item.status }) }), _jsx("td", { className: "p-4", children: _jsx("button", { onClick: () => setSelected({ ...item }), className: "rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50", children: "Periksa" }) })] }, item.id))) })] }), !filtered.length && _jsx("div", { className: "p-10 text-center text-sm text-stone-500", children: "Tidak ada data pendaftaran yang sesuai." })] }), selected && (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4", onMouseDown: event => { if (event.target === event.currentTarget)
                    setSelected(null); }, children: _jsxs("section", { role: "dialog", "aria-modal": "true", "aria-labelledby": "application-dialog-title", className: "my-6 w-full max-w-3xl space-y-5 rounded-2xl bg-white p-5 shadow-xl sm:p-7", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { id: "application-dialog-title", className: "text-lg font-bold text-stone-900", children: "Pemeriksaan Pendaftaran" }), _jsx("p", { className: "mt-1 text-xs text-stone-500", children: selected.application_code })] }), _jsx("button", { onClick: () => setSelected(null), "aria-label": "Tutup detail pendaftar", className: "rounded-lg p-2 text-stone-500 hover:bg-stone-100", children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { className: "grid gap-3 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-2", children: [_jsxs("p", { children: [_jsx("b", { children: "Nama calon siswa:" }), " ", selected.candidate_name] }), _jsxs("p", { children: [_jsx("b", { children: "NIK:" }), " ", selected.national_id || '-'] }), _jsxs("p", { children: [_jsx("b", { children: "Tempat, tanggal lahir:" }), " ", [selected.birth_place, formatDate(selected.birth_date)].filter(Boolean).join(', ') || '-'] }), _jsxs("p", { children: [_jsx("b", { children: "Jenis kelamin:" }), " ", selected.gender === 'L' ? 'Laki-laki' : selected.gender === 'P' ? 'Perempuan' : '-'] }), _jsxs("p", { children: [_jsx("b", { children: "Asal sekolah:" }), " ", selected.origin_school] }), _jsxs("p", { children: [_jsx("b", { children: "Program:" }), " ", selected.program || 'Reguler'] }), _jsxs("p", { children: [_jsx("b", { children: "Orang tua/wali:" }), " ", selected.parent_name] }), _jsxs("p", { children: [_jsx("b", { children: "Nomor kontak:" }), " ", selected.parent_phone] }), _jsxs("p", { className: "sm:col-span-2", children: [_jsx("b", { children: "Alamat:" }), " ", selected.address || '-'] }), _jsxs("p", { className: "sm:col-span-2", children: [_jsx("b", { children: "Catatan pendaftar:" }), " ", selected.notes || '-'] })] }), _jsxs("div", { children: [_jsx("h3", { className: "mb-2 text-sm font-semibold text-stone-900", children: "Dokumen pendukung" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [Object.entries(parseDocuments(selected.documents)).map(([name, filename]) => (_jsxs("a", { href: `/api/admin/admission-applications/${selected.id}/documents/${encodeURIComponent(filename)}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50", children: [_jsx(FileText, { size: 14 }), name, _jsx(ExternalLink, { size: 12 })] }, name))), !Object.keys(parseDocuments(selected.documents)).length && _jsx("p", { className: "text-xs text-stone-500", children: "Tidak ada dokumen yang diunggah." })] })] }), _jsxs("label", { className: "block text-sm font-semibold text-stone-800", children: ["Status seleksi", _jsx("select", { className: "mt-1.5 w-full rounded-lg border border-stone-200 p-3 font-normal", value: (selected.status) ?? '', onChange: event => setSelected({ ...selected, status: event.target.value }), children: Object.entries(statusLabels).map(([value, label]) => _jsx("option", { value: (value) ?? '', children: label }, value)) })] }), _jsxs("label", { className: "block text-sm font-semibold text-stone-800", children: ["Catatan panitia", _jsx("textarea", { rows: 3, maxLength: 5000, className: "mt-1.5 w-full rounded-lg border border-stone-200 p-3 font-normal", value: (selected.admin_notes || '') ?? '', onChange: event => setSelected({ ...selected, admin_notes: event.target.value }) })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setSelected(null), className: "rounded-xl border border-stone-200 px-4 py-2 text-sm", children: "Batal" }), _jsx("button", { disabled: saving, onClick: () => void save(), className: "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50", children: saving ? 'Menyimpan…' : 'Simpan Pemeriksaan' })] })] }) }))] }));
};
