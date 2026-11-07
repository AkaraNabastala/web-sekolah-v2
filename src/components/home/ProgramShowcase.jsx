import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Clock, 
  UserCheck, 
  X, 
  Compass, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';
import { initialPrograms } from '../../services/fallbackData';

export const ProgramShowcase = ({ programs = initialPrograms }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState(null);

  const categories = [
    { id: 'all', label: 'Semua Program' },
    { id: 'unggulan', label: 'Program Unggulan' },
    { id: 'karakter', label: 'Pendidikan Karakter' }
  ];

  const filteredPrograms = activeTab === 'all' 
    ? programs 
    : programs.filter(p => p.category === activeTab);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Heading & Category Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-[var(--school-primary)] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kurikulum Terintegrasi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
              Program Unggulan & Pembinaan Karakter
            </h2>
            <p className="text-sm text-stone-600 font-normal leading-relaxed">
              Disusun untuk mengoptimalkan potensi intelektual, kecakapan berbahasa global, dan keluhuran budi pekerti peserta didik.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/70 rounded-2xl shrink-0 self-start md:self-auto">
            {categories.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-[var(--school-primary)] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPrograms.map((prog, idx) => (
            <div
              key={prog.id || idx}
              className="group bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-xl hover:border-[var(--school-secondary)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-stone-100 group-hover:bg-[var(--school-primary)] transition-colors duration-300" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--school-primary)] bg-stone-100 px-2.5 py-1 rounded-md">
                    {prog.category_name || 'Program'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">0{idx + 1}</span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-[var(--school-primary)] transition-colors leading-snug">
                  {prog.name}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal line-clamp-3">
                  {prog.description}
                </p>

                {/* Highlights List */}
                {prog.highlights && (
                  <ul className="space-y-1.5 pt-2 border-t border-stone-100 text-xs text-stone-600">
                    {prog.highlights.slice(0, 3).map((item, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedProgram(prog)}
                  className="text-xs font-bold text-[var(--school-primary)] hover:underline inline-flex items-center gap-1 group-hover:text-[var(--school-primary)] cursor-pointer"
                >
                  <span>Detail Silabus</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="p-1 rounded-lg text-stone-400 group-hover:text-[var(--school-primary)] transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Programs Link */}
        <div className="text-center pt-2">
          <Link
            to="/program"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--school-primary)] hover:text-stone-900 transition-colors"
          >
            <span>Buka Seluruh Kurikulum & Ekstrakurikuler</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--school-primary)] bg-stone-100 px-2.5 py-1 rounded-md">
                  {selectedProgram.category_name || 'Program Sekolah'}
                </span>
                <h3 className="font-bold text-xl text-stone-900 mt-2">{selectedProgram.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Deskripsi & Tujuan</h4>
                <p className="text-sm text-stone-700 leading-relaxed font-normal">
                  {selectedProgram.description}
                </p>
              </div>

              {selectedProgram.highlights && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Cakupan Keunggulan</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProgram.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {selectedProgram.schedule_info && (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Jadwal Pelaksanaan</span>
                    </div>
                    <p className="text-stone-600">{selectedProgram.schedule_info}</p>
                  </div>
                )}

                {selectedProgram.instructor && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tenaga Pembina</span>
                    </div>
                    <p className="text-stone-600">{selectedProgram.instructor}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-5 py-2.5 bg-[var(--school-primary)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
