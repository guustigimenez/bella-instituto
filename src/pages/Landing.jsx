// src/pages/Landing.jsx
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div>
      <h1>Bienvenida a Bella</h1>
      <p>
        Gestioná los tratamientos y clientes de tu centro de belleza de forma rápida, ordenada y segura.
      </p>
      <Link to="/clientes">
        <button style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#e91e63',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginTop: '1rem',
          cursor: 'pointer'
        }}>
          Ir a Gestión de Clientes
        </button>
      </Link>
    </div>
  );
}
