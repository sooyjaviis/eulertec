import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react'; // Si no tienes iconos, puedes quitar esta importación

export default function AlumnoDashboard({ userId }) {
  const [calificaciones, setCalificaciones] = useState([]);
  const [promedioGeneral, setPromedioGeneral] = useState("0.0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apuntamos a tu API de PHP pasándole el userId por la URL
    fetch(`https://senk.host/eulertec/api/get-calificaciones.php?id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.calificaciones) {
          setCalificaciones(data.calificaciones);
          setPromedioGeneral(data.promedio_general.toFixed(1));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando boleta:", err);
        setLoading(false);
      });
  }, [userId]);

  // Función para obtener el estatus visual (Aprobado/Reprobado)
  const getEstatusVisual = (promedio) => {
    const p = Number(promedio);
    if (p >= 6) return { texto: 'APROBADO', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    return { texto: 'NA (REPROBADO)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">CARGANDO PROGRESO...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      {/* Header del Progreso Académico */}
      <div className="max-w-6xl mx-auto bg-[#0f172a] rounded-[40px] p-8 md:p-12 mb-8 flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-white text-4xl md:text-5xl font-black tracking-tighter mb-2">MI PROGRESO ACADÉMICO</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Ciclo Escolar Activo • 2026</p>
        </div>
        
        <div className="mt-6 md:mt-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center min-w-[200px] relative z-10">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Promedio General</span>
          <span className="text-[#10b981] text-6xl font-black">{promedioGeneral}</span>
        </div>
      </div>

      {/* Tabla de Calificaciones */}
      <div className="max-w-6xl mx-auto bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Materia</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Parcial 1</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Parcial 2</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Parcial 3</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Final</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
             {calificaciones.length > 0 ? (
  calificaciones.map((c, i) => {
    // Aseguramos que el estatus se base en el promedio final que viene de la BD
    const estatus = getEstatusVisual(parseFloat(c.final));
    
    return (
      <tr key={i} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
        <td className="px-8 py-6 font-black text-slate-700 uppercase tracking-tighter">
          {c.materia}
        </td>
        
        {/* Usamos parcial1, parcial2, parcial3 (sin guion bajo) como definimos en el alias de PHP */}
        <td className="px-6 py-6 text-center font-bold text-slate-600">
          {parseFloat(c.parcial1) > 0 ? c.parcial1 : <span className="opacity-20">—</span>}
        </td>
        <td className="px-6 py-6 text-center font-bold text-slate-600">
          {parseFloat(c.parcial2) > 0 ? c.parcial2 : <span className="opacity-20">—</span>}
        </td>
        <td className="px-6 py-6 text-center font-bold text-slate-600">
          {parseFloat(c.parcial3) > 0 ? c.parcial3 : <span className="opacity-20">—</span>}
        </td>
        
        {/* El promedio final destacado */}
        <td className="px-6 py-6 text-center font-black text-indigo-600 bg-indigo-50/30">
          {parseFloat(c.final) > 0 ? c.final : "0.00"}
        </td>
        
        <td className="px-8 py-6 text-center">
          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${estatus.bg} ${estatus.color} ${estatus.border} uppercase`}>
            {estatus.texto}
          </span>
        </td>
      </tr>
    );
  })
) : (
  <tr>
    <td colSpan="6" className="py-20 text-center">
      <div className="flex flex-col items-center opacity-40">
        <BookOpen size={48} className="mb-4 text-slate-300" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">
          Aún no hay calificaciones registradas.
        </p>
      </div>
    </td>
  </tr>
)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota al pie */}
      <div className="max-w-6xl mx-auto mt-8 bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-amber-500 text-lg">⚠️</span>
        <p className="text-amber-700/70 text-xs font-bold italic">
          Nota: Las calificaciones mostradas son preliminares hasta el cierre del ciclo escolar.
        </p>
      </div>
    </div>
  );
}