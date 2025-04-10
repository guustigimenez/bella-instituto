import { useEffect, useState } from "react";

export default function ModalEditClient({ open, onClose, client, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    domicilio: "",
    edad: ""
  });

  useEffect(() => {
    if (client) {
      setForm({
        nombre: client.nombre || "",
        apellido: client.apellido || "",
        email: client.email || "",
        telefono: client.telefono || "",
        domicilio: client.domicilio || "",
        edad: client.edad || ""
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...client, ...form });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-pink-700">Editar Cliente</h2>

        <div className="space-y-3">
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre"
            className="w-full border border-gray-300 rounded p-2" />
          <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido"
            className="w-full border border-gray-300 rounded p-2" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email"
            className="w-full border border-gray-300 rounded p-2" />
          <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono"
            className="w-full border border-gray-300 rounded p-2" />
          <input name="domicilio" value={form.domicilio} onChange={handleChange} placeholder="Domicilio"
            className="w-full border border-gray-300 rounded p-2" />
          <input name="edad" value={form.edad} onChange={handleChange} placeholder="Edad"
            className="w-full border border-gray-300 rounded p-2" />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
