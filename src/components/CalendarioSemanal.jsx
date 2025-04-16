// src/components/CalendarioSemanal.jsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import TurnoForm from './TurnoForm';
import { guardarHistoriaClinica, eliminarHistoriaClinicaDeTurno } from '../services/historiaClinicaService';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarioSemanal() {
  const [eventos, setEventos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoTurno, setNuevoTurno] = useState({
    cliente: '',
    clienteId: null,
    tratamientosAplicados: [],
    valor: 0,
    start: null,
    end: null,
    id: null,
  });

  const [clientes, setClientes] = useState([]);
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
          tratamientosAplicados: data.tratamientosAplicados || [],
          valor: data.valor || 0,
          title: `${data.cliente} - ${(data.tratamientosAplicados || []).map(t => t.nombre).join(', ')}`,
          start: new Date(data.start),
          end: new Date(data.end),
        };
      });
      setEventos(turnos);
    };

    const cargarTratamientos = async () => {
      const snapshot = await getDocs(collection(db, 'tratamientos'));
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setTratamientos(lista);
    };

    cargarClientes();
    cargarTurnos();
    cargarTratamientos();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setNuevoTurno({
      cliente: '',
      clienteId: null,
      tratamientosAplicados: [],
      valor: 0,
      start,
      end,
      id: null,
    });
    setModalAbierto(true);
  };

  const handleSelectEvent = (evento) => {
    setNuevoTurno({
      cliente: evento.cliente,
      clienteId: evento.clienteId,
      tratamientosAplicados: evento.tratamientosAplicados || [],
      valor: evento.valor || 0,
      start: new Date(evento.start),
      end: new Date(evento.end),
      id: evento.id,
    });
    setModalAbierto(true);
  };

  const guardarTurno = async () => {
    if (!nuevoTurno.tratamientosAplicados || nuevoTurno.tratamientosAplicados.length === 0) {
      alert('Debes agregar al menos un tratamiento.');
      return;
    }

    const nuevoEvento = {
      cliente: nuevoTurno.cliente,
      clienteId: nuevoTurno.clienteId,
      tratamientosAplicados: nuevoTurno.tratamientosAplicados,
      valor: nuevoTurno.valor,
      title: `${nuevoTurno.cliente} - ${nuevoTurno.tratamientosAplicados.map(t => t.nombre).join(', ')}`,
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
    if (!nuevoTurno.tratamientosAplicados || nuevoTurno.tratamientosAplicados.length === 0) {
      alert('Debes agregar al menos un tratamiento.');
      return;
    }

    const turnoRef = doc(db, 'turnos', nuevoTurno.id);
    const eventoActualizado = {
      cliente: nuevoTurno.cliente,
      clienteId: nuevoTurno.clienteId,
      tratamientosAplicados: nuevoTurno.tratamientosAplicados,
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
        title: `${nuevoTurno.cliente} - ${nuevoTurno.tratamientosAplicados.map(t => t.nombre).join(', ')}`,
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

      await eliminarHistoriaClinicaDeTurno(nuevoTurno.clienteId, nuevoTurno.start.toISOString());
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
        tooltipAccessor={(event) => {
          if (!event.tratamientosAplicados || event.tratamientosAplicados.length === 0) return '';
          const lista = event.tratamientosAplicados.map(t => `• ${t.nombre} ($${t.valor})`).join('\n');
          return `Cliente: ${event.cliente}\n${lista}\nTotal: $${event.valor}`;
        }}
        culture="es"
        min={new Date(2020, 0, 1, 7, 0)} 
        max={new Date(2020, 0, 1, 22, 0)} 
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
