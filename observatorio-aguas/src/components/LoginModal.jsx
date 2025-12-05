import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function LoginModal({ open, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const formatDetail = (detail) => {
    if (Array.isArray(detail)) return detail.map((d) => d?.msg || JSON.stringify(d)).join(' | ');
    if (typeof detail === 'string') return detail;
    if (detail?.msg) return detail.msg;
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      setLoading(true);
      await onSubmit(email, password);
      onClose();
      setEmail('');
      setPassword('');
    } catch (err) {
      const formatted = formatDetail(err?.response?.data?.detail) || 'No se pudo iniciar sesión';
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
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800">Iniciar sesión</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Correo</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
