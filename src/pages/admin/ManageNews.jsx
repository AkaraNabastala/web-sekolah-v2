import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { toast } from '../../hooks/useToast';
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { Plus, Edit, Trash2, Eye, Search, X, Upload } from 'lucide-react';
export const ManageNews = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewArticle, setPreviewArticle] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category_id: 1,
        summary: '',
        content: '',
        thumbnail: '',
        author: 'Tim Redaksi',
        status: 'draft'
    });
    const loadNews = async () => {
        try {
            const [nRes, cRes] = await Promise.all([
                schoolApi.getAdminNews(),
                schoolApi.getNewsCategories()
            ]);
            setArticles(nRes);
            setCategories(cRes);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        loadNews();
    }, []);
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            title: '',
            slug: '',
            category_id: categories[0]?.id || 1,
            summary: '',
            content: '',
            thumbnail: '/demo/demo-event.svg',
            author: 'Tim Redaksi',
            status: 'published'
        });
        setModalOpen(true);
    };
    const handleOpenEdit = (article) => {
        setEditingId(article.id);
        setFormData({ ...article });
        setModalOpen(true);
    };
    const handleTitleChange = (e) => {
        const title = e.target.value;
        const baseSlug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData({
            ...formData,
            title,
            slug: editingId ? formData.slug : baseSlug
        });
    };
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploading(true);
        try {
            const res = await schoolApi.uploadFile(file);
            if (res.success) {
                setFormData(prev => ({ ...prev, thumbnail: res.fileUrl }));
                toast.success('Thumbnail berhasil diunggah!');
            }
        }
        catch (err) {
            toast.error('Gagal mengunggah thumbnail.');
        }
        finally {
            setUploading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error('Judul dan konten wajib diisi.');
            return;
        }
        try {
            if (editingId) {
                await schoolApi.updateNews(editingId, formData);
                toast.success('Warta berita berhasil diperbarui!');
            }
            else {
                await schoolApi.createNews(formData);
                toast.success('Berita baru berhasil diterbitkan!');
            }
            setModalOpen(false);
            loadNews();
        }
        catch (err) {
            toast.error('Terjadi kesalahan saat menyimpan berita.');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus warta ini?')) {
            try {
                await schoolApi.deleteNews(id);
                toast.success('Berita berhasil dihapus.');
                loadNews();
            }
            catch (err) {
                toast.error('Gagal menghapus berita.');
            }
        }
    };
    const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Berita & Artikel" }) }), _jsxs("button", { onClick: handleOpenCreate, className: "bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Berita" })] })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "relative w-full sm:w-72", children: [_jsx(Search, { className: "w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", value: search ?? '', onChange: (e) => setSearch(e.target.value), className: "w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50/50" })] }), _jsxs("span", { className: "text-xs text-stone-400", children: ["Total ", filtered.length, " artikel"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[10px] tracking-wider", children: [_jsx("th", { className: "py-3 px-4", children: "Thumbnail & Judul" }), _jsx("th", { className: "py-3 px-4", children: "Kategori" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4", children: "Penulis" }), _jsx("th", { className: "py-3 px-4", children: "Views" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100 font-normal", children: filtered.map((item) => (_jsxs("tr", { className: "hover:bg-stone-50/50", children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center gap-3 max-w-md", children: [_jsx("div", { className: "w-14 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0", children: _jsx("img", { src: item.thumbnail || '', alt: item.title, className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-stone-900 line-clamp-1", children: item.title }), _jsxs("p", { className: "text-[10px] text-stone-400", children: ["/", item.slug] })] })] }) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[11px]", children: item.category_name }) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'}`, children: item.status }) }), _jsx("td", { className: "py-3 px-4 text-stone-600", children: item.author }), _jsx("td", { className: "py-3 px-4 font-semibold text-stone-700", children: item.views_count || 0 }), _jsxs("td", { className: "py-3 px-4 text-right space-x-2", children: [_jsx("button", { onClick: () => {
                                                            setPreviewArticle(item);
                                                            setPreviewModalOpen(true);
                                                        }, className: "p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors", title: "Preview Warta", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors", title: "Edit Berita", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors", title: "Hapus Berita", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, item.id))) })] }) })] }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10", children: [_jsx("h3", { className: "text-lg font-bold text-stone-900", children: editingId ? 'Ubah Berita' : 'Tambah Berita' }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Judul Berita *" }), _jsx("input", { type: "text", required: true, value: formData.title ?? '', onChange: handleTitleChange, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Slug URL" }), _jsx("input", { type: "text", value: formData.slug ?? '', onChange: (e) => setFormData({ ...formData, slug: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50 font-mono" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kategori" }), _jsx("select", { value: formData.category_id ?? '', onChange: (e) => setFormData({ ...formData, category_id: parseInt(e.target.value) }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: categories.map((c) => (_jsx("option", { value: c.id ?? '', children: c.name }, c.id))) })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Ringkasan Singkat (Lead)" }), _jsx("textarea", { rows: 2, value: formData.summary ?? '', onChange: (e) => setFormData({ ...formData, summary: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Isi Lengkap Artikel *" }), _jsx(RichTextEditor, { rows: 10, value: formData.content || '', onChange: content => setFormData({ ...formData, content }), placeholder: "Tulis isi berita dan gunakan toolbar untuk memformatnya." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "URL Gambar Thumbnail" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: formData.thumbnail ?? '', onChange: (e) => setFormData({ ...formData, thumbnail: e.target.value }), className: "flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0", children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: uploading ? '...' : 'Upload' }), _jsx("input", { type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden" })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Status Publikasi" }), _jsxs("select", { value: formData.status ?? '', onChange: (e) => setFormData({ ...formData, status: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: [_jsx("option", { value: "published", children: "Published (Tayang Publik)" }), _jsx("option", { value: "draft", children: "Draft (Konsep Sementara)" })] })] })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100", children: "Batal" }), _jsx("button", { type: "submit", className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all", children: editingId ? 'Perbarui Warta' : 'Simpan Berita' })] })] })] }) })), previewModalOpen && previewArticle && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-stone-100 pb-3", children: [_jsxs("span", { className: "text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded", children: ["Preview Mode \u2022 ", previewArticle.category_name] }), _jsx("button", { onClick: () => setPreviewModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("h2", { className: "text-xl font-bold text-stone-900", children: previewArticle.title }), previewArticle.thumbnail && (_jsx("img", { src: previewArticle.thumbnail, alt: previewArticle.title, className: "w-full h-48 object-cover rounded-xl" })), _jsx("p", { className: "text-xs text-stone-500 italic bg-stone-50 p-3 rounded-lg border-l-4 border-emerald-600", children: previewArticle.summary }), _jsx("div", { className: "text-xs text-stone-700 leading-relaxed space-y-3 font-normal", children: previewArticle.content.split('\n\n').map((p, i) => (_jsx("p", { children: p }, i))) })] }) }))] }));
};
