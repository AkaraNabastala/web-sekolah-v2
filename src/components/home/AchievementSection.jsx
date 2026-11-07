import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Medal, ArrowRight, Sparkles, ChevronRight, X, User } from 'lucide-react';
import { initialAchievements } from '../../services/fallbackData';

export const AchievementSection = ({ achievements = initialAchievements }) => {
  const [filter, setFilter] = useState('all');
  const [activeItem, setActiveItem] = useState(null);

  const levels = [
    { id: 'all', label: 'Semua Tingkat' },
    { id: 'Internasional', label: 'Internasional' },
    { id: 'Nasional', label: 'Nasional' }
  ];

  const filtered = filter === 'all'
    ? achievements
    : achievements.filter(a => a.level === filter);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header with Title and Level Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-100 pb-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Tradisi Prestasi Sekolah</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
              Jejak Keberhasilan Siswa & Tim Labschool
            </h2>
            <p className="text-sm text-stone-600 font-normal leading-relaxed">
              Konsistensi pembinaan minat dan bakat mengantarkan siswa-siswi meraih podium kehormatan di kancah nasional dan internasional.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl shrink-0 self-start md:self-auto">
            {levels.map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setFilter(lvl.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  filter === lvl.id
                    ? 'bg-white text-[var(--school-primary)] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item, idx) => {
            const isIntl = item.level === 'Internasional';
            return (
              <div
                key={item.id || idx}
                onClick={() => setActiveItem(item)}
                className="group relative bg-stone-50 hover:bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
              >
                {/* Glow sheen on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      isIntl 
                        ? 'bg-amber-100 text-amber-800 shadow-sm group-hover:bg-amber-200 group-hover:scale-105' 
                        : 'bg-stone-200/80 text-stone-700 group-hover:bg-[var(--school-primary)] group-hover:text-white'
                    }`}>
                      {isIntl ? <Trophy className="w-5 h-5" /> : <Medal className="w-5 h-5" />}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 font-mono">
                      <span>{item.year || '2026'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                        isIntl ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        Tingkat {item.level}
                      </span>
                      {item.category && (
                        <span className="text-[11px] text-stone-500 truncate">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-stone-900 group-hover:text-[var(--school-primary)] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {item.student_or_team && (
                      <p className="mt-2 text-xs text-stone-600 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{item.student_or_team}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between text-xs font-semibold text-[var(--school-primary)]">
                  <span>Lihat Detail</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center pt-2">
          <Link
            to="/prestasi"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--school-primary)] hover:text-stone-900 transition-colors"
          >
            <span>Buka Galeri Prestasi & Rekor Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Tingkat {activeItem.level} • {activeItem.year}
                  </span>
                  <h3 className="font-bold text-lg text-stone-900 mt-1 leading-snug">{activeItem.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-stone-700">
              {activeItem.student_or_team && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[11px] font-bold uppercase text-stone-400 block mb-0.5">Penerima Penghargaan</span>
                  <span className="font-bold text-stone-900 text-sm">{activeItem.student_or_team}</span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold uppercase text-stone-400 block mb-1">Catatan Prestasi</span>
                <p className="leading-relaxed font-normal text-stone-600">
                  {activeItem.description || 'Pencapaian gemilang yang diraih melalui seleksi ketat dan bimbingan intensif dari tim pembina olimpiade sekolah.'}
                </p>
              </div>

              {activeItem.organizer && (
                <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span>Penyelenggara Resmi: </span>
                  <span className="font-semibold text-stone-800">{activeItem.organizer}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-5 py-2.5 bg-[var(--school-primary)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
