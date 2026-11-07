import React from 'react';

const SOCIAL_NETWORKS = [
    { key: 'tiktok_url', label: 'TikTok', icon: 'ri-tiktok-fill', color: '#ffffff', hover: '#111111' },
    { key: 'instagram_url', label: 'Instagram', icon: 'ri-instagram-line', color: '#e1306c', hover: '#c13584' },
    { key: 'facebook_url', label: 'Facebook', icon: 'ri-facebook-fill', color: '#1877f2', hover: '#166fe5' },
    { key: 'youtube_url', label: 'YouTube', icon: 'ri-youtube-fill', color: '#ff0033', hover: '#cc0000' }
];

export const SocialLinks = ({ settings, profile, className = '' }) => {
    const links = SOCIAL_NETWORKS
        .filter(({ key }) => settings?.[key])
        .map(network => ({ ...network, href: settings[network.key] }));
    const whatsappNumber = profile?.whatsapp?.replace(/\D/g, '');
    if (whatsappNumber) {
        links.push({
            key: 'whatsapp',
            label: 'WhatsApp',
            icon: 'ri-whatsapp-fill',
            color: '#25d366',
            hover: '#1da851',
            href: `https://wa.me/${whatsappNumber}`
        });
    }

    if (!links.length) return null;

    return (
        <div className={`flex flex-wrap items-center gap-2.5 ${className}`} aria-label="Media sosial sekolah">
            {links.map(({ key, label, icon, color, hover, href }) => (
                <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="social-brand-link group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    style={{ '--social-brand-color': color, '--social-brand-hover': hover }}
                >
                    <i className={`${icon} text-[19px] leading-none`} aria-hidden="true" />
                </a>
            ))}
        </div>
    );
};

export default SocialLinks;
