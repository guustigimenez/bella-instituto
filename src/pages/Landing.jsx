// src/pages/Landing.jsx
import { Link } from 'react-router-dom';

import CalendarioSemanal from '../components/CalendarioSemanal';

export default function Landing() {
  return (
    <div>
      <h1>Bienvenida a Bella</h1>
      <p>
        Gestioná los tratamientos y clientes de tu centro de belleza de forma rápida, ordenada y segura.
      </p>
      <CalendarioSemanal />
    </div>
  );
}
