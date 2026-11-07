import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Plus, Trash2, Upload, Play, X } from 'lucide-react';
import { toast } from '../../hooks/useToast';
export const ManageGallery = () => {
    const [mediaList, setMediaList] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        media_type: 'photo',
        file_url: '/demo/demo-event.svg',
        video_url: '',
        caption: '',
        category: 'Akademik'
    });
    const loadGallery = async () => {
        try {
            const res = await schoolApi.getGallery();
            setMediaList(res);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        loadGallery();
    }, []);
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploading(true);
        try {
            const res = await schoolApi.uploadFile(file);
            if (res.success) {
                setForm(prev => ({ ...prev, file_url: res.fileUrl }));
                toast.success('Foto berhasil diunggah!');
            }
        }
        catch (err) {
            toast.error('Gagal mengunggah berkas.');
        }
        finally {
            setUploading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.file_url) {
            toast.error('Judul dan file URL wajib diisi.');
            return;
        }
        try {
            await schoolApi.createGalleryMedia(form);
            toast.success('Media berhasil disimpan ke galeri!');
            setModalOpen(false);
            setForm({
                title: '',
                media_type: 'photo',
                file_url: '/demo/demo-event.svg',
                video_url: '',
                caption: '',
                category: 'Akademik'
            });
            loadGallery();
        }
        catch (err) {
            toast.error('Gagal menambahkan media.');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Hapus media ini dari galeri?')) {
            try {
                await schoolApi.deleteGalleryMedia(id);
                toast.success('Media berhasil dihapus.');
                loadGallery();
            }
            catch (err) {
                toast.error('Gagal menghapus media.');
            }
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Manajemen Galeri Media" }) }), _jsxs("button", { onClick: () => setModalOpen(true), className: "bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Tambah Foto / Video" })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: mediaList.map((item) => (_jsxs("div", { className: "bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 flex flex-col group relative", children: [_jsxs("div", { className: "relative aspect-[4/3] overflow-hidden bg-stone-100", children: [_jsx("img", { src: item.file_url, alt: item.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }), item.media_type === 'video' && (_jsx("div", { className: "absolute inset-0 bg-black/30 flex items-center justify-center", children: _jsx(Play, { className: "w-8 h-8 text-white fill-current opacity-80" }) })), _jsx("span", { className: "absolute top-2 left-2 bg-emerald-950/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded", children: item.category })] }), _jsxs("div", { className: "p-4 flex flex-col flex-1 justify-between space-y-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-bold text-xs text-stone-900 line-clamp-1", children: item.title }), item.caption && (_jsx("p", { className: "text-[11px] text-stone-500 line-clamp-2 font-normal mt-0.5", children: item.caption }))] }), _jsxs("div", { className: "pt-2 border-t border-stone-100 flex justify-between items-center text-[10px]", children: [_jsx("span", { className: "text-stone-400 font-medium capitalize", children: item.media_type }), _jsxs("button", { onClick: () => handleDelete(item.id), className: "text-red-500 hover:text-red-700 p-1 font-bold flex items-center gap-1", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Hapus" })] })] })] })] }, item.id))) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-stone-100 pb-3", children: [_jsx("h3", { className: "text-base font-bold text-stone-900", children: "Upload Media Galeri Baru" }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Judul Media *" }), _jsx("input", { type: "text", required: true, value: form.title ?? '', onChange: (e) => setForm({ ...form, title: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Jenis Media" }), _jsxs("select", { value: form.media_type ?? '', onChange: (e) => setForm({ ...form, media_type: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: [_jsx("option", { value: "photo", children: "Foto Dokumentasi" }), _jsx("option", { value: "video", children: "Tautan Video" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kategori Album" }), _jsxs("select", { value: form.category ?? '', onChange: (e) => setForm({ ...form, category: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: [_jsx("option", { value: "Akademik", children: "Akademik" }), _jsx("option", { value: "Keagamaan", children: "Keagamaan" }), _jsx("option", { value: "Kesiswaan", children: "Kesiswaan" }), _jsx("option", { value: "Umum", children: "Umum" })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Foto Thumbnail / Gambar (URL atau Upload) *" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", required: true, value: form.file_url ?? '', onChange: (e) => setForm({ ...form, file_url: e.target.value }), className: "flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0", children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: uploading ? '...' : 'Upload' }), _jsx("input", { type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden" })] })] })] }), form.media_type === 'video' && (_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "URL Tautan Video (YouTube)" }), _jsx("input", { type: "text", value: form.video_url ?? '', onChange: (e) => setForm({ ...form, video_url: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Keterangan / Caption" }), _jsx("textarea", { rows: 2, value: form.caption ?? '', onChange: (e) => setForm({ ...form, caption: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100", children: "Batal" }), _jsx("button", { type: "submit", className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all", children: "Simpan ke Galeri" })] })] })] }) }))] }));
};
