import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const tipos = ['Río', 'Lago', 'Océano'];
const contaminaciones = ['Baja', 'Medio-Baja', 'Medio', 'Medio-Alto', 'Alta'];
const biodiversidades = ['Alta', 'Media', 'Baja'];

export default function WaterBodyForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'Río',
    latitud: '',
    longitud: '',
    contaminacion: 'Baja',
    biodiversidad: 'Alta',
    descripcion: '',
    temperatura: '',
    ph: '',
    oxigeno_disuelto: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
        temperatura: form.temperatura ? parseFloat(form.temperatura) : undefined,
        ph: form.ph ? parseFloat(form.ph) : undefined,
        oxigeno_disuelto: form.oxigeno_disuelto ? parseFloat(form.oxigeno_disuelto) : undefined,
      };
      await api.post('/cuerpos-agua', payload);
      onCreated?.();
      onClose();
    } catch (err) {
      const message = err.response?.data?.detail || 'No se pudo registrar el cuerpo de agua';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const allowed = user && ['admin', 'analista'].includes(user.role);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Registrar cuerpo de agua</h2>
            <p className="text-sm text-gray-500">Los datos se guardarán vinculados a tu usuario.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {!allowed && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-3 text-sm">
            Debes tener rol de analista o admin para registrar nuevos cuerpos de agua.
          </div>
        )}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre"
              required
              value={form.nombre}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {tipos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
              <input
                name="latitud"
                type="number"
                step="any"
                required
                value={form.latitud}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
              <input
                name="longitud"
                type="number"
                step="any"
                required
                value={form.longitud}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contaminación</label>
            <select
              name="contaminacion"
              value={form.contaminacion}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {contaminaciones.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biodiversidad</label>
            <select
              name="biodiversidad"
              value={form.biodiversidad}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {biodiversidades.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
            <input
              name="temperatura"
              type="number"
              step="any"
              value={form.temperatura}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
            <input
              name="ph"
              type="number"
              step="any"
              value={form.ph}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oxígeno disuelto (mg/L)</label>
            <input
              name="oxigeno_disuelto"
              type="number"
              step="any"
              value={form.oxigeno_disuelto}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              rows="3"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancelar</button>
            <button
              type="submit"
              disabled={!allowed || loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
