import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { toast } from '../../hooks/useToast';
import { schoolApi } from '../../services/api';
import { Save, Plus, Trash2, Upload } from 'lucide-react';
export const ManageHistory = () => {
    const [history, setHistory] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    useEffect(() => { schoolApi.getHistory().then(setHistory).catch(() => toast.error('Gagal memuat sejarah sekolah.')); }, []);
    const handleFileUpload = async (file, _target) => {
        setUploading(true);
        try {
            const res = await schoolApi.uploadFile(file);
            if (res.success && history) {
                setHistory({ ...history, featured_image: res.fileUrl });
                toast.success('Foto berhasil diunggah!');
            }
        }
        catch {
            toast.error('Gagal mengunggah foto.');
        }
        finally {
            setUploading(false);
        }
    };
    const handleSaveHistory = async (e) => {
        e.preventDefault();
        if (!history)
            return;
        setSaving(true);
        try {
            const res = await schoolApi.updateHistory(history);
            if (res.success)
                toast.success('Sejarah dan linimasa berhasil disimpan!');
        }
        catch {
            toast.error('Gagal menyimpan sejarah sekolah.');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins pb-12", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Sejarah & Linimasa Sekolah" }), _jsx("p", { className: "text-xs text-stone-500 font-normal mt-0.5", children: "Kelola artikel sejarah dan tonggak perjalanan sekolah." })] }), history && (_jsxs("form", { onSubmit: handleSaveHistory, className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsxs("div", { className: "border-b border-stone-100 pb-4", children: [_jsx("h2", { className: "text-base font-bold text-stone-900", children: "Sejarah & Linimasa Pendirian Sekolah" }), _jsx("p", { className: "text-xs text-stone-400 font-normal mt-0.5", children: "Kelola artikel sejarah lengkap dan milestone perjalanan sekolah dari masa ke masa" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Judul Artikel Sejarah" }), _jsx("input", { type: "text", value: (history.title) ?? '', onChange: (e) => setHistory({ ...history, title: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Foto Utama Dokumentasi Sejarah" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start", children: [_jsx("img", { src: history.featured_image || '/demo/demo-classroom.svg', alt: "Sejarah", className: "w-32 h-20 rounded-xl object-cover border border-stone-200 shadow-xs" }), _jsxs("div", { className: "flex-1 space-y-2 w-full", children: [_jsx("input", { type: "text", value: (history.featured_image || '') ?? '', onChange: (e) => setHistory({ ...history, featured_image: e.target.value }), placeholder: "URL Foto Sejarah", className: "w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer", children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: uploading ? 'Mengunggah...' : 'Unggah File Foto' }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'history'), className: "hidden" })] })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Uraian Artikel Sejarah" }), _jsx("textarea", { rows: 8, value: (history.content) ?? '', onChange: (e) => setHistory({ ...history, content: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-normal leading-relaxed" })] }), _jsxs("div", { className: "space-y-4 pt-4 border-t border-stone-100", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-stone-900", children: "Linimasa Tonggak Sejarah (Milestones)" }), _jsx("p", { className: "text-[11px] text-stone-400", children: "Tahun-tahun penting dan pencapaian bersejarah sekolah" })] }), _jsxs("button", { type: "button", onClick: () => {
                                            const current = history.milestones || [];
                                            setHistory({
                                                ...history,
                                                milestones: [...current, { year: `${new Date().getFullYear()}`, title: '', desc: '' }]
                                            });
                                        }, className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Tambah Milestone" })] })] }), _jsx("div", { className: "space-y-3", children: (history.milestones || []).map((ms, idx) => (_jsxs("div", { className: "p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "w-6 text-xs text-stone-400 font-bold", children: [idx + 1, "."] }), _jsx("input", { type: "text", placeholder: "Tahun (e.g. 2005)", value: (ms.year) ?? '', onChange: (e) => {
                                                        const newMs = [...(history.milestones || [])];
                                                        newMs[idx] = { ...newMs[idx], year: e.target.value };
                                                        setHistory({ ...history, milestones: newMs });
                                                    }, className: "w-24 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-emerald-800 bg-white" }), _jsx("input", { type: "text", placeholder: "Judul Peristiwa Penting", value: (ms.title) ?? '', onChange: (e) => {
                                                        const newMs = [...(history.milestones || [])];
                                                        newMs[idx] = { ...newMs[idx], title: e.target.value };
                                                        setHistory({ ...history, milestones: newMs });
                                                    }, className: "flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 bg-white" }), _jsx("button", { type: "button", onClick: () => {
                                                        const newMs = (history.milestones || []).filter((_, i) => i !== idx);
                                                        setHistory({ ...history, milestones: newMs });
                                                    }, className: "p-1.5 text-stone-400 hover:text-red-600 transition-colors", title: "Hapus Milestone", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsx("textarea", { rows: 2, placeholder: "Deskripsi singkat peristiwa...", value: (ms.desc) ?? '', onChange: (e) => {
                                                const newMs = [...(history.milestones || [])];
                                                newMs[idx] = { ...newMs[idx], desc: e.target.value };
                                                setHistory({ ...history, milestones: newMs });
                                            }, className: "w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-normal text-stone-600 bg-white" })] }, idx))) })] }), _jsxs("button", { type: "submit", disabled: saving, className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: saving ? 'Menyimpan...' : 'Simpan Sejarah & Linimasa' })] })] }))] }));
};
