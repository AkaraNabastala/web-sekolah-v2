import React from 'react';
import { ADMISSION_LABEL } from '../../config/admissions';
import { Link as RouterLink } from 'react-router-dom';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { SocialLinks } from './SocialLinks';
import { useSchool } from '../../context/SchoolContext';

const Link = ({ feature, ...props }) => {
    const { settings } = useSchool();
    let flags = settings?.feature_flags;
    if (typeof flags === 'string') {
        try { flags = JSON.parse(flags); } catch { flags = null; }
    }
    if (feature && flags?.[feature] === false) return null;
    return <RouterLink {...props} />;
};

export const Footer = () => {
    const { profile, settings } = useSchool();
    const navigation = [
        ['/', 'Beranda Utama'], ['/profil', 'Identitas & Profil Sekolah'], ['/sejarah', 'Sejarah Perjalanan', 'history'],
        ['/visi-misi', 'Visi, Misi & Nilai Utama'], ['/organisasi', 'Struktur Organisasi', 'organization'],
        ['/guru-staf', 'Guru & Tenaga Kependidikan', 'teachers'], ['/berita', 'Berita Sekolah', 'news'],
        ['/agenda', 'Agenda Kegiatan', 'agenda'], ['/pengumuman', 'Pengumuman', 'announcements']
    ];
    const services = [
        ['/ppdb', `Informasi ${ADMISSION_LABEL}`, 'ppdb'], ['/prestasi', 'Galeri Prestasi Siswa', 'achievements'],
        ['/fasilitas', 'Sarana & Fasilitas', 'facilities'], ['/galeri', 'Dokumentasi Foto & Video', 'gallery'],
        ['/kontak', 'Kirim Pesan / Kontak', 'contact']
    ];

    return (
        <footer className="relative overflow-hidden border-t-4 font-poppins text-white" style={{ backgroundColor: 'var(--school-primary)', borderTopColor: 'var(--school-secondary)' }}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5" />
            <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
                    <div className="space-y-4 sm:col-span-2 lg:col-span-4">
                        <SchoolLogo size="lg" lightText />
                        <p className="mt-3 text-xs leading-relaxed text-emerald-200/90">{profile?.description || settings?.tagline || 'Informasi dan profil resmi sekolah.'}</p>
                        <SocialLinks settings={settings} profile={profile} className="pt-2" />
                    </div>
                    <div className="space-y-3 lg:col-span-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><span className="h-2 w-2 rounded-full bg-amber-400" />Navigasi Halaman</h4>
                        <ul className="space-y-2 text-xs text-emerald-200/80">
                            {navigation.map(([to, label, feature]) => (
                                <li key={to}><Link to={to} feature={feature} className="flex items-center gap-1.5 transition-colors hover:text-amber-300"><ChevronRight className="h-3.5 w-3.5 shrink-0 text-emerald-600" /><span>{label}</span></Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-3 lg:col-span-2">
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><span className="h-2 w-2 rounded-full bg-amber-400" />Layanan & Info</h4>
                        <ul className="space-y-2 text-xs text-emerald-200/80">
                            {services.map(([to, label, feature]) => (
                                <li key={to}><Link to={to} feature={feature} className="flex items-center gap-1.5 transition-colors hover:text-amber-300"><ChevronRight className="h-3.5 w-3.5 shrink-0 text-emerald-600" /><span>{label}</span></Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-3 lg:col-span-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><span className="h-2 w-2 rounded-full bg-white/70" />Kontak Sekolah</h4>
                        <div className="space-y-2.5 text-xs text-emerald-200/80">
                            {profile?.address && <div className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><span>{profile.address}</span></div>}
                            {profile?.phone && <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-amber-400" /><a className="hover:text-white" href={`tel:${profile.phone}`}>{profile.phone}</a></div>}
                            {profile?.email && <div className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-amber-400" /><a className="hover:text-white" href={`mailto:${profile.email}`}>{profile.email}</a></div>}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-emerald-300/80 sm:flex-row">
                    <p>{settings?.footer_text || `© ${new Date().getFullYear()} ${settings?.school_name || profile?.name || 'Sekolah'}. Hak cipta dilindungi.`}</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/kontak" feature="contact" className="transition-colors hover:text-white">Kontak Sekolah</Link>
                        <span className="text-white/30">•</span>
                        <span className="text-white/70">Website sekolah dikembangkan oleh <span className="font-semibold" style={{ color: 'var(--school-secondary)' }}>Nabastala</span></span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
