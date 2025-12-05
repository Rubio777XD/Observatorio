import React, { useMemo } from 'react';

const contaminationScore = (nivel) => {
  const value = (nivel || '').toLowerCase();
  if (value.includes('alto')) return 3;
  if (value.includes('medio')) return 2;
  return 1;
};

export default function DataPanel({ cuerpos }) {
  const stats = useMemo(() => {
    const total = cuerpos.length;
    const biodiversidadAlta = cuerpos.filter((c) => (c.biodiversidad || '').toLowerCase().includes('alta')).length;
    const contaminacionMediaAlta = cuerpos.filter((c) => contaminationScore(c.contaminacion) >= 2).length;
    return { total, biodiversidadAlta, contaminacionMediaAlta };
  }, [cuerpos]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Datos de Monitoreo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Cuerpos de Agua"
          value={stats.total}
          description="Registros almacenados"
          color="blue"
        />
        <StatCard
          title="Biodiversidad Alta"
          value={stats.biodiversidadAlta}
          description="Ecosistemas saludables"
          color="green"
        />
        <StatCard
          title="Contaminación Media/Alta"
          value={stats.contaminacionMediaAlta}
          description="Requieren atención"
          color="red"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">Tipo</th>
              <th className="py-3 px-4 text-left">Contaminación</th>
              <th className="py-3 px-4 text-left">Biodiversidad</th>
              <th className="py-3 px-4 text-left">Última actualización</th>
            </tr>
          </thead>
          <tbody>
            {cuerpos.map((cuerpo) => (
              <tr key={cuerpo.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{cuerpo.nombre}</td>
                <td className="py-3 px-4">{cuerpo.tipo}</td>
                <td className="py-3 px-4">{cuerpo.contaminacion}</td>
                <td className="py-3 px-4">{cuerpo.biodiversidad}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {cuerpo.fecha_actualizacion ? new Date(cuerpo.fecha_actualizacion).toLocaleDateString() : 'N/D'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, color }) {
  const colorMap = {
    blue: 'from-blue-50 to-blue-100 text-blue-800',
    green: 'from-green-50 to-green-100 text-green-800',
    red: 'from-red-50 to-red-100 text-red-800',
  };
  const accent = color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} p-6 rounded-xl shadow stats-card`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className={`${accent} p-2 rounded-lg text-white font-bold`}>{value}</div>
      </div>
      <p className="text-sm mt-2 text-gray-700">{description}</p>
    </div>
  );
}
