import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import api from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import WaterBodyFormModal from './components/WaterBodyFormModal';

const tipoColorFallback = {
  río: '#2563eb',
  lago: '#16a34a',
  océano: '#4338ca',
};

function getColorByTipo(tipo) {
  if (!tipo) return '#475569';
  const normalized = tipo.toLowerCase();
  return tipoColorFallback[normalized] || '#475569';
}

const contaminationRank = {
  baja: 1,
  'medio-bajo': 2,
  media: 3,
  medio: 3,
  'medio-alto': 4,
  alto: 5,
};

function StatsCard({ title, value, subtitle, color }) {
  return (
    <div className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-slate-600 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-semibold text-slate-800 mt-2">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white`} style={{ backgroundColor: color }}>
        ●
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function MapView({ cuerpos, filtro }) {
  const filtered = useMemo(() => {
    if (filtro === 'todos') return cuerpos;
    return cuerpos.filter((c) => c.tipo?.toLowerCase() === filtro);
  }, [cuerpos, filtro]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-800">Mapa interactivo</h3>
        <p className="text-sm text-slate-500">{filtered.length} cuerpos visibles</p>
      </div>
      <div className="h-[480px]">
        <MapContainer center={[-15, -60]} zoom={3} scrollWheelZoom className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          {filtered.map((cuerpo) => {
            const color = getColorByTipo(cuerpo.tipo);
            const icon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background:${color}; width: 14px; height: 14px; border-radius: 9999px; border: 2px solid white"></div>`,
            });
            return (
              <Marker key={cuerpo.id} position={[cuerpo.latitud, cuerpo.longitud]} icon={icon}>
                <Popup>
                  <div className="text-sm">
                    <h4 className="font-semibold text-slate-800">{cuerpo.nombre}</h4>
                    <p className="text-slate-600">Tipo: {cuerpo.tipo}</p>
                    <p className="text-slate-600">Contaminación: {cuerpo.contaminacion}</p>
                    <p className="text-slate-600">Biodiversidad: {cuerpo.biodiversidad}</p>
                    {cuerpo.descripcion && <p className="text-slate-500 mt-1">{cuerpo.descripcion}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

function DataView({ cuerpos }) {
  const stats = useMemo(() => {
    const total = cuerpos.length;
    const alta = cuerpos.filter((c) => c.biodiversidad?.toLowerCase() === 'alta').length;
    const contaminacionAlta = cuerpos.filter((c) => {
      const valor = c.contaminacion?.toLowerCase() || '';
      const rank = contaminationRank[valor] || 0;
      return rank >= contaminationRank.medio;
    }).length;
    return { total, alta, contaminacionAlta };
  }, [cuerpos]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total cuerpos de agua" value={stats.total} subtitle="Registros en la base" color="#2563eb" />
        <StatsCard title="Biodiversidad alta" value={stats.alta} subtitle="Ecosistemas saludables" color="#16a34a" />
        <StatsCard title="Contaminación media/alta" value={stats.contaminacionAlta} subtitle="Requieren atención" color="#dc2626" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Datos de monitoreo</h3>
          <span className="text-sm text-slate-500">{cuerpos.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Contaminación</th>
                <th className="px-4 py-3 text-left">Biodiversidad</th>
                <th className="px-4 py-3 text-left">Última actualización</th>
              </tr>
            </thead>
            <tbody>
              {cuerpos.map((cuerpo) => (
                <tr key={cuerpo.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{cuerpo.nombre}</td>
                  <td className="px-4 py-3 text-slate-700">{cuerpo.tipo}</td>
                  <td className="px-4 py-3 text-slate-700">{cuerpo.contaminacion}</td>
                  <td className="px-4 py-3 text-slate-700">{cuerpo.biodiversidad}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {cuerpo.fecha_actualizacion
                      ? new Date(cuerpo.fecha_actualizacion).toLocaleDateString()
                      : 'Sin datos'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, login, register, user, logout } = useAuth();
  const [cuerpos, setCuerpos] = useState([]);
  const [activeTab, setActiveTab] = useState('mapa');
  const [filtro, setFiltro] = useState('todos');
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [alerta, setAlerta] = useState('');

  const puedeCrear = isAuthenticated;

  const fetchCuerpos = async () => {
    const { data } = await api.get('/cuerpos-agua');
    setCuerpos(data);
  };

  useEffect(() => {
    fetchCuerpos().catch((err) => console.error('No se pudieron cargar los cuerpos de agua', err));
  }, []);

  const handleCreate = async (payload) => {
    try {
      await api.post('/cuerpos-agua', payload);
      await fetchCuerpos();
      setAlerta('Cuerpo de agua registrado exitosamente');
      setTimeout(() => setAlerta(''), 3000);
    } catch (error) {
      if (error?.response?.status === 401) {
        setAlerta('Debes iniciar sesión para registrar un cuerpo de agua');
        setLoginOpen(true);
        return;
      }
      setAlerta(error?.response?.data?.detail || 'No se pudo registrar el cuerpo de agua');
      setTimeout(() => setAlerta(''), 4000);
    }
  };

  const handleRegister = async (payload) => {
    const result = await register(payload);
    setRegisterOpen(false);
    setLoginOpen(true);
    setAlerta('Registro exitoso. Ahora puedes iniciar sesión.');
    setTimeout(() => setAlerta(''), 4000);
    return result;
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div>
            <p className="text-slate-700">Observatorio de Aguas</p>
            <h1 className="text-2xl font-semibold text-slate-900">Monitoreo y gestión</h1>
          </div>
          <div className="flex items-center space-x-3">
            {!isAuthenticated && (
              <>
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => setRegisterOpen(true)}
                >
                  Registrarse
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  onClick={() => setLoginOpen(true)}
                >
                  Iniciar sesión
                </button>
              </>
            )}
            {isAuthenticated && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-slate-800 font-semibold">{user?.full_name}</p>
                  <p className="text-xs text-slate-500">Rol: {user?.role || 'N/D'}</p>
                </div>
                <button
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <TabButton active={activeTab === 'mapa'} onClick={() => setActiveTab('mapa')} label="Mapa" />
            <TabButton active={activeTab === 'datos'} onClick={() => setActiveTab('datos')} label="Datos" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-2 rounded-full text-sm border ${
                filtro === 'todos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
              }`}
              onClick={() => setFiltro('todos')}
            >
              Todos
            </button>
            <button
              className={`px-3 py-2 rounded-full text-sm border ${
                filtro === 'río' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-700 border-slate-200'
              }`}
              onClick={() => setFiltro('río')}
            >
              Ríos
            </button>
            <button
              className={`px-3 py-2 rounded-full text-sm border ${
                filtro === 'lago' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-700 border-slate-200'
              }`}
              onClick={() => setFiltro('lago')}
            >
              Lagos
            </button>
            <button
              className={`px-3 py-2 rounded-full text-sm border ${
                filtro === 'océano' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-700 border-slate-200'
              }`}
              onClick={() => setFiltro('océano')}
            >
              Océanos
            </button>
          </div>
        </div>

        {puedeCrear && (
          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              onClick={() => setFormOpen(true)}
            >
              + Registrar cuerpo de agua
            </button>
          </div>
        )}
        {!isAuthenticated && (
          <p className="text-sm text-slate-600 text-right">Inicia sesión para registrar nuevos cuerpos de agua.</p>
        )}

        {alerta && <div className="rounded-xl bg-emerald-50 text-emerald-700 p-3 border border-emerald-100">{alerta}</div>}

        {activeTab === 'mapa' ? (
          <MapView cuerpos={cuerpos} filtro={filtro} />
        ) : (
          <DataView cuerpos={cuerpos} />
        )}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSubmit={login} />
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} onSubmit={handleRegister} />
      <WaterBodyFormModal open={formOpen && puedeCrear} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
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
