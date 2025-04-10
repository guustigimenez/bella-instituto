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
    telefono: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cliente = {
      ...form,
      edad: parseInt(form.edad),
      fecha: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'clientes'), cliente);
    onClienteAgregado({ id: docRef.id, ...cliente });
    setForm({
      nombre: '',
      apellido: '',
      edad: '',
      domicilio: '',
      email: '',
      telefono: '',
    });
    setMostrarFormulario(false);
    alert('Cliente registrado con éxito');
  };

  return (
    <div className="mb-6">
      {!mostrarFormulario ? (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition"
        >
          Agregar Nuevo Cliente
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded p-6 space-y-4"
        >
          {[
            { name: 'nombre', label: 'Nombre' },
            { name: 'apellido', label: 'Apellido' },
            { name: 'edad', label: 'Edad', type: 'number' },
            { name: 'domicilio', label: 'Domicilio' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono' },
          ].map(({ name, label, type = 'text' }) => (
            <input
              key={name}
              name={name}
              placeholder={label}
              type={type}
              value={form[name]}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          ))}
          <div className="flex gap-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Guardar Cliente
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
