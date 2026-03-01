import React from 'react';
import { Trash2, CheckCircle, Clock, Pencil } from 'lucide-react';

export default function DramaItem({ drama, onDelete, onToggle, onRate, onEdit }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-pink-500/50 transition-all flex flex-col">
      {/* Poster Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src={drama.image} 
          alt={drama.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {drama.isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg">
            Completed
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className={`font-bold text-lg truncate ${drama.isCompleted ? 'text-slate-500' : 'text-slate-100'}`}>
          {drama.title}
        </h3>

        {/* Numeric Rating */}
        <div className="mt-2 flex items-center justify-between">
          <label className="text-[10px] uppercase text-slate-500 font-bold">Rating</label>
          <select 
            value={drama.rating}
            onChange={(e) => onRate(drama.id, e.target.value)}
            className="bg-slate-800 text-yellow-400 text-sm font-bold rounded px-2 py-1 outline-none border border-slate-700"
          >
            {[...Array(11).keys()].map(num => (
              <option key={num} value={num}>{num}/10</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
          <button 
            onClick={() => onToggle(drama.id)} 
            className={`p-2 rounded-lg transition-colors ${drama.isCompleted ? 'text-green-500 bg-green-500/10' : 'text-slate-400 bg-slate-800'}`}
          >
            {drama.isCompleted ? <CheckCircle size={18} /> : <Clock size={18} />}
          </button>
          
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg">
              <Pencil size={18} />
            </button>
            <button onClick={() => onDelete(drama.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}