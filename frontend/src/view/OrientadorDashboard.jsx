import React, { useState, useEffect } from 'react';
import { Download, BookOpen, Loader2, AlertCircle } from 'lucide-react';

export default function OrientadorDashboard() {
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(""); // Guardará "materia_id-grupo_id"
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // 🔹 ID del orientador
  const orientadorId = localStorage.getItem('userId') || 2; 

  // 🔹 Ahora recibe ambos IDs
  const cargarAlumnos = async (idMateria, idGrupo) => {
    if (!idMateria || !idGrupo) return;
    setLoading(true);
    try {
      // Le mandamos materia_id Y grupo_id a tu PHP
      const res = await fetch(`https://senk.host/eulertec/api/get_alumnos_grupo.php?materia_id=${idMateria}&grupo_id=${idGrupo}`);
      const data = await res.json();
      console.log("📝 Alumnos cargados:", data);
      
      const lista = data.calificaciones || (Array.isArray(data) ? data : []);
      setAlumnos(lista);
    } catch (err) {
      console.error("❌ Error fetch alumnos:", err);
      setAlumnos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        const res = await fetch(`https://senk.host/eulertec/api/get_materias_orientador.php?orientador_id=${orientadorId}`);
        const data = await res.json();

        if (data.error) {
          setErrorStatus(`Error de SQL: ${data.error}`);
          return;
        }
        if (data.status === "empty") {
          setErrorStatus(data.message);
          setMaterias([]);
          return;
        }

        const lista = Array.isArray(data) ? data : Object.values(data);

        if (lista.length > 0) {
          setErrorStatus(null);
          setMaterias(lista);
          
          // Armamos la llave combinada para seleccionar la primera opción
          const primerValor = `${lista[0].id}-${lista[0].grupo_id}`;
          setMateriaSeleccionada(primerValor);
          
          // Cargamos alumnos con materia_id y grupo_id
          cargarAlumnos(lista[0].id, lista[0].grupo_id);
        } else {
          setErrorStatus("La respuesta de la API está vacía.");
        }
      } catch (err) {
        setErrorStatus("No se pudo conectar con el servidor.");
      }
    };

    cargarMaterias();
  }, [orientadorId]);

  const handleMateriaChange = (e) => {
    const valorCombinado = e.target.value;
    setMateriaSeleccionada(valorCombinado);
    
    // Separamos el string "1-2" -> materia: 1, grupo: 2
    const [idMateria, idGrupo] = valorCombinado.split("-");
    cargarAlumnos(idMateria, idGrupo);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
              Control de Orientación
            </h2>
            <p className="text-slate-500 font-medium">Orientador #{orientadorId}</p>
          </div>

          {/* SELECTOR */}
          <div className="flex items-center gap-3 bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase">Grupo / Materia:</span>
            <select
              value={materiaSeleccionada}
              onChange={handleMateriaChange}
              className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer min-w-[200px]"
            >
              {materias.length > 0 ? (
                materias.map((m) => (
                  // El value ahora tiene los dos IDs separados por un guión
                  <option key={`${m.id}-${m.grupo_id}`} value={`${m.id}-${m.grupo_id}`}>
                    {m.nombre_materia} - {m.nombre_grupo}
                  </option>
                ))
              ) : (
                <option value="">No hay materias</option>
              )}
            </select>
          </div>
        </div>

        {/* ALERTA DE ERROR VISUAL */}
        {errorStatus && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl shadow-sm">
            <AlertCircle size={20} />
            <p className="text-sm font-bold uppercase">{errorStatus}</p>
          </div>
        )}

        {/* TABLA */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-6 uppercase text-[10px] font-black tracking-widest">Estudiante</th>
                <th className="p-6 text-center uppercase text-[10px] font-black tracking-widest">Final</th>
                <th className="p-6 text-center uppercase text-[10px] font-black tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={32} />
                    <span className="text-xs font-bold text-slate-400 uppercase">Buscando alumnos...</span>
                  </td>
                </tr>
              ) : alumnos.length > 0 ? (
                alumnos.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      {/* Mostramos nombre y apellido paterno según tu PHP */}
                      <p className="font-black text-slate-700 uppercase leading-none">{al.nombre} {al.apellido_paterno}</p>
                      <span className="text-[10px] text-slate-400 font-bold">MATRÍCULA: #{al.id}</span>
                    </td>
                    <td className="p-6 text-center font-black text-xl text-indigo-600">
                      {/* Tu PHP devuelve 'promedio', no 'final' */}
                      {al.promedio || "0.00"}
                    </td>
                    <td className="p-6 text-center">
                      <a href={`http://senk.host/eulertec/api/generar_boleta.php?id=${al.id}`} target="_blank" rel="noreferrer" className="bg-slate-100 p-2 px-4 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 inline-flex items-center gap-2">
                        <Download size={14} /> PDF
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-24 text-center">
                    <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase text-xs">Sin registros que mostrar</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}