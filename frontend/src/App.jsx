import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import DirectorDashboard from './view/DirectorDashboard';
import OrientadorDashboard from './view/OrientadorDashboard';
import MaestroDashboard from './view/MaestroDashboard'; 
import AlumnoDashboard from './view/AlumnoDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "error" });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const showAlert = (msg, type = "error") => {
    setAlert({ show: true, message: msg, type });
    // Se quita solita después de 4 segundos
    setTimeout(() => setAlert({ show: false, message: "", type: "error" }), 4000);
  };

  const handleLoginSuccess = (data) => {
    if (!data) {
      showAlert("Credenciales incorrectas. Intenta de nuevo.");
      return;
    }
    setTransitionText(`¡Hola de nuevo, ${data.nombre}!`);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setUser(data);
      setIsTransitioning(false);
    }, 1500);
  };

  const handleLogout = () => {
    setTransitionText("Finalizando sesión...");
    setIsTransitioning(true);
    
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsTransitioning(false);
    }, 1500);
  };

  useEffect(() => {
    if (!user || isTransitioning) return;
    let temporizador;
    const TIEMPO_MAXIMO = 15 * 60 * 1000; 

    const reiniciarTemporizador = () => {
      if (temporizador) clearTimeout(temporizador);
      temporizador = setTimeout(() => handleLogout(), TIEMPO_MAXIMO);
    };

    reiniciarTemporizador();
    window.addEventListener('mousemove', reiniciarTemporizador);
    window.addEventListener('keydown', reiniciarTemporizador);
    return () => {
      if (temporizador) clearTimeout(temporizador);
      window.removeEventListener('mousemove', reiniciarTemporizador);
      window.removeEventListener('keydown', reiniciarTemporizador);
    };
  }, [user, isTransitioning]);

  const renderDashboard = () => {
    if (!user) return null;
    const rol = Number(user.rol_id);
    switch(rol) {
      case 1: return <DirectorDashboard />;
      case 2: return <OrientadorDashboard />;
      case 3: return <MaestroDashboard maestroId={user.id} />;
      case 4: return <AlumnoDashboard userId={user.id} />;    
      default: return <div className="text-center p-10 font-bold text-red-500">Rol no asignado.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 relative overflow-x-hidden">
      
      {/* 🚨 ALERTA FLOTANTE (TOAST) */}
      {alert.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-8 duration-300">
          <div className="bg-white border-2 border-rose-100 shadow-2xl shadow-rose-200/50 p-4 rounded-3xl flex items-center gap-4 min-w-[300px]">
            <div className="h-10 w-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Error de Acceso</p>
              <p className="text-sm font-bold text-slate-700">{alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 CARGA GLOBAL CON BACKDROP BLUR */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-700 animate-in fade-in">
          <div className="relative h-20 w-20 mb-6">
            <div className="absolute inset-0 bg-indigo-600 rounded-3xl animate-spin duration-[3s]"></div>
            <div className="absolute inset-2 bg-white rounded-[1.2rem] flex items-center justify-center shadow-inner">
               <span className="text-indigo-600 font-black text-2xl italic">E</span>
            </div>
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter text-slate-800 animate-pulse">{transitionText}</h2>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL CON TRANSICIÓN DE DESVANECIDO */}
      <div className={`transition-all duration-1000 ease-in-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {!user ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            {/* Asegúrate de que tu componente Login use 'onLoginSuccess' */}
<Login 
  onLoginSuccess={handleLoginSuccess} 
  onLoginError={showAlert} 
/>          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            {/* Header con Blur y Estilo */}
            <header className="relative mb-10 bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white shadow-2xl shadow-slate-200/40 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                  {user.nombre?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">{user.nombre}</h1>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user.rol_nombre || 'Docente'}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="group flex items-center gap-3 bg-slate-50 text-slate-500 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
              >
                <span>Salir</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </header>

            {/* Vistas con desvanecido al cargar */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
              {renderDashboard()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;