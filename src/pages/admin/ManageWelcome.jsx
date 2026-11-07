import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { toast } from '../../hooks/useToast';
import { schoolApi } from '../../services/api';
import { useSchool } from '../../context/SchoolContext';
import { Save, Upload } from 'lucide-react';
export const ManageWelcome = () => {
    const { updateCachedProfile } = useSchool();
    const [profile, setProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    useEffect(() => { schoolApi.getProfile().then(setProfile).catch(() => toast.error('Gagal memuat data kepala sekolah.')); }, []);
    const handleFileUpload = async (file, _target) => {
        setUploading(true);
        try {
            const res = await schoolApi.uploadFile(file);
            if (res.success && profile) {
                setProfile({ ...profile, headmaster_photo: res.fileUrl });
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
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profile)
            return;
        setSaving(true);
        try {
            const res = await schoolApi.updateProfile(profile);
            if (res.success) {
                updateCachedProfile(res.data);
                toast.success('Sambutan kepala sekolah berhasil disimpan!');
            }
        }
        catch {
            toast.error('Gagal menyimpan sambutan kepala sekolah.');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins pb-12", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Sambutan Kepala Sekolah" }), _jsx("p", { className: "text-xs text-stone-500 font-normal mt-0.5", children: "Kelola nama pimpinan, foto, dan sambutan kepala sekolah." })] }), profile && (_jsxs("form", { onSubmit: handleSaveProfile, className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsxs("div", { className: "border-b border-stone-100 pb-4", children: [_jsx("h2", { className: "text-base font-bold text-stone-900", children: "Sambutan & Profil Kepala Sekolah" }), _jsx("p", { className: "text-xs text-stone-400 font-normal mt-0.5", children: "Sambutan pimpinan yang ditampilkan di halaman beranda dan profil" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Lengkap & Gelar Pimpinan" }), _jsx("input", { type: "text", value: (profile.headmaster_name) ?? '', onChange: (e) => setProfile({ ...profile, headmaster_name: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "URL / File Foto Kepala Sekolah" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: (profile.headmaster_photo) ?? '', onChange: (e) => setProfile({ ...profile, headmaster_photo: e.target.value }), className: "flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0", children: [_jsx(Upload, { className: "w-4 h-4" }), _jsx("span", { children: "Unggah" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'headmaster'), className: "hidden" })] })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Teks Lengkap Sambutan Kepala Sekolah" }), _jsx("textarea", { rows: 8, value: (profile.headmaster_welcome) ?? '', onChange: (e) => setProfile({ ...profile, headmaster_welcome: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-normal leading-relaxed" })] }), _jsxs("button", { type: "submit", disabled: saving, className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: saving ? 'Menyimpan...' : 'Simpan Sambutan Kepala Sekolah' })] })] }))] }));
};
