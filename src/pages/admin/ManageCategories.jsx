import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Tags, Pencil } from 'lucide-react';
import { schoolApi } from '../../services/api';
import { toast } from '../../hooks/useToast';
const scopes = [{ value: 'news', label: 'Berita' }, { value: 'program', label: 'Program' }, { value: 'facility', label: 'Fasilitas' }];
export const ManageCategories = () => {
    const [scope, setScope] = useState('news');
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const load = async () => { setLoading(true); try {
        setItems(await schoolApi.getContentCategories(scope));
    }
    catch {
        toast.error('Kategori gagal dimuat.');
    }
    finally {
        setLoading(false);
    } };
    useEffect(() => { void load(); }, [scope]);
    const add = async (e) => { e.preventDefault(); if (!name.trim())
        return; try {
        if (editingId)
            await schoolApi.updateContentCategory(editingId, scope, { name: name.trim(), description });
        else
            await schoolApi.createContentCategory({ scope, name: name.trim(), description });
        setName('');
        setDescription('');
        setEditingId(null);
        toast.success(editingId ? 'Kategori diperbarui.' : 'Kategori ditambahkan.');
        await load();
    }
    catch (error) {
        toast.error(error?.response?.data?.message || 'Kategori gagal disimpan.');
    } };
    const edit = (item) => { setEditingId(item.id); setName(item.name); setDescription(item.description || ''); };
    const remove = async (id) => { if (!window.confirm('Hapus kategori ini?'))
        return; try {
        await schoolApi.deleteContentCategory(id, scope);
        toast.success('Kategori dihapus.');
        await load();
    }
    catch (error) {
        toast.error(error?.response?.data?.message || 'Kategori tidak dapat dihapus.');
    } };
    return _jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Kategori Konten" }), _jsx("div", { className: "flex flex-wrap gap-2", children: scopes.map(item => _jsx("button", { onClick: () => setScope(item.value), className: `rounded-xl px-4 py-2 text-sm font-semibold ${scope === item.value ? 'bg-emerald-700 text-white' : 'border border-stone-200 bg-white text-stone-600'}`, children: item.label }, item.value)) }), _jsxs("form", { onSubmit: add, className: "grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-[1fr_1.5fr_auto]", children: [_jsx("input", { required: true, value: name, onChange: e => setName(e.target.value), placeholder: "Nama kategori", className: "rounded-xl border border-stone-200 px-3 py-2.5 text-sm" }), _jsx("input", { value: description, onChange: e => setDescription(e.target.value), placeholder: "Deskripsi (opsional)", className: "rounded-xl border border-stone-200 px-3 py-2.5 text-sm" }), _jsxs("div", { className: "flex gap-2", children: [editingId && _jsx("button", { type: "button", onClick: () => { setEditingId(null); setName(""); setDescription(""); }, className: "rounded-xl border px-3 py-2.5 text-sm", children: "Batal" }), _jsxs("button", { className: "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white", children: [_jsx(Plus, { size: 16 }), editingId ? "Simpan" : "Tambah"] })] })] }), _jsx("div", { className: "overflow-hidden rounded-2xl border border-stone-200 bg-white", children: loading ? _jsx("p", { className: "p-8 text-center text-sm text-stone-500", children: "Memuat kategori\u2026" }) : items.length ? items.map(item => _jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-stone-100 p-4 last:border-0", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-stone-900", children: item.name }), item.description && _jsx("p", { className: "mt-1 text-xs text-stone-500", children: item.description })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => edit(item), "aria-label": `Edit kategori ${item.name}`, className: "rounded-lg p-2 text-stone-400 hover:bg-stone-100", children: _jsx(Pencil, { size: 16 }) }), _jsx("button", { onClick: () => void remove(item.id), "aria-label": `Hapus kategori ${item.name}`, className: "rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600", children: _jsx(Trash2, { size: 16 }) })] })] }, item.id)) : _jsxs("div", { className: "p-10 text-center text-sm text-stone-500", children: [_jsx(Tags, { className: "mx-auto mb-2", size: 22 }), "Belum ada kategori."] }) })] });
};
