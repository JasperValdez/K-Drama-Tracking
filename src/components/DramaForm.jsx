import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Plus } from 'lucide-react';

export default function DramaForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPicking, setIsPicking] = useState(false); 
  const dropdownRef = useRef(null);

  const API_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

  useEffect(() => {
    const search = async () => {
      if (!API_TOKEN || title.trim().length < 2) { 
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
        
        const filtered = data.results?.filter(show => 
          show.origin_country?.includes('KR')
        ).slice(0, 5) || [];
        
        setResults(filtered.length > 0 ? filtered : (data.results?.slice(0, 5) || []));
      } catch (err) { 
        console.error("TMDB API Error:", err); 
      } finally {
        setLoading(false);
      }
    };

    const debouncer = setTimeout(search, 500);
    return () => clearTimeout(debouncer);
  }, [title, API_TOKEN]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handlePick = async (item) => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const detailRes = await fetch(
        `https://api.themoviedb.org/3/tv/${item.id}?append_to_response=credits&language=en-US`, 
        { headers: { Authorization: `Bearer ${API_TOKEN}` } }
      );
      const details = await detailRes.json();

      // --- NEW LOGIC: GRAB TOP 2 CAST MEMBERS (ML & FL) ---
      const leads = details.credits?.cast
        ?.slice(0, 2)
        .map(person => person.name)
        .join(' & ') || "Unknown Leads";

      onAdd({
        title: item.name,
        image: item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
          : "https://via.placeholder.com/500x750?text=No+Poster",
        year: item.first_air_date?.split('-')[0] || "N/A",
        overview: item.overview || "No synopsis available.",
        genre: details.genres?.[0]?.name || "Drama",
        total_episodes: details.number_of_episodes || 16,
        main_actor: leads, // Now contains two names if available
        rewatch_count: 0,
        rating: 0,
        is_completed: false,
        status: 'Watching'
      });

      setTitle("");
      setResults([]);
    } catch (err) {
      console.error("Error fetching drama details:", err);
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <div className="relative group w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <div className={`flex items-center bg-slate-900 border-2 rounded-2xl md:rounded-[2rem] p-1.5 md:p-2 transition-all shadow-2xl ${
        isPicking ? 'border-pink-500 animate-pulse' : 'border-slate-800 focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10'
      }`}>
        <div className="p-2 md:p-3 text-slate-500 shrink-0">
          {loading || isPicking ? (
            <Loader2 className="animate-spin text-pink-500" size={20} />
          ) : (
            <Search size={20} className="md:w-6 md:h-6" />
          )}
        </div>
        
        <input 
          disabled={isPicking}
          className="flex-1 bg-transparent border-none outline-none text-white text-base md:text-lg font-medium p-2 placeholder:text-slate-600 min-w-0 disabled:opacity-50"
          placeholder={isPicking ? "Enriching leads..." : "Search for a K-Drama to add..."}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: '16px' }} 
        />

        {title && !isPicking && (
          <button 
            onClick={() => { setTitle(""); setResults([]); }}
            className="p-2 text-slate-500 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-slate-800 rounded-[1.5rem] md:rounded-3xl overflow-hidden z-[100] shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="p-3 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 border-b border-slate-800/50 flex justify-between">
            <span>Top Matches</span>
            {loading && <Loader2 size={10} className="animate-spin" />}
          </div>
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
            {results.map(item => (
              <button 
                key={item.id} 
                disabled={isPicking}
                onClick={() => handlePick(item)}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-pink-500/10 active:bg-pink-500/20 text-left border-b border-slate-800/50 last:border-none transition-colors group disabled:opacity-50"
              >
                <div className="relative w-10 h-14 md:w-12 md:h-16 shrink-0 bg-slate-800 rounded-lg overflow-hidden">
                  <img 
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "https://via.placeholder.com/92x138?text=?"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt="" 
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-white text-sm md:text-base truncate group-hover:text-pink-400 transition-colors">{item.name}</p>
                  <p className="text-slate-500 text-xs font-medium">
                    {item.first_air_date?.split('-')[0] || "N/A"} • {item.origin_country?.[0] || "TV"}
                  </p>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-pink-600 group-hover:text-white transition-all">
                  <Plus size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}