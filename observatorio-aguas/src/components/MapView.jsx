import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const getColorByType = (tipo) => {
  const lower = (tipo || '').toLowerCase();
  if (lower.includes('río') || lower.includes('rio')) return '#3b82f6';
  if (lower.includes('lago')) return '#16a34a';
  if (lower.includes('océano') || lower.includes('oceano')) return '#6366f1';
  return '#6b7280';
};

export default function MapView({ cuerpos, filtro }) {
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => {
    if (filtro === 'todos') return cuerpos;
    return cuerpos.filter((c) => c.tipo.toLowerCase().includes(filtro));
  }, [cuerpos, filtro]);

  return (
    <div className="w-full">
      <div className="h-[520px] rounded-xl overflow-hidden relative">
        <MapContainer center={[-15, -60]} zoom={3} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((cuerpo) => {
            const color = getColorByType(cuerpo.tipo);
            const icon = L.divIcon({
              html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white"></div>`,
              className: 'custom-marker',
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            });
            return (
              <Marker
                key={cuerpo.id}
                position={[cuerpo.latitud, cuerpo.longitud]}
                icon={icon}
                eventHandlers={{ click: () => setSelected(cuerpo) }}
              >
                <Popup>
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-800">{cuerpo.nombre}</h3>
                    <p className="text-sm"><strong>Tipo:</strong> {cuerpo.tipo}</p>
                    <p className="text-sm"><strong>Contaminación:</strong> {cuerpo.contaminacion}</p>
                    <p className="text-sm"><strong>Biodiversidad:</strong> {cuerpo.biodiversidad}</p>
                    {cuerpo.descripcion && <p className="text-sm text-gray-600">{cuerpo.descripcion}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      {selected && (
        <div className="mt-4 bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{selected.nombre}</h3>
              <p className="text-sm text-gray-500">{selected.tipo} · {selected.contaminacion} · Biodiversidad {selected.biodiversidad}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">Cerrar</button>
          </div>
          {selected.descripcion && <p className="mt-2 text-gray-700 text-sm">{selected.descripcion}</p>}
        </div>
      )}
    </div>
  );
}
