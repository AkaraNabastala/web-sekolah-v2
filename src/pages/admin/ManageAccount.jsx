import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { toast } from '../../hooks/useToast';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schoolApi } from '../../services/api';
import { ADMISSION_LABEL } from '../../config/admissions';
import { Save, Lock, User, Key, UserPlus, Trash2, Shield, X } from 'lucide-react';
export const ManageAccount = () => {
    const { admin, updateAdminUser } = useAuth();
    const [fullName, setFullName] = useState(admin?.full_name || '');
    const [email, setEmail] = useState(admin?.email || '');
    const [username, setUsername] = useState(admin?.username || '');
    const [avatar, setAvatar] = useState(admin?.avatar || '');
    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Multi-user & Roles List
    const [usersList, setUsersList] = useState([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        full_name: '',
        email: '',
        password: '',
        role: 'admin_konten'
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [addingUser, setAddingUser] = useState(false);
    const loadUsers = async () => {
        try {
            const data = await schoolApi.getAdminUsers();
            setUsersList(data);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        if (admin?.role === 'superadmin')
            loadUsers();
    }, [admin?.role]);
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await schoolApi.updateAdminProfile({ full_name: fullName, email, username, avatar });
            if (res.success && res.user) {
                updateAdminUser(res.user);
                toast.success('Profil akun administrator berhasil disimpan!');
                if (admin?.role === 'superadmin')
                    loadUsers();
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
        }
        finally {
            setSavingProfile(false);
        }
    };
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Konfirmasi password baru tidak cocok.');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password baru minimal 8 karakter.');
            return;
        }
        setSavingPassword(true);
        try {
            const res = await schoolApi.changePassword({ currentPassword, newPassword });
            if (res.success) {
                toast.success(res.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah password.');
        }
        finally {
            setSavingPassword(false);
        }
    };
    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (newUser.password.length < 8) {
            toast.error('Password minimal 8 karakter.');
            return;
        }
        setAddingUser(true);
        try {
            const res = await schoolApi.createAdminUser(newUser);
            if (res.success) {
                toast.success('Akun pengelola baru berhasil ditambahkan!');
                setShowAddUserModal(false);
                setNewUser({ username: '', full_name: '', email: '', password: '', role: 'admin_konten' });
                loadUsers();
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambahkan akun.');
        }
        finally {
            setAddingUser(false);
        }
    };
    const handleDeleteUser = async (id, uname) => {
        if (id === 1) {
            toast.error('Akun superadmin utama tidak dapat dihapus.');
            return;
        }
        if (window.confirm(`Yakin ingin menghapus akun @${uname}?`)) {
            try {
                await schoolApi.deleteAdminUser(id);
                toast.success(`Akun @${uname} berhasil dihapus.`);
                loadUsers();
            }
            catch (err) {
                toast.error(err.response?.data?.message || 'Gagal menghapus akun.');
            }
        }
    };
    return (_jsxs("div", { className: "space-y-8 font-poppins pb-12", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Keamanan & Akun Administrator" }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start", children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsxs("div", { className: "border-b border-stone-100 pb-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(User, { className: "w-5 h-5 text-emerald-700" }), _jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-stone-900", children: "Informasi Profil Akun Aktif" }), _jsx("p", { className: "text-[11px] text-stone-400 font-normal", children: "Identitas administrator yang sedang masuk" })] })] }), _jsx("span", { className: "text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase", children: admin?.role || 'Superadmin' })] }), _jsxs("form", { onSubmit: handleUpdateProfile, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Lengkap Pengelola" }), _jsx("input", { type: "text", required: true, value: fullName, onChange: (e) => setFullName(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Username Login" }), _jsx("input", { type: "text", required: true, value: username, onChange: (e) => setUsername(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Alamat Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "URL Avatar Foto Profil" }), _jsx("input", { type: "text", value: avatar, onChange: (e) => setAvatar(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("button", { type: "submit", disabled: savingProfile, className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: savingProfile ? 'Menyimpan...' : 'Perbarui Profil' })] })] })] }), _jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsxs("div", { className: "border-b border-stone-100 pb-4 flex items-center gap-3", children: [_jsx(Key, { className: "w-5 h-5 text-amber-600" }), _jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-stone-900", children: "Ubah Kata Sandi (Password)" }), _jsx("p", { className: "text-[11px] text-stone-400 font-normal", children: "Disimpan dengan enkripsi Bcrypt 10 rounds" })] })] }), _jsxs("form", { onSubmit: handleChangePassword, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kata Sandi Saat Ini *" }), _jsx("input", { type: "password", required: true, value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Kata Sandi Baru *" }), _jsx("input", { type: "password", required: true, minLength: 8, value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Konfirmasi Kata Sandi Baru *" }), _jsx("input", { type: "password", required: true, minLength: 6, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("button", { type: "submit", disabled: savingPassword, className: "bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2", children: [_jsx(Lock, { className: "w-4 h-4" }), _jsx("span", { children: savingPassword ? 'Menyimpan...' : 'Ubah Kata Sandi' })] })] })] })] }), admin?.role === 'superadmin' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Shield, { className: "w-5 h-5 text-emerald-700" }), _jsx("div", { children: _jsx("h2", { className: "text-base font-bold text-stone-900", children: "Struktur Pengguna & Peran Sistem (Role Management)" }) })] }), _jsxs("button", { onClick: () => setShowAddUserModal(true), className: "bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto", children: [_jsx(UserPlus, { className: "w-4 h-4" }), _jsx("span", { children: "Tambah Akun Pengelola" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3", children: "Pengelola" }), _jsx("th", { className: "p-3", children: "Username & Email" }), _jsx("th", { className: "p-3", children: "Peran (Role)" }), _jsx("th", { className: "p-3", children: "Hak Akses" }), _jsx("th", { className: "p-3", children: "Status" }), _jsx("th", { className: "p-3 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100", children: usersList.map((user) => (_jsxs("tr", { className: "hover:bg-stone-50/50", children: [_jsxs("td", { className: "p-3 flex items-center gap-3", children: [_jsxs("div", { className: "relative w-8 h-8 rounded-full overflow-hidden border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0", children: [_jsx("span", { children: (user.full_name || 'A').trim().charAt(0).toUpperCase() }), user.avatar && (_jsx("img", { src: user.avatar, alt: user.full_name, onError: (event) => { event.currentTarget.style.display = 'none'; }, className: "absolute w-8 h-8 rounded-full object-cover" }))] }), _jsx("span", { className: "font-bold text-stone-900", children: user.full_name })] }), _jsxs("td", { className: "p-3", children: [_jsxs("p", { className: "font-semibold text-emerald-900", children: ["@", user.username] }), _jsx("p", { className: "text-stone-400 text-[11px]", children: user.email })] }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'superadmin'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : user.role === 'admin_konten'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-amber-100 text-amber-800'}`, children: user.role === 'superadmin' ? 'Superadmin' : user.role === 'admin_konten' ? 'Admin Konten' : `Admin ${ADMISSION_LABEL}` }) }), _jsx("td", { className: "p-3 text-stone-600 text-[11px]", children: user.role === 'superadmin'
                                                            ? 'Seluruh Akses Penuh (Full Access)'
                                                            : user.role === 'admin_konten'
                                                                ? 'Berita, Profil, Guru, Prestasi, Galeri'
                                                                : `Data ${ADMISSION_LABEL} & Verifikasi Siswa` }), _jsx("td", { className: "p-3", children: _jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800", children: "Aktif" }) }), _jsx("td", { className: "p-3 text-right", children: user.id !== 1 ? (_jsx("button", { onClick: () => handleDeleteUser(user.id, user.username), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors", title: "Hapus Akun", children: _jsx(Trash2, { className: "w-4 h-4" }) })) : (_jsx("span", { className: "text-[10px] text-stone-400 italic font-mono", children: "Akun Utama" })) })] }, user.id))) })] }) })] }), showAddUserModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-stone-100", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-stone-900", children: "Tambah Akun Pengelola Baru" }), _jsx("p", { className: "text-xs text-stone-400 font-normal", children: "Manajemen akun dan peran pengelola" })] }), _jsx("button", { onClick: () => setShowAddUserModal(false), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleCreateUser, className: "space-y-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Nama Lengkap" }), _jsx("input", { type: "text", required: true, value: newUser.full_name, onChange: (e) => setNewUser({ ...newUser, full_name: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Username" }), _jsx("input", { type: "text", required: true, value: newUser.username, onChange: (e) => setNewUser({ ...newUser, username: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Peran (Role)" }), _jsxs("select", { value: newUser.role, onChange: (e) => setNewUser({ ...newUser, role: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50", children: [_jsx("option", { value: "admin_konten", children: "Admin Konten" }), _jsx("option", { value: "superadmin", children: "Super Administrator" }), _jsx("option", { value: "admin_ppdb", children: `Admin ${ADMISSION_LABEL}` })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Email" }), _jsx("input", { type: "email", required: true, value: newUser.email, onChange: (e) => setNewUser({ ...newUser, email: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-bold text-stone-700", children: "Password Awal (Min. 8 Karakter)" }), _jsx("input", { type: "password", required: true, minLength: 6, value: newUser.password, onChange: (e) => setNewUser({ ...newUser, password: e.target.value }), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 bg-stone-50" })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowAddUserModal(false), className: "px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100", children: "Batal" }), _jsx("button", { type: "submit", disabled: addingUser, className: "bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm", children: addingUser ? 'Menyimpan...' : 'Tambah Pengguna' })] })] })] }) }))] }))] }));
};
