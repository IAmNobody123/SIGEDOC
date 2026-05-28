
import { useState, useEffect } from 'react';
import { fetchUserDocumentHistory, fetchDocumentMovements } from '../../conection/documents';
import Toast from '../components/Toast';
import './Tramites.css';

function Historicos({ idUsuario }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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

  const handleViewDetails = (documento) => {
    setSelectedDocumento(documento);
    setDetailsOpen(true);
  };

  const handleViewHistory = async (documento) => {
    setSelectedDocumento(documento);
    setHistoryOpen(true);
    setLoadingMovements(true);

    const res = await fetchDocumentMovements(documento.id_documento);
    if (res.success) {
      setMovements(res.data);
    } else {
      setMovements([]);
      Toast.error('Error al cargar historial', res.error || 'No se pudieron cargar los movimientos');
    }
    setLoadingMovements(false);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedDocumento(null);
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedDocumento(null);
    setMovements([]);
    setLoadingMovements(false);
  };

  const filteredHistorico = historico.filter((doc) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      doc.nombre?.toLowerCase().includes(term) ||
      doc.interesado?.toLowerCase().includes(term) ||
      doc.tipo_documento?.toLowerCase().includes(term) ||
      doc.estado_actual?.toLowerCase().includes(term) ||
      doc.creador_nombre?.toLowerCase().includes(term) ||
      doc.creador_apellido?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredHistorico.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocumentos = filteredHistorico.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="tramites-container">
      <div className="tramites-header">
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por interesado"
            value={searchTerm}
            onChange={handleSearchChange}
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

        {paginatedDocumentos.map((doc) => (
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
                <strong>Interesado:</strong> {doc.interesado || '-'}
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
            <div className="tramite-card-footer">
              <button
                className="details-btn"
                onClick={() => handleViewDetails(doc)}
              >
                Detalles
              </button>
              <button
                className="history-btn"
                onClick={() => handleViewHistory(doc)}
              >
                Historial
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls" style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '20px' }}>
          <button
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              marginRight: '10px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ← Anterior
          </button>
          <span style={{ margin: '0 15px', fontWeight: 'bold' }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              marginLeft: '10px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Siguiente →
          </button>
        </div>
      )}

      {detailsOpen && selectedDocumento && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeDetails}>
              ×
            </button>
            <h2>Detalle del documento</h2>
            <div className="detail-section">
              <p>
                <strong>ID:</strong> {selectedDocumento.id_documento}
              </p>
              <p>
                <strong>Nombre:</strong> {selectedDocumento.nombre}
              </p>
              <p>
                <strong>Interesado:</strong> {selectedDocumento.interesado || '-'}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedDocumento.tipo_documento || '-'}
              </p>
              <p>
                <strong>Estado actual:</strong> {selectedDocumento.estado_actual}
              </p>
              <p>
                <strong>Unidad actual:</strong> {selectedDocumento.unidad_actual_nombre}
              </p>
              {selectedDocumento.externo && (
                <p>
                  <strong>Origen externo:</strong> {selectedDocumento.descripcion_origen_externo}
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={closeDetails}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {historyOpen && selectedDocumento && (
        <div className="modal-overlay2" onClick={closeHistory}>
          <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal2" onClick={closeHistory}>
              ×
            </button>
            <h2>Historial de movimientos - {selectedDocumento.nombre}</h2>
            {loadingMovements ? (
              <p>Cargando historial...</p>
            ) : movements.length > 0 ? (
              <div className="movements-table-container">
                <table className="movements-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>De</th>
                      <th>A</th>
                      <th>Enviado por</th>
                      <th>Recibido por</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((mov) => (
                      <tr key={mov.id_movimiento}>
                        <td>{new Date(mov.fecha_movimiento).toLocaleString()}</td>
                        <td>{mov.estado}</td>
                        <td>{mov.unidad_origen_nombre}</td>
                        <td>{mov.unidad_destino_nombre}</td>
                        <td>{mov.enviado_por_nombre} {mov.enviado_por_apellido}</td>
                        <td>{mov.recibido_por_nombre ? `${mov.recibido_por_nombre} ${mov.recibido_por_apellido}` : '-'}</td>
                        <td>{mov.observaciones || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay movimientos registrados para este documento.</p>
            )}
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={closeHistory}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Historicos;
