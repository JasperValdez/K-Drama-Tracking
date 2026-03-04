import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import DramaForm from './components/DramaForm';
import DramaItem from './components/DramaItem';
import EditModal from './components/EditModal';
import StatsModal from './components/StatsModal';
import Auth from './components/Auth';
import { LogOut, LayoutGrid, Search, ChevronDown, RotateCcw, Flame, Trophy, Dices } from 'lucide-react'; 
import { Toaster, toast } from 'sonner';

function App() {
  const [session, setSession] = useState(null);
  const [dramas, setDramas] = useState([]);
  const [editingDrama, setEditingDrama] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 
  
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Watching', 'Completed', 'Dropped'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchDramas();
  }, [session]);

  const fetchDramas = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('dramas').select('*').order('created_at', { ascending: false });
    if (!error) setDramas(data || []);
    setLoading(false);
  };

  // --- OPTIMIZED STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const list = dramas || [];
    const averageScore = list.length > 0 
      ? (list.reduce((acc, d) => acc + (Number(d.rating) || 0), 0) / list.length).toFixed(1)
      : "0.0";

    const topRewatched = [...list]
      .filter(d => (Number(d.rewatch_count) || 0) > 0)
      .sort((a, b) => Number(b.rewatch_count) - Number(a.rewatch_count))
      .slice(0, 3);

    const totalRewatches = list.reduce((acc, d) => acc + (Number(d.rewatch_count) || 0), 0);
    
    return { averageScore, topRewatched, totalRewatches };
  }, [dramas]);

  // --- OPTIMIZED FILTERING AND SORTING ---
  const filteredAndSortedDramas = useMemo(() => {
    return (dramas || [])
      .filter((drama) => {
        const tabMatch = 
          activeTab === 'All' ? true :
          activeTab === 'Completed' ? drama.is_completed :
          activeTab === 'Watching' ? (!drama.is_completed && drama.status !== 'Dropped') :
          activeTab === 'Dropped' ? drama.status === 'Dropped' : true;

        const searchMatch = String(drama.title || "").toLowerCase().includes(searchQuery.toLowerCase());
        return tabMatch && searchMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === 'year') return (Number(b.year) || 0) - (Number(a.year) || 0);
        if (sortBy === 'rewatches') return (Number(b.rewatch_count) || 0) - (Number(a.rewatch_count) || 0);
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [dramas, activeTab, searchQuery, sortBy]);

  const pickRandomDrama = () => {
    if (filteredAndSortedDramas.length === 0) {
      toast.error("Nothing to pick from!");
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredAndSortedDramas.length);
    const randomDrama = filteredAndSortedDramas[randomIndex];
    
    toast(`Vault Recommendation:`, {
      description: `You should watch "${randomDrama.title}"`,
      icon: <Dices className="text-pink-500" size={18} />,
      duration: 5000,
    });
  };

  const addDrama = async (dramaData) => {
    const isDuplicate = dramas.some(
      (d) => String(d.title || "").toLowerCase().trim() === dramaData.title.toLowerCase().trim()
    );

    if (isDuplicate) {
      toast.error("Already in Vault", { description: `"${dramaData.title}" is already in your list.` });
      return;
    }

    const { data, error } = await supabase
      .from('dramas')
      .insert([{ ...dramaData, user_id: session.user.id }])
      .select();

    if (error) {
      toast.error(error.code === '23505' ? "This drama already exists." : "Failed to save to cloud");
    } else if (data) {
      setDramas([data[0], ...dramas]);
      toast.success(`${dramaData.title} added to list`);
    }
  };

  const handleRewatch = async (id, nextCount) => {
    const { error } = await supabase.from('dramas').update({ rewatch_count: nextCount }).eq('id', id);
    if (!error) {
      setDramas(prev => prev.map(d => d.id === id ? { ...d, rewatch_count: nextCount } : d));
      toast.success("Rewatch updated!", { icon: <RotateCcw size={14} className="text-amber-500" /> });
    }
  };

  const deleteDrama = async (id) => {
    toast("Delete this drama?", {
      description: "Permanently remove from vault?",
      action: {
        label: "Delete",
        onClick: async () => {
          const { error } = await supabase.from('dramas').delete().eq('id', id);
          if (!error) {
            setDramas(prev => prev.filter(d => d.id !== id));
            toast.success("Removed");
          }
        },
      },
    });
  };

  const updateDrama = async (id, updates) => {
    const { error } = await supabase.from('dramas').update(updates).eq('id', id);
    if (!error) setDramas(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const getCount = (tabName) => {
    if (tabName === 'All') return dramas.length;
    if (tabName === 'Completed') return dramas.filter(d => d.is_completed).length;
    if (tabName === 'Watching') return dramas.filter(d => !d.is_completed && d.status !== 'Dropped').length;
    if (tabName === 'Dropped') return dramas.filter(d => d.status === 'Dropped').length;
    return 0;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('All');
    setSortBy('newest');
  };

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <Toaster position="top-center" theme="dark" richColors closeButton />

      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-4 py-4 md:px-8 md:py-6 mb-6 md:mb-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-pink-600 p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg shadow-pink-500/30">
                <LayoutGrid size={20} className="text-white md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-3xl font-black tracking-tighter italic leading-none text-white">KD-PRO</h1>
                <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1">My Personal Vault</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={pickRandomDrama} className="p-2 bg-slate-800 hover:bg-pink-600 rounded-xl transition-all text-slate-400 hover:text-white group" title="Random Pick">
                <Dices size={20} className="group-active:rotate-180 transition-transform duration-500" />
              </button>

              <button onClick={() => setShowStats(true)} className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-all group">
                <Trophy className="text-amber-500 group-hover:rotate-12 transition-transform" size={16} fill="currentColor" />
                <span className="hidden xs:inline text-amber-500 text-[10px] font-black uppercase tracking-widest">Hall of Fame</span>
              </button>

              <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-black transition-all group p-2">
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden xs:inline uppercase text-[10px] tracking-widest text-slate-400">Logout</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <div className="flex items-center flex-1 justify-between md:justify-start md:gap-8 px-4 py-2 md:px-6 md:py-2 bg-slate-900/50 border border-slate-800 rounded-2xl md:rounded-full shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter">Total</span>
                  <span className="text-white text-base md:text-lg font-black leading-none">{dramas.length}</span>
                </div>
                <div className="w-[1px] h-5 bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter">Watching</span>
                  <span className="text-pink-500 text-base md:text-lg font-black leading-none">{getCount('Watching')}</span>
                </div>
                <div className="w-[1px] h-5 bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter">Completed</span>
                  <span className="text-green-500 text-base md:text-lg font-black leading-none">{getCount('Completed')}</span>
                </div>
                <div className="w-[1px] h-5 bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter">Rewatches</span>
                  <span className="text-amber-500 text-base md:text-lg font-black leading-none flex items-center gap-1">
                    {stats.totalRewatches} <Flame size={12} className={stats.totalRewatches > 0 ? "animate-pulse" : ""} />
                  </span>
                </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="max-w-xl mx-auto mb-10 md:mb-16">
          <DramaForm onAdd={addDrama} />
        </div>

        <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search your vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-bold text-sm text-white"
            />
          </div>
          
          <div className="relative w-full md:w-52">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 px-4 outline-none appearance-none font-black uppercase text-[10px] tracking-widest cursor-pointer hover:border-slate-700 transition-colors text-white"
            >
              <option value="newest">Latest Added</option>
              <option value="rating">Highest Rated</option>
              <option value="rewatches">Most Rewatched</option>
              <option value="year">Release Year</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>
        </div>

        <div className="flex justify-start md:justify-center mb-10 overflow-x-auto no-scrollbar -mx-3 px-3 md:mx-0">
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-full relative min-w-max shadow-xl">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-2 md:px-7 md:py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-colors z-10 flex items-center gap-2 ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}
              >
                {tab} <span className="opacity-50 text-[8px] font-bold">{getCount(tab)}</span>
                {activeTab === tab && (
                  <motion.div layoutId="active-pill" className="absolute inset-0 bg-pink-600 rounded-full -z-10 shadow-lg shadow-pink-500/40" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accessing Vault...</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedDramas.length === 0 ? (
                <motion.div key="empty" className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem] gap-4">
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">No matches found</p>
                  <button onClick={resetFilters} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">
                    <RotateCcw size={14} /> Reset Filters
                  </button>
                </motion.div>
              ) : (
                filteredAndSortedDramas.map(drama => (
                  <motion.div key={drama.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                    <DramaItem 
                      drama={drama} 
                      onDelete={deleteDrama} 
                      onRewatch={handleRewatch}
                      onToggle={(id) => updateDrama(id, { is_completed: !drama.is_completed, status: !drama.is_completed ? 'Completed' : 'Watching' })}
                      onRate={(id, rate) => updateDrama(id, { rating: rate })}
                      onEdit={() => setEditingDrama(drama)}
                      onStatusChange={(id, newStatus) => updateDrama(id, { status: newStatus, is_completed: newStatus === 'Completed' })}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {editingDrama && (
        <EditModal 
          drama={editingDrama} 
          onClose={() => setEditingDrama(null)} 
          onSave={(id, updates) => { 
            updateDrama(id, updates); 
            setEditingDrama(null); 
            toast.success("Drama details updated"); 
          }} 
        />
      )}

      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        topDramas={stats.topRewatched}
        avgScore={stats.averageScore}
        totalRewatches={stats.totalRewatches}
        dramas={dramas || []} 
      />
    </div>
  );
}

export default App;