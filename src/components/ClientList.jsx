// src/components/ClientList.jsx
import { useState } from 'react';

export default function ClientList({ clientes }) {
  const [busqueda, setBusqueda] = useState('');

  const clientesFiltrados = clientes.filter(c =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h2>Historial de Clientes</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o apellido..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />
      {clientesFiltrados.map((c) => (
        <div key={c.id} style={{ marginBottom: '1rem' }}>
          <strong>{c.nombre} {c.apellido}</strong> <br />
          <small>{c.email} - Edad: {c.edad}</small><br />
          <small>Fecha ingreso: {c.fecha.toDate().toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
