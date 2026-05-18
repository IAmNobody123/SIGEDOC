const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL_GENERAL ? `${import.meta.env.VITE_BACKEND_URL_GENERAL}/documents` : "http://localhost:5000/documents").trim();

const fetchTiposDocumento = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/tipos`);
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching tipos de documento:", error);
        return { success: false };
    }
};

const createExternalDocument = async (documentData) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/external`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(documentData)
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error creating document:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchAllDocuments = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error fetching documents:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchDocumentMovements = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/${id}/movimientos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error fetching document movements:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchPendingDocumentsByUnidad = async (unidadId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/unidad/${unidadId}/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error fetching pending documents:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchUserDocumentHistory = async (usuarioId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/usuario/${usuarioId}/historico`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error fetching user document history:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const designarDocument = async (idUsuario, idDocumento, unidadDestino, observaciones = "") => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/${idDocumento}/designar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ unidad_destino: unidadDestino, observaciones, id_usuario: idUsuario })
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error assigning document:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const finalizarDocument = async (idDocumento, observaciones = "") => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/${idDocumento}/finalizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ observaciones })
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error finalizing document:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchDocumentStats = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/stats/documentos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error("Error fetching document stats:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchUserDocumentStats = async (usuarioId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/usuario/${usuarioId}/estadisticas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching user document stats:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/notificaciones`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchDerivacionesPendientes = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/derivaciones/pendientes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching pending derivations:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const fetchMovimientosRecientes = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/movimientos/recientes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching recent movements:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const aprobarDerivacion = async (idDocumento) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/${idDocumento}/aprobar-derivacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error approving derivation:", error);
        return { success: false, error: "Error de conexión" };
    }
};

const rechazarDerivacion = async (idDocumento, razon) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/${idDocumento}/rechazar-derivacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ razon })
        });
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        } else {
            const errorData = await res.json();
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error("Error rejecting derivation:", error);
        return { success: false, error: "Error de conexión" };
    }
};

export { fetchTiposDocumento, createExternalDocument, fetchAllDocuments, fetchDocumentMovements, fetchPendingDocumentsByUnidad, fetchUserDocumentHistory, fetchUserDocumentStats, designarDocument, finalizarDocument, fetchDocumentStats, fetchNotifications, fetchDerivacionesPendientes, aprobarDerivacion, rechazarDerivacion, fetchMovimientosRecientes };
