import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { toast } from '../../hooks/useToast';
import { RichTextEditor } from '../../components/common/RichTextEditor';
export const ManageFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        category: 'Ruang Belajar',
        description: '',
        photo: '/demo/demo-classroom.svg',
        capacity: '32 Siswa',
        condition_status: 'Sangat Baik',
        display_order: 1
    });
    const loadData = async () => {
        try {
            const res = await schoolApi.getFacilities();
            setFacilities(res);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        loadData();
        schoolApi.getContentCategories('facility').then(setCategoryOptions).catch(() => undefined);
    }, []);
    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({
            name: '',
            category: 'Ruang Belajar',
            description: '',
            photo: '/demo/demo-classroom.svg',
            capacity: '32 Siswa',
            condition_status: 'Sangat Baik',
            display_order: facilities.length + 1
        });
        setModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setEditingId(item.id);
        setForm({ ...item });
        setModalOpen(true);
    };
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploading(true);
        try {
            const res = await schoolApi.uploadFile(file);
            if (res.success) {
                setForm(prev => ({ ...prev, photo: res.fileUrl }));
                toast.success('Foto fasilitas berhasil diunggah!');
            }
        }
        catch (err) {
            toast.error('Gagal mengunggah foto.');
        }
        finally {
            setUploading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await schoolApi.updateFacility(editingId, form);
                toast.success('Fasilitas berhasil diperbarui!');
            }
            else {
                await schoolApi.createFacility(form);
                toast.success('Fasilitas baru berhasil ditambahkan!');
            }
            setModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error('Gagal menyimpan data fasilitas.');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus fasilitas ini?')) {
            try {
                await schoolApi.deleteFacility(id);
                toast.success('Fasilitas berhasil dihapus.');
                loadData();
            }
            catch (err) {
                toast.error('Gagal menghapus fasilitas.');
            }
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Manajemen Sarana & Fasilitas" }) }), _jsxs("button", { onClick: handleOpenCreate, className: "bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Fasilitas" })] })] }), _jsx("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[10px] tracking-wider", children: [_jsx("th", { className: "py-3 px-4", children: "Foto & Nama Fasilitas" }), _jsx("th", { className: "py-3 px-4", children: "Kategori" }), _jsx("th", { className: "py-3 px-4", children: "Kapasitas" }), _jsx("th", { className: "py-3 px-4", children: "Kondisi" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100 font-normal", children: facilities.map((item) => (_jsxs("tr", { className: "hover:bg-stone-50/50", children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-14 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0", children: _jsx("img", { src: item.photo, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-stone-900", children: item.name }), _jsx("p", { className: "text-[10px] text-stone-400 line-clamp-1 max-w-xs", children: item.description })] })] }) }), _jsx("td", { className: "py-3 px-4 font-semibold text-emerald-800", children: item.category }), _jsx("td", { className: "py-3 px-4 text-stone-600", children: item.capacity || '-' }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded text-[10px]", children: item.condition_status }) }), _jsxs("td", { className: "py-3 px-4 text-right space-x-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors", title: "Edit Data", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors", title: "Hapus Data", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, item.id))) })] }) }) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-stone-100 pb-3", children: [_jsx("h3", { className: "text-base font-bold text-stone-900", children: editingId ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru' }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Sarana / Ruangan *" }), _jsx("input", { type: "text", required: true, value: (form.name) ?? '', onChange: (e) => setForm({ ...form, name: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kategori" }), _jsx("input", { type: "text", list: "facility-category-options", value: (form.category || '') ?? '', onChange: (e) => setForm({ ...form, category: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsx("datalist", { id: "facility-category-options", children: categoryOptions.map(category => _jsx("option", { value: (category.name) ?? '' }, category.id)) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kapasitas" }), _jsx("input", { type: "text", value: (form.capacity) ?? '', onChange: (e) => setForm({ ...form, capacity: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kondisi Fisik" }), _jsxs("select", { value: (form.condition_status) ?? '', onChange: (e) => setForm({ ...form, condition_status: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: [_jsx("option", { value: "Sangat Baik", children: "Sangat Baik" }), _jsx("option", { value: "Baik", children: "Baik" }), _jsx("option", { value: "Perlu Perbaikan Ringan", children: "Perlu Perbaikan Ringan" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Foto Fasilitas (URL atau Upload) *" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", required: true, value: (form.photo) ?? '', onChange: (e) => setForm({ ...form, photo: e.target.value }), className: "flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0", children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: uploading ? '...' : 'Upload' }), _jsx("input", { type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden" })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Uraian / Spesifikasi" }), _jsx(RichTextEditor, { rows: 5, value: (form.description || '') ?? '', onChange: description => setForm({ ...form, description }) })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100", children: "Batal" }), _jsx("button", { type: "submit", className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all", children: "Simpan Fasilitas" })] })] })] }) }))] }));
};
