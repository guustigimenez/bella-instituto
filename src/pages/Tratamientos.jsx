// src/components/Tratamientos.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Tratamientos() {
  const [tratamientos, setTratamientos] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoValor, setNuevoValor] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tratamientoEditando, setTratamientoEditando] = useState(null);

  useEffect(() => {
    cargarTratamientos();
  }, []);

  const cargarTratamientos = async () => {
    const snapshot = await getDocs(collection(db, 'tratamientos'));
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTratamientos(lista);
  };

  const agregarTratamiento = async () => {
    if (!nuevoNombre || !nuevoValor) return;

    try {
      await addDoc(collection(db, 'tratamientos'), {
        nombre: nuevoNombre,
        valor: parseFloat(nuevoValor),
      });
      resetFormulario();
      cargarTratamientos();
    } catch (error) {
      console.error('Error al agregar tratamiento:', error);
    }
  };

  const eliminarTratamiento = async (id) => {
    const confirmar = window.confirm('¿Estás seguro que querés eliminar este tratamiento?');
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'tratamientos', id));
      setTratamientos(tratamientos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error al eliminar tratamiento:', error);
    }
  };

  const editarTratamiento = (tratamiento) => {
    setNuevoNombre(tratamiento.nombre);
    setNuevoValor(tratamiento.valor);
    setTratamientoEditando(tratamiento.id);
    setModoEdicion(true);
  };

  const guardarEdicion = async () => {
    if (!tratamientoEditando) return;

    try {
      const ref = doc(db, 'tratamientos', tratamientoEditando);
      await updateDoc(ref, {
        nombre: nuevoNombre,
        valor: parseFloat(nuevoValor),
      });
      resetFormulario();
      cargarTratamientos();
    } catch (error) {
      console.error('Error al actualizar tratamiento:', error);
    }
  };

  const cancelarEdicion = () => {
    resetFormulario();
  };

  const resetFormulario = () => {
    setNuevoNombre('');
    setNuevoValor('');
    setModoEdicion(false);
    setTratamientoEditando(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h2>Gestión de Tratamientos</h2>

      <input
        type="text"
        placeholder="Nombre del tratamiento"
        value={nuevoNombre}
        onChange={(e) => setNuevoNombre(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      <input
        type="number"
        placeholder="Valor"
        value={nuevoValor}
        onChange={(e) => setNuevoValor(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      {modoEdicion ? (
        <>
          <button
            onClick={guardarEdicion}
            style={{ padding: '8px 16px', marginRight: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Guardar Cambios
          </button>
          <button
            onClick={cancelarEdicion}
            style={{ padding: '8px 16px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          onClick={agregarTratamiento}
          style={{ padding: '8px 16px', marginRight: '10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Agregar Tratamiento
        </button>
      )}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
        {tratamientos.map(t => (
          <li
            key={t.id}
            style={{ padding: '0.5rem 0', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{t.nombre} - ${t.valor}</span>
            <div>
              <button
                onClick={() => editarTratamiento(t)}
                style={{ marginRight: '10px', backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
              >
                Editar
              </button>
              <button
                onClick={() => eliminarTratamiento(t.id)}
                style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
