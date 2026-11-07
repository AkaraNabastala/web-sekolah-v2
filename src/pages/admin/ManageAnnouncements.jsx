import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Send, FileText } from 'lucide-react';
import { schoolApi } from '../../services/api';
import { toast } from '../../hooks/useToast';
import { RichTextEditor } from '../../components/common/RichTextEditor';
const emptyForm = { title: '', slug: '', summary: '', content: '', category: 'Umum', cover_image: '', status: 'draft' };
export const ManageAnnouncements = () => {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const load = async () => {
        try {
            setItems(await schoolApi.getAdminAnnouncements());
        }
        catch {
            toast.error('Pengumuman gagal dimuat.');
        }
    };
    useEffect(() => { void load(); }, []);
    const startCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
    const startEdit = (item) => {
        setEditing(item.id);
        setForm({ title: item.title, slug: item.slug, summary: item.summary || '', content: item.content, category: item.category || 'Umum', cover_image: item.cover_image || '', status: item.status });
        setOpen(true);
    };
    const save = async (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.content.trim())
            return toast.error('Judul dan isi pengumuman wajib diisi.');
        setSaving(true);
        try {
            if (editing)
                await schoolApi.updateAnnouncement(editing, form);
            else
                await schoolApi.createAnnouncement(form);
            toast.success('Pengumuman berhasil disimpan.');
            setOpen(false);
            await load();
        }
        catch (error) {
            toast.error(error?.response?.data?.message || 'Pengumuman gagal disimpan.');
        }
        finally {
            setSaving(false);
        }
    };
    const remove = async (id) => {
        if (!window.confirm('Hapus pengumuman ini?'))
            return;
        try {
            await schoolApi.deleteAnnouncement(id);
            toast.success('Pengumuman dihapus.');
            await load();
        }
        catch {
            toast.error('Pengumuman gagal dihapus.');
        }
    };
    const filtered = items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
    return _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Pengumuman" }), _jsxs("button", { onClick: startCreate, className: "inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white", children: [_jsx(Plus, { size: 16 }), " Buat Pengumuman"] })] }), _jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5", children: [_jsx(Search, { size: 16, className: "text-stone-400" }), _jsx("input", { "aria-label": "Cari pengumuman", className: "w-full text-sm outline-none", value: search, onChange: e => setSearch(e.target.value), placeholder: "Cari pengumuman" })] }), _jsx("div", { className: "overflow-hidden rounded-2xl border border-stone-200 bg-white", children: filtered.length ? filtered.map(item => _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-4 last:border-0", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-semibold text-stone-900", children: item.title }), _jsxs("div", { className: "mt-1 flex gap-2 text-xs text-stone-500", children: [_jsx("span", { children: item.category || 'Umum' }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: item.status === 'published' ? 'Terbit' : item.status === 'draft' ? 'Draf' : 'Arsip' })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => startEdit(item), className: "rounded-lg border p-2 text-stone-600 hover:bg-stone-50", "aria-label": "Edit", children: _jsx(Pencil, { size: 16 }) }), _jsx("button", { onClick: () => void remove(item.id), className: "rounded-lg border p-2 text-red-600 hover:bg-red-50", "aria-label": "Hapus", children: _jsx(Trash2, { size: 16 }) })] })] }, item.id)) : _jsxs("div", { className: "p-10 text-center text-sm text-stone-500", children: [_jsx(FileText, { className: "mx-auto mb-2", size: 24 }), "Belum ada pengumuman."] }) }), open && _jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4", children: _jsxs("form", { onSubmit: save, className: "my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold", children: editing ? 'Edit Pengumuman' : 'Pengumuman Baru' }), _jsx("button", { type: "button", onClick: () => setOpen(false), className: "text-stone-500", children: "Tutup" })] }), _jsxs("label", { className: "block space-y-1 text-sm font-medium", children: ["Judul", _jsx("input", { required: true, className: "w-full rounded-lg border p-3 font-normal", value: form.title, onChange: e => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }) })] }), _jsxs("label", { className: "block space-y-1 text-sm font-medium", children: ["Ringkasan", _jsx("textarea", { rows: 2, className: "w-full rounded-lg border p-3 font-normal", value: form.summary, onChange: e => setForm({ ...form, summary: e.target.value }) })] }), _jsxs("label", { className: "block space-y-1 text-sm font-medium", children: ["Isi Pengumuman", _jsx(RichTextEditor, { rows: 8, value: form.content, onChange: content => setForm({ ...form, content }) })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [_jsxs("label", { className: "block space-y-1 text-sm font-medium", children: ["Kategori", _jsx("input", { className: "w-full rounded-lg border p-3 font-normal", value: form.category, onChange: e => setForm({ ...form, category: e.target.value }) })] }), _jsxs("label", { className: "block space-y-1 text-sm font-medium", children: ["Status", _jsxs("select", { className: "w-full rounded-lg border p-3 font-normal", value: form.status, onChange: e => setForm({ ...form, status: e.target.value }), children: [_jsx("option", { value: "draft", children: "Simpan sebagai draf" }), _jsx("option", { value: "published", children: "Terbitkan" }), _jsx("option", { value: "archived", children: "Arsip" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setOpen(false), className: "rounded-xl border px-4 py-2 text-sm", children: "Batal" }), _jsxs("button", { disabled: saving, className: "inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50", children: [_jsx(Send, { size: 15 }), saving ? 'Menyimpan…' : 'Simpan'] })] })] }) })] });
};
