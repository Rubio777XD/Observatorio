import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import './App.css';
import api from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import WaterBodyForm from './components/WaterBodyForm';
import MapView from './components/MapView';
import DataPanel from './components/DataPanel';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState('mapa');
  const [filtro, setFiltro] = useState('todos');
  const [cuerpos, setCuerpos] = useState([]);
  const [showAuth, setShowAuth] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingBodies, setIsLoadingBodies] = useState(false);

  const fetchCuerpos = async () => {
    try {
      setIsLoadingBodies(true);
      const { data } = await api.get('/cuerpos-agua');
      setCuerpos(data);
    } catch (err) {
      setError('No se pudieron cargar los cuerpos de agua');
    } finally {
      setIsLoadingBodies(false);
    }
  };

  useEffect(() => {
    fetchCuerpos();
  }, []);

  const canCreate = user && ['admin', 'analista'].includes(user.role);

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-white shadow-lg rounded-xl mx-4 mt-4 mb-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Observatorio de Aguas</h1>
                <p className="text-xs text-gray-500">Monitoreo colaborativo de cuerpos de agua</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!loading && user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">{user.full_name}</p>
                    <p className="text-gray-500">Rol: {user.role || 'N/A'}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
                    onClick={() => setShowAuth('login')}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setShowAuth('register')}
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex space-x-2 pb-4">
            {['mapa', 'datos', 'acerca'].map((key) => (
              <button
                key={key}
                className={`btn-tab px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${tab === key ? 'active shadow-md' : ''}`}
                onClick={() => setTab(key)}
              >
                <span className="capitalize">{key}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pb-12">
        {tab === 'mapa' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Mapa Interactivo</h2>
                <p className="text-sm text-gray-500">Datos obtenidos directamente desde la API</p>
              </div>
              <div className="flex items-center gap-2">
                {canCreate && (
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    onClick={() => setShowForm(true)}
                  >
                    + Registrar cuerpo de agua
                  </button>
                )}
                {!user && (
                  <button
                    className="text-sm text-blue-600 underline"
                    onClick={() => setShowAuth('login')}
                  >
                    Inicia sesión para registrar
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'río', label: 'Ríos' },
                { key: 'lago', label: 'Lagos' },
                { key: 'océano', label: 'Océanos' },
              ].map((item) => (
                <button
                  key={item.key}
                  className={`filter-btn px-3 py-1.5 rounded-full border text-sm transition-all ${
                    filtro === item.key ? 'active border-2 font-semibold' : ''
                  }`}
                  onClick={() => setFiltro(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}
            {isLoadingBodies ? (
              <div className="flex items-center justify-center h-64 text-blue-600 font-semibold">Cargando cuerpos de agua...</div>
            ) : (
              <MapView cuerpos={cuerpos} filtro={filtro} />
            )}
          </div>
        )}

        {tab === 'datos' && <DataPanel cuerpos={cuerpos} />}

        {tab === 'acerca' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acerca del Observatorio</h2>
            <p className="text-gray-700 leading-relaxed">
              El Observatorio de Aguas conecta los datos reales de cuerpos de agua con herramientas de visualización y gestión.
              Usa autenticación JWT del backend para que analistas y administradores registren nuevos cuerpos de agua, mientras los
              visualizadores pueden explorar información en tiempo real.
            </p>
          </div>
        )}
      </main>

      {showAuth && (
        <AuthModal
          type={showAuth}
          onClose={() => setShowAuth(null)}
          onSuccess={fetchCuerpos}
        />
      )}
      {showForm && (
        <WaterBodyForm
          onClose={() => setShowForm(false)}
          onCreated={fetchCuerpos}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
