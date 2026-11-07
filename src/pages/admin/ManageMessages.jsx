import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../services/api';
import { Mail, Check, Trash2, X, ExternalLink } from 'lucide-react';
import { toast } from '../../hooks/useToast';
export const ManageMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const loadMessages = async () => {
        try {
            const res = await schoolApi.getAdminMessages();
            setMessages(res);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        loadMessages();
    }, []);
    const handleToggleRead = async (id, currentStatus) => {
        try {
            await schoolApi.markMessageRead(id, !currentStatus);
            toast.success('Status pesan diperbarui.');
            loadMessages();
        }
        catch (err) {
            toast.error('Gagal memperbarui status.');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Hapus pesan ini dari database?')) {
            try {
                await schoolApi.deleteMessage(id);
                toast.success('Pesan berhasil dihapus.');
                if (selectedMsg?.id === id)
                    setSelectedMsg(null);
                loadMessages();
            }
            catch (err) {
                toast.error('Gagal menghapus pesan.');
            }
        }
    };
    const handleOpenDetail = (msg) => {
        setSelectedMsg(msg);
        if (!msg.is_read) {
            schoolApi.markMessageRead(msg.id, true).then(() => loadMessages());
        }
    };
    return (_jsxs("div", { className: "space-y-6 font-poppins", children: [_jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: _jsx("div", { children: _jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Kotak Masuk Pesan Pengunjung" }) }) }), _jsx("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[10px] tracking-wider", children: [_jsx("th", { className: "py-3 px-4", children: "Pengirim & Kontak" }), _jsx("th", { className: "py-3 px-4", children: "Subjek Pesan" }), _jsx("th", { className: "py-3 px-4", children: "Tanggal Masuk" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-stone-100 font-normal", children: messages.length > 0 ? (messages.map((item) => (_jsxs("tr", { className: `hover:bg-stone-50/50 cursor-pointer ${!item.is_read ? 'bg-amber-50/30 font-medium' : ''}`, onClick: () => handleOpenDetail(item), children: [_jsxs("td", { className: "py-3 px-4", children: [_jsx("p", { className: "font-bold text-stone-900", children: item.name }), _jsxs("p", { className: "text-[10px] text-stone-400", children: [item.email, " ", item.phone ? `• ${item.phone}` : ''] })] }), _jsxs("td", { className: "py-3 px-4", children: [_jsx("p", { className: "font-semibold text-emerald-800 line-clamp-1", children: item.subject }), _jsx("p", { className: "text-[11px] text-stone-500 line-clamp-1 font-normal", children: item.message })] }), _jsx("td", { className: "py-3 px-4 text-stone-400 text-[11px]", children: new Date(item.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.is_read ? 'bg-stone-100 text-stone-600' : 'bg-amber-100 text-amber-800'}`, children: item.is_read ? 'Sudah Dibaca' : 'Pesan Baru' }) }), _jsxs("td", { className: "py-3 px-4 text-right space-x-2", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => handleToggleRead(item.id, item.is_read), className: `p-1.5 rounded-lg transition-colors ${item.is_read ? 'text-stone-400 hover:text-amber-600' : 'text-emerald-700 bg-emerald-50'}`, title: item.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca', children: _jsx(Check, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleDelete(item.id), className: "p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors", title: "Hapus pesan", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, item.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "py-8 text-center text-stone-400 text-xs", children: "Belum ada pesan yang masuk." }) })) })] }) }) }), selectedMsg && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 border border-stone-100", children: [_jsxs("div", { className: "flex justify-between items-start border-b border-stone-100 pb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded", children: "Detail Pesan Pengunjung" }), _jsx("h3", { className: "text-lg font-bold text-stone-900 mt-2", children: selectedMsg.subject })] }), _jsx("button", { onClick: () => setSelectedMsg(null), className: "text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "space-y-2 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-100", children: [_jsxs("p", { children: [_jsx("span", { className: "font-bold text-stone-700", children: "Pengirim:" }), " ", selectedMsg.name] }), _jsxs("p", { children: [_jsx("span", { className: "font-bold text-stone-700", children: "Email:" }), " ", selectedMsg.email] }), _jsxs("p", { children: [_jsx("span", { className: "font-bold text-stone-700", children: "Telepon / WA:" }), " ", selectedMsg.phone || '-'] }), _jsxs("p", { children: [_jsx("span", { className: "font-bold text-stone-700", children: "Tanggal:" }), " ", new Date(selectedMsg.created_at).toLocaleString('id-ID')] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-bold text-stone-700", children: "Isi Pesan:" }), _jsx("div", { className: "p-4 rounded-2xl bg-white border border-stone-200 text-stone-700 text-xs leading-relaxed font-normal whitespace-pre-line", children: selectedMsg.message })] }), _jsxs("div", { className: "pt-4 border-t border-stone-100 flex flex-wrap justify-between items-center gap-2", children: [_jsxs("button", { onClick: () => handleDelete(selectedMsg.id), className: "text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "Hapus Pesan" })] }), _jsxs("div", { className: "flex gap-2", children: [selectedMsg.phone && (_jsxs("a", { href: `https://wa.me/${selectedMsg.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(selectedMsg.name)},%20kami%20dari%20pihak%20sekolah%20merespons%20pesan%20Anda:`, target: "_blank", rel: "noreferrer", className: "bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm", children: [_jsx("span", { children: "Balas WhatsApp" }), _jsx(ExternalLink, { className: "w-3.5 h-3.5" })] })), _jsxs("a", { href: `mailto:${selectedMsg.email}?subject=Re:%20${encodeURIComponent(selectedMsg.subject)}`, className: "bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all", children: [_jsx(Mail, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Kirim Email" })] })] })] })] }) }))] }));
};
