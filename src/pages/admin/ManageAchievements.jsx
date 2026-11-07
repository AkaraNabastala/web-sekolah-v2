import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from '../../hooks/useToast';
export const ManageAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        student_or_team: '',
        level: 'Kabupaten',
        category: 'Akademik',
        rank: 'Juara 1',
        year: '2025',
        organizer: '',
        photo: '/demo/demo-event.svg',
        description: ''
    });
    const loadData = async () => {
        try {
            const res = await schoolApi.getAchievements();
            setAchievements(res);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({
            title: '',
            student_or_team: '',
            level: 'Kabupaten',
            category: 'Akademik',
            rank: 'Juara 1',
            year: '2025',
            organizer: '',
            photo: '/demo/demo-event.svg',
            description: ''
        });
        setModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setEditingId(item.id);
        setForm({ ...item });
        setModalOpen(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await schoolApi.updateAchievement(editingId, form);
                toast.success('Prestasi berhasil diperbarui!');
            }
            else {
                await schoolApi.createAchievement(form);
                toast.success('Prestasi baru berhasil ditambahkan!');
            }
            setModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error('Gagal menyimpan data.');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Hapus catatan prestasi ini?')) {
            try {
                await schoolApi.deleteAchievement(id);
                toast.success('Prestasi berhasil dihapus.');
                loadData();
            }
            catch (err) {
                toast.error('Gagal menghapus prestasi.');
            }
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Manajemen Prestasi Sekolah" }) }), _jsxs("button", { onClick: handleOpenCreate, className: "bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Prestasi" })] })] }), _jsx("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[10px] tracking-wider", children: [_jsx("th", { className: "py-3 px-4", children: "Nama Kejuaraan / Prestasi" }), _jsx("th", { className: "py-3 px-4", children: "Peringkat & Tahun" }), _jsx("th", { className: "py-3 px-4", children: "Peraih (Siswa / Tim)" }), _jsx("th", { className: "py-3 px-4", children: "Tingkat & Penyelenggara" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100 font-normal", children: achievements.map((item) => (_jsxs("tr", { className: "hover:bg-stone-50/50", children: [_jsxs("td", { className: "py-3 px-4", children: [_jsx("p", { className: "font-bold text-stone-900", children: item.title }), _jsx("span", { className: "text-[10px] text-stone-400", children: item.category })] }), _jsxs("td", { className: "py-3 px-4", children: [_jsx("span", { className: "bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]", children: item.rank }), _jsxs("p", { className: "text-[11px] text-stone-400 mt-0.5", children: ["Tahun ", item.year] })] }), _jsx("td", { className: "py-3 px-4 font-semibold text-emerald-800", children: item.student_or_team }), _jsxs("td", { className: "py-3 px-4", children: [_jsxs("p", { className: "font-medium text-stone-700", children: ["Tingkat ", item.level] }), _jsx("p", { className: "text-[10px] text-stone-400", children: item.organizer })] }), _jsxs("td", { className: "py-3 px-4 text-right space-x-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors", title: "Edit Data", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors", title: "Hapus Data", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, item.id))) })] }) }) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-stone-100 pb-3", children: [_jsx("h3", { className: "text-base font-bold text-stone-900", children: editingId ? 'Edit Data Prestasi' : 'Tambah Prestasi Baru' }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Kejuaraan / Prestasi *" }), _jsx("input", { type: "text", required: true, value: (form.title) ?? '', onChange: (e) => setForm({ ...form, title: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Siswa / Tim *" }), _jsx("input", { type: "text", required: true, value: (form.student_or_team) ?? '', onChange: (e) => setForm({ ...form, student_or_team: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Peringkat *" }), _jsx("input", { type: "text", required: true, value: (form.rank) ?? '', onChange: (e) => setForm({ ...form, rank: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Tingkat" }), _jsxs("select", { value: (form.level) ?? '', onChange: (e) => setForm({ ...form, level: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: [_jsx("option", { value: "Kecamatan", children: "Kecamatan" }), _jsx("option", { value: "Kabupaten", children: "Kabupaten" }), _jsx("option", { value: "Provinsi", children: "Provinsi" }), _jsx("option", { value: "Nasional", children: "Nasional" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kategori" }), _jsx("input", { type: "text", value: (form.category) ?? '', onChange: (e) => setForm({ ...form, category: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Tahun" }), _jsx("input", { type: "text", value: (form.year) ?? '', onChange: (e) => setForm({ ...form, year: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Instansi Penyelenggara" }), _jsx("input", { type: "text", value: (form.organizer) ?? '', onChange: (e) => setForm({ ...form, organizer: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "URL Foto Dokumentasi" }), _jsx("input", { type: "text", value: (form.photo) ?? '', onChange: (e) => setForm({ ...form, photo: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Keterangan Tambahan" }), _jsx("textarea", { rows: 2, value: (form.description) ?? '', onChange: (e) => setForm({ ...form, description: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100", children: "Batal" }), _jsx("button", { type: "submit", className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all", children: "Simpan Prestasi" })] })] })] }) }))] }));
};
