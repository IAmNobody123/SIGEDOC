const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const login = async (dni, password) => {
    try {
        const res = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dni,
                password,
            }),
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error en login:", error);
        return { error: "Error en el servidor" };
    }
};
const register = async (dni, password, rol) => {
    try {
        const res = await fetch(`${BACKEND_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dni,
                password,
                rol,
            }),
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error en registro:", error);
        return { error: "Error en el servidor" };
    }
};

export { login, register };