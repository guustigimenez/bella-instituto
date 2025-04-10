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
  
  useEffect(() => {
    if (turno.cliente) {
      setBusquedaCliente(turno.cliente);
    } else {
      setBusquedaCliente('');
    }
    setClienteFiltrado([]);
  }, [turno]);

  useEffect(() => {
    if (!turno.valorBase) return;
  
    let valorFinal = turno.valorBase;
  
    if (turno.tipoDescuento && turno.descuento) {
      if (turno.tipoDescuento === 'fijo') {
        valorFinal = turno.valorBase - turno.descuento;
      } else if (turno.tipoDescuento === 'porcentaje') {
        valorFinal = turno.valorBase * (1 - turno.descuento / 100);
      }
    }
  
    setTurno(prev => ({
      ...prev,
      valor: Math.max(0, Math.round(valorFinal)),
    }));
  }, [turno.valorBase, turno.tipoDescuento, turno.descuento]);

  const handleCambioValor = (e) => {
    const valorNumerico = parseFloat(e.target.value);
    setTurno(prev => ({
      ...prev,
      valor: isNaN(valorNumerico) ? '' : valorNumerico,
    }));
  };

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
      <h3 style={{ marginBottom: '1rem' }}>
        {turno.id ? 'Editar Turno' : 'Nuevo Turno'}
      </h3>

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
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />

      {clienteFiltrado.length > 0 && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            maxHeight: '150px',
            overflowY: 'auto',
            background: '#fff',
          }}
        >
          {clienteFiltrado.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => {
                const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
                setTurno((prev) => ({
                  ...prev,
                  cliente: nombreCompleto,
                  clienteId: cliente.id,
                }));
                setBusquedaCliente(nombreCompleto);
                setClienteFiltrado([]);
              }}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
              }}
            >
              {cliente.nombre} {cliente.apellido} – {cliente.email}
            </div>
          ))}
        </div>
      )}

        <select
        value={turno.tratamientoId || ''}
        onChange={(e) => {
            const id = e.target.value;
            const tratamiento = tratamientos.find(t => t.id === id);
            if (tratamiento) {
            setTurno(prev => ({
                ...prev,
                tratamientoId: id,
                tratamiento: tratamiento.nombre,
                valorBase: tratamiento.valor,
                valor: tratamiento.valor, // Por si no hay descuento
            }));
            }
        }}
        style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
        }}
        >
        <option value="">Seleccionar tratamiento</option>
        {tratamientos.map((t) => (
            <option key={t.id} value={t.id}>
            {t.nombre} – ${t.valor}
            </option>
        ))}
        </select>

      <input
        type="number"
        value={turno.valor || ''}
        disabled
        style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: '#f0f0f0',
        }}
        />

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '10px' }}>
        <select
            value={turno.tipoDescuento || ''}
            onChange={(e) =>
            setTurno(prev => ({ ...prev, tipoDescuento: e.target.value }))
            }
            style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            }}
        >
            <option value="">Sin descuento</option>
            <option value="fijo">Descuento fijo ($)</option>
            <option value="porcentaje">Descuento %</option>
        </select>

        <input
            type="number"
            placeholder="Descuento"
            value={turno.descuento || ''}
            onChange={(e) =>
            setTurno(prev => ({
                ...prev,
                descuento: parseFloat(e.target.value),
            }))
            }
            disabled={!turno.tipoDescuento}
            style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            }}
        />
        </div>

      <p>
        Desde: {turno.start ? format(turno.start, 'dd/MM/yyyy HH:mm') : '—'}
        <br />
        Hasta: {turno.end ? format(turno.end, 'HH:mm') : '—'}
      </p>

      <div style={{ marginTop: '1rem' }}>
        {!turno.id ? (
          <button
            onClick={onGuardar}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#e91e63',
              color: 'white',
              border: 'none',
              marginRight: '1rem',
            }}
          >
            Guardar Turno
          </button>
        ) : (
          <>
            <button
              onClick={onActualizar}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                marginRight: '1rem',
              }}
            >
              Actualizar Turno
            </button>
            <button
              onClick={onEliminar}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                marginRight: '1rem',
              }}
            >
              Eliminar Turno
            </button>
          </>
        )}
        <button
          onClick={onClose}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#ccc',
            border: 'none',
          }}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}