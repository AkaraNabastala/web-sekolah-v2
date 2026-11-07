import { useEffect, useState } from 'react';
import { useSchool } from '../../context/SchoolContext';

export const SEO = ({ title, description = 'Website resmi sekolah. Informasi profil, program, berita, kegiatan, dan layanan pendidikan.', ogType = 'website', ogImage }) => {
    const { settings, profile } = useSchool();
    const [assetVersion] = useState(() => Date.now());
    const schoolName = settings?.school_name || profile?.name || 'Nama Sekolah Anda';
    const fullTitle = title ? `${title} — ${schoolName}` : schoolName;
    const resolvedOgImage = ogImage || settings?.logo_url || undefined;
    // The favicon represents the same primary school logo used throughout the site.
    // Keep the separately configured favicon as a compatibility fallback only.
    const faviconSource = settings?.logo_url || settings?.favicon_url;
    const faviconVersion = settings?.updated_at || assetVersion;
    const resolvedFavicon = faviconSource
        ? `${faviconSource}${faviconSource.includes('?') ? '&' : '?'}v=${encodeURIComponent(faviconVersion)}`
        : '/favicon.svg';

    useEffect(() => {
        if (document.title !== fullTitle) document.title = fullTitle;

        const setMetaTag = (selector, attr, value) => {
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                const property = selector.match(/property="([^"]+)"/)?.[1];
                const name = selector.match(/name="([^"]+)"/)?.[1];
                if (property) element.setAttribute('property', property);
                if (name) element.setAttribute('name', name);
                document.head.appendChild(element);
            }
            element.setAttribute(attr, value);
        };

        setMetaTag('meta[name="description"]', 'content', description);
        setMetaTag('meta[property="og:title"]', 'content', fullTitle);
        setMetaTag('meta[property="og:description"]', 'content', description);
        setMetaTag('meta[property="og:type"]', 'content', ogType);
        if (resolvedOgImage) setMetaTag('meta[property="og:image"]', 'content', resolvedOgImage);

        let favicon = document.querySelector('link[rel~="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = resolvedFavicon;
    }, [fullTitle, description, ogType, resolvedOgImage, resolvedFavicon]);

    return null;
};
