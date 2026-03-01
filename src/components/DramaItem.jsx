import React from 'react';
import { Trash2, CheckCircle, Clock, Pencil, Star, Ban } from 'lucide-react';

export default function DramaItem({ drama, onDelete, onToggle, onRate, onEdit, onStatusChange }) {
  const isFinished = drama.is_completed;
  const isDropped = drama.status === 'Dropped';

  return (
    <div className={`flex flex-col bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border transition-all duration-500 shadow-xl h-full
      ${isFinished ? 'border-green-500/30' : isDropped ? 'border-red-500/20 opacity-80' : 'border-slate-800 hover:border-pink-500/40 md:hover:-translate-y-2'}`}>
      
      {/* Poster Image Area */}
      <div className="relative aspect-[2/3] group overflow-hidden">
        <img 
          src={drama.image} 
          className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110" 
          alt={drama.title} 
        />
        
        {/* Overlay Badges */}
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center backdrop-blur-[3px]">
            <span className="bg-green-500 text-white font-black px-3 py-1 md:px-5 md:py-2 rounded-full text-[8px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase shadow-lg shadow-green-500/20">
              Completed
            </span>
          </div>
        )}
        {isDropped && !isFinished && (
          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-500 text-white font-black px-3 py-1 md:px-5 md:py-2 rounded-full text-[8px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase shadow-lg">
              Dropped
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 md:p-6 flex-1 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mb-3 md:mb-6">
          <h3 className="font-black text-sm md:text-xl leading-tight text-white mb-1 line-clamp-1">
            {drama.title}
          </h3>
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
            {drama.year || "N/A"}
          </p>
        </div>

        <div className="mt-auto space-y-2.5 md:space-y-4">
          {/* Rating Select */}
          <div className="flex items-center justify-between bg-slate-950/50 p-2 md:p-3 rounded-lg md:rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1 md:gap-2">
              <Star size={12} className="text-yellow-500 fill-yellow-500 md:w-[14px] md:h-[14px]" />
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Score</span>
            </div>
            <select 
              value={drama.rating} 
              onChange={(e) => onRate(drama.id, parseInt(e.target.value))}
              className="bg-transparent text-yellow-500 font-black text-[11px] md:text-sm outline-none cursor-pointer border-none"
            >
              {[...Array(11).keys()].map(n => <option key={n} value={n} className="bg-slate-900">{n}</option>)}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 md:gap-2 h-9 md:h-12">
            <button 
              onClick={() => onToggle(drama.id)} 
              className={`flex-[1.5] flex items-center justify-center rounded-lg md:rounded-2xl transition-all active:scale-90 
                ${isFinished ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {isFinished ? <CheckCircle size={16} className="md:w-5 md:h-5" /> : <Clock size={16} className="md:w-5 md:h-5" />}
            </button>

            <button 
              onClick={() => onStatusChange(drama.id, isDropped ? 'Watching' : 'Dropped')} 
              className={`flex-1 flex items-center justify-center rounded-lg md:rounded-2xl transition-all active:scale-90 
                ${isDropped ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-red-500'}`}
            >
              <Ban size={14} className="md:w-[18px] md:h-[18px]" />
            </button>

            <button 
              onClick={onEdit} 
              className="flex-1 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg md:rounded-2xl hover:text-blue-400 transition-all active:scale-90"
            >
              <Pencil size={14} className="md:w-[18px] md:h-[18px]" />
            </button>
            
            <button 
              onClick={() => onDelete(drama.id)} 
              className="flex-1 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg md:rounded-2xl hover:text-red-500 transition-all active:scale-90"
            >
              <Trash2 size={14} className="md:w-[18px] md:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}