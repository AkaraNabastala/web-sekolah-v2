import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
export const FloatingWhatsApp = () => {
    const { profile } = useSchool();
    const [showScroll, setShowScroll] = useState(false);
    useEffect(() => {
        const checkScroll = () => {
            setShowScroll(window.scrollY > 300);
        };
        window.addEventListener('scroll', checkScroll);
        return () => window.removeEventListener('scroll', checkScroll);
    }, []);
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const waNum = profile?.whatsapp?.replace(/\D/g, '');
    const waMsg = encodeURIComponent('Assalamu’alaikum, saya ingin bertanya mengenai informasi sekolah.');
    const waUrl = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : null;
    // Don't show in admin dashboard
    if (window.location.pathname.startsWith('/admin')) {
        return null;
    }
    return (_jsxs("div", { className: "fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 font-poppins", children: [showScroll && (_jsx("button", { onClick: scrollToTop, className: "w-10 h-10 rounded-full bg-emerald-900/90 text-white flex items-center justify-center shadow-lg hover:bg-emerald-800 transition-all hover:-translate-y-1", "aria-label": "Kembali ke atas", children: _jsx(ArrowUp, { className: "w-4 h-4" }) })), waUrl && _jsxs("a", { href: waUrl, target: "_blank", rel: "noreferrer", className: "group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-emerald-900/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95", children: [_jsxs("div", { className: "relative", children: [_jsx(MessageCircle, { className: "w-5 h-5 text-white" }), _jsx("span", { className: "absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse border-2 border-emerald-600" })] }), _jsxs("div", { className: "flex flex-col text-left leading-tight", children: [_jsx("span", { className: "text-[9px] uppercase tracking-wider text-emerald-100 font-medium", children: "Layanan Cepat" }), _jsx("span", { className: "text-xs font-bold", children: "Chat WhatsApp" })] })] })] }));
};
