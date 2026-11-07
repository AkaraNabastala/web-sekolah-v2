import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
export const SchoolLogo = ({ className = '', size = 'md', showText = true, lightText = false }) => {
    const { settings, profile, isLoading } = useSchool();
    const [imgError, setImgError] = useState(false);
    const [cacheVersion] = useState(() => Date.now());
    const schoolName = settings?.school_name || profile?.name || 'Nama Sekolah Anda';
    const tagline = settings?.tagline || 'Website Resmi Sekolah';
    const configuredLogo = settings?.logo_url?.trim();
    const logoSrc = configuredLogo
        ? `${configuredLogo}${configuredLogo.includes('?') ? '&' : '?'}v=${cacheVersion}`
        : '';
    const initials = schoolName.split(/\s+/).filter(Boolean).slice(0, 3).map(word => word[0]).join('').toUpperCase();
    useEffect(() => {
        setImgError(false);
    }, [logoSrc]);
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-11 h-11',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20'
    };
    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
        xl: 'text-2xl'
    };
    return (_jsxs("div", { className: `flex items-center gap-3 ${className}`, children: [_jsx("div", { className: `relative ${sizeClasses[size]} shrink-0 flex items-center justify-center overflow-hidden rounded-lg`, children: isLoading ? (_jsx("div", { "aria-hidden": "true", className: "h-full w-full animate-pulse rounded-lg bg-white/15" })) : logoSrc && !imgError ? (_jsx("img", { src: logoSrc, alt: `Logo ${schoolName}`, onError: () => setImgError(true), className: "w-full h-full object-contain" }, logoSrc)) : (_jsx("div", { "aria-label": `Inisial ${schoolName}`, className: "w-full h-full flex items-center justify-center rounded-lg bg-current/10 font-bold", children: _jsx("span", { className: "text-xs", children: initials || 'SK' }) })) }), showText && (_jsxs("div", { className: "flex flex-col text-left leading-tight min-w-0", children: [_jsx("div", { className: `font-bold uppercase tracking-tight truncate ${textSizeClasses[size]} ${lightText ? 'text-white' : 'text-emerald-950'}`, children: _jsx("span", { children: schoolName }) }), _jsx("span", { className: `text-[9px] uppercase tracking-widest font-semibold truncate ${lightText ? 'text-emerald-200' : 'text-emerald-700'}`, children: tagline })] }))] }));
};
