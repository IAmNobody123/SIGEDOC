import { useState, useEffect } from "react";
import { fetchUserDocumentHistory, fetchDocumentMovements } from "../../conection/documents";
import "./BandejaMovimientos.css";

function BandejaMovimientos({ idUsuario }) {
  const [documentos, setDocumentos] = useState([]);
  const [filteredDocumentos, setFilteredDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  useEffect(() => {
    if (!idUsuario) return;

    const fetchHistorial = async () => {
      setLoading(true);
      setError("");
      const res = await fetchUserDocumentHistory(idUsuario);

      if (res.success) {
        setDocumentos(res.data);
      } else {
        setError(res.error || "Error al cargar el historial de documentos");
        setDocumentos([]);
      }
      setLoading(false);
    };

    fetchHistorial();
  }, [idUsuario]);

  useEffect(() => {
    let result = documentos;

    if (filtroEstado === "Activos") {
      result = result.filter(doc => doc.estado_actual?.toLowerCase() !== 'finalizado');
    } else if (filtroEstado === "Finalizados") {
      result = result.filter(doc => doc.estado_actual?.toLowerCase() === 'finalizado');
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((doc) =>
        doc.nombre?.toLowerCase().includes(term) ||
        doc.tipo_documento?.toLowerCase().includes(term) ||
        doc.unidad_actual_nombre?.toLowerCase().includes(term)
      );
    }

    setFilteredDocumentos(result);
  }, [documentos, filtroEstado, searchTerm]);

  const handleViewDetails = async (documento) => {
    setSelectedDocumento(documento);
    setDetailsOpen(true);
    setLoadingMovements(true);

    const res = await fetchDocumentMovements(documento.id_documento);
    if (res.success) {
      setMovements(res.data);
    } else {
      setMovements([]);
    }
    setLoadingMovements(false);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedDocumento(null);
    setMovements([]);
  };

  return (
    <div className="tramites-container">
      <div className="tramites-header">
        <h2>Historial de Documentos</h2>
        <div className="search-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por interesado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ flex: 1 }}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #000' }}
          >
            <option value="Todos">Todos</option>
            <option value="Activos">Activos</option>
            <option value="Finalizados">Finalizados</option>
          </select>
        </div>
      </div>

      {loading && <p className="tramites-info">Cargando historial...</p>}
      {error && <p className="tramites-error">{error}</p>}

      <div className="tramites-grid">
        {!loading && filteredDocumentos.length === 0 && (
          <p className="tramites-info">
            No se encontraron documentos.
          </p>
        )}

        {filteredDocumentos.map((doc) => (
          <div key={doc.id_documento} className="tramite-card">
            <div className="tramite-card-body">
              <h3>{doc.nombre}</h3>
              <p>
                <strong>Tipo:</strong> {doc.tipo_documento || "-"}
              </p>
              <p>
                <strong>Estado:</strong> {doc.estado_actual || "-"}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {doc.fecha_creacion
                  ? new Date(doc.fecha_creacion).toLocaleDateString()
                  : "-"}
              </p>
              <p>
                <strong>Unidad actual:</strong>{" "}
                {doc.unidad_actual_nombre || "-"}
              </p>
            </div>
            <div className="tramite-card-footer">
              <button
                className="tramite-btn"
                onClick={() => handleViewDetails(doc)}
              >
                Ver historial de movimientos
              </button>
            </div>
          </div>
        ))}
      </div>

      {detailsOpen && selectedDocumento && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px' }}
          >
            <button className="close-modal" onClick={closeDetails}>
              ×
            </button>
            <h2>Detalle del documento</h2>
            <div className="detail-section">
              <p><strong>ID:</strong> {selectedDocumento.id_documento}</p>
              <p><strong>Nombre:</strong> {selectedDocumento.nombre}</p>
              <p><strong>Tipo:</strong> {selectedDocumento.tipo_documento || "-"}</p>
              <p><strong>Estado actual:</strong> {selectedDocumento.estado_actual}</p>
              <p><strong>Unidad actual:</strong> {selectedDocumento.unidad_actual_nombre}</p>
              {selectedDocumento.externo && (
                <p>
                  <strong>Origen externo:</strong>{" "}
                  {selectedDocumento.descripcion_origen_externo}
                </p>
              )}
            </div>

            <h3>Historial de movimientos</h3>
            {loadingMovements ? (
              <p>Cargando historial...</p>
            ) : movements.length > 0 ? (
              <div className="movements-table-container">
                <table className="movements-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Acción</th>
                      <th>Unidad origen</th>
                      <th>Unidad destino</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((mov, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(mov.fecha_movimiento).toLocaleString()}
                        </td>
                        <td>{mov.estado || mov.accion || "-"}</td>
                        <td>{mov.unidad_origen_nombre || "-"}</td>
                        <td>{mov.unidad_destino_nombre || "-"}</td>
                        <td>{mov.observaciones || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay movimientos disponibles.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BandejaMovimientos;
