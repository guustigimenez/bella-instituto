// src/pages/Balance.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Balance() {
  const [turnos, setTurnos] = useState([]);
  const [resumenPorDia, setResumenPorDia] = useState({});
  const [totalMes, setTotalMes] = useState(0);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [detalleDiaSeleccionado, setDetalleDiaSeleccionado] = useState(null);

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

  const turnosDelDia = detalleDiaSeleccionado
    ? turnos.filter(turno => {
        const fechaLocal = new Date(new Date(turno.start).getTime() - 3 * 60 * 60 * 1000);
        return fechaLocal.toDateString() === detalleDiaSeleccionado;
      })
    : [];

  const formatearMoneda = (valor) => {
    return valor.toLocaleString('es-AR');
  };

  const exportarExcel = () => {
    const datos = Object.keys(resumenPorDia).map(fecha => ({
      Fecha: format(new Date(fecha), 'dd/MM/yyyy'),
      Recaudado: resumenPorDia[fecha],
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Balance');
    XLSX.writeFile(libro, 'Balance.xlsx');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Balance del Mes', 14, 20);
  
    const filas = Object.keys(resumenPorDia).map(fecha => ([
      format(new Date(fecha), 'dd/MM/yyyy'),
      `$${formatearMoneda(resumenPorDia[fecha])}`
    ]));
  
    autoTable(doc, {
      head: [['Fecha', 'Recaudado']],
      body: filas,
      startY: 30
    });
  
    doc.save('Balance.pdf');
  };

  const datosGrafico = Object.keys(resumenPorDia).map(fecha => ({
    fecha: format(new Date(fecha), 'dd/MM'),
    valor: resumenPorDia[fecha]
  }));

  return (
    <div className="max-w-5xl mx-auto p-6">
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
        <button onClick={exportarExcel} className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600">
          Exportar Excel
        </button>
        <button onClick={exportarPDF} className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600">
          Exportar PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Recaudado</h3>
        <div className="text-3xl font-bold text-green-600">${formatearMoneda(totalMes)}</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Gráfico de Recaudación</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis tickFormatter={(v) => `$${formatearMoneda(v)}`} />
            <Tooltip formatter={(value) => `$${formatearMoneda(value)}`} />
            <Bar dataKey="valor" fill="#e91e63" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Detalle por Día</h3>
        <ul className="space-y-2">
          {Object.keys(resumenPorDia)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((clave) => (
              <li key={clave} className="flex justify-between items-center text-gray-800">
                <div>
                  <span className="font-medium">{format(new Date(clave), 'dd/MM/yyyy')}</span>
                  <span className="ml-4 text-green-700">${formatearMoneda(resumenPorDia[clave])}</span>
                </div>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setDetalleDiaSeleccionado(clave)}
                >
                  Ver detalle
                </button>
              </li>
            ))}
        </ul>
      </div>

      {detalleDiaSeleccionado && (
        <div className="bg-white rounded-xl shadow p-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-pink-600">Turnos del {format(new Date(detalleDiaSeleccionado), 'dd/MM/yyyy')}</h4>
            <button
              onClick={() => setDetalleDiaSeleccionado(null)}
              className="text-sm text-gray-500 hover:underline"
            >
              Cerrar
            </button>
          </div>
          <ul className="divide-y">
            {turnosDelDia.map(turno => (
              <li key={turno.id} className="py-2 text-sm text-gray-800">
                <div>
                  <span className="font-medium">{turno.cliente}</span> — ${formatearMoneda(turno.valor)}
                </div>
                {turno.tratamientosAplicados?.length > 0 && (
                  <ul className="ml-4 mt-1 list-disc text-xs text-gray-600">
                    {turno.tratamientosAplicados.map((t, index) => (
                      <li key={index}>{t.nombre} — ${formatearMoneda(t.valor)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
