import React, { useEffect, useState, useRef } from 'react';
import { Users, GraduationCap, Trophy, Award, Building, Sparkles } from 'lucide-react';

function useCounter(target, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTime = null;
    const startVal = 0;
    const endVal = Number(target) || 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * (endVal - startVal) + startVal));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(endVal);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration, trigger]);

  return count;
}

export const InteractiveStats = ({ settings }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const studentsCount = useCounter(settings?.stats_students || 840, 2200, isVisible);
  const teachersCount = useCounter(settings?.stats_teachers || 68, 2000, isVisible);
  const achievementsCount = useCounter(settings?.stats_achievements || 184, 2400, isVisible);
  const alumniCount = useCounter(settings?.stats_alumni || 9200, 2500, isVisible);

  const stats = [
    {
      id: 'students',
      label: 'Peserta Didik Aktif',
      count: studentsCount,
      suffix: '+',
      icon: Users,
      description: 'Siswa berprestasi di seluruh jenjang'
    },
    {
      id: 'teachers',
      label: 'Pendidik & Tenaga Ahli',
      count: teachersCount,
      suffix: '',
      icon: GraduationCap,
      description: '100% tersertifikasi dan berdedikasi'
    },
    {
      id: 'achievements',
      label: 'Kejuaraan & Prestasi',
      count: achievementsCount,
      suffix: '+',
      icon: Trophy,
      description: 'Tingkat Kota, Nasional & Dunia'
    },
    {
      id: 'alumni',
      label: 'Alumni Teladan',
      count: alumniCount,
      suffix: '+',
      icon: Award,
      description: 'Melanjutkan ke SMA/Universitas top'
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--school-primary)] text-white relative overflow-hidden"
    >
      {/* Background geometric accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--school-secondary)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[var(--school-secondary)] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kiprah & Rekam Jejak</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Capaian dan Dedikasi bagi Masa Depan Bangsa
          </h2>
          <p className="text-sm text-white/70 font-normal leading-relaxed">
            Angka nyata yang membuktikan komitmen SMP Labschool dalam menghadirkan ekosistem pendidikan unggul dan berkelanjutan.
          </p>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="relative group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--school-secondary)]/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 text-[var(--school-secondary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="text-3xl sm:text-5xl font-extrabold font-mono tabular-nums text-white tracking-tight flex items-baseline">
                  <span>{item.count.toLocaleString('id-ID')}</span>
                  <span className="text-[var(--school-secondary)] text-2xl sm:text-3xl ml-0.5">{item.suffix}</span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-white/95">
                  {item.label}
                </h3>
                <p className="mt-1 text-xs text-white/60 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
