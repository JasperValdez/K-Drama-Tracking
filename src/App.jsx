import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import DramaForm from './components/DramaForm';
import DramaItem from './components/DramaItem';
import EditModal from './components/EditModal';
import Auth from './components/Auth';
import { LogOut, LayoutGrid, Search, ChevronDown, RotateCcw } from 'lucide-react'; 
import { Toaster, toast } from 'sonner';

function App() {
  const [session, setSession] = useState(null);
  const [dramas, setDramas] = useState([]);
  const [editingDrama, setEditingDrama] = useState(null);
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

  const filteredAndSortedDramas = dramas
    .filter((drama) => {
      const tabMatch = 
        activeTab === 'All' ? true :
        activeTab === 'Completed' ? drama.is_completed :
        activeTab === 'Watching' ? (!drama.is_completed && drama.status !== 'Dropped') :
        activeTab === 'Dropped' ? drama.status === 'Dropped' : true;

      const searchMatch = drama.title.toLowerCase().includes(searchQuery.toLowerCase());
      return tabMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const addDrama = async (dramaData) => {
    const { data, error } = await supabase
      .from('dramas')
      .insert([{ ...dramaData, rating: 0, is_completed: false, status: 'Watching', user_id: session.user.id }])
      .select();

    if (error) {
      toast.error("Failed to save to cloud");
    } else {
      setDramas([data[0], ...dramas]);
      toast.success(`${dramaData.title} added to list`);
    }
  };

  const deleteDrama = async (id) => {
    toast("Delete this drama?", {
      description: "This will permanently remove it from your cloud vault.",
      action: {
        label: "Delete",
        onClick: async () => {
          const { error } = await supabase.from('dramas').delete().eq('id', id);
          if (error) {
            toast.error("Error deleting drama");
          } else {
            setDramas(dramas.filter(d => d.id !== id));
            toast.success("Drama removed");
          }
        },
      },
    });
  };

  const updateDrama = async (id, updates) => {
    const { error } = await supabase.from('dramas').update(updates).eq('id', id);
    if (!error) {
      setDramas(dramas.map(d => d.id === id ? { ...d, ...updates } : d));
    }
  };

  const getCount = (tabName) => {
    if (tabName === 'All') return dramas.length;
    if (tabName === 'Completed') return dramas.filter(d => d.is_completed).length;
    if (tabName === 'Watching') return dramas.filter(d => !d.is_completed && d.status !== 'Dropped').length;
    if (tabName === 'Dropped') return dramas.filter(d => d.status === 'Dropped').length;
    return 0;
  };

  // Helper to clear search
  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('All');
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
                <h1 className="text-xl md:text-3xl font-black tracking-tighter italic leading-none">KD-PRO</h1>
                <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1">My Personal Vault</span>
              </div>
            </div>

            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-black transition-all group p-2">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden xs:inline uppercase text-[10px] tracking-widest">Logout</span>
            </button>
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="max-w-xl mx-auto mb-10 md:mb-16">
          <DramaForm onAdd={addDrama} />
        </div>

        {/* --- SEARCH & SORT SECTION (RESPONSIVE) --- */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search your vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-bold text-sm"
            />
          </div>
          
          <div className="relative w-full md:w-52">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 px-4 outline-none appearance-none font-black uppercase text-[10px] tracking-widest cursor-pointer hover:border-slate-700 transition-colors"
            >
              <option value="newest">Latest Added</option>
              <option value="rating">Highest Rated</option>
              <option value="year">Release Year</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex justify-start md:justify-center mb-10 overflow-x-auto no-scrollbar -mx-3 px-3 md:mx-0">
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-full relative min-w-max shadow-xl">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-2 md:px-7 md:py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-colors z-10 flex items-center gap-2 ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}
              >
                {tab} <span className="opacity-50 text-[8px]">{getCount(tab)}</span>
                {activeTab === tab && (
                  <motion.div layoutId="active-pill" className="absolute inset-0 bg-pink-600 rounded-full -z-10 shadow-lg shadow-pink-500/40" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedDramas.length === 0 ? (
                <motion.div key="empty" className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem] gap-4">
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">No matches for "{searchQuery}"</p>
                  <button onClick={resetFilters} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                    <RotateCcw size={14} /> Reset Filters
                  </button>
                </motion.div>
              ) : (
                filteredAndSortedDramas.map(drama => (
                  <motion.div key={drama.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <DramaItem 
                      drama={drama} 
                      onDelete={deleteDrama} 
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
          onSave={(id, t, i) => { updateDrama(id, { title: t, image: i }); setEditingDrama(null); toast.success("Updated"); }} 
        />
      )}
    </div>
  );
}

export default App;