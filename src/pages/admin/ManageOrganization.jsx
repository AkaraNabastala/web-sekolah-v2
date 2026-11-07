import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { toast } from '../../hooks/useToast';
export const ManageOrganization = () => {
    const [members, setMembers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        position: '',
        name: '',
        nip: '-',
        photo: '/demo/demo-person.svg',
        level: 1,
        parent_id: null,
        display_order: 1,
        description: ''
    });
    const loadData = async () => {
        try {
            const res = await schoolApi.getOrganization();
            setMembers(res);
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
            position: '',
            name: '',
            nip: '-',
            photo: '/demo/demo-person.svg',
            level: 1,
            parent_id: null,
            display_order: members.length + 1,
            description: ''
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
                toast.success('Foto berhasil diunggah!');
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
                await schoolApi.updateOrgMember(editingId, form);
                toast.success('Anggota struktur berhasil diperbarui!');
            }
            else {
                await schoolApi.createOrgMember(form);
                toast.success('Anggota baru berhasil ditambahkan!');
            }
            setModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error('Gagal menyimpan data.');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus pejabat dari bagan organisasi ini?')) {
            try {
                await schoolApi.deleteOrgMember(id);
                toast.success('Data berhasil dihapus.');
                loadData();
            }
            catch (err) {
                toast.error('Gagal menghapus data.');
            }
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Manajemen Struktur Organisasi" }) }), _jsxs("button", { onClick: handleOpenCreate, className: "bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Anggota" })] })] }), _jsx("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[10px] tracking-wider", children: [_jsx("th", { className: "py-3 px-4", children: "Urutan & Posisi" }), _jsx("th", { className: "py-3 px-4", children: "Nama Lengkap & NIP" }), _jsx("th", { className: "py-3 px-4", children: "Atasan" }), _jsx("th", { className: "py-3 px-4", children: "Tugas / Deskripsi Singkat" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100 font-normal", children: members.map((item) => (_jsxs("tr", { className: "hover:bg-stone-50/50", children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0", children: _jsx("img", { src: item.photo || '', alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-emerald-800 text-xs", children: item.position }), _jsxs("p", { className: "text-[10px] text-stone-400", children: ["Order: ", item.display_order] })] })] }) }), _jsxs("td", { className: "py-3 px-4", children: [_jsx("p", { className: "font-bold text-stone-900", children: item.name }), _jsxs("p", { className: "text-[10px] text-stone-400 font-mono", children: ["NIP: ", item.nip || '-'] })] }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "text-stone-600 text-xs", children: members.find(member => member.id === item.parent_id)?.position || 'Pimpinan tertinggi' }) }), _jsx("td", { className: "py-3 px-4 text-stone-500 max-w-xs truncate", children: item.description || '-' }), _jsxs("td", { className: "py-3 px-4 text-right space-x-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors", title: "Edit Data", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors", title: "Hapus Data", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, item.id))) })] }) }) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-stone-100 pb-3", children: [_jsx("h3", { className: "text-base font-bold text-stone-900", children: editingId ? 'Edit Anggota Struktur' : 'Tambah Anggota Struktur' }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Jabatan Struktur *" }), _jsx("input", { type: "text", required: true, value: (form.position) ?? '', onChange: (e) => setForm({ ...form, position: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Pejabat & Gelar *" }), _jsx("input", { type: "text", required: true, value: (form.name) ?? '', onChange: (e) => setForm({ ...form, name: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "NIP (Opsional)" }), _jsx("input", { type: "text", value: (form.nip || '') ?? '', onChange: (e) => setForm({ ...form, nip: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Atasan / Induk Jabatan" }), _jsxs("select", { value: (form.parent_id ?? '') ?? '', onChange: (e) => setForm({ ...form, parent_id: e.target.value ? Number(e.target.value) : null }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: [_jsx("option", { value: "", children: "Tidak memiliki atasan" }), members.filter(member => member.id !== editingId).map(member => _jsxs("option", { value: (member.id) ?? '', children: [member.position, " \u2014 ", member.name] }, member.id))] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Foto Anggota (URL atau Upload)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: (form.photo) ?? '', onChange: (e) => setForm({ ...form, photo: e.target.value }), className: "flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0", children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: uploading ? '...' : 'Upload' }), _jsx("input", { type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden" })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Uraian Tugas / Deskripsi Singkat" }), _jsx("textarea", { rows: 2, value: (form.description) ?? '', onChange: (e) => setForm({ ...form, description: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100", children: "Batal" }), _jsx("button", { type: "submit", className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all", children: "Simpan Data" })] })] })] }) }))] }));
};
