import { useState, useEffect } from 'react';
import './components.css';
import { fetchRoles, fetchUnidades } from '../../conection/user';

export const ModalAddUser = ({ isOpen, onClose, userToEdit }) => {
    const API_URL = (import.meta.env.VITE_BACKEND_URL_GENERAL || 'http://localhost:5000').trim();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        id_unidad: '',
        id_rol: ''
    });
    const [foto, setFoto] = useState(null);
    const [roles, setRoles] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            cargarRoles();
            cargarUnidades();
            if (userToEdit) {
                setFormData({
                    nombre: userToEdit.nombre || '',
                    apellido: userToEdit.apellido || '',
                    email: userToEdit.email || '',
                    password: '', // password left blank on edit unless they want to change it
                    id_unidad: userToEdit.id_unidad || '',
                    id_rol: userToEdit.id_rol || ''
                });
                setFoto(null);
            } else {
                setFormData({
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    id_unidad: '',
                    id_rol: ''
                });
                setFoto(null);
            }
        }
    }, [isOpen, userToEdit]);

    const cargarRoles = async () => {
        const res = await fetchRoles();
        if (res.success) setRoles(res.data);
    };

    const cargarUnidades = async () => {
        const res = await fetchUnidades();
        console.log(res)
        if (res.success) setUnidades(res.data);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('apellido', formData.apellido);
        data.append('email', formData.email);
        if (formData.password) {
            data.append('password', formData.password);
        }
        data.append('id_unidad', formData.id_unidad);
        data.append('id_rol', formData.id_rol);

        if (foto) {
            data.append('foto_url', foto);
        }

        try {
            const url = userToEdit
                ? `${API_URL}/users/update/${userToEdit.id_usuario}`
                : `${API_URL}/users/create`;

            const method = userToEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: data,
            });

            if (response.ok) {
                onClose();
            } else {
                alert("Error al guardar usuario");
            }
        } catch (error) {
            console.error("Error guardando usuario:", error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: 'white', padding: '24px', borderRadius: '8px',
                width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{userToEdit ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Apellido</label>
                                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Email (Usuario)</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Contraseña {userToEdit && <span style={{ fontWeight: 'normal', color: '#666' }}>(dejar en blanco para no cambiar)</span>}</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required={!userToEdit} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Rol</label>
                                <select name="id_rol" value={formData.id_rol} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="">Seleccione un rol</option>
                                    {roles.map(rol => (
                                        <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Unidad de Trabajo</label>
                                <select name="id_unidad" value={formData.id_unidad} onChange={handleChange} required={!userToEdit} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    <option value="">Seleccione unidad</option>
                                    {unidades.map(u => (
                                        <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Foto de Perfil</label>
                            <input type="file" name="foto_url" accept="image/*" onChange={handleFileChange} style={{ padding: '8px 0' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '12px' }}>
                            <button type="button" onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};