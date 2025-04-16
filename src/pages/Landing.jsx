// src/pages/Landing.jsx
import { motion } from 'framer-motion';
import CalendarioSemanal from '../components/CalendarioSemanal';
import TurnosManiana from '../components/TurnosManiana';

export default function Landing() {
  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-700 mb-4">
          Bienvenida a <span className="text-pink-500">Bella</span>
        </h1>
        <p className="text-gray-700 text-lg">
          Gestioná los tratamientos y clientes de tu centro de belleza de forma <span className="font-medium">rápida</span>, <span className="font-medium">ordenada</span> y <span className="font-medium">segura</span>.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6"
      >
        <h2 className="text-2xl font-bold text-pink-700 mb-4">📅 Agenda Semanal</h2>
        <CalendarioSemanal />
      </motion.div>

      <TurnosManiana />
    </div>
  );
}
