import React, { useState, useEffect } from 'react';
import DramaForm from './components/DramaForm';
import DramaItem from './components/DramaItem';
import EditModal from './components/EditModal';

function App() {
  const [dramas, setDramas] = useState(() => {
    const saved = localStorage.getItem("kdramas_v3");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [editingDrama, setEditingDrama] = useState(null);

  useEffect(() => {
    localStorage.setItem("kdramas_v3", JSON.stringify(dramas));
  }, [dramas]);

  const addDrama = (title, image) => {
    const newDrama = { id: Date.now(), title, image, rating: 0, isCompleted: false };
    setDramas([newDrama, ...dramas]);
  };

  const deleteDrama = (id) => {
    if(window.confirm("Remove this drama?")) {
      setDramas(dramas.filter(d => d.id !== id));
    }
  };

  const toggleComplete = (id) => {
    setDramas(dramas.map(d => d.id === id ? { ...d, isCompleted: !d.isCompleted } : d));
  };

  const updateRating = (id, rate) => {
    setDramas(dramas.map(d => d.id === id ? { ...d, rating: rate } : d));
  };

  const saveEdit = (id, newTitle, newImage) => {
    setDramas(dramas.map(d => d.id === id ? { ...d, title: newTitle, image: newImage } : d));
    setEditingDrama(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 mb-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-pink-500 tracking-tighter">KD-LIST</h1>
          <div className="flex gap-3 text-xs font-bold uppercase tracking-widest">
            <span className="text-slate-500">Total: {dramas.length}</span>
            <span className="text-green-500">Done: {dramas.filter(d => d.isCompleted).length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {/* Mobile-friendly Form */}
        <div className="max-w-md mx-auto mb-10">
          <DramaForm onAdd={addDrama} />
        </div>

        {/* Responsive Grid System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dramas.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-600">
              <p className="text-xl">Your watchlist is empty.</p>
              <p className="text-sm mt-2">Add your first drama above!</p>
            </div>
          ) : (
            dramas.map(drama => (
              <DramaItem 
                key={drama.id} 
                drama={drama} 
                onDelete={deleteDrama} 
                onToggle={toggleComplete}
                onRate={updateRating}
                onEdit={() => setEditingDrama(drama)}
              />
            ))
          )}
        </div>
      </main>

      {editingDrama && (
        <EditModal 
          drama={editingDrama} 
          onClose={() => setEditingDrama(null)} 
          onSave={saveEdit} 
        />
      )}
    </div>
  );
}

export default App;