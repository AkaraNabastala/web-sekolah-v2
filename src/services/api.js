import axios from 'axios';
export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});
// Session JWT berada di cookie HttpOnly; JavaScript hanya mengirim token CSRF non-HttpOnly.
api.interceptors.request.use((config) => {
    if (typeof document !== 'undefined' && !['get', 'head', 'options'].includes((config.method || 'get').toLowerCase())) {
        const csrfCookie = document.cookie.split('; ').find(part => part.startsWith('school_csrf='));
        const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.slice('school_csrf='.length)) : '';
        if (csrfToken)
            config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
});
// Intercept 401 Unauthorized
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('school_admin_token');
        localStorage.removeItem('school_admin_user');
        window.location.href = '/admin/login';
    }
    return Promise.reject(error);
});
// API Helper Methods
export const schoolApi = {
    // Public
    getProfile: () => api.get('/school-profile').then(r => r.data.data),
    getHistory: () => api.get('/school-history').then(r => r.data.data),
    getVisionMission: () => api.get('/vision-mission').then(r => r.data.data),
    getOrganization: () => api.get('/organization').then(r => r.data.data),
    getTeachers: () => api.get('/teachers').then(r => r.data.data),
    getStaff: () => api.get('/staff').then(r => r.data.data),
    getNews: (category) => api.get('/news', { params: { category } }).then(r => r.data.data),
    getNewsBySlug: (slug) => api.get(`/news/${slug}`).then(r => r.data.data),
    getNewsCategories: () => api.get('/news/categories').then(r => r.data.data),
    getGallery: (category) => api.get('/gallery', { params: { category } }).then(r => r.data.data),
    getGalleryAlbums: () => api.get('/gallery/albums').then(r => r.data.data),
    getAchievements: () => api.get('/achievements').then(r => r.data.data),
    getFacilities: () => api.get('/facilities').then(r => r.data.data),
    getPPDB: () => api.get('/ppdb').then(r => r.data.data),
    getSettings: () => api.get('/settings').then(r => r.data.data),
    sendContactMessage: (data) => api.post('/contact', data).then(r => r.data),
    logVisitor: (path) => api.post('/visitor/log', { path, referrer: document.referrer }),
    // Auth
    login: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
    logout: () => api.post('/auth/logout').then(r => r.data),
    getMe: () => api.get('/auth/me').then(r => r.data.user),
    updateAdminProfile: (data) => api.put('/auth/profile', data).then(r => r.data),
    changePassword: (data) => api.put('/auth/password', data).then(r => r.data),
    // Admin Dashboard
    getDashboardStats: () => api.get('/admin/dashboard/statistics').then(r => r.data.data),
    getAdminActivities: () => api.get('/admin/dashboard/activities').then(r => r.data.data),
    // Admin Profile & Identity
    updateProfile: (data) => api.put('/admin/school-profile', data).then(r => r.data),
    updateHistory: (data) => api.put('/admin/school-history', data).then(r => r.data),
    updateVisionMission: (data) => api.put('/admin/vision-mission', data).then(r => r.data),
    // Admin Organization
    createOrgMember: (data) => api.post('/admin/organization', data).then(r => r.data),
    updateOrgMember: (id, data) => api.put(`/admin/organization/${id}`, data).then(r => r.data),
    deleteOrgMember: (id) => api.delete(`/admin/organization/${id}`).then(r => r.data),
    // Admin Teachers & Staff
    createTeacher: (data) => api.post('/admin/teachers', data).then(r => r.data),
    updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data).then(r => r.data),
    deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`).then(r => r.data),
    createStaff: (data) => api.post('/admin/staff', data).then(r => r.data),
    updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data).then(r => r.data),
    deleteStaff: (id) => api.delete(`/admin/staff/${id}`).then(r => r.data),
    // Admin News
    getAdminNews: () => api.get('/admin/news').then(r => r.data.data),
    createNews: (data) => api.post('/admin/news', data).then(r => r.data),
    updateNews: (id, data) => api.put(`/admin/news/${id}`, data).then(r => r.data),
    deleteNews: (id) => api.delete(`/admin/news/${id}`).then(r => r.data),
    createNewsCategory: (data) => api.post('/admin/news/categories', data).then(r => r.data),
    // Admin Gallery
    createGalleryMedia: (data) => api.post('/admin/gallery', data).then(r => r.data),
    deleteGalleryMedia: (id) => api.delete(`/admin/gallery/${id}`).then(r => r.data),
    createGalleryAlbum: (data) => api.post('/admin/gallery/albums', data).then(r => r.data),
    deleteGalleryAlbum: (id) => api.delete(`/admin/gallery/albums/${id}`).then(r => r.data),
    // Admin Achievements
    createAchievement: (data) => api.post('/admin/achievements', data).then(r => r.data),
    updateAchievement: (id, data) => api.put(`/admin/achievements/${id}`, data).then(r => r.data),
    deleteAchievement: (id) => api.delete(`/admin/achievements/${id}`).then(r => r.data),
    // Admin Facilities
    createFacility: (data) => api.post('/admin/facilities', data).then(r => r.data),
    updateFacility: (id, data) => api.put(`/admin/facilities/${id}`, data).then(r => r.data),
    deleteFacility: (id) => api.delete(`/admin/facilities/${id}`).then(r => r.data),
    // Agendas
    getAgendas: () => api.get('/agendas').then(r => r.data.data),
    getAdminAgendas: () => api.get('/admin/agendas').then(r => r.data.data),
    createAgenda: (data) => api.post('/admin/agendas', data).then(r => r.data),
    updateAgenda: (id, data) => api.put(`/admin/agendas/${id}`, data).then(r => r.data),
    deleteAgenda: (id) => api.delete(`/admin/agendas/${id}`).then(r => r.data),
    // Programs & Extracurricular
    getPrograms: (category) => api.get('/programs', { params: { category } }).then(r => r.data.data),
    getAdminPrograms: () => api.get('/admin/programs').then(r => r.data.data),
    createProgram: (data) => api.post('/admin/programs', data).then(r => r.data),
    updateProgram: (id, data) => api.put(`/admin/programs/${id}`, data).then(r => r.data),
    deleteProgram: (id) => api.delete(`/admin/programs/${id}`).then(r => r.data),
    // Central content categories
    getContentCategories: (scope) => api.get('/admin/content-categories', { params: { scope } }).then(r => r.data.data),
    createContentCategory: (data) => api.post('/admin/content-categories', data).then(r => r.data),
    updateContentCategory: (id, scope, data) => api.put(`/admin/content-categories/${scope}/${id}`, data).then(r => r.data),
    deleteContentCategory: (id, scope) => api.delete(`/admin/content-categories/${scope}/${id}`).then(r => r.data),
    // Announcements
    getAnnouncements: () => api.get('/announcements').then(r => r.data.data),
    getAdminAnnouncements: () => api.get('/admin/announcements').then(r => r.data.data),
    createAnnouncement: (data) => api.post('/admin/announcements', data).then(r => r.data),
    updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data).then(r => r.data),
    deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`).then(r => r.data),
    // SPMB / PPDB application workflow
    submitAdmissionApplication: (data) => api.post('/admissions/applications', data).then(r => r.data),
    uploadAdmissionDocument: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/admissions/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return response.data;
    },
    getAdmissionApplications: () => api.get('/admin/admission-applications').then(r => r.data.data),
    updateAdmissionApplication: (id, data) => api.put(`/admin/admission-applications/${id}`, data).then(r => r.data),
    // Admin PPDB
    updatePPDB: (data) => api.put('/admin/ppdb', data).then(r => r.data),
    // Admin Messages
    getAdminMessages: () => api.get('/admin/messages').then(r => r.data.data),
    markMessageRead: (id, is_read) => api.put(`/admin/messages/${id}/read`, { is_read }).then(r => r.data),
    deleteMessage: (id) => api.delete(`/admin/messages/${id}`).then(r => r.data),
    // Admin Settings
    updateSettings: (data) => api.put('/admin/settings', data).then(r => r.data),
    // File Upload
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },
    // Admin Users & Roles
    getAdminUsers: () => api.get('/admin/users').then(r => r.data.data),
    createAdminUser: (data) => api.post('/admin/users', data).then(r => r.data),
    deleteAdminUser: (id) => api.delete(`/admin/users/${id}`).then(r => r.data),
    // System & Database Status
    getDatabaseStatus: () => api.get('/system/database-status').then(r => r.data)
};
