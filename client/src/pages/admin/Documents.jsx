import { useState, useEffect } from "react";
import {
  fetchAllDocuments,
  fetchDocumentMovements,
} from "../../conection/documents";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
    setCurrentPage(1);
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
    setSelectedDocument(null);
    setMovements([]);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMovements = movements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(movements.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

useEffect(() => {
  const loadDocuments = async () => {
    try {
      setLoading(true);

      const res = await fetchAllDocuments();

      if (res.success) {
        setDocuments(res.data);
      } else {
        setError(res.error || "Error al cargar documentos");
      }
    } catch (err) {
      setError("Error al cargar documentos",err);
    } finally {
      setLoading(false);
    }
  };

  loadDocuments();
}, []);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tipo_documento
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doc.creador_nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doc.creador_apellido
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="documents-container">

      <div className="search-container">
        <label htmlFor="">Ingresa el nombre del documento: </label>
        <input
          type="text"
          placeholder="Buscar por nombre, tipo o creador..."
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
              <th>ID</th>
              <th>Interesado</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Creado por</th>
              <th>Fecha</th>
              <th>Unidad actual</th>
              <th>Origen externo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id_documento}>
                <td>{doc.id_documento}</td>
                <td>{doc.nombre}</td>
                <td>{doc.tipo_documento}</td>
                <td>{doc.estado_actual}</td>
                <td>{doc.creador_nombre} {doc.creador_apellido}</td>
                <td>{new Date(doc.fecha_creacion).toLocaleDateString()}</td>
                <td>{doc.unidad_actual_nombre}</td>
                <td>{doc.externo ? doc.descripcion_origen_externo : '-'}</td>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                    <p>
                      <strong>ID:</strong>{" "}
                      {selectedDocument.id_documento}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedDocument.nombre}
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

      {movementsModalOpen && (
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
                <h2>Movimientos del Documento: {selectedDocument.nombre}</h2>
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
                            <th>Recibido por</th>
                            <th>Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMovements.map((mov) => (
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

                    {totalPages > 1 && (
                      <div className="pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                        >
                          Anterior
                        </button>

                        <span className="pagination-info">
                          Página {currentPage} de {totalPages}
                        </span>

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No hay movimientos registrados para este documento.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
