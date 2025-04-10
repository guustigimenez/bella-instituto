// src/components/CalendarioSemanal.jsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

Modal.setAppElement('#root');

export default function CalendarioSemanal() {
  const [eventos, setEventos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoTurno, setNuevoTurno] = useState({
    cliente: '',
    clienteId: null,
    tratamiento: '',
    valor: '',
    start: null,
    end: null,
    id: null,
  });

  const [clientes, setClientes] = useState([]);
  const [clienteFiltrado, setClienteFiltrado] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');

  useEffect(() => {
    const cargarClientes = async () => {
      const snapshot = await getDocs(collection(db, 'clientes'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(lista);
    };

    const cargarTurnos = async () => {
      const snapshot = await getDocs(collection(db, 'turnos'));
      const turnos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          cliente: data.cliente,
          clienteId: data.clienteId,
          tratamiento: data.tratamiento,
          valor: data.valor,
          title: `${data.cliente} - ${data.tratamiento}`,
          start: new Date(data.start),
          end: new Date(data.end),
        };
      });
      setEventos(turnos);
    };

    cargarClientes();
    cargarTurnos();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setNuevoTurno({
      cliente: '',
      clienteId: null,
      tratamiento: '',
      valor: '',
      start,
      end,
      id: null,
    });
    setBusquedaCliente('');
    setClienteFiltrado([]);
    setModalAbierto(true);
  };

  const handleSelectEvent = (evento) => {
    setNuevoTurno({
      cliente: evento.cliente,
      clienteId: evento.clienteId,
      tratamiento: evento.tratamiento,
      valor: evento.valor,
      start: new Date(evento.start),
      end: new Date(evento.end),
      id: evento.id,
    });
    setBusquedaCliente(evento.cliente || '');
    setClienteFiltrado([]);
    setModalAbierto(true);
  };

  const guardarTurno = async () => {
    const nuevoEvento = {
      cliente: nuevoTurno.cliente,
      clienteId: nuevoTurno.clienteId,
      tratamiento: nuevoTurno.tratamiento,
      valor: nuevoTurno.valor,
      title: `${nuevoTurno.cliente} - ${nuevoTurno.tratamiento}`,
      start: nuevoTurno.start,
      end: nuevoTurno.end,
    };

    try {
      const docRef = await addDoc(collection(db, 'turnos'), {
        ...nuevoEvento,
        start: nuevoTurno.start.toISOString(),
        end: nuevoTurno.end.toISOString(),
        creado: new Date().toISOString(),
      });
      setEventos([...eventos, { ...nuevoEvento, id: docRef.id }]);
      setModalAbierto(false);
    } catch (error) {
      console.error('❌ Error al guardar turno:', error);
    }
  };

  const actualizarTurno = async () => {
    if (!nuevoTurno.id) return;

    const turnoRef = doc(db, 'turnos', nuevoTurno.id);
    const eventoActualizado = {
      cliente: nuevoTurno.cliente,
      clienteId: nuevoTurno.clienteId,
      tratamiento: nuevoTurno.tratamiento,
      valor: nuevoTurno.valor,
      start: nuevoTurno.start.toISOString(),
      end: nuevoTurno.end.toISOString(),
    };

    try {
      await updateDoc(turnoRef, eventoActualizado);
      setEventos(eventos.map(e => (e.id === nuevoTurno.id ? {
        ...e,
        ...eventoActualizado,
        start: new Date(nuevoTurno.start),
        end: new Date(nuevoTurno.end),
        title: `${nuevoTurno.cliente} - ${nuevoTurno.tratamiento}`,
      } : e)));
      setModalAbierto(false);
    } catch (error) {
      console.error('❌ Error al actualizar turno:', error);
    }
  };

  const eliminarTurno = async () => {
    if (!nuevoTurno.id) return;

    try {
      await deleteDoc(doc(db, 'turnos', nuevoTurno.id));
      setEventos(eventos.filter(e => e.id !== nuevoTurno.id));
      setModalAbierto(false);
    } catch (error) {
      console.error('❌ Error al eliminar turno:', error);
    }
  };

  return (
    <div style={{ height: '500px' }}>
      <h2>Agenda semanal</h2>
      <Calendar
        localizer={localizer}
        events={eventos}
        defaultView="week"
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={(slotInfo) => {
          if (!modalAbierto) handleSelectSlot(slotInfo);
        }}
        onSelectEvent={handleSelectEvent}
        tooltipAccessor={(event) =>
          `Cliente: ${event.cliente}\nTratamiento: ${event.tratamiento}\nValor: $${event.valor}`
        }
        culture="es"
        style={{
          height: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
        }}
      />

      <Modal
        isOpen={modalAbierto}
        onRequestClose={() => setModalAbierto(false)}
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
        <h3 style={{ marginBottom: '1rem' }}>Nuevo Turno</h3>

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
          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        {clienteFiltrado.length > 0 && (
          <div style={{ border: '1px solid #ccc', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', background: '#fff' }}>
            {clienteFiltrado.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => {
                  const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
                  setNuevoTurno(prev => ({ ...prev, cliente: nombreCompleto, clienteId: cliente.id }));
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

        <input
          type="text"
          placeholder="Tratamiento"
          value={nuevoTurno.tratamiento}
          onChange={(e) => setNuevoTurno(prev => ({ ...prev, tratamiento: e.target.value }))}
          style={{ width: '100%', padding: '8px', marginTop: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <input
          type="number"
          placeholder="Valor"
          value={nuevoTurno.valor}
          onChange={(e) => setNuevoTurno(prev => ({ ...prev, valor: e.target.value }))}
          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <p>
          Desde: {nuevoTurno.start ? format(nuevoTurno.start, 'dd/MM/yyyy HH:mm') : '—'} <br />
          Hasta: {nuevoTurno.end ? format(nuevoTurno.end, 'HH:mm') : '—'}
        </p>

        <div style={{ marginTop: '1rem' }}>
          {!nuevoTurno.id ? (
            <button
              onClick={guardarTurno}
              style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#e91e63', color: 'white', border: 'none', marginRight: '1rem' }}
            >
              Guardar Turno
            </button>
          ) : (
            <>
              <button
                onClick={actualizarTurno}
                style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#2196f3', color: 'white', border: 'none', marginRight: '1rem' }}
              >
                Actualizar Turno
              </button>
              <button
                onClick={eliminarTurno}
                style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#f44336', color: 'white', border: 'none', marginRight: '1rem' }}
              >
                Eliminar Turno
              </button>
            </>
          )}
          <button
            onClick={() => setModalAbierto(false)}
            style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#ccc', border: 'none' }}
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}
