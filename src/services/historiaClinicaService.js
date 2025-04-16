import { collection, addDoc, query, where, getDocs, deleteDoc} from 'firebase/firestore';
import { db } from './firebase';

export const guardarHistoriaClinica = async (clienteId, clienteNombre, tratamientos, fecha) => {
  const coleccion = collection(db, 'historia_clinica');

  for (const tratamiento of tratamientos) {
    await addDoc(coleccion, {
      clienteId,
      clienteNombre,
      tratamientoNombre: tratamiento.nombre,
      fecha,
      comentario: '', // Se puede editar después
    });
  }
};

export const eliminarHistoriaClinicaDeTurno = async (clienteId, fecha) => {
  const coleccion = collection(db, 'historia_clinica');

  const q = query(
    coleccion,
    where('clienteId', '==', clienteId),
    where('fecha', '==', fecha)
  );

  const snapshot = await getDocs(q);
  const batch = [];

  snapshot.forEach((docu) => {
    batch.push(deleteDoc(docu.ref));
  });

  await Promise.all(batch);
};