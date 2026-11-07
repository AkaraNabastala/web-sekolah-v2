import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from '../../hooks/useToast';
import { schoolApi } from '../../services/api';
import { RichTextEditor } from '../../components/common/RichTextEditor';
const fieldClass = "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-800 outline-none transition focus:border-[var(--school-primary)] focus:ring-2 focus:ring-stone-100";
export const ManageVisionMission = () => {
    const [data, setData] = useState(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        schoolApi.getVisionMission()
            .then(result => setData({ ...result, missions: result.missions || [], goals: result.goals || [] }))
            .catch(() => toast.error('Gagal memuat visi dan misi.'));
    }, []);
    const updateMission = (index, value) => {
        if (!data)
            return;
        const missions = [...(data.missions || [])];
        missions[index] = value;
        setData({ ...data, missions });
    };
    const save = async (event) => {
        event.preventDefault();
        if (!data)
            return;
        setSaving(true);
        try {
            const result = await schoolApi.updateVisionMission(data);
            if (result.success)
                toast.success('Visi dan misi berhasil disimpan.');
        }
        catch {
            toast.error('Gagal menyimpan visi dan misi.');
        }
        finally {
            setSaving(false);
        }
    };
    if (!data)
        return _jsx("div", { className: "p-8 text-center text-sm text-stone-500", children: "Memuat data..." });
    return (_jsxs("div", { className: "space-y-6 pb-12", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h1", { className: "text-2xl font-bold text-stone-900", children: "Visi dan Misi" }), _jsxs("button", { form: "vision-mission-form", type: "submit", disabled: saving, className: "inline-flex items-center gap-2 rounded-xl bg-[var(--school-primary)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60", children: [_jsx(Save, { className: "h-4 w-4" }), saving ? 'Menyimpan...' : 'Simpan'] })] }), _jsxs("form", { id: "vision-mission-form", onSubmit: save, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-2", children: [_jsxs("section", { className: "space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-stone-900", children: "Visi" }), _jsx(RichTextEditor, { rows: 7, value: (data.vision || '') ?? '', onChange: vision => setData({ ...data, vision }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-semibold text-stone-600", children: "Motto (opsional)" }), _jsx("input", { value: (data.vision_motto || '') ?? '', onChange: event => setData({ ...data, vision_motto: event.target.value }), className: fieldClass })] })] }), _jsxs("section", { className: "space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("h2", { className: "text-lg font-semibold text-stone-900", children: "Misi" }), _jsxs("button", { type: "button", onClick: () => setData({ ...data, missions: [...(data.missions || []), ''] }), className: "inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50", children: [_jsx(Plus, { className: "h-4 w-4" }), "Tambah poin"] })] }), _jsxs("div", { className: "max-h-[32rem] space-y-3 overflow-y-auto pr-1", children: [(data.missions || []).map((mission, index) => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsxs("span", { className: "mt-3 w-7 shrink-0 text-sm font-semibold text-stone-400", children: [index + 1, "."] }), _jsx("div", { className: "min-w-0 flex-1", children: _jsx(RichTextEditor, { rows: 3, value: (mission) ?? '', onChange: value => updateMission(index, value) }) }), _jsx("button", { type: "button", onClick: () => setData({ ...data, missions: data.missions.filter((_, i) => i !== index) }), "aria-label": `Hapus misi ${index + 1}`, className: "mt-2 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))), (!data.missions || data.missions.length === 0) && _jsx("p", { className: "text-sm text-stone-400", children: "Belum ada poin misi." })] })] })] }), _jsxs("section", { className: "space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("h2", { className: "text-lg font-semibold text-stone-900", children: "Tujuan Sekolah" }), _jsxs("button", { type: "button", onClick: () => setData({ ...data, goals: [...(data.goals || []), ''] }), className: "inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50", children: [_jsx(Plus, { className: "h-4 w-4" }), "Tambah tujuan"] })] }), (data.goals || []).map((goal, index) => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsxs("span", { className: "mt-3 w-7 shrink-0 text-sm font-semibold text-stone-400", children: [index + 1, "."] }), _jsx("div", { className: "min-w-0 flex-1", children: _jsx(RichTextEditor, { rows: 3, value: (goal) ?? '', onChange: value => { const goals = [...(data.goals || [])]; goals[index] = value; setData({ ...data, goals }); } }) }), _jsx("button", { type: "button", onClick: () => setData({ ...data, goals: (data.goals || []).filter((_, i) => i !== index) }), "aria-label": `Hapus tujuan ${index + 1}`, className: "mt-2 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index)))] })] })] }));
};
