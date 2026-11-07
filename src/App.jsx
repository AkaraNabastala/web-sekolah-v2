import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SEO } from './components/common/SEO';
// Public Pages
import { Home } from './pages/public/Home';
import { Profile } from './pages/public/Profile';
import { History } from './pages/public/History';
import { VisionMission } from './pages/public/VisionMission';
import { Organization } from './pages/public/Organization';
import { Teachers } from './pages/public/Teachers';
import { NewsList } from './pages/public/NewsList';
import { NewsDetail } from './pages/public/NewsDetail';
import { Gallery } from './pages/public/Gallery';
import { Achievements } from './pages/public/Achievements';
import { Facilities } from './pages/public/Facilities';
import { PPDB } from './pages/public/PPDB';
import { Contact } from './pages/public/Contact';
import { AgendaList } from './pages/public/AgendaList';
import { Announcements } from './pages/public/Announcements';
import { Programs } from './pages/public/Programs';
import { DesignPreview } from './pages/public/DesignPreview';
import { DesignPreviewV2 } from './pages/public/DesignPreviewV2';
import { NotFound } from './pages/public/NotFound';
// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardHome } from './pages/admin/DashboardHome';
import { DashboardPPDB } from './pages/admin/DashboardPPDB';
import { ManageProfile } from './pages/admin/ManageProfile';
import { ManageWelcome } from './pages/admin/ManageWelcome';
import { ManageHistory } from './pages/admin/ManageHistory';
import { ManageVisionMission } from './pages/admin/ManageVisionMission';
import { ManageNews } from './pages/admin/ManageNews';
import { ManageAgendas } from './pages/admin/ManageAgendas';
import { ManageAnnouncements } from './pages/admin/ManageAnnouncements';
import { ManageCategories } from './pages/admin/ManageCategories';
import { ManagePrograms } from './pages/admin/ManagePrograms';
import { ManageTeachers } from './pages/admin/ManageTeachers';
import { ManageOrganization } from './pages/admin/ManageOrganization';
import { ManageGallery } from './pages/admin/ManageGallery';
import { ManageAchievements } from './pages/admin/ManageAchievements';
import { ManageFacilities } from './pages/admin/ManageFacilities';
import { ManagePPDB } from './pages/admin/ManagePPDB';
import { ManageAdmissionApplications } from './pages/admin/ManageAdmissionApplications';
import { ManageMessages } from './pages/admin/ManageMessages';
import { ManageSettings } from './pages/admin/ManageSettings';
import { ManageAccount } from './pages/admin/ManageAccount';
import { VisitorStats } from './pages/admin/VisitorStats';
// Auto-scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};
// Public Website Layout Shell
const PublicLayout = ({ children }) => {
    return (_jsxs("div", { className: "public-shell min-h-screen flex flex-col bg-white", children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-1", children: _jsx(ErrorBoundary, { children: children }) }), _jsx(Footer, {}), _jsx(FloatingWhatsApp, {})] }));
};
const FeatureRoute = ({ feature, children }) => {
    const { settings } = useSchool();
    let flags = settings?.feature_flags;
    if (typeof flags === 'string') {
        try {
            flags = JSON.parse(flags);
        }
        catch {
            flags = null;
        }
    }
    return flags && flags[feature] === false ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(_Fragment, { children: children });
};
const AdminDashboardRoute = () => {
    const { admin } = useAuth();
    return admin?.role === 'admin_ppdb' ? _jsx(DashboardPPDB, {}) : _jsx(DashboardHome, {});
};
const RoleRoute = ({ roles, children }) => {
    const { admin } = useAuth();
    return admin && roles.includes(admin.role) ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/admin", replace: true });
};
const CONTENT_ADMIN_ROLES = ['superadmin', 'admin_konten'];
const PPDB_ADMIN_ROLES = ['superadmin', 'admin_ppdb'];
const SUPERADMIN_ROLES = ['superadmin'];
export const App = () => {
    return (_jsx(AuthProvider, { children: _jsx(SchoolProvider, { children: _jsxs(Router, { children: [_jsx(ScrollToTop, {}), _jsx(SEO, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(PublicLayout, { children: _jsx(Home, {}) }) }), _jsx(Route, { path: "/profil", element: _jsx(PublicLayout, { children: _jsx(Profile, {}) }) }), _jsx(Route, { path: "/sejarah", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "history", children: _jsx(History, {}) }) }) }), _jsx(Route, { path: "/visi-misi", element: _jsx(PublicLayout, { children: _jsx(VisionMission, {}) }) }), _jsx(Route, { path: "/organisasi", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "organization", children: _jsx(Organization, {}) }) }) }), _jsx(Route, { path: "/guru", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "teachers", children: _jsx(Teachers, {}) }) }) }), _jsx(Route, { path: "/guru-staf", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "teachers", children: _jsx(Teachers, {}) }) }) }), _jsx(Route, { path: "/berita", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "news", children: _jsx(NewsList, {}) }) }) }), _jsx(Route, { path: "/berita/:slug", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "news", children: _jsx(NewsDetail, {}) }) }) }), _jsx(Route, { path: "/agenda", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "agenda", children: _jsx(AgendaList, {}) }) }) }), _jsx(Route, { path: "/kegiatan", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "agenda", children: _jsx(AgendaList, {}) }) }) }), _jsx(Route, { path: "/pengumuman", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "announcements", children: _jsx(Announcements, {}) }) }) }), _jsx(Route, { path: "/program", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "programs", children: _jsx(Programs, {}) }) }) }), _jsx(Route, { path: "/kurikulum", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "programs", children: _jsx(Programs, {}) }) }) }), _jsx(Route, { path: "/ekstrakurikuler", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "programs", children: _jsx(Programs, {}) }) }) }), _jsx(Route, { path: "/galeri", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "gallery", children: _jsx(Gallery, {}) }) }) }), _jsx(Route, { path: "/prestasi", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "achievements", children: _jsx(Achievements, {}) }) }) }), _jsx(Route, { path: "/fasilitas", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "facilities", children: _jsx(Facilities, {}) }) }) }), _jsx(Route, { path: "/ppdb", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "ppdb", children: _jsx(PPDB, {}) }) }) }), _jsx(Route, { path: "/kontak", element: _jsx(PublicLayout, { children: _jsx(FeatureRoute, { feature: "contact", children: _jsx(Contact, {}) }) }) }), import.meta.env.DEV && (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/design-preview", element: _jsx(PublicLayout, { children: _jsx(DesignPreview, {}) }) }), _jsx(Route, { path: "/design-preview-v2", element: _jsx(PublicLayout, { children: _jsx(DesignPreviewV2, {}) }) })] })), _jsx(Route, { path: "/admin/login", element: _jsx(AdminLogin, {}) }), _jsxs(Route, { path: "/admin", element: _jsx(AdminLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(AdminDashboardRoute, {}) }), _jsx(Route, { path: "statistik", element: _jsx(RoleRoute, { roles: SUPERADMIN_ROLES, children: _jsx(VisitorStats, {}) }) }), _jsx(Route, { path: "profil", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageProfile, {}) }) }), _jsx(Route, { path: "sambutan", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageWelcome, {}) }) }), _jsx(Route, { path: "sejarah", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageHistory, {}) }) }), _jsx(Route, { path: "visi-misi", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageVisionMission, {}) }) }), _jsx(Route, { path: "berita", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageNews, {}) }) }), _jsx(Route, { path: "agenda", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageAgendas, {}) }) }), _jsx(Route, { path: "pengumuman", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageAnnouncements, {}) }) }), _jsx(Route, { path: "kategori", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageCategories, {}) }) }), _jsx(Route, { path: "program", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManagePrograms, {}) }) }), _jsx(Route, { path: "guru-staf", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageTeachers, {}) }) }), _jsx(Route, { path: "organisasi", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageOrganization, {}) }) }), _jsx(Route, { path: "galeri", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageGallery, {}) }) }), _jsx(Route, { path: "prestasi", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageAchievements, {}) }) }), _jsx(Route, { path: "fasilitas", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES, children: _jsx(ManageFacilities, {}) }) }), _jsx(Route, { path: "ppdb", element: _jsx(RoleRoute, { roles: PPDB_ADMIN_ROLES, children: _jsx(ManagePPDB, {}) }) }), _jsx(Route, { path: "penerimaan", element: _jsx(RoleRoute, { roles: PPDB_ADMIN_ROLES, children: _jsx(ManageAdmissionApplications, {}) }) }), _jsx(Route, { path: "pesan", element: _jsx(RoleRoute, { roles: SUPERADMIN_ROLES, children: _jsx(ManageMessages, {}) }) }), _jsx(Route, { path: "pengaturan", element: _jsx(RoleRoute, { roles: SUPERADMIN_ROLES, children: _jsx(ManageSettings, {}) }) }), _jsx(Route, { path: "akun", element: _jsx(RoleRoute, { roles: CONTENT_ADMIN_ROLES.concat(PPDB_ADMIN_ROLES), children: _jsx(ManageAccount, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(PublicLayout, { children: _jsx(NotFound, {}) }) })] })] }) }) }));
};
export default App;
