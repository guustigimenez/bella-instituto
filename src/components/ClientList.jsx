import { useEffect, useState } from 'react';
import {
  MailIcon,
  PhoneIcon,
  HomeIcon,
  CalendarIcon,
  UserIcon,
  PencilIcon,
  MessageCircleIcon
} from 'lucide-react';
import ModalEditClient from "./ModalEditClient";
import { actualizarClienteEnFirebase } from '../services/firebase';
import { toast } from 'react-toastify';
import HistoriaClinica from './HistoriaClinica';

export default function ClientList({ clientes: clientesProp }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteEditando, setClienteEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [comentarios, setComentarios] = useState({});

  useEffect(() => {
    setClientes(clientesProp || []);
  }, [clientesProp]);

  const abrirModal = (cliente) => {
    setClienteEditando(cliente);
    setModalAbierto(true);
  };

  const guardarClienteEditado = async (clienteActualizado) => {
    try {
      await actualizarClienteEnFirebase(clienteActualizado);

      const nuevosClientes = clientes.map((c) =>
        c.id === clienteActualizado.id ? clienteActualizado : c
      );
      setClientes(nuevosClientes);

      toast.success("Cliente actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar cliente en Firebase:", error);
      toast.error("Error al actualizar el cliente");
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-pink-700 mb-6 flex items-center gap-2">
        <UserIcon className="text-pink-700" size={24} />
        Historial de Clientes
      </h2>
      <input
        type="text"
        placeholder="Buscar por nombre o apellido..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-8"
      />

      <div className="space-y-6">
        {clientesFiltrados.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold text-pink-700 mb-1 flex items-center gap-2">
                  <UserIcon size={18} />
                  {c.nombre} {c.apellido}
                </div>

                {c.email && (
                  <div className="text-sm text-gray-800 flex items-center gap-2 mb-1">
                    <MailIcon size={16} className="text-gray-500" />
                    {c.email}
                  </div>
                )}

                {c.telefono && (
                  <div className="text-sm text-gray-800 flex items-center gap-2 mb-1">
                    <PhoneIcon size={16} className="text-gray-500" />
                    {c.telefono}
                  </div>
                )}

                {c.domicilio && (
                  <div className="text-sm text-gray-800 flex items-center gap-2 mb-1">
                    <HomeIcon size={16} className="text-gray-500" />
                    {c.domicilio}
                  </div>
                )}

                <div className="text-sm text-gray-800 flex items-center gap-2 mb-1">
                  <span className="font-medium">Edad:</span> {c.edad || '—'}
                </div>

                {c.fecha?.toDate && (
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    <CalendarIcon size={14} className="text-gray-400" />
                    {c.fecha.toDate().toLocaleDateString()} —{' '}
                    {c.fecha.toDate().toLocaleTimeString()}
                  </div>
                )}
              </div>

              <button
                onClick={() => abrirModal(c)}
                className="text-blue-600 hover:text-blue-800 transition"
                title="Editar cliente"
              >
                <PencilIcon size={18} />
              </button>
            </div>

            <div className="mt-4">
              <HistoriaClinica clienteId={c.id} />
            </div>
          </div>
        ))}
      </div>

      <ModalEditClient
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        client={clienteEditando}
        onSave={guardarClienteEditado}
      />
    </div>
  );
}