import { useState, useEffect } from "react";
import {
  fetchPendingDocumentsByUnidad,
  fetchDocumentMovements,
  designarDocument,
  finalizarDocument,
} from "../../conection/documents";
import { fetchUnidades } from "../../conection/user";
import Toast from "../components/Toast";
import "./Tramites.css";

function Tramites({ idUsuario, idUnidad }) {
  const [tramites, setTramites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidadDestino, setSelectedUnidadDestino] = useState("");
  const [unidadFilter, setUnidadFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [observacionesAssign, setObservacionesAssign] = useState("");

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
      Toast.error("Error al cargar historial", res.error || "No se pudieron cargar los movimientos");
    }
    setLoadingMovements(false);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedDocumento(null);
    setAssignOpen(false);
    setSelectedUnidadDestino("");
    setObservacionesAssign("");
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedDocumento(null);
    setMovements([]);
    setLoadingMovements(false);
  };

  const openAssign = () => {
    setSelectedUnidadDestino("");
    setObservacionesAssign("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedUnidadDestino) {
      Toast.error("Seleccione la unidad destino", "Debes elegir una unidad antes de designar.");
      return;
    }
    setActionLoading(true);

    const observacionesFinal = observacionesAssign.trim() || "Designado desde trámites";

    const res = await designarDocument(
      idUsuario,
      selectedDocumento.id_documento,
      selectedUnidadDestino,
      observacionesFinal
    );

    setActionLoading(false);
    if (res.success) {
      Toast.success("Trámite designado", "El trámite fue enviado correctamente.");
      setAssignOpen(false);
      setDetailsOpen(false);
      loadTramites();
    } else {
      Toast.error("Error al designar", res.error || "Error al designar el trámite");
    }
  };

  const handleFinalize = async () => {
    const confirmed = await Toast.confirmAction({
      title: "Finalizar trámite",
      text: "¿Deseas finalizar este trámite? Esta acción lo marcará como finalizado.",
      confirmButtonText: "Sí, finalizar",
      cancelButtonText: "Cancelar",
      icon: "warning",
    });

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    const res = await finalizarDocument(
      selectedDocumento.id_documento,
      "Finalizado desde trámites"
    );

    setActionLoading(false);
    if (res.success) {
      Toast.success("Trámite finalizado", "El trámite se finalizó correctamente.");
      setDetailsOpen(false);
      loadTramites();
    } else {
      Toast.error("Error al finalizar", res.error || "Error al finalizar el trámite");
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
                className="details-btn"
                onClick={() => handleViewDetails(doc)}
              >
                Detalles
              </button>
              <button
                className=" history-btn"
                onClick={() => handleViewHistory(doc)}
              >
                Historial
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
              <p>No hay movimientos registrados para este trámite.</p>
            )}
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
              <label htmlFor="unidadFilter">Buscar unidad destino</label>
              <input
                id="unidadFilter"
                type="text"
                placeholder="Filtra por nombre o tipo de oficina..."
                value={unidadFilter}
                onChange={(e) => setUnidadFilter(e.target.value)}
                className="unidad-search-input"
              />
              <label htmlFor="unidadDestino">Seleccionar unidad destino</label>
              <select
                id="unidadDestino"
                value={selectedUnidadDestino}
                onChange={(e) => setSelectedUnidadDestino(e.target.value)}
              >
                <option value="">Seleccione una unidad</option>
                {unidades
                  .filter((unidad) => unidad.id_unidad !== idUnidad)
                  .filter((unidad) =>
                    unidad.nombre.toLowerCase().includes(unidadFilter.toLowerCase()) ||
                    unidad.tipo?.toLowerCase().includes(unidadFilter.toLowerCase())
                  )
                  .map((unidad) => (
                    <option key={unidad.id_unidad} value={unidad.id_unidad}>
                      {unidad.nombre}
                    </option>
                  ))}
              </select>
              <label htmlFor="observacionesAssign">Observaciones (Opcional)</label>
              <textarea
                id="observacionesAssign"
                placeholder="Añade observaciones sobre esta designación..."
                value={observacionesAssign}
                onChange={(e) => setObservacionesAssign(e.target.value)}
                className="observaciones-textarea"
                rows={3}
              />
              <button
                className="primary-btn"
                onClick={handleAssign}
                disabled={actionLoading}
              >
                Enviar tramo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tramites;

