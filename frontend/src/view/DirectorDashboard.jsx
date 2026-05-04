import React, { useState, useEffect } from 'react';
import { 
    RefreshCcw, GraduationCap, UserCheck, LayoutGrid, 
    Users, Search, UserPlus, Edit3, Trash2, MoreHorizontal, AlertCircle 
} from 'lucide-react';

const DirectorDashboard = () => {
    // 1. Estados
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [stats, setStats] = useState({ alumnos: 0, personal: 0, grupos: 0, orientadores: 0 });

    // 2. Fetch de datos
    const cargarDatos = async () => {
        setLoading(true);
        setError(null); // Reseteamos el error al reintentar
        try {
            const response = await fetch('https://senk.host/eulertec/api/admin-usuarios.php');
            if (!response.ok) throw new Error('Error al conectar con el servidor');
            
            const data = await response.json();
            
            if (data.usuarios) {
                setUsuarios(data.usuarios);
                setStats(data.stats || { alumnos: 0, personal: 0, grupos: 0, orientadores: 0 });
            }
        } catch (err) {
            console.error("Error de conexión:", err);
            setError("No se pudieron cargar los datos. Verifica tu conexión o intenta más tarde.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Efecto de carga inicial (Faltaba en tu código original)
    useEffect(() => {
        cargarDatos();
    }, []);

    // 4. Lógica de filtrado
    const usuariosFiltrados = Array.isArray(usuarios) 
        ? usuarios.filter(u => {
            const termino = filtro.toLowerCase();
            return u.nombre?.toLowerCase().includes(termino) || 
                   u.apellido_paterno?.toLowerCase().includes(termino);
        })
        : [];

    // 5. Helpers para limpiar el JSX
    const obtenerEstiloRol = (rolId, estadoMaestro) => {
        const id = Number(rolId);
        if (id === 1) return 'bg-amber-100 text-amber-700 border-amber-200';
        if ([2, 3].includes(id)) {
            return estadoMaestro === 'Activo'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200/50'
                : 'bg-slate-100 text-slate-500 border-slate-200';
        }
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    const obtenerNombreRol = (rolId, estadoMaestro) => {
        const id = Number(rolId);
        if (id === 1) return 'Administrador';
        if ([2, 3].includes(id)) return `Maestro (${estadoMaestro || 'Inactivo'})`;
        return 'Alumno Regular';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 animate-in fade-in duration-500">
            <main className="max-w-7xl mx-auto p-4 md:p-8">

                {/* Encabezado del Panel */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`h-2 w-2 rounded-full ${error ? 'bg-rose-500' : 'bg-indigo-600 animate-pulse'}`}></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gestión Institucional</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Panel del Director</h2>
                        <p className="text-slate-500 font-medium mt-1">Control total de alumnos, docentes y oferta académica.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Estado del Servidor</p>
                            <p className={`text-xs font-bold ${error ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {error ? 'Desconectado' : 'Sincronizado'}
                            </p>
                        </div>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${error ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                        </div>
                    </div>
                </header>

                {/* Mensaje de Error */}
                {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 animate-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <p className="text-sm font-semibold">{error}</p>
                    </div>
                )}

                {/* Tarjetas de Estadísticas (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Alumnos', val: stats.alumnos, color: 'from-blue-500 to-blue-700', icon: GraduationCap, shadow: 'shadow-blue-200' },
                        { label: 'Docentes Activos', val: stats.personal, color: 'from-indigo-500 to-indigo-700', icon: UserCheck, shadow: 'shadow-indigo-200' },
                        { label: 'Grupos', val: stats.grupos, color: 'from-emerald-400 to-emerald-600', icon: LayoutGrid, shadow: 'shadow-emerald-200' },
                        { label: 'Orientadores', val: stats.orientadores || 0, color: 'from-slate-700 to-slate-900', icon: Users, shadow: 'shadow-slate-200' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                            <div className={`bg-gradient-to-br ${item.color} p-4 rounded-2xl text-white shadow-lg ${item.shadow}`}>
                                <item.icon size={26} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">{loading ? '-' : item.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Barra de Herramientas */}
                <div className="bg-white/70 backdrop-blur-md p-4 rounded-[28px] shadow-sm border border-white mb-8 flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o apellido..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50/80 border border-slate-200/60 rounded-[20px] focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <button
                            onClick={cargarDatos}
                            disabled={loading}
                            className="p-4 bg-white text-slate-500 rounded-2xl border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all active:scale-95 disabled:opacity-50"
                            title="Actualizar datos"
                        >
                            <RefreshCcw size={22} className={loading ? 'animate-spin text-indigo-600' : ''} />
                        </button>
                        <button className="flex-1 lg:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3">
                            <UserPlus size={18} /> Nuevo Registro
                        </button>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="bg-white rounded-[35px] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px] border-collapse">
                            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                <tr className="border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificación del Usuario</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Acceso System</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Grupo / Adscripción</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Estatus y Rol</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 relative">
                                {/* Loader de superposición para la tabla */}
                                {loading && usuarios.length > 0 && (
                                    <tr className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                        <td></td>
                                    </tr>
                                )}

                                {usuariosFiltrados.map((u) => (
                                    <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors uppercase text-sm leading-tight">
                                                {u.nombre} {u.apellido_paterno}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 mt-1.5 flex items-center gap-1">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 border border-slate-200/60">
                                                    MATRÍCULA: #{u.id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200/60">
                                                <span className="text-xs font-mono font-bold tracking-tight">@{u.usuario}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="text-sm font-semibold text-slate-600">
                                                {u.nombre_grupo || u.estado_maestro || <span className="text-slate-300">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-block text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border transition-all ${obtenerEstiloRol(u.rol_id, u.estado_maestro)}`}>
                                                {obtenerNombreRol(u.rol_id, u.estado_maestro)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Editar">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Más opciones">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Estado Vacío / Cargando */}
                    <div className="border-t border-slate-100">
                        {loading && usuarios.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4 bg-slate-50/50">
                                <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Base de Datos...</p>
                            </div>
                        ) : usuariosFiltrados.length === 0 && !error ? (
                            <div className="p-24 text-center flex flex-col items-center gap-4 bg-slate-50/30">
                                <div className="bg-white p-6 rounded-full shadow-sm border border-slate-100">
                                    <Search size={32} className="text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-slate-700 font-black uppercase text-sm tracking-widest">Sin coincidencias</p>
                                    <p className="text-slate-500 text-sm mt-1">No hay registros que coincidan con <span className="font-semibold text-slate-700">"{filtro}"</span></p>
                                </div>
                                <button 
                                    onClick={() => setFiltro('')} 
                                    className="mt-2 text-indigo-600 text-xs font-black uppercase tracking-wider hover:text-indigo-800 transition-colors"
                                >
                                    Limpiar búsqueda
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DirectorDashboard;