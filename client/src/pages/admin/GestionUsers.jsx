import { useState, useEffect } from "react"
import { ModalAddUser } from "../components/ModalAddUser"
import { fetchUsers, deleteUser } from "../../conection/user";

export default function GestionUsers() {
    const [users, setUsers] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [userToEdit, setUserToEdit] = useState(null)
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [loadError, setLoadError] = useState('')
    const API_URL = (import.meta.env.VITE_BACKEND_URL_GENERAL || "http://localhost:5000").trim();

    

    const listUsers = async () => {
        setLoadingUsers(true);
        setLoadError('');
        setUsers([]);

        const res = await fetchUsers();
        if (res.success) {
            setUsers(res.data);
        } else {
            setLoadError('No se pudieron cargar los usuarios.');
        }

        setLoadingUsers(false);
    };

    useEffect(() => {
        (async () => {
            await listUsers();
        })();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("¿Está seguro de eliminar este usuario?")) {
            const res = await deleteUser(id);
            if (res.success) {
                listUsers();
            }
        }
    };

    const handleEdit = (user) => {
        setUserToEdit(user);
        setOpenModal(true);
    };

    const handleAdd = () => {
        setUserToEdit(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        listUsers();
    };

    return (
        <div>
            <div className="gestion-users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Gestión de Usuarios</h2>
                <button className="btn-primary" onClick={handleAdd}>Agregar Usuario</button>
            </div>

            <div className="table-users table-responsive">
                {loadingUsers && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#4b5563' }}>
                        Cargando usuarios, por favor espere...
                    </div>
                )}
                {loadError && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#b91c1c' }}>
                        {loadError}
                    </div>
                )}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', opacity: loadingUsers ? 0.5 : 1 }}>
                    <thead style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Foto</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Nombre</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>DNI</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Rol</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Unidad</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id_usuario} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px' }}>
                                    {user.foto_url ? (
                                        <img src={`${API_URL}/uploads/img/perfil/${user.foto_url}`} alt="Perfil" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontWeight: 'bold' }}>
                                            {user.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '12px' }}>{user.nombre} {user.apellido}</td>
                                <td style={{ padding: '12px' }}>{user.dni || user.email}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '999px', fontSize: '0.85em', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                                        {user.rol_nombre || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>{user.unidad_nombre || 'N/A'}</td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleEdit(user)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                                    <button onClick={() => handleDelete(user.id_usuario)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {!loadingUsers && users.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No hay usuarios registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ModalAddUser isOpen={openModal} onClose={handleCloseModal} userToEdit={userToEdit} />
        </div>
    )
}