import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function RegisterModal({ open, onClose, onSubmit }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      setLoading(true);
      await onSubmit({ email, password, fullName });
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
      setFullName('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
    } catch (err) {
      setError(err?.response?.data?.detail || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 9999, backgroundColor: 'rgba(15,23,42,0.35)' }}>
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800">Crear cuenta</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirmar contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold rounded-lg py-3 hover:bg-emerald-700 transition"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
