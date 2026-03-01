import React, { useState, useEffect } from 'react';
import { Search, Loader2, X, Save } from 'lucide-react';

export default function EditModal({ drama, onClose, onSave }) {
  const [title, setTitle] = useState(drama.title);
  const [image, setImage] = useState(drama.image);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

  useEffect(() => {
    const search = async () => {
      if (title.length < 2 || title === drama.title) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&language=en-US`, {
          headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        const data = await res.json();
        setResults(data.results.slice(0, 3)); 
      } catch (err) { console.error("API Error:", err); }
      setLoading(false);
    };
    const debouncer = setTimeout(search, 500);
    return () => clearTimeout(debouncer);
  }, [title]);

  const handleSelectNew = (item) => {
    setTitle(item.name);
    setImage(item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : image);
    setResults([]);
  };

  return (
    <div className="fixed inset-0 bg-black/90 md:bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 z-[100] animate-in fade-in duration-300">
      {/* Modal Container: Pulls up from bottom on mobile, centers on desktop */}
      <div className="bg-slate-900 border-t md:border border-slate-800 p-6 md:p-8 rounded-t-[2.5rem] md:rounded-[3rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in duration-300 max-h-[95vh] overflow-y-auto no-scrollbar">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">Edit Drama</h2>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white md:hidden">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-5">
          {/* Title Search */}
          <div className="relative">
            <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2 mb-1.5 block">Search to Auto-Update</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-3 focus-within:ring-2 focus-within:ring-pink-500 transition-all">
              {loading ? <Loader2 size={16} className="animate-spin text-pink-500" /> : <Search size={16} className="text-slate-600" />}
              <input 
                className="flex-1 bg-transparent p-3 outline-none text-white font-bold text-sm md:text-base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: '16px' }} // Prevents iOS zoom
              />
            </div>

            {/* Live Search Results */}
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl z-20 border border-slate-700 animate-in fade-in slide-in-from-top-1">
                {results.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => handleSelectNew(item)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-pink-500/20 active:bg-pink-500/30 text-left border-b border-slate-700 last:border-none"
                  >
                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-8 h-12 object-cover rounded shadow" alt="" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.first_air_date?.split('-')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview & Manual URL Area */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-950/50 rounded-3xl border border-slate-800/50">
            <div className="col-span-1">
               <img src={image} className="w-full aspect-[2/3] object-cover rounded-xl shadow-xl border border-slate-800" alt="" />
            </div>
            <div className="col-span-2 flex flex-col justify-center gap-2">
              <label className="text-[9px] font-black text-slate-500 uppercase block">Manual Image URL</label>
              <textarea 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400 text-[10px] font-mono outline-none resize-none h-20"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pb-4 md:pb-0">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(drama.id, title, image)} 
            className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-black hover:bg-pink-500 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest shadow-lg shadow-pink-500/20"
          >
            <Save size={18} /> Update
          </button>
        </div>
      </div>
    </div>
  );
}