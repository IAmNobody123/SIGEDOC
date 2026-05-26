import { useState, useEffect, useCallback } from "react";
import {
  fetchDocumentosPendientesAceptacion,
  fetchDocumentMovements,
  aceptarDocumento,
} from "../../conection/documents";
import "./DocumentosPendientesAceptacion.css";

function DocumentosPendientesAceptacion({ idUnidad }) {
  const [documentos, setDocumentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadDocumentos = useCallback(async () => {
    if (!idUnidad) return;

    setLoading(true);
    setError("");
    const res = await fetchDocumentosPendientesAceptacion(idUnidad);
    if (res.success) {
      setDocumentos(res.data);
    } else {
      setError(res.error || "Error al cargar documentos pendientes de aceptación");
    }
    setLoading(false);
  }, [idUnidad]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadDocumentos();
    }, 0);
    return () => clearTimeout(t);
  }, [loadDocumentos]);

  const handleViewDetails = async (documento) => {
    setSelectedDocumento(documento);
    setDetailsOpen(true);
    setLoadingMovements(true);
    setActionError("");
    setActionMessage("");

    const res = await fetchDocumentMovements(documento.id_documento);
    if (res.success) {
      setMovements(res.data);
    } else {
      setMovements([]);
      setActionError(res.error || "No se pudieron cargar los movimientos");
    }
    setLoadingMovements(false);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedDocumento(null);
    setMovements([]);
    setActionError("");
    setActionMessage("");
  };

  const handleAceptar = async () => {
    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    const res = await aceptarDocumento(selectedDocumento.id_documento);

    setActionLoading(false);
    if (res.success) {
      setActionMessage("Documento aceptado correctamente. Ya puedes interactuar con él.");
      setDetailsOpen(false);
      loadDocumentos();
    } else {
      setActionError(res.error || "Error al aceptar el documento");
    }
  };

  const filteredDocumentos = documentos.filter((doc) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      doc.nombre?.toLowerCase().includes(term) ||
      doc.tipo_documento?.toLowerCase().includes(term) ||
      doc.creador_nombre?.toLowerCase().includes(term) ||
      doc.creador_apellido?.toLowerCase().includes(term) ||
      doc.unidad_origen_nombre?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="documentos-aceptacion-container">
        <div className="loading">Cargando documentos pendientes de aceptación...</div>
      </div>
    );
  }

  return (
    <div className="documentos-aceptacion-container">
      <div className="documentos-aceptacion-header">
        <h2>📋 Documentos pendientes de aceptación</h2>
        <p className="subtitle">
          {filteredDocumentos.length > 0
            ? `${filteredDocumentos.length} documento(s) requiere(n) tu aceptación`
            : "No hay documentos pendientes de aceptación"}
        </p>
        {filteredDocumentos.length > 0 && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre, tipo, creador u origen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="documentos-aceptacion-error">
          <p>{error}</p>
        </div>
      )}
      {actionMessage && (
        <div className="documentos-aceptacion-success">
          <p>{actionMessage}</p>
        </div>
      )}

      <div className="documentos-aceptacion-grid">
        {filteredDocumentos.length === 0 && !loading && (
          <div className="empty-state">
            <p>✓ Todos los documentos han sido aceptados</p>
          </div>
        )}
        {filteredDocumentos.map((doc) => (
          <div key={doc.id_documento} className="documento-aceptacion-card">
            <div className="card-status">
              <span className="status-badge">Pendiente de aceptación</span>
            </div>
            <div className="documento-aceptacion-card-body">
              <h3>{doc.nombre}</h3>
              <div className="document-info">
                <p>
                  <strong>Tipo:</strong> {doc.tipo_documento || "-"}
                </p>
                <p>
                  <strong>Origen:</strong> {doc.unidad_origen_nombre || "Externo"}
                </p>
                <p>
                  <strong>Remitido por:</strong> {doc.creador_nombre} {doc.creador_apellido}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(doc.fecha_creacion).toLocaleDateString("es-ES")}
                </p>
                {doc.descripcion_origen_externo && (
                  <p>
                    <strong>Descripción:</strong> {doc.descripcion_origen_externo}
                  </p>
                )}
              </div>
            </div>
            <div className="documento-aceptacion-card-footer">
              <button
                className="btn-ver-detalles"
                onClick={() => handleViewDetails(doc)}
              >
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {detailsOpen && selectedDocumento && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeDetails}>
              ×
            </button>
            <h2>Detalle del documento</h2>

            <div className="detail-section">
              <h3>Información general</h3>
              <p>
                <strong>ID:</strong> {selectedDocumento.id_documento}
              </p>
              <p>
                <strong>Nombre:</strong> {selectedDocumento.nombre}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedDocumento.tipo_documento || "-"}
              </p>
              <p>
                <strong>Origen:</strong> {selectedDocumento.unidad_origen_nombre || "Externo"}
              </p>
              <p>
                <strong>Remitido por:</strong> {selectedDocumento.creador_nombre}{" "}
                {selectedDocumento.creador_apellido}
              </p>
              <p>
                <strong>Fecha de creación:</strong>{" "}
                {new Date(selectedDocumento.fecha_creacion).toLocaleDateString(
                  "es-ES"
                )}
              </p>
              {selectedDocumento.descripcion_origen_externo && (
                <p>
                  <strong>Descripción:</strong>{" "}
                  {selectedDocumento.descripcion_origen_externo}
                </p>
              )}
            </div>

            <div className="detail-section">
              <h3>Historial de movimientos</h3>
              {loadingMovements ? (
                <p>Cargando movimientos...</p>
              ) : movements.length === 0 ? (
                <p>No hay movimientos registrados</p>
              ) : (
                <div className="movements-list">
                  {movements.map((mov) => (
                    <div key={mov.id_movimiento} className="movement-item">
                      <p>
                        <strong>Movimiento:</strong> {mov.id_movimiento}
                      </p>
                      <p>
                        <strong>De:</strong> {mov.unidad_origen_nombre || "-"} → <strong>Hacia:</strong>{" "}
                        {mov.unidad_destino_nombre || "-"}
                      </p>
                      <p>
                        <strong>Estado:</strong> {mov.estado}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(mov.fecha_movimiento).toLocaleString("es-ES")}
                      </p>
                      {mov.observaciones && (
                        <p>
                          <strong>Observaciones:</strong> {mov.observaciones}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {actionError && (
              <div className="action-error">
                <p>{actionError}</p>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-aceptar"
                onClick={handleAceptar}
                disabled={actionLoading}
              >
                {actionLoading ? "Aceptando..." : "✓ Aceptar documento"}
              </button>
              <button className="btn-cancelar" onClick={closeDetails}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentosPendientesAceptacion;
