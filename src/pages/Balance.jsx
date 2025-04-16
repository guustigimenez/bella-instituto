// src/pages/Balance.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';

export default function Balance() {
  const [turnos, setTurnos] = useState([]);
  const [resumenPorDia, setResumenPorDia] = useState({});
  const [totalMes, setTotalMes] = useState(0);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  useEffect(() => {
    const cargarTurnos = async () => {
      const snapshot = await getDocs(collection(db, 'turnos'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTurnos(lista);
    };
    cargarTurnos();
  }, []);

  useEffect(() => {
    const resumen = {};
    let total = 0;

    turnos.forEach(turno => {
      const fechaOriginal = new Date(turno.start);
      const fechaLocal = new Date(fechaOriginal.getTime() - 3 * 60 * 60 * 1000);

      const mismoMes = fechaLocal.getMonth() === mesSeleccionado;
      const mismoAnio = fechaLocal.getFullYear() === anioSeleccionado;
      if (!mismoMes || !mismoAnio) return;

      const clave = fechaLocal.toDateString();
      const valorNumerico = Number(turno.valor) || 0;
      resumen[clave] = (resumen[clave] || 0) + valorNumerico;
      total += valorNumerico;
    });

    setResumenPorDia(resumen);
    setTotalMes(total);
  }, [turnos, mesSeleccionado, anioSeleccionado]);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-pink-700 mb-6">Balance del Mes</h2>

      <div className="flex gap-4 mb-6">
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2"
        >
          {meses.map((mes, index) => (
            <option key={index} value={index}>{mes}</option>
          ))}
        </select>
        <select
          value={anioSeleccionado}
          onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2"
        >
          {[2024, 2025, 2026].map((anio) => (
            <option key={anio} value={anio}>{anio}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Recaudado</h3>
        <div className="text-3xl font-bold text-green-600">${totalMes}</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Detalle por Día</h3>
        <ul className="space-y-2">
          {Object.keys(resumenPorDia)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((clave) => (
              <li key={clave} className="flex justify-between text-gray-800">
                <span>{format(new Date(clave), 'dd/MM/yyyy')}</span>
                <span>${resumenPorDia[clave]}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
