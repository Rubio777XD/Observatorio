import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import './App.css'
import {
  createFavorite,
  createWaterBody,
  fetchAlerts,
  fetchFavorites,
  fetchParameters,
  fetchProtectedZones,
  fetchReadings,
  fetchReports,
  fetchSensors,
  fetchStats,
  fetchWaterBodies,
} from './api'
import { AuthProvider, useAuth } from './context/AuthContext'

const iconColors = {
  río: 'blue',
  lago: 'green',
  océano: 'indigo',
}

const buildIcon = (tipo) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<span style="background:${iconColors[tipo] || 'gray'};width:14px;height:14px;display:inline-block;border-radius:9999px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></span>`,
  })

const AuthControls = ({ onOpenForm }) => {
  const { user, logout } = useAuth()
  const puedeGestionar = ['admin', 'analista'].includes((user?.role || '').toLowerCase())

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm text-gray-700">
          <p className="font-semibold">{user.full_name}</p>
          <p className="text-gray-500">Rol: {user.role || 'sin rol'}</p>
        </div>
        {puedeGestionar && (
          <button className="btn-tab px-3 py-2 rounded-lg bg-blue-500 text-white shadow" onClick={onOpenForm}>
            + Añadir nuevo cuerpo de agua
          </button>
        )}
        <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    )
  }

  return null
}

