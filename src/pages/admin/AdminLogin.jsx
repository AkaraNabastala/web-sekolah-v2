import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import { SEO } from '../../components/common/SEO';
export const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSetupNeeded, setIsSetupNeeded] = useState(false);
    // Form Setup Admin Pertama
    const [setupFullName, setSetupFullName] = useState('');
    const [setupEmail, setSetupEmail] = useState('');
    const [setupUsername, setSetupUsername] = useState('');
    const [setupPassword, setSetupPassword] = useState('');
    const [setupToken, setSetupToken] = useState('');
    const [setupMessage, setSetupMessage] = useState(null);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);
    useEffect(() => {
        // Periksa status inisialisasi administrator
        axios.get('/api/setup/status')
            .then(res => {
            if (res.data?.initialized === false && res.data?.setupEnabled === true) {
                setIsSetupNeeded(true);
            }
        })
            .catch(() => { });
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password) {
            setError('Username dan password wajib diisi.');
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            const res = await login(username, password);
            if (res.success) {
                navigate('/admin');
            }
            else {
                setError(res.message || 'Login gagal. Periksa kembali username dan kata sandi Anda.');
            }
        }
        catch (err) {
            setError('Terjadi kendala saat menghubungi server autentikasi.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleFirstAdminSetup = async (e) => {
        e.preventDefault();
        setError(null);
        setSetupMessage(null);
        if (!setupFullName || !setupEmail || !setupUsername || !setupPassword) {
            setError('Semua kolom form pembuatan admin pertama wajib diisi.');
            return;
        }
        if (setupPassword.length < 12) {
            setError('Kata sandi harus minimal 12 karakter.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await axios.post('/api/setup/first-admin', {
                full_name: setupFullName,
                email: setupEmail,
                username: setupUsername,
                password: setupPassword
            }, { headers: { 'X-Admin-Setup-Token': setupToken } });
            if (res.data.success) {
                setSetupMessage('Administrator utama berhasil dibuat! Silakan masuk dengan akun yang baru Anda daftarkan.');
                setSetupToken('');
                setSetupPassword('');
                setIsSetupNeeded(false);
                setUsername(setupUsername);
                setPassword('');
            }
            else {
                setError(res.data.message || 'Gagal menginisialisasi administrator.');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat administrator pertama.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(SEO, { title: "Masuk Admin" }), _jsxs("div", { className: "min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:16px_16px]" }), _jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md relative z-10", children: [_jsx("div", { className: "flex justify-center", children: _jsx(SchoolLogo, { size: "xl", showText: false }) }), _jsx("h2", { className: "mt-4 text-center text-2xl font-bold tracking-tight text-slate-900", children: "PANEL ADMIN SEKOLAH" }), _jsx("p", { className: "mt-1 text-center text-sm font-medium text-emerald-800", children: "Portal Masuk Dashboard Pengelolaan Sistem" })] }), _jsx("div", { className: "mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0", children: _jsxs("div", { className: "bg-white py-8 px-6 shadow-xl shadow-slate-200/80 rounded-2xl border border-slate-200 sm:px-10", children: [error && (_jsxs("div", { className: "mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm", children: [_jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0 text-rose-600" }), _jsx("span", { children: error })] })), setupMessage && (_jsxs("div", { className: "mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm", children: [_jsx(ShieldCheck, { className: "w-5 h-5 flex-shrink-0 text-emerald-600" }), _jsx("span", { children: setupMessage })] })), isSetupNeeded ? (
                                /* Formulir Inisialisasi Administrator Pertama (Terkunci Otomatis setelah terdaftar) */
                                _jsxs("form", { onSubmit: handleFirstAdminSetup, className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed", children: [_jsx("span", { className: "font-bold", children: "Inisialisasi Sistem:" }), " Belum ada akun administrator terdaftar. Silakan buat akun Superadmin pertama untuk mengamankan panel sekolah."] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Nama Lengkap" }), _jsx("input", { type: "text", required: true, value: setupFullName, onChange: (e) => setSetupFullName(e.target.value), className: "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Alamat Email" }), _jsx("input", { type: "email", required: true, value: setupEmail, onChange: (e) => setSetupEmail(e.target.value), className: "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Username Baru" }), _jsx("input", { type: "text", required: true, value: setupUsername, onChange: (e) => setSetupUsername(e.target.value), className: "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Token Setup Administrator" }), _jsx("input", { type: "password", required: true, minLength: 32, value: setupToken, onChange: (e) => setSetupToken(e.target.value), autoComplete: "off", className: "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm" }), _jsx("p", { className: "mt-1 text-[11px] text-slate-500", children: "Token harus sama dengan ADMIN_SETUP_TOKEN yang disimpan operator di environment server." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Kata Sandi (Min. 12 Karakter)" }), _jsx("input", { type: "password", required: true, value: setupPassword, onChange: (e) => setSetupPassword(e.target.value), className: "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm" })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-all shadow-md disabled:opacity-60", children: isSubmitting ? 'Memproses Setup...' : 'Buat Administrator Utama' })] })) : (
                                /* Formulir Login Admin Standar */
                                _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1.5", children: "Username atau Email" }), _jsxs("div", { className: "relative rounded-xl shadow-sm", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400", children: _jsx(User, { className: "h-5 w-5" }) }), _jsx("input", { type: "text", required: true, value: username, onChange: (e) => setUsername(e.target.value), className: "block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm transition-all" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1.5", children: "Kata Sandi" }), _jsxs("div", { className: "relative rounded-xl shadow-sm", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400", children: _jsx(Lock, { className: "h-5 w-5" }) }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm transition-all" })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-all shadow-md shadow-emerald-700/20 disabled:opacity-60 cursor-pointer", children: isSubmitting ? ('Memverifikasi Kredensial...') : (_jsxs(_Fragment, { children: [_jsx("span", { children: "Masuk ke Dashboard" }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) }) })] })), _jsxs("div", { className: "mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-600" }), "Sistem Terenkripsi"] }), _jsx("a", { href: "/", className: "text-emerald-700 hover:text-emerald-800 hover:underline", children: "\u2190 Kembali ke Website Publik" })] })] }) })] })] }));
};
export default AdminLogin;
