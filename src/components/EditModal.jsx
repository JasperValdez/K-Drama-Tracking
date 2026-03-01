import React, { useState, useRef } from 'react';

export default function EditModal({ drama, onClose, onSave }) {
  const [title, setTitle] = useState(drama.title);
  const [image, setImage] = useState(drama.image);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
        <h2 className="text-2xl font-black mb-6 text-white text-center tracking-tight">EDIT DRAMA</h2>
        
        <div className="flex flex-col items-center gap-4">
          <div 
            onClick={() => fileRef.current.click()}
            className="w-32 h-44 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 cursor-pointer"
          >
            <img src={image} className="w-full h-full object-cover" alt="edit preview" />
          </div>
          <input type="file" ref={fileRef} className="hidden" onChange={handleFile} />

          <input 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none text-white text-center font-bold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold">Cancel</button>
          <button onClick={() => onSave(drama.id, title, image)} className="flex-1 py-4 bg-pink-600 text-white rounded-2xl font-black">Save</button>
        </div>
      </div>
    </div>
  );
}