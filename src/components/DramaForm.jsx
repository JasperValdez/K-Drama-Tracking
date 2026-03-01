import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Plus } from 'lucide-react';

export default function DramaForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const API_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

  useEffect(() => {
    const search = async () => {
      if (title.trim().length < 2) { 
        setResults([]); 
        return; 
      }
      
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&language=en-US`, 
          { headers: { Authorization: `Bearer ${API_TOKEN}` } }
        );
        const data = await res.json();
        
        // Filter for K-Dramas primarily but show others if no KR found
        const filtered = data.results.filter(show => 
          show.origin_country?.includes('KR')
        ).slice(0, 5);
        
        setResults(filtered.length > 0 ? filtered : data.results.slice(0, 5));
      } catch (err) { 
        console.error("TMDB API Error:", err); 
      }
      setLoading(false);
    };

    const debouncer = setTimeout(search, 500);
    return () => clearTimeout(debouncer);
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    // Add touchstart for mobile users
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handlePick = (item) => {
    onAdd({
      title: item.name,
      image: item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : "https://via.placeholder.com/500x750?text=No+Poster",
      year: item.first_air_date?.split('-')[0] || "N/A"
    });
    setTitle("");
    setResults([]);
  };

  return (
    <div className="relative group w-full" ref={dropdownRef}>
      {/* Input Container */}
      <div className="flex items-center bg-slate-900 border-2 border-slate-800 rounded-2xl md:rounded-[2rem] p-1.5 md:p-2 focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition-all shadow-2xl">
        <div className="p-2 md:p-3 text-slate-500 shrink-0">
          {loading ? (
            <Loader2 className="animate-spin text-pink-500" size={20} md:size={24} />
          ) : (
            <Search size={20} className="md:w-6 md:h-6" />
          )}
        </div>
        
        <input 
          className="flex-1 bg-transparent border-none outline-none text-white text-base md:text-lg font-medium p-2 placeholder:text-slate-600 min-w-0"
          placeholder="Add K-Drama..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          // Prevents zoom on some mobile browsers
          style={{ fontSize: '16px' }} 
        />

        {title && (
          <button 
            onClick={() => { setTitle(""); setResults([]); }}
            className="p-2 text-slate-500 hover:text-white transition-colors shrink-0"
          >
            <X size={18} md:size={20} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-slate-800 rounded-[1.5rem] md:rounded-3xl overflow-hidden z-[100] shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="p-3 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 border-b border-slate-800/50">
            Top Matches
          </div>
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
            {results.map(item => (
              <button 
                key={item.id} 
                onClick={() => handlePick(item)}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-pink-500/10 active:bg-pink-500/20 text-left border-b border-slate-800/50 last:border-none transition-colors group"
              >
                <div className="relative w-10 h-14 md:w-12 md:h-16 shrink-0">
                  <img 
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "https://via.placeholder.com/92x138"} 
                    className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" 
                    alt="" 
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-white text-sm md:text-base truncate">{item.name}</p>
                  <p className="text-slate-500 text-xs">{item.first_air_date?.split('-')[0] || "N/A"}</p>
                </div>
                <div className="shrink-0 text-slate-700 md:group-hover:text-pink-500 transition-colors">
                  <Plus size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}