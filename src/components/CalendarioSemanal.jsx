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
import TurnoForm from './TurnoForm';

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
  const [tratamientos, setTratamientos] = useState([]);

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

useEffect(() => {
  const cargarTratamientos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'tratamientos'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Tratamientos desde Firebase:', lista);
      setTratamientos(lista);
    } catch (error) {
      console.error('Error al cargar tratamientos:', error);
    }
  };

  cargarTratamientos();
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
    if (
      !nuevoTurno.valor ||
      isNaN(nuevoTurno.valor) ||
      Number(nuevoTurno.valor) <= 0
    ) {
      alert('Por favor ingresá un valor numérico mayor a cero para el tratamiento.');
      return;
    }

    const nuevoEvento = {
      cliente: nuevoTurno.cliente,
      clienteId: nuevoTurno.clienteId,
      tratamiento: nuevoTurno.tratamiento,
      valor: Number(nuevoTurno.valor),
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

    if (
      !nuevoTurno.valor ||
      isNaN(nuevoTurno.valor) ||
      Number(nuevoTurno.valor) <= 0
    ) {
      alert('Por favor ingresá un valor numérico mayor a cero para el tratamiento.');
      return;
    }

    const turnoRef = doc(db, 'turnos', nuevoTurno.id);
    const eventoActualizado = {
      cliente: nuevoTurno.cliente,
      clienteId: nuevoTurno.clienteId,
      tratamiento: nuevoTurno.tratamiento,
      valor: Number(nuevoTurno.valor),
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

      <TurnoForm
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardar={guardarTurno}
        onActualizar={actualizarTurno}
        onEliminar={eliminarTurno}
        turno={nuevoTurno}
        setTurno={setNuevoTurno}
        clientes={clientes}
        tratamientos={tratamientos}
      />
    </div>
  );
}
