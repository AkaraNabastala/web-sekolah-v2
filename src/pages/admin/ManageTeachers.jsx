import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { toast } from '../../hooks/useToast';
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Plus, Edit, Trash2, Upload, X, Users, GraduationCap } from 'lucide-react';
export const ManageTeachers = () => {
    const [activeTab, setActiveTab] = useState('teachers');
    const [teachers, setTeachers] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    // Form for teacher or staff
    const [teacherForm, setTeacherForm] = useState({
        name: '',
        title: 'S.Pd',
        nip: '-',
        photo: '/demo/demo-person.svg',
        position: 'Guru Mata Pelajaran',
        subject: '',
        last_education: 'S1 Pendidikan',
        short_bio: '',
        display_order: 1
    });
    const [staffForm, setStaffForm] = useState({
        name: '',
        photo: '/demo/demo-person.svg',
        position: 'Staf Administrasi',
        department: 'Tata Usaha',
        last_education: 'S1 / D3',
        short_bio: '',
        display_order: 1
    });
    const loadData = async () => {
        try {
            const [tRes, sRes] = await Promise.all([
                schoolApi.getTeachers(),
                schoolApi.getStaff()
            ]);
            setTeachers(tRes);
            setStaffList(sRes);
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
        if (activeTab === 'teachers') {
            setTeacherForm({
                name: '',
                title: 'S.Pd',
                nip: '-',
                photo: '/demo/demo-person.svg',
                position: 'Guru Mata Pelajaran',
                subject: '',
                last_education: 'S1 Pendidikan',
                short_bio: '',
                display_order: teachers.length + 1
            });
        }
        else {
            setStaffForm({
                name: '',
                photo: '/demo/demo-person.svg',
                position: 'Staf Administrasi',
                department: 'Tata Usaha',
                last_education: 'S1 / D3',
                short_bio: '',
                display_order: staffList.length + 1
            });
        }
        setModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setEditingId(item.id);
        if (activeTab === 'teachers') {
            setTeacherForm({ ...item });
        }
        else {
            setStaffForm({ ...item });
        }
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
                if (activeTab === 'teachers') {
                    setTeacherForm(prev => ({ ...prev, photo: res.fileUrl }));
                }
                else {
                    setStaffForm(prev => ({ ...prev, photo: res.fileUrl }));
                }
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
            if (activeTab === 'teachers') {
                if (editingId) {
                    await schoolApi.updateTeacher(editingId, teacherForm);
                    toast.success('Data guru berhasil diperbarui!');
                }
                else {
                    await schoolApi.createTeacher(teacherForm);
                    toast.success('Guru baru berhasil ditambahkan!');
                }
            }
            else {
                if (editingId) {
                    await schoolApi.updateStaff(editingId, staffForm);
                    toast.success('Data staf berhasil diperbarui!');
                }
                else {
                    await schoolApi.createStaff(staffForm);
                    toast.success('Staf baru berhasil ditambahkan!');
                }
            }
            setModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error('Gagal menyimpan data.');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus data ini?')) {
            try {
                if (activeTab === 'teachers') {
                    await schoolApi.deleteTeacher(id);
                }
                else {
                    await schoolApi.deleteStaff(id);
                }
                toast.success('Data berhasil dihapus.');
                loadData();
            }
            catch (err) {
                toast.error('Gagal menghapus data.');
            }
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Manajemen Guru & Tenaga Kependidikan" }) }), _jsxs("button", { onClick: handleOpenCreate, className: "bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: activeTab === 'teachers' ? 'Guru' : 'Staf' })] })] }), _jsxs("div", { className: "bg-white p-2 rounded-2xl shadow-sm border border-stone-200/80 flex gap-1 w-fit", children: [_jsxs("button", { onClick: () => setActiveTab('teachers'), className: `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'teachers' ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`, children: [_jsx(GraduationCap, { className: "w-4 h-4" }), _jsxs("span", { children: ["Guru Pengajar (", teachers.length, ")"] })] }), _jsxs("button", { onClick: () => setActiveTab('staff'), className: `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'staff' ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`, children: [_jsx(Users, { className: "w-4 h-4" }), _jsxs("span", { children: ["Tenaga Kependidikan / Staf (", staffList.length, ")"] })] })] }), _jsx("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[10px] tracking-wider", children: [_jsx("th", { className: "py-3 px-4", children: "Foto & Nama" }), _jsx("th", { className: "py-3 px-4", children: activeTab === 'teachers' ? 'Mata Pelajaran' : 'Divisi / Bagian' }), _jsx("th", { className: "py-3 px-4", children: "Jabatan" }), _jsx("th", { className: "py-3 px-4", children: "Pendidikan" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100 font-normal", children: (activeTab === 'teachers' ? teachers : staffList).map((item) => (_jsxs("tr", { className: "hover:bg-stone-50/50", children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0", children: _jsx("img", { src: item.photo || '', alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-stone-900", children: item.name }), item.nip && item.nip !== '-' && (_jsxs("p", { className: "text-[10px] text-stone-400 font-mono", children: ["NIP: ", item.nip] }))] })] }) }), _jsx("td", { className: "py-3 px-4 font-semibold text-emerald-800", children: activeTab === 'teachers' ? item.subject : item.department }), _jsx("td", { className: "py-3 px-4 text-stone-600", children: item.position }), _jsx("td", { className: "py-3 px-4 text-stone-500", children: item.last_education }), _jsxs("td", { className: "py-3 px-4 text-right space-x-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors", title: "Edit Data", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors", title: "Hapus Data", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, item.id))) })] }) }) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10", children: [_jsx("h3", { className: "text-lg font-bold text-stone-900", children: editingId ? `Edit ${activeTab === 'teachers' ? 'Guru' : 'Staf'}` : `Tambah ${activeTab === 'teachers' ? 'Guru' : 'Staf'} Baru` }), _jsx("button", { onClick: () => setModalOpen(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Lengkap & Gelar *" }), _jsx("input", { type: "text", required: true, value: (activeTab === 'teachers' ? teacherForm.name : staffForm.name) ?? '', onChange: (e) => {
                                                if (activeTab === 'teachers')
                                                    setTeacherForm({ ...teacherForm, name: e.target.value });
                                                else
                                                    setStaffForm({ ...staffForm, name: e.target.value });
                                            }, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Jabatan *" }), _jsx("input", { type: "text", required: true, value: (activeTab === 'teachers' ? teacherForm.position : staffForm.position) ?? '', onChange: (e) => {
                                                        if (activeTab === 'teachers')
                                                            setTeacherForm({ ...teacherForm, position: e.target.value });
                                                        else
                                                            setStaffForm({ ...staffForm, position: e.target.value });
                                                    }, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: activeTab === 'teachers' ? 'Mata Pelajaran Diampu *' : 'Divisi / Departemen *' }), _jsx("input", { type: "text", required: true, value: (activeTab === 'teachers' ? teacherForm.subject : staffForm.department) ?? '', onChange: (e) => {
                                                        if (activeTab === 'teachers')
                                                            setTeacherForm({ ...teacherForm, subject: e.target.value });
                                                        else
                                                            setStaffForm({ ...staffForm, department: e.target.value });
                                                    }, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Pendidikan Terakhir" }), _jsx("input", { type: "text", value: (activeTab === 'teachers' ? teacherForm.last_education : staffForm.last_education) ?? '', onChange: (e) => {
                                                        if (activeTab === 'teachers')
                                                            setTeacherForm({ ...teacherForm, last_education: e.target.value });
                                                        else
                                                            setStaffForm({ ...staffForm, last_education: e.target.value });
                                                    }, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Urutan Tampilan" }), _jsx("input", { type: "number", value: (activeTab === 'teachers' ? teacherForm.display_order : staffForm.display_order) ?? '', onChange: (e) => {
                                                        const v = parseInt(e.target.value) || 1;
                                                        if (activeTab === 'teachers')
                                                            setTeacherForm({ ...teacherForm, display_order: v });
                                                        else
                                                            setStaffForm({ ...staffForm, display_order: v });
                                                    }, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Foto Profil (URL atau Upload)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: (activeTab === 'teachers' ? teacherForm.photo : staffForm.photo) ?? '', onChange: (e) => {
                                                        if (activeTab === 'teachers')
                                                            setTeacherForm({ ...teacherForm, photo: e.target.value });
                                                        else
                                                            setStaffForm({ ...staffForm, photo: e.target.value });
                                                    }, className: "flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" }), _jsxs("label", { className: "bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0", children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: uploading ? '...' : 'Upload' }), _jsx("input", { type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden" })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Deskripsi Singkat / Bio" }), _jsx("textarea", { rows: 2, value: (activeTab === 'teachers' ? teacherForm.short_bio : staffForm.short_bio) ?? '', onChange: (e) => {
                                                if (activeTab === 'teachers')
                                                    setTeacherForm({ ...teacherForm, short_bio: e.target.value });
                                                else
                                                    setStaffForm({ ...staffForm, short_bio: e.target.value });
                                            }, className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100", children: "Batal" }), _jsx("button", { type: "submit", className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all", children: "Simpan Data" })] })] })] }) }))] }));
};
