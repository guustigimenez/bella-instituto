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
    <div>
      <h2>Gestión de Clientes</h2>
      <ClientForm onClienteAgregado={agregarCliente} />
      <hr style={{ margin: '2rem 0' }} />
      <ClientList clientes={clientes} />
    </div>
  );
}
