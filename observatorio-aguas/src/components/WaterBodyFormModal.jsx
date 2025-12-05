import { useState } from 'react';
import { createPortal } from 'react-dom';

const tipos = ['Río', 'Lago', 'Océano'];
const contaminacionOpciones = ['Baja', 'Medio', 'Media', 'Medio-Alto', 'Alto'];
const biodiversidadOpciones = ['Alta', 'Media', 'Baja'];

export default function WaterBodyFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'Río',
    latitud: '',
    longitud: '',
    contaminacion: 'Medio',
    biodiversidad: 'Media',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const formatDetail = (detail) => {
    if (Array.isArray(detail)) return detail.map((d) => d?.msg || JSON.stringify(d)).join(' | ');
    if (typeof detail === 'string') return detail;
    if (detail?.msg) return detail.msg;
    return '';
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      setLoading(true);
      await onSubmit({
        ...form,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
      });
      onClose();
      setForm({
        nombre: '',
        tipo: 'Río',
        latitud: '',
        longitud: '',
        contaminacion: 'Medio',
        biodiversidad: 'Media',
        descripcion: '',
      });
    } catch (err) {
      const formatted = formatDetail(err?.response?.data?.detail) || 'No se pudo registrar el cuerpo de agua';
      setError(formatted);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(15,23,42,0.35)',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800">Registrar cuerpo de agua</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Nombre</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Tipo</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              required
            >
              {tipos.map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contaminación</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.contaminacion}
              onChange={(e) => handleChange('contaminacion', e.target.value)}
              required
            >
              {contaminacionOpciones.map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Biodiversidad</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.biodiversidad}
              onChange={(e) => handleChange('biodiversidad', e.target.value)}
              required
            >
              {biodiversidadOpciones.map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Latitud</label>
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.latitud}
              onChange={(e) => handleChange('latitud', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Longitud</label>
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.longitud}
              onChange={(e) => handleChange('longitud', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              rows="3"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
