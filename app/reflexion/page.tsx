'use client'
import { useState } from 'react';

const KEY = 'rocket.journal.v1';

export default function ReflexionPage() {
  const [text, setText] = useState('');

  function save() {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]') as {d:string,t:string}[];
    list.unshift({ d: new Date().toISOString(), t: text.trim() });
    localStorage.setItem(KEY, JSON.stringify(list));
    setText('');
    alert('Guardado ✅');
  }

  return (
    <main className="min-h-dvh bg-slate-50 p-6">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Reflexión del día</h1>
        <div className="rounded-2xl bg-white border p-5 space-y-3">
          <textarea
            className="w-full border rounded-xl p-3 min-h-40"
            placeholder="¿Qué lograste hoy?"
            value={text}
            onChange={e=>setText(e.target.value)}
          />
          <button onClick={save} className="w-full h-12 rounded-full bg-indigo-600 text-white font-medium">
            Guardar
          </button>
        </div>
      </div>
    </main>
  );
}
