// src/components/HistoriaClinica.jsx
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';

export default function HistoriaClinica({ clienteId }) {
  const [historia, setHistoria] = useState([]);
  const [comentarios, setComentarios] = useState({});

  useEffect(() => {
    const cargarHistoria = async () => {
      if (!clienteId) return;

      const q = query(collection(db, 'turnos'), where('clienteId', '==', clienteId));
      const snapshot = await getDocs(q);

      const tratamientos = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const fecha = data.start;
        (data.tratamientosAplicados || []).forEach(t => {
          tratamientos.push({
            ...t,
            fecha,
            turnoId: doc.id,
            comentario: t.comentario || ''
          });
        });
      });

      setHistoria(tratamientos);
      const comentariosMap = {};
      tratamientos.forEach((t, i) => comentariosMap[i] = t.comentario || '');
      setComentarios(comentariosMap);
    };

    cargarHistoria();
  }, [clienteId]);

  const guardarComentario = async (i) => {
    const tratamiento = historia[i];
    const nuevoComentario = comentarios[i];

    const turnoRef = doc(db, 'turnos', tratamiento.turnoId);
    const snapshot = await getDocs(query(collection(db, 'turnos'), where('clienteId', '==', clienteId)));
    const turno = snapshot.docs.find(d => d.id === tratamiento.turnoId);
    if (!turno) return;

    const datos = turno.data();
    const nuevosTratamientos = (datos.tratamientosAplicados || []).map(t =>
      t.nombre === tratamiento.nombre ? { ...t, comentario: nuevoComentario } : t
    );

    await updateDoc(turnoRef, { tratamientosAplicados: nuevosTratamientos });
    alert('Comentario guardado');
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#e91e63' }}>
        Historia Clínica del Cliente
      </h3>

      {historia.length === 0 ? (
        <p>Este cliente aún no tiene historial de tratamientos.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {historia.map((t, i) => (
            <li key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <strong>{t.nombre}</strong> – realizado el {format(new Date(t.fecha), 'dd/MM/yyyy HH:mm')}
              <div style={{ marginTop: '0.5rem' }}>
                <textarea
                  rows={2}
                  placeholder="Comentario clínico..."
                  value={comentarios[i] || ''}
                  onChange={e => setComentarios(prev => ({ ...prev, [i]: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                />
                <button
                  onClick={() => guardarComentario(i)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', backgroundColor: '#2196f3', color: 'white', border: 'none' }}
                >
                  Guardar Comentario
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
