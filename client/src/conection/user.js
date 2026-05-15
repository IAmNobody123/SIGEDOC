const BACKEND_URL = (import.meta.env.VITE_USER_BACKEND_URL || "http://localhost:5000/users").trim();
const fetchRoles = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/roles`);
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching roles:", error);
        return { success: false };
    }
};

const fetchUnidades = async () => {
    try {
        const res = await fetch(`${BACKEND_URL}/unidades`);
        if (res.ok) {
            const data = await res.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching unidades:", error);
        return { success: false };
    }
};

const fetchUsers = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/`);
        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false };
    }
};

const deleteUser = async (id) => {
    try {
        const response = await fetch(`${BACKEND_URL}/delete/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false };
    }
};

const fetchUserStats = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/stats/usuarios`);
        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        }
        return { success: false };
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return { success: false };
    }
};

export { fetchRoles, fetchUnidades, fetchUsers, deleteUser, fetchUserStats };
