import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MailIcon,
  PhoneIcon,
  PencilIcon,
  Trash2Icon,
  SaveIcon,
  XIcon,
  UserCircleIcon,
  SearchIcon
} from 'lucide-react';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargarClientes = async () => {
      const snapshot = await getDocs(collection(db, 'clientes'));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setClientes(lista);
    };
    cargarClientes();
  }, []);

  const handleEditar = (id) => {
    const cliente = clientes.find(c => c.id === id);
    setEditando(id);
    setFormData({ ...cliente });
  };

  const handleGuardar = async (id) => {
    try {
      await updateDoc(doc(db, 'clientes', id), {
        nombre: formData.nombre || '',
        apellido: formData.apellido || '',
        email: formData.email || '',
        telefono: formData.telefono || '',
      });
      setClientes(prev => {
        const actualizados = prev.map(c => (c.id === id ? { ...formData, id } : c));
        actualizados.sort((a, b) => a.apellido.localeCompare(b.apellido));
        return actualizados;
      });
      setEditando(null);
      toast.success('Cliente actualizado con éxito');
    } catch (error) {
      console.error('❌ Error al guardar cliente:', error);
      toast.error('Hubo un error al guardar los cambios');
    }
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'clientes', id));
      const restantes = clientes.filter(c => c.id !== id);
      restantes.sort((a, b) => a.apellido.localeCompare(b.apellido));
      setClientes(restantes);
      toast.info('Cliente eliminado');
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      toast.error('No se pudo eliminar el cliente');
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const texto = `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-pink-700 mb-6">Administrar Clientes</h2>

      <div className="mb-4 flex items-center gap-2">
        <SearchIcon size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm text-left">
            <thead className="bg-pink-100 text-pink-700 font-semibold">
              <tr>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2 align-top max-w-[200px]">
                    <div className="flex items-start gap-2">
                      <UserCircleIcon size={32} className="text-gray-400" />
                      <div>
                        {editando === cliente.id ? (
                          <>
                            <input
                              value={formData.nombre || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                              className="border rounded px-2 py-1 w-full mb-1"
                              placeholder="Nombre"
                            />
                            <input
                              value={formData.apellido || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, apellido: e.target.value }))}
                              className="border rounded px-2 py-1 w-full"
                              placeholder="Apellido"
                            />
                          </>
                        ) : (
                          <div className="font-medium">
                            {cliente.nombre} {cliente.apellido}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-2 align-top break-words max-w-[200px]">
                    {editando === cliente.id ? (
                      <input
                        value={formData.email || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Email"
                      />
                    ) : (
                      <span className="flex items-center gap-2 text-gray-800">
                        <MailIcon size={14} className="text-gray-500" /> {cliente.email || '-'}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-2 align-top break-words max-w-[160px]">
                    {editando === cliente.id ? (
                      <input
                        value={formData.telefono || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Teléfono"
                      />
                    ) : (
                      <span className="flex items-center gap-2 text-gray-800">
                        <PhoneIcon size={14} className="text-gray-500" /> {cliente.telefono || '-'}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-2 flex flex-wrap gap-2 max-w-[180px]">
                    {editando === cliente.id ? (
                      <>
                        <button
                          onClick={() => handleGuardar(cliente.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <SaveIcon size={14} /> Guardar
                        </button>
                        <button
                          onClick={() => setEditando(null)}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <XIcon size={14} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditar(cliente.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <PencilIcon size={14} /> Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(cliente.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Trash2Icon size={14} /> Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}