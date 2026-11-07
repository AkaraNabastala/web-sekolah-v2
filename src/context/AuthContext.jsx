import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { schoolApi } from '../services/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Hapus token lama dari versi sebelumnya; sesi baru diverifikasi melalui cookie HttpOnly.
        localStorage.removeItem('school_admin_token');
        localStorage.removeItem('school_admin_user');
        // Pengunjung publik dan halaman login tidak membutuhkan sesi admin.
        // Periksa cookie hanya ketika URL awal memang berada di area dashboard.
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/admin') || currentPath === '/admin/login') {
            setIsLoading(false);
            return;
        }
        let active = true;
        schoolApi.getMe()
            .then(user => { if (active)
            setAdmin(user); })
            .catch(() => { if (active)
            setAdmin(null); })
            .finally(() => { if (active)
            setIsLoading(false); });
        return () => { active = false; };
    }, []);
    const login = async (username, password) => {
        try {
            const res = await schoolApi.login({ username, password });
            if (res.success && res.user) {
                setAdmin(res.user);
                return { success: true };
            }
            return { success: false, message: res.message || 'Login gagal.' };
        }
        catch (err) {
            const msg = err.response?.data?.message || 'Gagal masuk. Periksa kembali username dan password.';
            return { success: false, message: msg };
        }
    };
    const logout = () => {
        // Bersihkan state segera; penghapusan cookie dilakukan server.
        setAdmin(null);
        schoolApi.logout().catch(() => undefined);
        localStorage.removeItem('school_admin_token');
        localStorage.removeItem('school_admin_user');
    };
    const updateAdminUser = (user) => setAdmin(user);
    return (_jsx(AuthContext.Provider, { value: {
            admin,
            token: null,
            isAuthenticated: !!admin,
            isLoading,
            login,
            logout,
            updateAdminUser
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
