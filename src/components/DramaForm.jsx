import React, { useState, useRef } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';

export default function DramaForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // This is the Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, image || "https://via.placeholder.com/300x450?text=No+Poster");
    setTitle("");
    setImage("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image Upload Area */}
        <div 
          onClick={() => fileInputRef.current.click()}
          className="w-full sm:w-24 h-32 sm:h-24 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-all overflow-hidden"
        >
          {image ? (
            <img src={image} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <>
              <ImageIcon className="text-slate-600" size={24} />
              <span className="text-[10px] text-slate-500 mt-1 font-bold uppercase">Poster</span>
            </>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <input 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none text-white font-medium"
            placeholder="Drama Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <button type="submit" className="w-full bg-pink-600 py-3 rounded-xl hover:bg-pink-500 transition-all text-white font-black flex items-center justify-center gap-2">
            <Plus size={20} /> ADD TO LIST
          </button>
        </div>
      </div>
    </form>
  );
}