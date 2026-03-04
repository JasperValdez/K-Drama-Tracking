import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star, RotateCcw, PieChart, Bookmark } from 'lucide-react';

export default function StatsModal({ isOpen, onClose, topDramas, avgScore, totalRewatches, dramas }) {
  // 1. Process Genre Data (Top 5)
  const genreStats = Object.entries(
    dramas.reduce((acc, d) => (d.genre ? { ...acc, [d.genre]: (acc[d.genre] || 0) + 1 } : acc), {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const medals = [
    { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { color: 'text-slate-300', bg: 'bg-slate-300/10' },
    { color: 'text-amber-600', bg: 'bg-amber-600/10' }
  ];

  if (!isOpen) return <AnimatePresence />;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
        >
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
                <Trophy size={20} className="text-slate-950" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Hall of Fame</h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </header>

          {/* Quick Stats Grid */}
          <section className="grid grid-cols-2 gap-4 mb-8">
            <StatCard label="Avg Rating" value={avgScore} icon={<Star size={16} fill="currentColor" />} color="text-yellow-500" />
            <StatCard label="Rewatch Score" value={totalRewatches} icon={<RotateCcw size={16} strokeWidth={3} />} color="text-amber-500" />
          </section>

          {/* Genre DNA */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4 ml-2 text-pink-500">
              <PieChart size={14} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Genre DNA</h3>
            </div>
            <div className="space-y-4 bg-slate-950/30 p-5 rounded-[2rem] border border-slate-800">
              {genreStats.length > 0 ? (
                genreStats.map(([genre, count]) => (
                  <GenreBar key={genre} genre={genre} count={count} total={dramas.length} />
                ))
              ) : (
                <EmptyState message="No genre data found" />
              )}
            </div>
          </section>

          {/* Top 3 Legends */}
          <section>
            <div className="flex items-center gap-2 mb-4 ml-2 text-amber-500">
              <Bookmark size={14} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">The Legends</h3>
            </div>
            <div className="space-y-3">
              {topDramas.length > 0 ? (
                topDramas.map((drama, i) => (
                  <LegendItem key={drama.id} drama={drama} rank={i} medal={medals[i]} />
                ))
              ) : (
                <EmptyState message="No rewatched dramas found" />
              )}
            </div>
          </section>

          <button
            onClick={onClose}
            className="w-full mt-8 py-4 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-pink-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Exit Vault Stats
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* Sub-Components for cleaner code */

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-3xl text-center hover:border-slate-600 transition-colors">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <div className={`flex items-center justify-center gap-1 ${color}`}>
      {icon}
      <span className="text-2xl font-black tracking-tighter">{value}</span>
    </div>
  </div>
);

const GenreBar = ({ genre, count, total }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-white uppercase tracking-wider">{genre}</span>
      <span className="text-[10px] font-bold text-slate-500">{count} Dramas</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(count / total) * 100}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-pink-600 to-rose-400 rounded-full"
      />
    </div>
  </div>
);

const LegendItem = ({ drama, rank, medal }) => (
  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${medal.bg} ${medal.color}`}>
      {rank + 1}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white truncate uppercase tracking-tight">{drama.title}</p>
      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
        <RotateCcw size={10} /> {drama.rewatch_count} Times
      </p>
    </div>
    <div className="text-yellow-500 font-black flex flex-col items-center">
      <span className="text-xs">{drama.rating}</span>
      <Star size={10} fill="currentColor" />
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <p className="text-center py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
    {message}
  </p>
);