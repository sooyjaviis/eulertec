import React, { useState } from 'react';

export default function Login({ onLoginSuccess, onLoginError }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://senk.host/eulertec/api/login.php';
    }
    return '/eulertec/api/login.php';
  };

  const API_BASE = getApiUrl();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password }),
      });

      if (!response.ok) {
        throw new Error('SERVER_ERROR');
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token || 'secret');
        localStorage.setItem('user', JSON.stringify(data));
        onLoginSuccess(data); 
      } else {
        onLoginError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error("Detalle del error:", err);
      onLoginError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-50 relative overflow-hidden group">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      
      <div className="text-center mb-10 relative z-10">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100 rotate-3 transition-transform duration-500 group-hover:rotate-6">
          <span className="text-4xl">🏛️</span>
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Bienvenido</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">EulerTec OS</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Usuario</label>
          <input
            type="text"
            required
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white bg-slate-50/50 outline-none transition-all font-bold text-slate-700"
            placeholder="Introduce tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Contraseña</label>
          <input
            type="password"
            required
            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white bg-slate-50/50 outline-none transition-all font-bold text-slate-700"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-[1.5rem] font-black text-white uppercase tracking-[0.25em] text-[10px] transition-all shadow-2xl ${
            loading ? 'bg-slate-300' : 'bg-slate-900 hover:bg-indigo-600 active:scale-95'
          }`}
        >
          {loading ? 'Validando...' : 'Entrar al Sistema'}
        </button>
      </form>
    </div>
  );
}