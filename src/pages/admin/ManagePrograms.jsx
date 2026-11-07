import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Plus, Edit, Trash2, X, Search, Clock } from 'lucide-react';
import { toast } from '../../hooks/useToast';
import { RichTextEditor } from '../../components/common/RichTextEditor';
export const ManagePrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        category: 'unggulan',
        description: '',
        photo: '/demo/demo-classroom.svg',
        schedule_info: '',
        instructor: '',
        display_order: 1,
        is_active: 1
    });
    const loadData = async () => {
        try {
            const data = await schoolApi.getAdminPrograms();
            setPrograms(data);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        loadData();
        schoolApi.getContentCategories('program').then(setCategoryOptions).catch(() => undefined);
    }, []);
    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({
            name: '',
            category: 'unggulan',
            description: '',
            photo: '/demo/demo-classroom.svg',
            schedule_info: '',
            instructor: '',
            display_order: programs.length + 1,
            is_active: 1
        });
        setModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            category: item.category || 'unggulan',
            description: item.description || '',
            photo: item.photo || '',
            schedule_info: item.schedule_info || '',
            instructor: item.instructor || '',
            display_order: item.display_order || 1,
            is_active: item.is_active ?? 1
        });
        setModalOpen(true);
    };
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploading(true);
        try {
            const res = await schoolApi.uploadFile(file);
            if (res.success) {
                setForm(prev => ({ ...prev, photo: res.fileUrl }));
                toast.success('Foto program berhasil diunggah!');
            }
        }
        catch {
            toast.error('Gagal mengunggah gambar.');
        }
        finally {
            setUploading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            toast.error('Nama program wajib diisi.');
            return;
        }
        setLoading(true);
        try {
            if (editingId) {
                await schoolApi.updateProgram(editingId, form);
                toast.success('Program berhasil diperbarui!');
            }
            else {
                await schoolApi.createProgram(form);
                toast.success('Program baru berhasil ditambahkan!');
            }
            setModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan program.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus program ini?'))
            return;
        try {
            await schoolApi.deleteProgram(id);
            toast.success('Program berhasil dihapus!');
            loadData();
        }
        catch {
            toast.error('Gagal menghapus program.');
        }
    };
    const filtered = programs.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Program & Ekstrakurikuler" }) }), _jsxs("button", { onClick: handleOpenCreate, className: "inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Program" })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-3", children: [_jsx(Search, { className: "w-4 h-4 text-stone-400" }), _jsx("input", { type: "text", value: search ?? '', onChange: (e) => setSearch(e.target.value), className: "w-full text-xs bg-transparent focus:outline-none text-stone-800" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.length === 0 ? (_jsx("div", { className: "col-span-full py-12 text-center text-stone-400 text-xs", children: "Belum ada program atau ekstrakurikuler terdaftar." })) : (filtered.map((item) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow", children: [_jsxs("div", { children: [_jsxs("div", { className: "aspect-[16/9] overflow-hidden bg-stone-100 relative", children: [_jsx("img", { src: item.photo || '/demo/demo-classroom.svg', alt: item.name, className: "w-full h-full object-cover" }), _jsx("span", { className: "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-emerald-800 backdrop-blur-sm uppercase", children: item.category })] }), _jsxs("div", { className: "p-5 space-y-2", children: [_jsx("h3", { className: "font-bold text-base text-stone-900", children: item.name }), _jsx("p", { className: "text-xs text-stone-500 line-clamp-3 leading-relaxed font-normal", children: item.description }), item.schedule_info && (_jsxs("p", { className: "text-[11px] text-emerald-700 font-medium pt-1", children: [_jsx(Clock, { className: "mr-1 inline h-3.5 w-3.5" }), item.schedule_info] })), item.instructor && (_jsxs("p", { className: "text-[11px] text-stone-400", children: ["Pembina: ", item.instructor] }))] })] }), _jsxs("div", { className: "p-4 border-t border-stone-100 flex items-center justify-between text-xs", children: [_jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`, children: item.is_active ? 'Aktif' : 'Non-Aktif' }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors", title: "Edit Program", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors", title: "Hapus Program", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] })] }, item.id)))) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-4", children: [_jsx("h3", { className: "text-lg font-bold text-stone-900", children: editingId ? 'Ubah Program' : 'Tambah Program' }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Program *" }), _jsx("input", { type: "text", required: true, value: form.name ?? '', onChange: (e) => setForm({ ...form, name: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kategori" }), _jsx("input", { type: "text", list: "program-category-options", value: form.category ?? '', onChange: (e) => setForm({ ...form, category: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" }), _jsx("datalist", { id: "program-category-options", children: categoryOptions.map(category => _jsx("option", { value: category.name ?? '' }, category.id)) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Instruktur / Pembina" }), _jsx("input", { type: "text", value: form.instructor ?? '', onChange: (e) => setForm({ ...form, instructor: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Jadwal & Waktu Pelaksanaan" }), _jsx("input", { type: "text", value: form.schedule_info ?? '', onChange: (e) => setForm({ ...form, schedule_info: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Foto Program" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "text", value: form.photo ?? '', onChange: (e) => setForm({ ...form, photo: e.target.value }), className: "flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none" }), _jsxs("label", { className: "cursor-pointer bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 transition-colors", children: [_jsx("span", { children: uploading ? '...' : 'Upload' }), _jsx("input", { type: "file", accept: "image/*", onChange: handlePhotoUpload, className: "hidden" })] })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Deskripsi Program" }), _jsx(RichTextEditor, { rows: 5, value: form.description || '', onChange: description => setForm({ ...form, description }) })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-3 border-t border-stone-100", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors", children: "Batal" }), _jsx("button", { type: "submit", disabled: loading, className: "px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-60", children: loading ? 'Menyimpan...' : 'Simpan Program' })] })] })] }) }))] }));
};
