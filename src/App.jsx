// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Clientes from './pages/Clientes';
import './App.css'; // ⬅️ Asegurate de importar el CSS

function App() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/clientes" element={<Clientes />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
