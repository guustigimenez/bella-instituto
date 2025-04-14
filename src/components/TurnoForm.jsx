// src/components/TurnoForm.jsx
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';

Modal.setAppElement('#root');

export default function TurnoForm({
  isOpen,
  onClose,
  onGuardar,
  onActualizar,
  onEliminar,
  turno,
  setTurno,
  clientes,
  tratamientos
}) {
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteFiltrado, setClienteFiltrado] = useState([]);
  const [tratamientoSeleccionadoId, setTratamientoSeleccionadoId] = useState('');

  useEffect(() => {
    if (turno.cliente) {
      setBusquedaCliente(turno.cliente);
    } else {
      setBusquedaCliente('');
    }
    setClienteFiltrado([]);
  }, [turno]);

  useEffect(() => {
    const total = (turno.tratamientosAplicados || []).reduce(
      (acc, t) => acc + Number(t.valor),
      0
    );
    setTurno((prev) => ({ ...prev, valor: total }));
  }, [turno.tratamientosAplicados]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={false}
      style={{
        content: {
          padding: '2rem',
          borderRadius: '10px',
          maxWidth: '500px',
          margin: 'auto',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          backgroundColor: '#fff',
        },
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.3)',
        },
      }}
    >
      <h3 style={{ marginBottom: '1rem' }}>{turno.id ? 'Editar Turno' : 'Nuevo Turno'}</h3>

      <input
        type="text"
        placeholder="Buscar cliente por nombre o email"
        value={busquedaCliente}
        onChange={(e) => {
          const texto = e.target.value.toLowerCase();
          setBusquedaCliente(texto);
          const resultados = clientes.filter(
            (c) =>
              c.nombre?.toLowerCase().includes(texto) ||
              c.apellido?.toLowerCase().includes(texto) ||
              c.email?.toLowerCase().includes(texto)
          );
          setClienteFiltrado(resultados);
        }}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      {clienteFiltrado.length > 0 && (
        <div style={{ border: '1px solid #ccc', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
          {clienteFiltrado.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => {
                const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
                setTurno((prev) => ({ ...prev, cliente: nombreCompleto, clienteId: cliente.id }));
                setBusquedaCliente(nombreCompleto);
                setClienteFiltrado([]);
              }}
              style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              {cliente.nombre} {cliente.apellido} – {cliente.email}
            </div>
          ))}
        </div>
      )}

      <select
        value={tratamientoSeleccionadoId}
        onChange={(e) => setTratamientoSeleccionadoId(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      >
        <option value="">Seleccionar tratamiento</option>
        {tratamientos.map((t) => (
          <option key={t.id} value={t.id}>{t.nombre} – ${t.valor}</option>
        ))}
      </select>

      <button
        onClick={() => {
          const t = tratamientos.find((x) => x.id === tratamientoSeleccionadoId);
          if (t) {
            setTurno((prev) => ({
              ...prev,
              tratamientosAplicados: [...(prev.tratamientosAplicados || []), t]
            }));
            setTratamientoSeleccionadoId('');
          }
        }}
        style={{ width: '100%', padding: '8px', marginBottom: '20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px' }}
      >
        Agregar Tratamiento
      </button>

      <ul style={{ marginBottom: '20px' }}>
        {(turno.tratamientosAplicados || []).map((t, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '5px'
            }}
          >
            <span>{t.nombre} – ${t.valor}</span>
            <button
              onClick={() => {
                const nuevos = turno.tratamientosAplicados.filter((_, i) => i !== index);
                setTurno(prev => ({ ...prev, tratamientosAplicados: nuevos }));
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e91e63',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              title="Eliminar tratamiento"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <input
        type="number"
        value={turno.valor || 0}
        disabled
        style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#f0f0f0' }}
      />

      <p>
        Desde: {turno.start ? format(turno.start, 'dd/MM/yyyy HH:mm') : '—'}<br />
        Hasta: {turno.end ? format(turno.end, 'HH:mm') : '—'}
      </p>

      <div style={{ marginTop: '1rem' }}>
        {!turno.id ? (
          <button onClick={onGuardar} style={{ padding: '8px 12px', backgroundColor: '#e91e63', color: 'white', border: 'none', marginRight: '1rem' }}>Guardar Turno</button>
        ) : (
          <>
            <button onClick={onActualizar} style={{ padding: '8px 12px', backgroundColor: '#2196f3', color: 'white', border: 'none', marginRight: '1rem' }}>Actualizar Turno</button>
            <button onClick={onEliminar} style={{ padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', marginRight: '1rem' }}>Eliminar Turno</button>
          </>
        )}
        <button onClick={onClose} style={{ padding: '8px 12px', backgroundColor: '#ccc', border: 'none' }}>Cancelar</button>
      </div>
    </Modal>
  );
}