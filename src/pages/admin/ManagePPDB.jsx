import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Save, Plus, Trash2 } from 'lucide-react';
import { toast } from '../../hooks/useToast';
import { ADMISSION_LABEL } from '../../config/admissions';
export const ManagePPDB = () => {
    const [ppdb, setPpdb] = useState(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        schoolApi.getPPDB().then(res => setPpdb(res));
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ppdb)
            return;
        setSaving(true);
        try {
            const res = await schoolApi.updatePPDB(ppdb);
            if (res.success) {
                toast.success(`Pengaturan ${ADMISSION_LABEL} berhasil disimpan!`);
            }
        }
        catch (err) {
            toast.error(`Gagal menyimpan pengaturan ${ADMISSION_LABEL}.`);
        }
        finally {
            setSaving(false);
        }
    };
    if (!ppdb) {
        return _jsxs("div", { className: "p-8 text-center text-xs text-stone-500 font-poppins", children: ["Memuat data ", ADMISSION_LABEL, "..."] });
    }
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: _jsx("div", { children: _jsxs("h1", { className: "text-2xl font-bold text-stone-900", children: ["Pengaturan ", ADMISSION_LABEL] }) }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsxs("div", { className: "border-b border-stone-100 pb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-base font-bold text-stone-900", children: "Status Pembukaan & Periode" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs font-bold text-stone-700", children: "Status Pendaftaran:" }), _jsx("button", { type: "button", onClick: () => setPpdb({ ...ppdb, is_open: ppdb.is_open ? 0 : 1 }), className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${ppdb.is_open ? 'bg-emerald-700 text-white shadow-sm' : 'bg-stone-200 text-stone-700'}`, children: ppdb.is_open ? 'DIBUKA' : 'DITUTUP' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Tahun Ajaran *" }), _jsx("input", { type: "text", required: true, value: ppdb.academic_year ?? '', onChange: (e) => setPpdb({ ...ppdb, academic_year: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Kontak Panitia" }), _jsx("input", { type: "text", value: ppdb.contact_person ?? '', onChange: (e) => setPpdb({ ...ppdb, contact_person: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "WhatsApp Panitia" }), _jsx("input", { type: "text", value: ppdb.contact_whatsapp ?? '', onChange: (e) => setPpdb({ ...ppdb, contact_whatsapp: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Ringkasan Pendaftaran" }), _jsx("textarea", { rows: 3, value: ppdb.overview ?? '', onChange: (e) => setPpdb({ ...ppdb, overview: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-normal" })] })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-4", children: [_jsx("h2", { className: "text-base font-bold text-stone-900", children: "Daftar Dokumen Persyaratan" }), _jsxs("button", { type: "button", onClick: () => setPpdb({ ...ppdb, requirements: [...ppdb.requirements, ''] }), className: "text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Tambah Syarat" })] })] }), _jsx("div", { className: "space-y-2.5", children: ppdb.requirements.map((req, idx) => (_jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs("span", { className: "w-6 text-xs text-stone-400 font-bold", children: [idx + 1, "."] }), _jsx("input", { type: "text", value: req ?? '', onChange: (e) => {
                                                const newR = [...ppdb.requirements];
                                                newR[idx] = e.target.value;
                                                setPpdb({ ...ppdb, requirements: newR });
                                            }, className: "flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsx("button", { type: "button", onClick: () => {
                                                const newR = ppdb.requirements.filter((_, i) => i !== idx);
                                                setPpdb({ ...ppdb, requirements: newR });
                                            }, className: "p-2 text-stone-400 hover:text-red-600 transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, idx))) })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-stone-900", children: "Transparansi Biaya Pendidikan" }), _jsx("p", { className: "text-xs text-stone-400", children: "Tampilkan rincian pembiayaan pada halaman publik" })] }), _jsx("button", { type: "button", onClick: () => setPpdb({ ...ppdb, show_fees: ppdb.show_fees ? 0 : 1 }), className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${ppdb.show_fees ? 'bg-emerald-700 text-white shadow-sm' : 'bg-stone-200 text-stone-700'}`, children: ppdb.show_fees ? 'TAMPILKAN BIAYA' : 'SEMBUNYIKAN BIAYA' })] }), ppdb.show_fees ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Keterangan Biaya & Kebijakan Angsuran" }), _jsx("textarea", { rows: 2, value: ppdb.fees_description ?? '', onChange: (e) => setPpdb({ ...ppdb, fees_description: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-normal" })] }), _jsxs("div", { className: "space-y-2.5", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Item Pembiayaan" }), _jsxs("button", { type: "button", onClick: () => setPpdb({ ...ppdb, fees_items: [...ppdb.fees_items, { item: '', nominal: '', note: '' }] }), className: "text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Tambah Komponen Biaya" })] })] }), ppdb.fees_items.map((fee, idx) => (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200", children: [_jsx("input", { type: "text", value: fee.item ?? '', onChange: (e) => {
                                                            const newF = [...ppdb.fees_items];
                                                            newF[idx].item = e.target.value;
                                                            setPpdb({ ...ppdb, fees_items: newF });
                                                        }, className: "sm:col-span-6 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white" }), _jsx("input", { type: "text", value: fee.nominal ?? '', onChange: (e) => {
                                                            const newF = [...ppdb.fees_items];
                                                            newF[idx].nominal = e.target.value;
                                                            setPpdb({ ...ppdb, fees_items: newF });
                                                        }, className: "sm:col-span-3 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold" }), _jsx("input", { type: "text", value: fee.note || '', onChange: (e) => {
                                                            const newF = [...ppdb.fees_items];
                                                            newF[idx].note = e.target.value;
                                                            setPpdb({ ...ppdb, fees_items: newF });
                                                        }, className: "sm:col-span-2 px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white" }), _jsx("button", { type: "button", onClick: () => {
                                                            const newF = ppdb.fees_items.filter((_, i) => i !== idx);
                                                            setPpdb({ ...ppdb, fees_items: newF });
                                                        }, className: "sm:col-span-1 p-2 text-stone-400 hover:text-red-600 transition-colors flex justify-center", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, idx)))] })] })) : null] }), _jsxs("button", { type: "submit", disabled: saving, className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: saving ? 'Menyimpan...' : 'Simpan Pengaturan' })] })] })] }));
};
