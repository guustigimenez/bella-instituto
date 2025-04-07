// src/components/ClientForm.jsx
import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ClientForm({ onClienteAgregado }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    domicilio: '',
    email: '',
    tratamiento: '',
    monto: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cliente = {
      ...form,
      edad: parseInt(form.edad),
      monto: parseFloat(form.monto),
      fecha: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'clientes'), cliente);

    // Notificar al componente padre
    onClienteAgregado({ id: docRef.id, ...cliente });

    setForm({
      nombre: '',
      apellido: '',
      edad: '',
      domicilio: '',
      email: '',
      tratamiento: '',
      monto: '',
    });

    setMostrarFormulario(false);
    alert('Cliente registrado con éxito');
  };

  return (
    <div>
      {!mostrarFormulario ? (
        <button onClick={() => setMostrarFormulario(true)} style={estiloBoton}>
          Agregar Nuevo Cliente
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
          <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
          <input name="edad" placeholder="Edad" type="number" value={form.edad} onChange={handleChange} />
          <input name="domicilio" placeholder="Domicilio" value={form.domicilio} onChange={handleChange} />
          <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} />
          <input name="tratamiento" placeholder="Tratamiento" value={form.tratamiento} onChange={handleChange} />
          <input name="monto" placeholder="Monto $" type="number" value={form.monto} onChange={handleChange} />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit">Guardar Cliente</button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              style={botonCancelar}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const estiloBoton = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#e91e63',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  marginBottom: '1rem'
};

const botonCancelar = {
  backgroundColor: '#ccc',
  color: '#333',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem',
  cursor: 'pointer'
};
