import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../services/firebase'; // Asegurate de importar tu instancia de Firebase

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
    } catch (error) {
      console.error('❌ Error al guardar cliente:', error);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'clientes', id));
      setClientes(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Administrar Clientes</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={th}>Nombre</th>
            <th style={th}>Apellido</th>
            <th style={th}>Email</th>
            <th style={th}>Teléfono</th>
            <th style={th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td style={td}>
                {editando === cliente.id ? (
                  <input
                    value={formData.nombre || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                  />
                ) : (
                  cliente.nombre
                )}
              </td>
              <td style={td}>
                {editando === cliente.id ? (
                  <input
                    value={formData.apellido || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, apellido: e.target.value }))
                    }
                  />
                ) : (
                  cliente.apellido
                )}
              </td>
              <td style={td}>
                {editando === cliente.id ? (
                  <input
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                ) : (
                  cliente.email
                )}
              </td>
              <td style={td}>
                {editando === cliente.id ? (
                  <input
                    value={formData.telefono || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, telefono: e.target.value }))
                    }
                  />
                ) : (
                  cliente.telefono || '-'
                )}
              </td>
              <td style={td}>
                {editando === cliente.id ? (
                  <>
                    <button onClick={() => handleGuardar(cliente.id)} style={btnSave}>
                      Guardar
                    </button>
                    <button onClick={() => setEditando(null)} style={btnCancel}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditar(cliente.id)} style={btnEdit}>
                      Editar
                    </button>
                    <button onClick={() => handleEliminar(cliente.id)} style={btnDelete}>
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
  );
}

const th = {
  textAlign: 'left',
  padding: '0.5rem',
  borderBottom: '1px solid #ccc',
};

const td = {
  padding: '0.5rem',
  borderBottom: '1px solid #eee',
};

const btnEdit = {
  backgroundColor: '#2196f3',
  color: 'white',
  border: 'none',
  padding: '4px 8px',
  marginRight: '4px',
  cursor: 'pointer',
  borderRadius: '4px',
};

const btnDelete = {
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  padding: '4px 8px',
  cursor: 'pointer',
  borderRadius: '4px',
};

const btnSave = {
  backgroundColor: '#4caf50',
  color: 'white',
  border: 'none',
  padding: '4px 8px',
  marginRight: '4px',
  cursor: 'pointer',
  borderRadius: '4px',
};

const btnCancel = {
  backgroundColor: '#9e9e9e',
  color: 'white',
  border: 'none',
  padding: '4px 8px',
  cursor: 'pointer',
  borderRadius: '4px',
};
