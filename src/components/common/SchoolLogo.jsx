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
        ? `${configuredLogo}${configuredLogo.includes('?') ? '&' : '?'}v=${encodeURIComponent(settings?.updated_at || cacheVersion)}`
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

    return (
        <div className={`school-logo flex min-w-0 items-center gap-3 ${className}`}>
            <div className={`relative ${sizeClasses[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-lg`}>
                {isLoading ? (
                    <div aria-hidden="true" className="h-full w-full animate-pulse rounded-lg bg-white/15" />
                ) : logoSrc && !imgError ? (
                    <img key={logoSrc} src={logoSrc} alt={`Logo ${schoolName}`} onError={() => setImgError(true)} className="h-full w-full object-contain" />
                ) : (
                    <div aria-label={`Inisial ${schoolName}`} className="flex h-full w-full items-center justify-center rounded-lg bg-current/10 font-bold">
                        <span className="text-xs">{initials || 'SK'}</span>
                    </div>
                )}
            </div>
            {showText && (
                <div className="school-logo__text flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left leading-tight">
                    <span className={`school-logo__name block w-full whitespace-normal text-left font-bold uppercase tracking-tight [overflow-wrap:anywhere] ${textSizeClasses[size]} ${lightText ? 'text-white' : 'text-emerald-950'}`}>
                        {schoolName}
                    </span>
                    <span className={`school-logo__tagline block w-full whitespace-normal text-left text-[9px] font-semibold uppercase leading-snug tracking-[0.12em] [overflow-wrap:anywhere] ${lightText ? 'text-emerald-200' : 'text-emerald-700'}`}>
                        {tagline}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SchoolLogo;