const AuthPanel = () => {
  const { user, login, register, error, setError } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register({ email: form.email, password: form.password, full_name: form.full_name })
      }
      setError(null)
    } catch (err) {
      setError('No se pudo completar la acción. Verifica los datos.')
    }
  }

  if (user) return null

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-2">
          <button className={`btn-tab px-3 py-2 rounded-lg ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Iniciar sesión
          </button>
          <button className={`btn-tab px-3 py-2 rounded-lg ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Registrarse
          </button>
        </div>
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
      <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Nombre completo"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        )}
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Correo"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn-tab px-4 py-2 rounded-lg bg-blue-500 text-white" type="submit">
          {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}

const NewWaterBodyModal = ({ open, onClose, onCreate }) => {
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'río',
    latitud: '',
    longitud: '',
    contaminacion: 'Baja',
    biodiversidad: 'Alta',
    descripcion: '',
    temperatura: '',
    ph: '',
    oxigeno_disuelto: '',
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) {
      setForm({
        nombre: '',
        tipo: 'río',
        latitud: '',
        longitud: '',
        contaminacion: 'Baja',
        biodiversidad: 'Alta',
        descripcion: '',
        temperatura: '',
        ph: '',
        oxigeno_disuelto: '',
      })
      setError(null)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onCreate({
        ...form,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
        temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
        ph: form.ph ? parseFloat(form.ph) : null,
        oxigeno_disuelto: form.oxigeno_disuelto ? parseFloat(form.oxigeno_disuelto) : null,
      })
      onClose()
    } catch (err) {
      setError('No se pudo registrar el cuerpo de agua. Verifica los campos.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Registrar cuerpo de agua</h3>
          <button className="text-gray-500" onClick={onClose}>
            Cerrar
          </button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input className="border rounded-lg px-3 py-2" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <select className="border rounded-lg px-3 py-2" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            <option value="río">Río</option>
            <option value="lago">Lago</option>
            <option value="océano">Océano</option>
          </select>
          <input className="border rounded-lg px-3 py-2" placeholder="Latitud" type="number" step="0.0001" value={form.latitud} onChange={(e) => setForm({ ...form, latitud: e.target.value })} required />
          <input className="border rounded-lg px-3 py-2" placeholder="Longitud" type="number" step="0.0001" value={form.longitud} onChange={(e) => setForm({ ...form, longitud: e.target.value })} required />
          <select className="border rounded-lg px-3 py-2" value={form.contaminacion} onChange={(e) => setForm({ ...form, contaminacion: e.target.value })}>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={form.biodiversidad} onChange={(e) => setForm({ ...form, biodiversidad: e.target.value })}>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <input className="border rounded-lg px-3 py-2" placeholder="Temperatura" type="number" step="0.1" value={form.temperatura} onChange={(e) => setForm({ ...form, temperatura: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" placeholder="pH" type="number" step="0.1" value={form.ph} onChange={(e) => setForm({ ...form, ph: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" placeholder="Oxígeno disuelto" type="number" step="0.1" value={form.oxigeno_disuelto} onChange={(e) => setForm({ ...form, oxigeno_disuelto: e.target.value })} />
          <textarea className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <div className="md:col-span-2 flex justify-end space-x-3">
            <button type="button" className="px-4 py-2 bg-gray-100 rounded-lg" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const DataCards = ({ cuerpos }) => {
  const total = cuerpos.length
  const biodiversidadAlta = cuerpos.filter((c) => (c.biodiversidad || '').toLowerCase() === 'alta').length
  const contaminacionMediaAlta = cuerpos.filter((c) => ['media', 'alta'].includes((c.contaminacion || '').toLowerCase())).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="stats-card bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-800">Total Cuerpos de Agua</h3>
          <div className="bg-blue-500 p-2 rounded-lg text-white">🌊</div>
        </div>
        <p className="text-4xl font-bold text-blue-600 mt-4">{total}</p>
        <p className="text-sm text-blue-700 mt-2">Monitoreados activamente</p>
      </div>
      <div className="stats-card bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-800">Biodiversidad Alta</h3>
          <div className="bg-green-500 p-2 rounded-lg text-white">🌿</div>
        </div>
        <p className="text-4xl font-bold text-green-600 mt-4">{biodiversidadAlta}</p>
        <p className="text-sm text-green-700 mt-2">Cuerpos de agua saludables</p>
      </div>
      <div className="stats-card bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-800">Contaminación Media/Alta</h3>
          <div className="bg-red-500 p-2 rounded-lg text-white">⚠️</div>
        </div>
        <p className="text-4xl font-bold text-red-600 mt-4">{contaminacionMediaAlta}</p>
        <p className="text-sm text-red-700 mt-2">Requieren atención</p>
      </div>
    </div>
  )
}

const MapaInteractivo = ({ cuerpos }) => {
  const [filtro, setFiltro] = useState('todos')
  const cuerposFiltrados = cuerpos.filter((c) => filtro === 'todos' || c.tipo.toLowerCase() === filtro)
  const contador = cuerposFiltrados.length

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mapa Interactivo</h2>
        <div className="flex items-center text-sm text-gray-500">
          <span id="contador-cuerpos">{contador} cuerpos de agua monitoreados</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Todos', value: 'todos' },
            { label: 'Ríos', value: 'río' },
            { label: 'Lagos', value: 'lago' },
            { label: 'Océanos', value: 'océano' },
          ].map((btn) => (
            <button
              key={btn.value}
              className={`filter-btn px-3 py-1.5 rounded-full border text-sm transition-all ${filtro === btn.value ? 'active border-blue-500 text-blue-500' : 'border-blue-500 text-blue-500'}`}
              data-tipo={btn.value}
              onClick={() => setFiltro(btn.value)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[600px] w-full rounded-lg overflow-hidden relative">
        <MapContainer center={[0, -60]} zoom={4} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {cuerposFiltrados.map((cuerpo) => (
            <Marker key={cuerpo.id} position={[cuerpo.latitud, cuerpo.longitud]} icon={buildIcon(cuerpo.tipo.toLowerCase())}>
              <Popup>
                <div className="marker-popup">
                  <h3>{cuerpo.nombre}</h3>
                  <p>Tipo: {cuerpo.tipo}</p>
                  <p>Contaminación: {cuerpo.contaminacion}</p>
                  <p>Biodiversidad: {cuerpo.biodiversidad}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

const TablasRelacionadas = ({ sensores, parametros, lecturas, alertas, zonas, reportes, favoritos }) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Sensores activos</h3>
      <p className="text-sm text-gray-500 mb-2">Tabla: sensores</p>
      <ul className="list-disc pl-5 text-gray-700 space-y-1">
        {sensores.map((s) => (
          <li key={s.id}>{s.nombre} · {s.tipo} · Cuerpo #{s.cuerpo_agua_id}</li>
        ))}
        {sensores.length === 0 && <li className="text-gray-400">Sin sensores registrados</li>}
      </ul>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Parámetros ambientales</h3>
      <p className="text-sm text-gray-500 mb-2">Tabla: parametros_ambientales</p>
      <ul className="list-disc pl-5 text-gray-700 space-y-1">
        {parametros.map((p) => (
          <li key={p.id}>{p.nombre} ({p.unidad})</li>
        ))}
        {parametros.length === 0 && <li className="text-gray-400">Sin parámetros definidos</li>}
      </ul>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Lecturas recientes</h3>
      <p className="text-sm text-gray-500 mb-2">Tabla: lecturas_sensores</p>
      <ul className="list-disc pl-5 text-gray-700 space-y-1">
        {lecturas.map((l) => (
          <li key={l.id}>Sensor #{l.sensor_id} · Valor {l.valor} {l.unidad} · Cuerpo #{l.cuerpo_agua_id}</li>
        ))}
        {lecturas.length === 0 && <li className="text-gray-400">Sin lecturas registradas</li>}
      </ul>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Alertas</h3>
      <p className="text-sm text-gray-500 mb-2">Tabla: alertas</p>
      <ul className="list-disc pl-5 text-gray-700 space-y-1">
        {alertas.map((a) => (
          <li key={a.id}>Cuerpo #{a.cuerpo_agua_id} · Nivel {a.nivel} · {a.mensaje}</li>
        ))}
        {alertas.length === 0 && <li className="text-gray-400">Sin alertas activas</li>}
      </ul>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Zonas protegidas</h3>
      <p className="text-sm text-gray-500 mb-2">Tabla: zonas_protegidas</p>
      <ul className="list-disc pl-5 text-gray-700 space-y-1">
        {zonas.map((z) => (
          <li key={z.id}>{z.nombre} · {z.categoria || 'General'} · Cuerpo #{z.cuerpo_agua_id}</li>
        ))}
        {zonas.length === 0 && <li className="text-gray-400">Sin zonas definidas</li>}
      </ul>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Reportes generados</h3>
      <p className="text-sm text-gray-500 mb-2">Tabla: reportes</p>
      <ul className="list-disc pl-5 text-gray-700 space-y-1">
        {reportes.map((r) => (
          <li key={r.id}>{r.titulo} · Cuerpo #{r.cuerpo_agua_id}</li>
        ))}
        {reportes.length === 0 && <li className="text-gray-400">Sin reportes aún</li>}
      </ul>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-2">Favoritos</h3>
      <p className="text-sm text-gray-500 mb-2">Tabla: user_favorites</p>
      <ul className="list-disc pl-5 text-gray-700 space-y-1">
        {favoritos.map((f) => (
          <li key={f.id}>Cuerpo #{f.cuerpo_agua_id} agregado el {new Date(f.creado_en).toLocaleDateString()}</li>
        ))}
        {favoritos.length === 0 && <li className="text-gray-400">Agrega cuerpos a favoritos</li>}
      </ul>
    </div>
  </div>
)

const TablaCuerpos = ({ cuerpos, onFavorite, puedeCrear }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h3 className="text-xl font-semibold mb-2">Datos de Monitoreo</h3>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Contaminación</th>
          <th>Biodiversidad</th>
          <th>Última actualización</th>
          {puedeCrear && <th>Favorito</th>}
        </tr>
      </thead>
      <tbody>
        {cuerpos.map((cuerpo) => (
          <tr key={cuerpo.id}>
            <td>{cuerpo.nombre}</td>
            <td className="capitalize">{cuerpo.tipo}</td>
            <td>{cuerpo.contaminacion}</td>
            <td>{cuerpo.biodiversidad}</td>
            <td>{new Date(cuerpo.fecha_actualizacion).toLocaleString()}</td>
            {puedeCrear && (
              <td>
                <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg" onClick={() => onFavorite(cuerpo.id)}>
                  Marcar favorito
                </button>
              </td>
            )}
          </tr>
        ))}
        {cuerpos.length === 0 && (
          <tr>
            <td className="text-center text-gray-400" colSpan={puedeCrear ? 6 : 5}>
              No hay cuerpos de agua registrados
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

const AppContent = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('mapa')
  const [cuerpos, setCuerpos] = useState([])
  const [sensores, setSensores] = useState([])
  const [parametros, setParametros] = useState([])
  const [lecturas, setLecturas] = useState([])
  const [alertas, setAlertas] = useState([])
  const [zonas, setZonas] = useState([])
  const [reportes, setReportes] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [stats, setStats] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')

  const puedeGestionar = useMemo(() => ['admin', 'analista'].includes((user?.role || '').toLowerCase()), [user])

  const loadData = async () => {
    try {
      const [{ data: cuerposData }, { data: sensoresData }, { data: parametrosData }, { data: lecturasData }, { data: alertasData }, { data: zonasData }, { data: reportesData }, statsResp] =
        await Promise.all([
          fetchWaterBodies(),
          fetchSensors(),
          fetchParameters(),
          fetchReadings(),
          fetchAlerts(),
          fetchProtectedZones(),
          fetchReports(),
          fetchStats(),
        ])
      setCuerpos(cuerposData)
      setSensores(sensoresData)
      setParametros(parametrosData)
      setLecturas(lecturasData)
      setAlertas(alertasData)
      setZonas(zonasData)
      setReportes(reportesData)
      setStats(statsResp.data)
      if (user) {
        try {
          const favResp = await fetchFavorites()
          setFavoritos(favResp.data)
        } catch (err) {
          setFavoritos([])
        }
      } else {
        setFavoritos([])
      }
    } catch (err) {
      setMessage('No se pudo cargar toda la información desde la API. Revisa el backend.')
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleCreate = async (payload) => {
    await createWaterBody(payload)
    await loadData()
    setMessage('Cuerpo de agua registrado correctamente y visible en el mapa y la tabla.')
  }

  const handleFavorite = async (id) => {
    try {
      await createFavorite({ cuerpo_agua_id: id })
      const favResp = await fetchFavorites()
      setFavoritos(favResp.data)
      setMessage('Cuerpo de agua marcado como favorito.')
    } catch (err) {
      setMessage('No se pudo agregar a favoritos.')
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-white shadow-lg rounded-xl mx-4 mt-4 mb-8 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-800">Observatorio de Aguas</h1>
            </div>
            <div className="flex items-center space-x-2">
              {['mapa', 'datos'].map((key) => (
                <button key={key} className={`btn-tab px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${tab === key ? 'active shadow-md' : ''}`} onClick={() => setTab(key)}>
                  <span className="capitalize">{key}</span>
                </button>
              ))}
            </div>
            <AuthControls onOpenForm={() => setShowModal(true)} />
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 pb-10">
        <AuthPanel />
        {message && <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 mb-4">{message}</div>}
        {tab === 'mapa' && <MapaInteractivo cuerpos={cuerpos} />}
        {tab === 'datos' && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Datos de Monitoreo</h2>
                <p className="text-gray-500">Los indicadores se calculan con la tabla cuerpos_agua</p>
              </div>
              {puedeGestionar && (
                <button className="btn-tab px-4 py-2 rounded-lg bg-blue-500 text-white" onClick={() => setShowModal(true)}>
                  + Añadir nuevo cuerpo de agua
                </button>
              )}
            </div>
            <DataCards cuerpos={cuerpos} />
            <TablaCuerpos cuerpos={cuerpos} onFavorite={handleFavorite} puedeCrear={Boolean(user)} />
            <TablasRelacionadas sensores={sensores} parametros={parametros} lecturas={lecturas} alertas={alertas} zonas={zonas} reportes={reportes} favoritos={favoritos} />
            {stats && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-2">Estadísticas rápidas</h3>
                <p className="text-sm text-gray-500">Tablas consultadas: sensores, alertas, parametros_ambientales</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">Sensores: {stats.total_sensores}</div>
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">Alertas: {stats.total_alertas}</div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">Parámetros: {stats.total_parametros}</div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">Cuerpos: {stats.total_cuerpos_agua}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <NewWaterBodyModal open={showModal && puedeGestionar} onClose={() => setShowModal(false)} onCreate={handleCreate} />
    </div>
  )
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)

export default App
