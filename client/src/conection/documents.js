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

const designarDocument = async (idDocumento, unidadDestino, observaciones = "") => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BACKEND_URL}/${idDocumento}/designar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ unidad_destino: unidadDestino, observaciones })
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

export { fetchTiposDocumento, createExternalDocument, fetchAllDocuments, fetchDocumentMovements, fetchPendingDocumentsByUnidad, designarDocument, finalizarDocument };
