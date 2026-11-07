import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        errorMessage: ''
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, errorMessage: error.message };
    }
    componentDidCatch(error, errorInfo) {
        // Log error secara aman tanpa mencemari tampilan publik
        if (process.env.NODE_ENV !== 'production') {
            console.error('[ErrorBoundary caught error]', error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-[500px] flex items-center justify-center p-6 bg-[#FAF8F5]", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-3xl p-8 border border-[#ECE7DD] shadow-sm text-center space-y-5", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-[#FBF0EE] text-[#D94F3D] mx-auto flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-7 h-7" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: "text-xl font-bold text-[#1F2621]", children: "Terjadi Sedikit Kendala" }), _jsx("p", { className: "text-xs text-[#5C645D] leading-relaxed", children: "Halaman ini sementara tidak dapat dimuat dengan sempurna. Silakan muat ulang peramban atau kembali ke beranda utama sekolah." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-2 justify-center", children: [_jsxs("button", { onClick: () => window.location.reload(), className: "inline-flex items-center justify-center gap-2 bg-[#1B3B2B] text-white text-xs font-bold px-5 py-3 rounded-xl hover:bg-[#254F3A] transition-colors", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Muat Ulang" })] }), _jsxs(Link, { to: "/", onClick: () => this.setState({ hasError: false }), className: "inline-flex items-center justify-center gap-2 bg-[#EAE5DC] text-[#2C332D] text-xs font-bold px-5 py-3 rounded-xl hover:bg-[#DDD7CD] transition-colors", children: [_jsx(Home, { className: "w-4 h-4" }), _jsx("span", { children: "Halaman Utama" })] })] })] }) }));
        }
        return this.props.children;
    }
}
