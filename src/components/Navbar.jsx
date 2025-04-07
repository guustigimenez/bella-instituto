// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>💖 Bella</div>
      <div>
        <Link to="/">Inicio</Link>
        <Link to="/clientes">Clientes</Link>
      </div>
    </nav>
  );
}
