import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { useSchool } from '../../context/SchoolContext';
import { Save, Upload } from 'lucide-react';
import { toast } from '../../hooks/useToast';
import { ADMISSION_LABEL } from '../../config/admissions';
const FEATURE_OPTIONS = [
    { key: 'history', label: 'Sejarah Sekolah' },
    { key: 'vision', label: 'Visi Sekolah' },
    { key: 'mission', label: 'Misi Sekolah' },
    { key: 'goals', label: 'Tujuan Sekolah' },
    { key: 'coreValues', label: 'Nilai Utama Sekolah' },
    { key: 'organization', label: 'Struktur Organisasi' },
    { key: 'teachers', label: 'Guru & Tenaga Kependidikan' },
    { key: 'programs', label: 'Program & Ekstrakurikuler' },
    { key: 'news', label: 'Berita' },
    { key: 'announcements', label: 'Pengumuman' },
    { key: 'agenda', label: 'Agenda & Kegiatan' },
    { key: 'gallery', label: 'Galeri' },
    { key: 'achievements', label: 'Prestasi' },
    { key: 'facilities', label: 'Fasilitas' },
    { key: 'ppdb', label: ADMISSION_LABEL },
    { key: 'contact', label: 'Kontak' }
];
const DEFAULT_FEATURE_FLAGS = Object.fromEntries(FEATURE_OPTIONS.map(item => [item.key, true]));
function normalizeHeroSlides(value) {
    if (Array.isArray(value))
        return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    return [];
}
function normalizeFeatureFlags(value) {
    let parsed = value;
    if (typeof parsed === 'string') {
        try {
            parsed = JSON.parse(parsed);
        }
        catch {
            parsed = null;
        }
    }
    return { ...DEFAULT_FEATURE_FLAGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
}
export const ManageSettings = () => {
    const { updateCachedSettings } = useSchool();
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [heroUploading, setHeroUploading] = useState(null);
    useEffect(() => {
        schoolApi.getSettings().then(res => setSettings({ ...res, feature_flags: normalizeFeatureFlags(res.feature_flags), hero_slides: normalizeHeroSlides(res.hero_slides) }));
    }, []);
    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploading(true);
        try {
            const res = await schoolApi.uploadFile(file);
            if (res.success) {
                setSettings(prev => (prev ? { ...prev, logo_url: res.fileUrl } : null));
                toast.success('Logo berhasil diunggah!');
            }
        }
        catch (err) {
            toast.error('Gagal mengunggah logo.');
        }
        finally {
            setUploading(false);
        }
    };
    const handleHeroSlideUpload = async (index, file) => {
        if (!file)
            return;
        setHeroUploading(index);
        try {
            const result = await schoolApi.uploadFile(file);
            if (result.success) {
                setSettings(current => current ? {
                    ...current,
                    hero_slides: normalizeHeroSlides(current.hero_slides).map((slide, slideIndex) => slideIndex === index ? { ...slide, image: result.fileUrl } : slide)
                } : null);
                toast.success('Gambar slide berhasil diunggah.');
            }
        }
        catch {
            toast.error('Gagal mengunggah gambar slide.');
        }
        finally {
            setHeroUploading(null);
        }
    };
    const addHeroSlide = () => {
        setSettings(current => current ? {
            ...current,
            hero_slides: [...normalizeHeroSlides(current.hero_slides), { id: Date.now(), image: '', tag: '', title: '', subtitle: '', badge: '' }]
        } : null);
    };
    const moveHeroSlide = (index, direction) => {
        setSettings(current => {
            if (!current)
                return current;
            const slides = [...normalizeHeroSlides(current.hero_slides)];
            const target = index + direction;
            if (target < 0 || target >= slides.length)
                return current;
            [slides[index], slides[target]] = [slides[target], slides[index]];
            return { ...current, hero_slides: slides };
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!settings)
            return;
        setSaving(true);
        try {
            const res = await schoolApi.updateSettings(settings);
            if (res.success) {
                updateCachedSettings(res.data);
                toast.success('Pengaturan website berhasil disimpan!');
            }
        }
        catch (err) {
            toast.error('Gagal menyimpan pengaturan.');
        }
        finally {
            setSaving(false);
        }
    };
    if (!settings) {
        return _jsx("div", { className: "p-8 text-center text-xs text-stone-500 font-poppins", children: "Memuat konfigurasi website..." });
    }
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: _jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Pengaturan Website" }) }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsx("div", { className: "border-b border-stone-100 pb-4", children: _jsx("h2", { className: "text-base font-bold text-stone-900", children: "Branding & Logo Resmi" }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Sekolah" }), _jsx("input", { type: "text", required: true, value: settings.school_name ?? '', onChange: (e) => setSettings({ ...settings, school_name: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Tagline / Slogan Sekolah" }), _jsx("input", { type: "text", value: settings.tagline ?? '', onChange: (e) => setSettings({ ...settings, tagline: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Logo Sekolah (URL atau Unggah Berkas)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: settings.logo_url ?? '', onChange: (e) => setSettings({ ...settings, logo_url: e.target.value }), className: "flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0", children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: uploading ? '...' : 'Upload Logo' }), _jsx("input", { type: "file", accept: "image/*", onChange: handleLogoUpload, className: "hidden" })] })] }), _jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-3", children: [_jsx("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white", children: settings.logo_url ? (_jsx("img", { src: settings.logo_url, alt: "Pratinjau logo sekolah", className: "h-full w-full object-contain p-1" }, settings.logo_url)) : (_jsx("span", { className: "text-[10px] font-semibold text-stone-400", children: "Logo" })) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs font-semibold text-stone-700", children: "Pratinjau logo" }), _jsx("p", { className: "text-[11px] text-stone-500", children: "Logo ini digunakan pada navbar, footer, dan ikon tab browser." })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsx("div", { className: "border-b border-stone-100 pb-4", children: _jsx("h2", { className: "text-base font-bold text-stone-900", children: "Tema Warna Website" }) }), _jsx("div", { className: "flex flex-wrap gap-3", children: [
                                    { name: 'Hijau & Emas', primary: '#1B3B2B', secondary: '#E5C178', orange: '#C87941', blue: '#547C91' },
                                    { name: 'Biru & Perak', primary: '#183B56', secondary: '#B8C7D9', orange: '#D58B52', blue: '#3977A8' },
                                    { name: 'Marun & Krem', primary: '#642D3D', secondary: '#E8D6B8', orange: '#B87945', blue: '#6F8294' },
                                    { name: 'Teal & Pasir', primary: '#145B5A', secondary: '#D9C6A5', orange: '#C47B4B', blue: '#477F91' }
                                ].map(preset => (_jsxs("button", { type: "button", onClick: () => setSettings({ ...settings, primary_color: preset.primary, secondary_color: preset.secondary, accent_orange: preset.orange, accent_blue: preset.blue }), className: "border border-stone-200 hover:border-stone-400 rounded-xl px-3 py-2 text-left text-xs font-semibold text-stone-700", children: [_jsx("span", { className: "flex gap-1.5 mb-1.5", children: [preset.primary, preset.secondary, preset.orange, preset.blue].map(color => _jsx("span", { className: "w-5 h-5 rounded-full border border-black/10", style: { backgroundColor: color } }, color)) }), preset.name] }, preset.name))) }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
                                    { key: 'primary_color', label: 'Warna Utama' },
                                    { key: 'secondary_color', label: 'Warna Sekunder' },
                                    { key: 'accent_orange', label: 'Warna Aksen 1' },
                                    { key: 'accent_blue', label: 'Warna Aksen 2' }
                                ].map(item => (_jsxs("label", { className: "space-y-2 block text-xs font-semibold text-stone-700", children: [item.label, _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "color", value: settings[item.key] || '#1B3B2B', onChange: e => setSettings({ ...settings, [item.key]: e.target.value }), className: "w-10 h-10 border border-stone-200 rounded-lg p-1 bg-white" }), _jsx("input", { type: "text", value: settings[item.key] || '', onChange: e => setSettings({ ...settings, [item.key]: e.target.value }), className: "min-w-0 w-full px-2 py-2 rounded-lg border border-stone-200 bg-stone-50 font-mono text-[11px]" })] })] }, item.key))) })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-5", children: [_jsx("div", { className: "border-b border-stone-100 pb-4", children: _jsx("h2", { className: "text-base font-bold text-stone-900", children: "Fitur Website" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: FEATURE_OPTIONS.map(feature => (_jsxs("label", { className: "flex items-start gap-3 p-3 rounded-xl border border-stone-200 hover:border-emerald-300 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: normalizeFeatureFlags(settings.feature_flags)[feature.key] !== false, onChange: e => setSettings({ ...settings, feature_flags: { ...normalizeFeatureFlags(settings.feature_flags), [feature.key]: e.target.checked } }), className: "mt-0.5 accent-emerald-700" }), _jsx("span", { className: "block text-xs font-bold text-stone-800", children: feature.label })] }, feature.key))) })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsx("div", { className: "border-b border-stone-100 pb-4", children: _jsx("h2", { className: "text-base font-bold text-stone-900", children: "Konten Hero Beranda" }) }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Headline Hero Beranda" }), _jsx("input", { type: "text", value: settings.hero_title ?? '', onChange: (e) => setSettings({ ...settings, hero_title: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-bold" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Sub-Headline / Paragraf Sambutan Hero" }), _jsx("textarea", { rows: 3, value: settings.hero_subtitle ?? '', onChange: (e) => setSettings({ ...settings, hero_subtitle: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-normal" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("h3", { className: "text-sm font-semibold text-stone-800", children: "Slide Hero" }), _jsx("button", { type: "button", onClick: addHeroSlide, className: "rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50", children: "Tambah slide" })] }), normalizeHeroSlides(settings.hero_slides).map((slide, index) => (_jsxs("div", { className: "grid grid-cols-1 gap-3 rounded-xl border border-stone-200 p-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2 sm:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-semibold text-stone-700", children: ["Slide ", index + 1] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", disabled: index === 0, onClick: () => moveHeroSlide(index, -1), className: "text-xs font-semibold text-stone-600 disabled:opacity-30", children: "Naik" }), _jsx("button", { type: "button", disabled: index === normalizeHeroSlides(settings.hero_slides).length - 1, onClick: () => moveHeroSlide(index, 1), className: "text-xs font-semibold text-stone-600 disabled:opacity-30", children: "Turun" }), _jsx("button", { type: "button", onClick: () => setSettings({ ...settings, hero_slides: normalizeHeroSlides(settings.hero_slides).filter((_, i) => i !== index) }), className: "text-xs font-semibold text-red-600", children: "Hapus" })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [slide.image && _jsx("img", { src: slide.image, alt: slide.title || 'Pratinjau slide', className: "h-20 w-32 rounded-lg object-cover" }), _jsxs("label", { className: "cursor-pointer rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50", children: [heroUploading === index ? 'Mengunggah...' : 'Unggah gambar', _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: event => handleHeroSlideUpload(index, event.target.files?.[0]) })] }), _jsx("input", { type: "text", value: slide.image ?? '', onChange: event => setSettings({ ...settings, hero_slides: normalizeHeroSlides(settings.hero_slides).map((item, i) => i === index ? { ...item, image: event.target.value } : item) }), placeholder: "URL gambar (opsional)", className: "min-w-0 flex-1 rounded-lg border border-stone-200 px-3 py-2 text-xs" })] })] }), _jsx("input", { type: "text", value: slide.tag || '', onChange: event => setSettings({ ...settings, hero_slides: normalizeHeroSlides(settings.hero_slides).map((item, i) => i === index ? { ...item, tag: event.target.value } : item) }), placeholder: "Label kecil", className: "rounded-lg border border-stone-200 px-3 py-2 text-xs" }), _jsx("input", { type: "text", value: slide.badge || '', onChange: event => setSettings({ ...settings, hero_slides: normalizeHeroSlides(settings.hero_slides).map((item, i) => i === index ? { ...item, badge: event.target.value } : item) }), placeholder: "Badge (opsional)", className: "rounded-lg border border-stone-200 px-3 py-2 text-xs" }), _jsx("input", { type: "text", value: slide.title ?? '', onChange: event => setSettings({ ...settings, hero_slides: normalizeHeroSlides(settings.hero_slides).map((item, i) => i === index ? { ...item, title: event.target.value } : item) }), placeholder: "Judul slide", className: "rounded-lg border border-stone-200 px-3 py-2 text-xs sm:col-span-2" }), _jsx("textarea", { rows: 2, value: slide.subtitle || '', onChange: event => setSettings({ ...settings, hero_slides: normalizeHeroSlides(settings.hero_slides).map((item, i) => i === index ? { ...item, subtitle: event.target.value } : item) }), placeholder: "Deskripsi slide", className: "rounded-lg border border-stone-200 px-3 py-2 text-xs sm:col-span-2" })] }, slide.id))), normalizeHeroSlides(settings.hero_slides).length === 0 && _jsx("p", { className: "text-xs text-stone-500", children: "Belum ada slide khusus. Gambar hero lama tetap digunakan sebagai cadangan." })] })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsx("div", { className: "border-b border-stone-100 pb-4", children: _jsx("h2", { className: "text-base font-bold text-stone-900", children: "Angka Statistik Sekolah (Counter Beranda)" }) }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Siswa Aktif" }), _jsx("input", { type: "number", value: settings.stats_students ?? '', onChange: (e) => setSettings({ ...settings, stats_students: parseInt(e.target.value) || 0 }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-bold" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Guru & Tenaga Staf" }), _jsx("input", { type: "number", value: settings.stats_teachers ?? '', onChange: (e) => setSettings({ ...settings, stats_teachers: parseInt(e.target.value) || 0 }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-bold" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Prestasi Juara" }), _jsx("input", { type: "number", value: settings.stats_achievements ?? '', onChange: (e) => setSettings({ ...settings, stats_achievements: parseInt(e.target.value) || 0 }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-bold" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Total Alumni" }), _jsx("input", { type: "number", value: settings.stats_alumni ?? '', onChange: (e) => setSettings({ ...settings, stats_alumni: parseInt(e.target.value) || 0 }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-bold" })] })] })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsx("div", { className: "border-b border-stone-100 pb-4", children: _jsx("h2", { className: "text-base font-bold text-stone-900", children: "Media Sosial & Optimasi SEO" }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Instagram URL" }), _jsx("input", { type: "text", value: settings.instagram_url ?? '', onChange: (e) => setSettings({ ...settings, instagram_url: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Facebook URL" }), _jsx("input", { type: "text", value: settings.facebook_url ?? '', onChange: (e) => setSettings({ ...settings, facebook_url: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "YouTube Channel URL" }), _jsx("input", { type: "text", value: settings.youtube_url ?? '', onChange: (e) => setSettings({ ...settings, youtube_url: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "TikTok URL" }), _jsx("input", { type: "text", value: settings.tiktok_url ?? '', onChange: (e) => setSettings({ ...settings, tiktok_url: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Meta Title SEO" }), _jsx("input", { type: "text", value: settings.seo_title ?? '', onChange: (e) => setSettings({ ...settings, seo_title: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Meta Description SEO" }), _jsx("textarea", { rows: 2, value: settings.seo_description ?? '', onChange: (e) => setSettings({ ...settings, seo_description: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-normal" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Teks Copyright Footer" }), _jsx("input", { type: "text", value: settings.footer_text ?? '', onChange: (e) => setSettings({ ...settings, footer_text: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("button", { type: "submit", disabled: saving, className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan Website' })] })] })] }));
};
