// src/pages/Clientes.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import ClientForm from '../components/ClientForm';
import ClientList from '../components/ClientList';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  const cargarClientes = async () => {
    const q = query(collection(db, 'clientes'), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClientes(data);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const agregarCliente = (nuevoCliente) => {
    setClientes(prev => [nuevoCliente, ...prev]);
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2
        style={{
          fontSize: '1.8rem',
          color: '#e91e63',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e91e63',
          paddingBottom: '0.5rem',
        }}
      >
        📋 Gestión de Clientes - Total de clientes: {clientes.length}
      </h2>

      <ClientForm onClienteAgregado={agregarCliente} />

      <hr style={{ margin: '2rem 0', borderColor: '#eee' }} />

      <ClientList clientes={[...clientes].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))} />
    </div>
  );
}
