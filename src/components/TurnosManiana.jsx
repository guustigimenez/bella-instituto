// src/components/TurnosManiana.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format, addDays } from 'date-fns';

export default function TurnosManiana() {
    const [turnos, setTurnos] = useState([]);
  
    useEffect(() => {
      const cargarTurnos = async () => {
        const snapshot = await getDocs(collection(db, 'turnos'));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        const manana = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        const filtrados = lista.filter(turno => {
          const fecha = new Date(turno.start);
          const fechaLocal = new Date(fecha.getTime() - 3 * 60 * 60 * 1000);
          const fechaTurno = format(fechaLocal, 'yyyy-MM-dd');
          return fechaTurno === manana;
        });
  
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
        const clientes = clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        const turnosConTelefono = filtrados.map(turno => {
          const cliente = clientes.find(c => c.id === turno.clienteId);
          return {
            ...turno,
            telefono: cliente?.telefono || '—'
          };
        });
  
        setTurnos(turnosConTelefono);
      };
  
      cargarTurnos();
    }, []);
  
    const enviarWhatsapp = async (turno) => {
      const mensaje = `Hola ${turno.cliente}, te recordamos tu turno mañana a las ${format(new Date(turno.start), 'HH:mm')}.`;
      const telefono = turno.telefono.replace(/\D/g, '');
      const url = `https://wa.me/54${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
  
      try {
        await updateDoc(doc(db, 'turnos', turno.id), {
          whatsappEnviado: true
        });
        setTurnos(prev => prev.map(t => t.id === turno.id ? { ...t, whatsappEnviado: true } : t));
      } catch (error) {
        console.error('Error al actualizar turno:', error);
      }
    };
  
    if (turnos.length === 0) return null;
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 mt-8"
      >
        <h2 className="text-2xl font-bold text-pink-700 mb-4">📞 Turnos para mañana</h2>
        <ul className="space-y-4">
          {turnos.map(turno => {
            const hora = format(new Date(turno.start), 'HH:mm');
            return (
              <li key={turno.id} className="text-gray-800 flex justify-between items-center border-b pb-2">
                <div>
                  <span className="font-semibold">{hora}</span> — {turno.cliente} ({turno.telefono})
                </div>
                {!turno.whatsappEnviado ? (
                  <button
                    onClick={() => enviarWhatsapp(turno)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                  >
                    Enviar WhatsApp
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold text-sm">WhatsApp enviado</span>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    );
}