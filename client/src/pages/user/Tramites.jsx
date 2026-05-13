import { useState, useEffect } from "react";
import {
  fetchPendingDocumentsByUnidad,
  fetchDocumentMovements,
  designarDocument,
  finalizarDocument,
} from "../../conection/documents";
import { fetchUnidades } from "../../conection/user";
import "./Tramites.css";

function Tramites({ idUnidad }) {
  const [tramites, setTramites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidadDestino, setSelectedUnidadDestino] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadTramites = async () => {
    setLoading(true);
    setError("");
    const res = await fetchPendingDocumentsByUnidad(idUnidad);
    if (res.success) {
      setTramites(res.data);
    } else {
      setError(res.error || "Error al cargar los trámites pendientes");
    }
    setLoading(false);
  };

//   const loadUnidades = async () => {
//     const res = await fetchUnidades();
//     if (res.success) {
//       setUnidades(res.data);
//     }
//   };

useEffect(() => {
  if (!idUnidad) return;

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tramitesRes, unidadesRes] = await Promise.all([
        fetchPendingDocumentsByUnidad(idUnidad),
        fetchUnidades(),
      ]);

      if (tramitesRes.success) {
        setTramites(tramitesRes.data);
      } else {
        setError(
          tramitesRes.error ||
            "Error al cargar los trámites pendientes"
        );
      }

      if (unidadesRes.success) {
        setUnidades(unidadesRes.data);
      }
    } catch (err) {
      setError("Error al cargar los datos", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [idUnidad]);

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
    setAssignOpen(false);
    setSelectedUnidadDestino("");
    setActionError("");
    setActionMessage("");
  };

  const openAssign = () => {
    setActionError("");
    setActionMessage("");
    setSelectedUnidadDestino("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedUnidadDestino) {
      setActionError("Seleccione la unidad de destino");
      return;
    }
    setActionLoading(true);
    setActionError("");

    const res = await designarDocument(
      selectedDocumento.id_documento,
      selectedUnidadDestino,
      "Designado desde trámites"
    );

    setActionLoading(false);
    if (res.success) {
      setActionMessage("Trámite designado correctamente.");
      setAssignOpen(false);
      setDetailsOpen(false);
      loadTramites();
    } else {
      setActionError(res.error || "Error al designar el trámite");
    }
  };

  const handleFinalize = async () => {
    setActionLoading(true);
    setActionError("");

    const res = await finalizarDocument(
      selectedDocumento.id_documento,
      "Finalizado desde trámites"
    );

    setActionLoading(false);
    if (res.success) {
      setActionMessage("Trámite finalizado correctamente.");
      setDetailsOpen(false);
      loadTramites();
    } else {
      setActionError(res.error || "Error al finalizar el trámite");
    }
  };

  const filteredTramites = tramites.filter((doc) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      doc.nombre?.toLowerCase().includes(term) ||
      doc.tipo_documento?.toLowerCase().includes(term) ||
      doc.creador_nombre?.toLowerCase().includes(term) ||
      doc.creador_apellido?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="tramites-container">
      <div className="tramites-header">
        <h2>Trámites pendientes</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar trámites por nombre, tipo o creador"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading && <p className="tramites-info">Cargando trámites...</p>}
      {error && <p className="tramites-error">{error}</p>}
      {actionMessage && <p className="tramites-success">{actionMessage}</p>}

      <div className="tramites-grid">
        {filteredTramites.length === 0 && !loading && (
          <p className="tramites-info">No hay trámites pendientes para esta unidad.</p>
        )}
        {filteredTramites.map((doc) => (
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
                <strong>Creado por:</strong> {doc.creador_nombre} {doc.creador_apellido}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(doc.fecha_creacion).toLocaleDateString()}
              </p>
              <p>
                <strong>Unidad actual:</strong> {doc.unidad_actual_nombre || "-"}
              </p>
            </div>
            <div className="tramite-card-footer">
              <button
                className="tramite-btn"
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
            <h2>Detalle del trámite</h2>
            <div className="detail-section">
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

            <h3>Historial de movimientos</h3>
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

            {actionError && <p className="tramites-error">{actionError}</p>}

            <div className="detail-actions">
              <button className="secondary-btn" onClick={openAssign}>
                Designar
              </button>
              <button
                className="primary-btn"
                onClick={handleFinalize}
                disabled={actionLoading}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {assignOpen && (
        <div className="modal-overlay" onClick={() => setAssignOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setAssignOpen(false)}>
              ×
            </button>
            <h2>Designar trámite</h2>
            <div className="assign-section">
              <label htmlFor="unidadDestino">Seleccionar unidad destino</label>
              <select
                id="unidadDestino"
                value={selectedUnidadDestino}
                onChange={(e) => setSelectedUnidadDestino(e.target.value)}
              >
                <option value="">Seleccione una unidad</option>
                {unidades
                  .filter((unidad) => unidad.id_unidad !== idUnidad)
                  .map((unidad) => (
                    <option key={unidad.id_unidad} value={unidad.id_unidad}>
                      {unidad.nombre}
                    </option>
                  ))}
              </select>
              <button
                className="primary-btn"
                onClick={handleAssign}
                disabled={actionLoading}
              >
                Enviar tramo
              </button>
            </div>
            {actionError && <p className="tramites-error">{actionError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tramites;

