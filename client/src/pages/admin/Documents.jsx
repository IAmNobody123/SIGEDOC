import { useState, useEffect } from "react";
import {
  fetchAllDocuments,
  fetchDocumentMovements,
  designarDocument,
} from "../../conection/documents";
import { fetchUnidades } from "../../conection/user";
import "./Documents.css"; // Asumiendo que crearemos este CSS

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movementsModalOpen, setMovementsModalOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignDocument, setReassignDocument] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidadDestino, setSelectedUnidadDestino] =
    useState("");
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignError, setReassignError] = useState("");
  const [reassignMessage, setReassignMessage] = useState("");
  const [currentPageMovements, setCurrentPageMovements] = useState(1);
  const [itemsPerPageMovements] = useState(5);
  const [currentPageDocuments, setCurrentPageDocuments] = useState(1);
  const [itemsPerPageDocuments] = useState(8);

  //   const loadDocuments = async () => {
  //     setLoading(true);
  //     const res = await fetchAllDocuments();
  //     if (res.success) {
  //       setDocuments(res.data);
  //     } else {
  //       setError(res.error || "Error al cargar documentos");
  //     }
  //     setLoading(false);
  //   };

  const handleViewDetails = async (document) => {
    setSelectedDocument(document);
    setModalOpen(true);
    setLoadingMovements(true);
    const res = await fetchDocumentMovements(document.id_documento);
    if (res.success) {
      setMovements(res.data);
    } else {
      setMovements([]);
    }
    setLoadingMovements(false);
  };

  const handleViewMovements = async (document) => {
    setSelectedDocument(document);
    setMovementsModalOpen(true);
    setCurrentPageMovements(1);
    setLoadingMovements(true);

    const res = await fetchDocumentMovements(document.id_documento);
    if (res.success) {
      setMovements(res.data);
    } else {
      setMovements([]);
    }
    setLoadingMovements(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setMovementsModalOpen(false);
    setReassignOpen(false);
    setSelectedDocument(null);
    setReassignDocument(null);
    setMovements([]);
    setSelectedUnidadDestino("");
    setReassignError("");
    setReassignMessage("");
    setCurrentPageMovements(1);
    setCurrentPageDocuments(1);
  };

  const openReassign = (document) => {
    setReassignDocument(document);
    setReassignOpen(true);
    setSelectedUnidadDestino("");
    setReassignError("");
    setReassignMessage("");
  };

  const handleReassign = async () => {
    if (!selectedUnidadDestino) {
      setReassignError("Seleccione la oficina de destino");
      return;
    }

    setReassignLoading(true);
    setReassignError("");
    setReassignMessage("");

    const res = await designarDocument(
      reassignDocument.id_documento,
      selectedUnidadDestino,
      "Reasignado desde documentos",
    );

    setReassignLoading(false);
    if (res.success) {
      setReassignMessage("Documento reasignado correctamente.");
      setReassignOpen(false);
      setReassignDocument(null);
      setSelectedUnidadDestino("");
      loadDocuments();
    } else {
      setReassignError(
        res.error || "Error al reasignar el documento",
      );
    }
  };

  const indexOfLastItem =
    currentPageMovements * itemsPerPageMovements;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageMovements;
  const currentMovements = movements.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(
    movements.length / itemsPerPageMovements,
  );

  const paginate = (pageNumber) =>
    setCurrentPageMovements(pageNumber);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetchAllDocuments();

      if (res.success) {
        setDocuments(res.data);
      } else {
        setError(res.error || "Error al cargar documentos");
      }
    } catch {
      setError("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const loadUnidades = async () => {
    const res = await fetchUnidades();
    if (res.success) {
      setUnidades(res.data);
    }
  };

  const formatEstado = (estado) =>
    estado === "Pendiente_Aceptacion_Usuario"
      ? "Esperando aceptacion"
      : estado;

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadDocuments(), loadUnidades()]);
    };

    initialize();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();
    return (
      doc.nombregeneral.toLowerCase().includes(term) ||
      doc.nombreinteresado.toLowerCase().includes(term) ||
      doc.tipo_documento?.toLowerCase().includes(term) ||
      doc.creador_nombre?.toLowerCase().includes(term) ||
      doc.creador_apellido?.toLowerCase().includes(term) ||
      doc.nro_expediente?.toString().toLowerCase().includes(term)
    );
  });

  const totalDocumentPages = Math.ceil(
    filteredDocuments.length / itemsPerPageDocuments,
  );

  const currentPageDocumentsSafe = Math.min(
    currentPageDocuments,
    Math.max(totalDocumentPages, 1),
  );

  const indexOfLastDocument =
    currentPageDocumentsSafe * itemsPerPageDocuments;
  const indexOfFirstDocument =
    indexOfLastDocument - itemsPerPageDocuments;
  const currentDocuments = filteredDocuments.slice(
    indexOfFirstDocument,
    indexOfLastDocument,
  );

  const paginateDocuments = (pageNumber) =>
    setCurrentPageDocuments(pageNumber);

  return (
    <div className="documents-container">
      <div className="search-container">
        <label htmlFor="documentSearch">Buscar documento:</label>
        <input
          id="documentSearch"
          type="text"
          placeholder="Buscar por interesado, tipo de documento o nro expediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <p>Cargando documentos...</p>}
      {error && <p className="error">{error}</p>}

      <div className="documents-list">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Nro Expediente</th>
              <th>Nombre general</th>
              <th>Persona interesada</th>
              <th>Tipo</th>
              <th>Estado</th>
              {/* <th>Creado por</th> */}
              <th>Fecha</th>
              <th>Unidad actual</th>
              {/* <th>Origen externo</th> */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDocuments.map((doc) => (
              <tr key={doc.id_documento}>
                <td>
                  {doc.nro_expediente
                    ? doc.nro_expediente
                    : "NO TIENE"}
                </td>
                <td>{doc.nombregeneral}</td>
                <td>
                  {doc.nombreinteresado
                    ? doc.nombreinteresado
                    : "NO TIENE"}
                </td>
                <td>{doc.tipo_documento}</td>
                <td>{formatEstado(doc.estado_actual)}</td>
                {/* <td>{doc.creador_nombre} {doc.creador_apellido}</td> */}
                <td>
                  {new Date(doc.fecha_creacion).toLocaleDateString()}
                </td>
                <td>{doc.unidad_actual_nombre}</td>
                {/* <td>{doc.externo ? doc.descripcion_origen_externo : '-'}</td> */}
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleViewDetails(doc)}
                      className="view-details-btn"
                    >
                      Ver detalles
                    </button>
                    <button
                      onClick={() => handleViewMovements(doc)}
                      className="view-movements-btn"
                    >
                      Ver movimientos
                    </button>
                    {doc.estado_actual &&
                      !["finalizado", "rechazado"].includes(
                        doc.estado_actual.toLowerCase(),
                      ) && (
                        <button
                          onClick={() => openReassign(doc)}
                          className="reassign-btn"
                        >
                          Reasignar
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalDocumentPages > 1 && (
        <div className="pagination documents-pagination">
          <button
            onClick={() =>
              paginateDocuments(currentPageDocuments - 1)
            }
            disabled={currentPageDocuments === 1}
            className="pagination-btn"
          >
            Anterior
          </button>

          <span className="pagination-info">
            Página {currentPageDocuments} de {totalDocumentPages}
          </span>

          <button
            onClick={() =>
              paginateDocuments(currentPageDocuments + 1)
            }
            disabled={currentPageDocuments === totalDocumentPages}
            className="pagination-btn"
          >
            Siguiente
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={closeModal}>
              ×
            </button>
            {selectedDocument && (
              <>
                <h2>Detalles del Documento</h2>
                <div className="document-details-grid">
                  <div className="detail-column">
                    {/* <p>
                      <strong>ID:</strong>{" "}
                      {selectedDocument.id_documento}
                    </p> */}
                    <p>
                      <strong>Nombre:</strong>{" "}
                      {selectedDocument.nombre}
                    </p>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {selectedDocument.tipo_documento}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {selectedDocument.estado_actual}
                    </p>
                  </div>
                  <div className="detail-column">
                    <p>
                      <strong>Creado por:</strong>{" "}
                      {selectedDocument.creador_nombre}{" "}
                      {selectedDocument.creador_apellido}
                    </p>
                    <p>
                      <strong>Fecha de creación:</strong>{" "}
                      {new Date(
                        selectedDocument.fecha_creacion,
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Unidad actual:</strong>{" "}
                      {selectedDocument.unidad_actual_nombre}
                    </p>
                    {selectedDocument.externo && (
                      <p>
                        <strong>Fecha de creación:</strong>{" "}
                        {new Date(
                          selectedDocument.fechaingreso,
                        ).toLocaleDateString()}{" "}
                      </p>
                    )}
                    {selectedDocument.externo && (
                      <p>
                        <strong>Origen externo:</strong>{" "}
                        {selectedDocument.descripcion_origen_externo}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {reassignOpen && reassignDocument && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={closeModal}>
              ×
            </button>
            <h2>Reasignar documento</h2>
            <div className="document-details-grid">
              <div className="detail-column">
                <p>
                  <strong>ID:</strong> {reassignDocument.id_documento}
                </p>
                <p>
                  <strong>Nombre:</strong> {reassignDocument.nombre}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  {reassignDocument.estado_actual}
                </p>
                <p>
                  <strong>Unidad actual:</strong>{" "}
                  {reassignDocument.unidad_actual_nombre}
                </p>
              </div>
              <div className="detail-column">
                <p>
                  <strong>Tipo:</strong>{" "}
                  {reassignDocument.tipo_documento}
                </p>
                <p>
                  <strong>Creado por:</strong>{" "}
                  {reassignDocument.creador_nombre}{" "}
                  {reassignDocument.creador_apellido}
                </p>
                {reassignDocument.externo && (
                  <p>
                    <strong>Origen externo:</strong>{" "}
                    {reassignDocument.descripcion_origen_externo}
                  </p>
                )}
              </div>
            </div>

            <div className="reassign-section">
              <label htmlFor="unidadDestino">
                Selecciona oficina destino
              </label>
              <select
                id="unidadDestino"
                value={selectedUnidadDestino}
                onChange={(e) =>
                  setSelectedUnidadDestino(e.target.value)
                }
                className="select-input"
              >
                <option value="">-- Seleccionar oficina --</option>
                {unidades.map((unidad) => (
                  <option
                    key={unidad.id_unidad}
                    value={unidad.id_unidad}
                  >
                    {unidad.nombre}
                  </option>
                ))}
              </select>
            </div>

            {reassignError && (
              <p className="error">{reassignError}</p>
            )}
            {reassignMessage && (
              <p className="success">{reassignMessage}</p>
            )}

            <div className="modal-actions">
              <button
                className="reassign-confirm-btn"
                onClick={handleReassign}
                disabled={reassignLoading}
              >
                {reassignLoading
                  ? "Reasignando..."
                  : "Confirmar reasignación"}
              </button>
              <button
                className="view-movements-btn"
                onClick={closeModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {movementsModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content-history-document"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={closeModal}>
              ×
            </button>
            {selectedDocument && (
              <>
                <h2>
                  Movimientos del Documento: {selectedDocument.nombre}
                </h2>
                {loadingMovements ? (
                  <p>Cargando movimientos...</p>
                ) : movements.length > 0 ? (
                  <>
                    <div className="movements-table-container">
                      <table className="movements-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>De</th>
                            <th>A</th>
                            <th>Enviado por</th>
                            {/* <th>Recibido por</th> */}
                            <th>Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMovements.map((mov) => (
                            <tr key={mov.id_movimiento}>
                              <td>
                                {new Date(
                                  mov.fecha_movimiento,
                                ).toLocaleString()}
                              </td>
                              <td>{mov.estado}</td>
                              <td>{mov.unidad_origen_nombre}</td>
                              <td>{mov.unidad_destino_nombre}</td>
                              <td>
                                {mov.enviado_por_nombre}{" "}
                                {mov.enviado_por_apellido}
                              </td>
                              {/* <td>{mov.recibido_por_nombre ? `${mov.recibido_por_nombre} ${mov.recibido_por_apellido}` : '-'}</td> */}
                              <td>{mov.observaciones || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="pagination">
                        <button
                          onClick={() =>
                            paginate(currentPageMovements - 1)
                          }
                          disabled={currentPageMovements === 1}
                          className="pagination-btn"
                        >
                          Anterior
                        </button>

                        <span className="pagination-info">
                          Página {currentPageMovements} de{" "}
                          {totalPages}
                        </span>

                        <button
                          onClick={() =>
                            paginate(currentPageMovements + 1)
                          }
                          disabled={
                            currentPageMovements === totalPages
                          }
                          className="pagination-btn"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p>
                    No hay movimientos registrados para este
                    documento.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
