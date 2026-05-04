import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const MaestroDashboard = ({ maestroId }) => {
    const [asignaciones, setAsignaciones] = useState([]);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Base de la API ajustada a tu entorno local de XAMPP
    const API_BASE = window.location.hostname === 'localhost' 
        ? 'https://localhost/eulertec/api' 
        : 'https://senk.host/eulertec/api';

    useEffect(() => {
        const cargarClases = async () => {
            if (!maestroId) return;
            try {
                // Asegúrate de que este PHP devuelva: id, nombre_grupo, nombre_materia, materia_id, grupo_id, ciclo_escolar
                const res = await fetch(`${API_BASE}/get_maestro_clases.php?maestro_id=${maestroId}`);
                const data = await res.json();
                setAsignaciones(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar clases:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarClases();
    }, [maestroId, API_BASE]);

    const verGrupo = async (asignacion) => {
        setGrupoSeleccionado(asignacion);
        setAlumnos([]);
        try {
            // Este endpoint debe traer los alumnos y sus notas actuales de la tabla 'calificaciones'
            const res = await fetch(`${API_BASE}/get_alumnos_grupo.php?grupo_id=${asignacion.grupo_id}&materia_id=${asignacion.materia_id}`);
            const data = await res.json();
            setAlumnos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar alumnos:", error);
        }
    };

    const manejarCalificacion = async (alumnoId, parcial, valor) => {
        // Validar rango de 0 a 10
        if (valor !== "" && (valor < 0 || valor > 10)) return;

        // 1. Actualización local inmediata (Optimistic UI)
        setAlumnos(prev => prev.map(al => {
            if (al.id === alumnoId) {
                const updated = { ...al, [`parcial_${parcial}`]: valor };
                const p1 = parseFloat(updated.parcial_1 || 0);
                const p2 = parseFloat(updated.parcial_2 || 0);
                const p3 = parseFloat(updated.parcial_3 || 0);
                updated.promedio = ((p1 + p2 + p3) / 3).toFixed(2);
                return updated;
            }
            return al;
        }));

        // 2. Guardado automático en DB (actualizar-nota.php)
        try {
            const response = await fetch(`${API_BASE}/actualizar-nota.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alumno_id: alumnoId,
                    materia_id: grupoSeleccionado.materia_id,
                    parcial: parcial, // Enviamos 1, 2 o 3
                    nota: valor
                })
            });

            const resData = await response.json();

            if (resData.success) {
                setStatus({ type: 'success', msg: 'Sincronizado' });
            } else {
                throw new Error("Error en servidor");
            }
            setTimeout(() => setStatus({ type: '', msg: '' }), 1500);
        } catch (error) {
            setStatus({ type: 'error', msg: 'Error de conexión' });
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">CARGANDO PANEL...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header dinámico con Status de Guardado */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-[#0f172a] tracking-tighter">PANEL ACADÉMICO</h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Gestiona tus grupos y calificaciones</p>
                    </div>
                    
                    <div className={`h-10 px-6 rounded-2xl flex items-center gap-2 transition-all duration-500 shadow-sm border ${
                        status.msg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    } ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{status.msg}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Lateral: Mis Materias */}
                    <aside className="lg:col-span-4 space-y-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                            <BookOpen size={14} /> Mis Materias Asignadas
                        </h2>
                        <div className="space-y-3">
                            {asignaciones.map((asig) => (
                                <button
                                    key={asig.id}
                                    onClick={() => verGrupo(asig)}
                                    className={`w-full group p-6 rounded-[2rem] border-2 transition-all duration-300 text-left relative overflow-hidden ${
                                        grupoSeleccionado?.id === asig.id 
                                        ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 translate-x-2' 
                                        : 'bg-white border-transparent hover:border-slate-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className={`text-[10px] font-black mb-1 uppercase tracking-wider ${grupoSeleccionado?.id === asig.id ? 'text-indigo-200' : 'text-indigo-500'}`}>
                                        Grupo {asig.nombre_grupo}
                                    </div>
                                    <div className={`text-xl font-black tracking-tight ${grupoSeleccionado?.id === asig.id ? 'text-white' : 'text-slate-800'}`}>
                                        {asig.nombre_materia}
                                    </div>
                                    <div className={`mt-2 text-[10px] font-bold ${grupoSeleccionado?.id === asig.id ? 'text-indigo-100/60' : 'text-slate-400'}`}>
                                        CICLO: {asig.ciclo_escolar}
                                    </div>
                                    <ChevronRight size={20} className={`absolute right-6 top-1/2 -translate-y-1/2 transition-all ${
                                        grupoSeleccionado?.id === asig.id ? 'text-white translate-x-0' : 'opacity-0 -translate-x-4'
                                    }`} />
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Principal: Lista de Alumnos */}
                    <main className="lg:col-span-8">
                        {!grupoSeleccionado ? (
                            <div className="h-full min-h-[400px] border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                                <Users size={64} className="mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-widest text-sm">Selecciona una materia para comenzar</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                                {/* Sub-header de la lista */}
                                <div className="bg-[#0f172a] p-8 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter">Lista: {grupoSeleccionado.nombre_grupo}</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Materia: {grupoSeleccionado.nombre_materia}</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Alumnos</div>
                                        <div className="text-2xl font-black text-indigo-400">{alumnos.length}</div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                                                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">P1</th>
                                                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">P2</th>
                                                <th className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">P3</th>
                                                <th className="p-6 text-center text-[10px] font-black text-indigo-500 uppercase tracking-widest">Final</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {alumnos.map((alumno) => (
                                                <tr key={alumno.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="font-black text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter text-sm">
                                                            {alumno.nombre} {alumno.apellido_paterno}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-bold italic tracking-widest">ID: #{alumno.id}</div>
                                                    </td>
                                                    {[1, 2, 3].map((num) => (
                                                        <td key={num} className="p-4 text-center">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                placeholder="0.0"
                                                                value={alumno[`parcial_${num}`] ?? ""}
                                                                onChange={(e) => manejarCalificacion(alumno.id, num, e.target.value)}
                                                                className="w-14 h-14 p-0 text-center font-black bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all text-slate-600 placeholder:text-slate-200"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="p-6 text-center">
                                                        <span className={`text-xl font-black px-4 py-2 rounded-2xl inline-block min-w-[60px] ${
                                                            parseFloat(alumno.promedio) >= 6 
                                                            ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' 
                                                            : 'text-rose-600 bg-rose-50 border border-rose-100'
                                                        }`}>
                                                            {alumno.promedio || "0.0"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MaestroDashboard;