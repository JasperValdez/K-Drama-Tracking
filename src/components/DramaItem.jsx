import React, { useState, useRef } from 'react';
import { Trash2, CheckCircle, Clock, Pencil, Star, Ban, Info, ChevronDown, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DramaItem({ drama, onDelete, onToggle, onRate, onEdit, onStatusChange, onRewatch }) {
  const [showSynopsis, setShowSynopsis] = useState(false);
  const isFinished = drama.is_completed;
  const isDropped = drama.status === 'Dropped';
  
  const timerRef = useRef(null);
  const [isHolding, setIsHolding] = useState(false);

  const handleToggleDetails = (e) => {
    e.stopPropagation();
    setShowSynopsis(!showSynopsis);
  };

  const handleRewatchUpdate = (delta) => {
    const newCount = (drama.rewatch_count || 0) + delta;
    if (newCount >= 0) {
      onRewatch(drama.id, newCount);
    }
  };

  const startPress = (e) => {
    e.stopPropagation();
    setIsHolding(true);
    timerRef.current = setTimeout(() => {
      onRewatch(drama.id, 0);
      toast.info(`Reset rewatches for ${drama.title}`);
      setIsHolding(false);
    }, 800);
  };

  const cancelPress = (e) => {
    if (e) e.stopPropagation();
    setIsHolding(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className={`group flex flex-col bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border transition-all duration-500 shadow-xl h-full relative
      ${isFinished ? 'border-green-500/30' : isDropped ? 'border-red-500/20 opacity-95' : 'border-slate-800 hover:border-pink-500/40 md:hover:-translate-y-2'}`}>
      
      {/* Poster Image Area */}
      <div 
        className="relative aspect-[2/3] overflow-hidden cursor-pointer z-0"
        onClick={handleToggleDetails}
      >
        <img 
          src={drama.image} 
          className={`w-full h-full object-cover transition-all duration-700 ${showSynopsis ? 'scale-110 blur-sm' : 'group-hover:scale-105'}`} 
          alt={drama.title} 
        />
        
        {/* --- FIXED: TOP BADGES (YEAR & GENRE) LIFTED ABOVE BLUR --- */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-30">
          <span className="bg-slate-950/80 backdrop-blur-md text-white font-black px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] border border-white/20 uppercase tracking-widest shadow-lg">
            {drama.year || "N/A"}
          </span>
          {drama.genre && (
            <span className="bg-pink-600/90 backdrop-blur-md text-white font-black px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] border border-white/20 uppercase tracking-widest shadow-lg">
              {drama.genre}
            </span>
          )}
        </div>

        {/* --- FIXED: REWATCH COUNT BADGE LIFTED ABOVE BLUR --- */}
        {drama.rewatch_count > 0 && !showSynopsis && (
          <div className="absolute top-12 left-3 z-30 pointer-events-none animate-in fade-in zoom-in duration-500">
            <div className="bg-amber-500 text-slate-950 font-black px-2 py-1 rounded-md text-[7px] md:text-[9px] uppercase tracking-tighter shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center gap-1 border border-amber-300">
              <RotateCcw size={10} strokeWidth={3} /> {drama.rewatch_count}x Rewatched
            </div>
          </div>
        )}

        {/* Completed Overlay (Z-INDEX 20 - Now sits behind the badges) */}
        {isFinished && !showSynopsis && (
          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center backdrop-blur-[2px] pointer-events-none z-20">
            <span className="bg-green-500 text-white font-black px-4 py-1.5 rounded-full text-[9px] tracking-[0.2em] uppercase shadow-xl border border-white/20">
              Completed
            </span>
          </div>
        )}

        {/* Synopsis Drawer */}
        <AnimatePresence>
          {showSynopsis && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-4 flex flex-col justify-end z-40"
            >
              <div className="mb-2 flex items-center gap-2 text-pink-500">
                <Info size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Synopsis</span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-200 leading-relaxed line-clamp-6 mb-4 italic">
                {drama.overview || "No summary available in the vault."}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center flex flex-col justify-center min-w-0">
                   <p className="text-[7px] text-slate-500 uppercase font-black mb-1 tracking-widest">Leads</p>
                   <p className="text-[8px] md:text-[9px] text-white font-bold px-1 break-words leading-tight">
                    {drama.main_actor || "Unknown"}
                   </p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center flex flex-col justify-center">
                   <p className="text-[7px] text-slate-500 uppercase font-black mb-1 tracking-widest">Length</p>
                   <p className="text-[9px] text-white font-bold">{drama.total_episodes || "16"} Eps</p>
                </div>
              </div>
              
              <button onClick={handleToggleDetails} className="w-full flex justify-center py-1 text-slate-400 hover:text-white">
                <ChevronDown size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Area (Rest of the component remains the same) */}
      <div className="p-3 md:p-5 flex-1 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mb-4">
          <h3 className="font-black text-sm md:text-lg leading-tight text-white mb-1 line-clamp-1 group-hover:text-pink-500 transition-colors">
            {drama.title}
          </h3>
          <button 
            onClick={handleToggleDetails}
            className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-pink-500"
          >
            Details <Info size={10} />
          </button>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between bg-slate-950/50 p-2 md:p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Score</span>
            </div>
            <select 
              value={drama.rating} 
              onChange={(e) => onRate(drama.id, parseInt(e.target.value))}
              className="bg-transparent text-yellow-500 font-black text-xs md:text-sm outline-none cursor-pointer border-none text-right appearance-none"
            >
              {[...Array(11).keys()].map(n => <option key={n} value={n} className="bg-slate-900">{n}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-5 gap-1.5 h-10 md:h-12">
            <button 
              onClick={() => onToggle(drama.id)} 
              className={`flex items-center justify-center rounded-xl transition-all active:scale-90 
                ${isFinished ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {isFinished ? <CheckCircle size={18} /> : <Clock size={18} />}
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); handleRewatchUpdate(1); }}
              onContextMenu={(e) => { e.preventDefault(); handleRewatchUpdate(-1); }}
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              className={`relative flex flex-col items-center justify-center rounded-xl transition-all active:scale-75 border border-transparent
                ${isHolding ? 'bg-amber-500 text-slate-950 scale-95 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-amber-400'}`}
            >
              <RotateCcw size={14} className={`${drama.rewatch_count > 0 ? "text-amber-500" : ""} ${isHolding ? "animate-bounce text-slate-950" : ""}`} />
              <span className={`text-[8px] font-black mt-0.5 ${drama.rewatch_count > 0 && !isHolding ? "text-amber-500" : ""}`}>
                {drama.rewatch_count || 0}
              </span>
            </button>

            <button 
              onClick={() => onStatusChange(drama.id, isDropped ? 'Watching' : 'Dropped')} 
              className={`flex items-center justify-center rounded-xl transition-all active:scale-90 
                ${isDropped ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-red-500'}`}
            >
              <Ban size={16} />
            </button>

            <button onClick={onEdit} className="flex items-center justify-center bg-slate-800 text-slate-400 rounded-xl hover:text-blue-400 active:scale-90">
              <Pencil size={16} />
            </button>
            
            <button onClick={() => onDelete(drama.id)} className="flex items-center justify-center bg-slate-800 text-slate-400 rounded-xl hover:text-red-600 active:scale-90">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}