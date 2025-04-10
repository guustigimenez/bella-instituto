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

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const cargarClientes = async () => {
      const snapshot = await getDocs(collection(db, 'clientes'));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
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
      setClientes(prev =>
        prev.map(c => (c.id === id ? { ...formData, id } : c))
      );
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
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.info('Cliente eliminado');
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      toast.error('No se pudo eliminar el cliente');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-pink-700 mb-6">Administrar Clientes</h2>
      <div className="overflow-x-auto bg-white rounded-xl shadow p-6">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-pink-100 text-pink-700 font-semibold">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Apellido</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-b last:border-b-0">
                <td className="px-4 py-2">
                  {editando === cliente.id ? (
                    <input
                      value={formData.nombre || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    cliente.nombre
                  )}
                </td>
                <td className="px-4 py-2">
                  {editando === cliente.id ? (
                    <input
                      value={formData.apellido || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, apellido: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    cliente.apellido
                  )}
                </td>
                <td className="px-4 py-2">
                  {editando === cliente.id ? (
                    <input
                      value={formData.email || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    cliente.email
                  )}
                </td>
                <td className="px-4 py-2">
                  {editando === cliente.id ? (
                    <input
                      value={formData.telefono || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, telefono: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    cliente.telefono || '-'
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  {editando === cliente.id ? (
                    <>
                      <button
                        onClick={() => handleGuardar(cliente.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditar(cliente.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(cliente.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Eliminar
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
  );
}
