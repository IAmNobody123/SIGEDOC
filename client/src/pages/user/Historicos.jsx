
import { useState, useEffect } from 'react';
import { fetchUserDocumentHistory } from '../../conection/documents';
import './Tramites.css';

function Historicos({ idUsuario }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadHistorico = async () => {
      if (!idUsuario) return;
      setLoading(true);
      setError('');
      const res = await fetchUserDocumentHistory(idUsuario);
      if (res.success) {
        setHistorico(res.data);
      } else {
        setError(res.error || 'Error al cargar el histórico de documentos');
      }
      setLoading(false);
    };

    loadHistorico();
  }, [idUsuario]);

  const filteredHistorico = historico.filter((doc) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      doc.nombre?.toLowerCase().includes(term) ||
      doc.tipo_documento?.toLowerCase().includes(term) ||
      doc.estado_actual?.toLowerCase().includes(term) ||
      doc.creador_nombre?.toLowerCase().includes(term) ||
      doc.creador_apellido?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="tramites-container">
      <div className="tramites-header">
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por interesado"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ color: 'black' }}
          />
        </div>
      </div>

      {loading && <p className="tramites-info">Cargando histórico...</p>}
      {error && <p className="tramites-error">{error}</p>}

      <div className="tramites-grid">
        {!loading && filteredHistorico.length === 0 && (
          <p className="tramites-info">No se encontraron documentos en tu histórico.</p>
        )}

        {filteredHistorico.map((doc) => (
          <div key={doc.id_documento} className="tramite-card">
            <div className="tramite-card-body">
              <h3>{doc.nombre}</h3>
              <p>
                <strong>Tipo:</strong> {doc.tipo_documento || '-'}
              </p>
              <p>
                <strong>Estado:</strong> {doc.estado_actual || '-'}
              </p>
              <p>
                <strong>Creado por:</strong> {doc.creador_nombre} {doc.creador_apellido}
              </p>
              <p>
                <strong>Fecha:</strong>{' '}
                {doc.fecha_creacion ? new Date(doc.fecha_creacion).toLocaleDateString() : '-'}
              </p>
              <p>
                <strong>Unidad actual:</strong> {doc.unidad_actual_nombre || '-'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Historicos;
