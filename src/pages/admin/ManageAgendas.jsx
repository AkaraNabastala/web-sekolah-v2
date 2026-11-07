import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, X, Search } from 'lucide-react';
import { toast } from '../../hooks/useToast';
import { RichTextEditor } from '../../components/common/RichTextEditor';
export const ManageAgendas = () => {
    const [agendas, setAgendas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '11:30',
        location: 'Lokasi kegiatan',
        organizer: 'Panitia Sekolah',
        is_published: 1
    });
    const loadData = async () => {
        try {
            const data = await schoolApi.getAdminAgendas();
            setAgendas(data);
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
            description: '',
            event_date: new Date().toISOString().split('T')[0],
            start_time: '08:00',
            end_time: '11:30',
            location: 'Lokasi kegiatan',
            organizer: 'Panitia Sekolah',
            is_published: 1
        });
        setModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setEditingId(item.id);
        setForm({
            title: item.title,
            description: item.description || '',
            event_date: item.event_date ? String(item.event_date).split('T')[0] : '',
            start_time: item.start_time || '08:00',
            end_time: item.end_time || 'Selesai',
            location: item.location || 'Lokasi kegiatan',
            organizer: item.organizer || 'Panitia Sekolah',
            is_published: item.is_published ?? 1
        });
        setModalOpen(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.event_date) {
            toast.error('Judul dan tanggal kegiatan wajib diisi.');
            return;
        }
        setLoading(true);
        try {
            if (editingId) {
                await schoolApi.updateAgenda(editingId, form);
                toast.success('Agenda berhasil diperbarui!');
            }
            else {
                await schoolApi.createAgenda(form);
                toast.success('Agenda baru berhasil ditambahkan!');
            }
            setModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan agenda.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus agenda kegiatan ini?'))
            return;
        try {
            await schoolApi.deleteAgenda(id);
            toast.success('Agenda berhasil dihapus!');
            loadData();
        }
        catch {
            toast.error('Gagal menghapus agenda.');
        }
    };
    const filtered = agendas.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.location?.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Agenda Kegiatan" }) }), _jsxs("button", { onClick: handleOpenCreate, className: "inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Agenda" })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-3", children: [_jsx(Search, { className: "w-4 h-4 text-stone-400" }), _jsx("input", { type: "text", value: search ?? '', onChange: (e) => setSearch(e.target.value), className: "w-full text-xs bg-transparent focus:outline-none text-stone-800" })] }), _jsx("div", { className: "bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-100", children: _jsxs("tr", { children: [_jsx("th", { className: "py-4 px-6", children: "Tanggal & Waktu" }), _jsx("th", { className: "py-4 px-6", children: "Kegiatan" }), _jsx("th", { className: "py-4 px-6", children: "Lokasi" }), _jsx("th", { className: "py-4 px-6", children: "Penyelenggara" }), _jsx("th", { className: "py-4 px-6", children: "Status" }), _jsx("th", { className: "py-4 px-6 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100", children: filtered.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "py-8 text-center text-stone-400", children: "Belum ada agenda kegiatan yang terdaftar." }) })) : (filtered.map((item) => (_jsxs("tr", { className: "hover:bg-stone-50/60 transition-colors", children: [_jsxs("td", { className: "py-4 px-6 whitespace-nowrap", children: [_jsxs("div", { className: "font-bold text-stone-900 flex items-center gap-1.5", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-emerald-700" }), _jsx("span", { children: new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) })] }), _jsxs("div", { className: "text-[11px] text-stone-400 flex items-center gap-1 mt-0.5", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsxs("span", { children: [item.start_time, " - ", item.end_time] })] })] }), _jsxs("td", { className: "py-4 px-6", children: [_jsx("p", { className: "font-bold text-stone-900", children: item.title }), item.description && (_jsx("p", { className: "text-[11px] text-stone-500 line-clamp-1 mt-0.5", children: item.description }))] }), _jsxs("td", { className: "py-4 px-6 whitespace-nowrap text-stone-600 flex items-center gap-1.5", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-amber-500 shrink-0" }), _jsx("span", { children: item.location })] }), _jsx("td", { className: "py-4 px-6 text-stone-600", children: item.organizer }), _jsx("td", { className: "py-4 px-6", children: _jsx("span", { className: `px-2.5 py-1 rounded-full text-[10px] font-bold ${item.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`, children: item.is_published ? 'Published' : 'Draft' }) }), _jsx("td", { className: "py-4 px-6 text-right whitespace-nowrap", children: _jsxs("div", { className: "inline-flex items-center gap-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors", title: "Edit Agenda", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors", title: "Hapus Agenda", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id)))) })] }) }) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-4", children: [_jsx("h3", { className: "text-lg font-bold text-stone-900", children: editingId ? 'Ubah Agenda' : 'Tambah Agenda' }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama / Judul Kegiatan *" }), _jsx("input", { type: "text", required: true, value: form.title ?? '', onChange: (e) => setForm({ ...form, title: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Tanggal Acara *" }), _jsx("input", { type: "date", required: true, value: form.event_date ?? '', onChange: (e) => setForm({ ...form, event_date: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Jam Mulai" }), _jsx("input", { type: "text", value: form.start_time ?? '', onChange: (e) => setForm({ ...form, start_time: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Jam Selesai" }), _jsx("input", { type: "text", value: form.end_time ?? '', onChange: (e) => setForm({ ...form, end_time: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Lokasi Kegiatan" }), _jsx("input", { type: "text", value: form.location ?? '', onChange: (e) => setForm({ ...form, location: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Penyelenggara" }), _jsx("input", { type: "text", value: form.organizer ?? '', onChange: (e) => setForm({ ...form, organizer: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" })] })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Keterangan Tambahan" }), _jsx(RichTextEditor, { rows: 5, value: form.description || '', onChange: description => setForm({ ...form, description }) })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx("input", { type: "checkbox", id: "is_published", checked: form.is_published === 1, onChange: (e) => setForm({ ...form, is_published: e.target.checked ? 1 : 0 }), className: "rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" }), _jsx("label", { htmlFor: "is_published", className: "text-xs text-stone-700 font-medium", children: "Terbitkan agenda ini ke website publik" })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-stone-100", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors", children: "Batal" }), _jsx("button", { type: "submit", disabled: loading, className: "px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-60", children: loading ? 'Menyimpan...' : 'Simpan Agenda' })] })] })] }) }))] }));
};
