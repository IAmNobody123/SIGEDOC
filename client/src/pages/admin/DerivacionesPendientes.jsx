import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { fetchDerivacionesPendientes, aprobarDerivacion, rechazarDerivacion } from '../../conection/documents';
import './DerivacionesPendientes.css';

export default function DerivacionesPendientes() {
    const [derivaciones, setDerivaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [procesando, setProcesando] = useState({});
    const [modalRechazo, setModalRechazo] = useState({ visible: false, idDocumento: null, razon: '' });

    // useEffect(() => {
    //     cargarDerivaciones();
    // }, []);

    // const cargarDerivaciones = async () => {
    //     setLoading(true);
    //     const res = await fetchDerivacionesPendientes();
    //     if (res.success) {
    //         setDerivaciones(res.data);
    //         setStatus({ type: '', message: '' });
    //     } else {
    //         setStatus({ type: 'error', message: 'Error al cargar derivaciones pendientes' });
    //     }
    //     setLoading(false);
    // };
    useEffect(() => {
    const cargar = async () => {
        setLoading(true);

        const res = await fetchDerivacionesPendientes();

        if (res.success) {
            setDerivaciones(res.data);
            setStatus({ type: '', message: '' });
        } else {
            setStatus({
                type: 'error',
                message: 'Error al cargar derivaciones pendientes'
            });
        }

        setLoading(false);
    };

    cargar();
}, []);

    const handleAprobar = async (idDocumento) => {
        setProcesando(prev => ({ ...prev, [idDocumento]: 'aprobando' }));
        const res = await aprobarDerivacion(idDocumento);
        
        if (res.success) {
            setStatus({ type: 'success', message: 'Derivación aprobada exitosamente.' });
            setDerivaciones(prev => prev.filter(d => d.id_documento !== idDocumento));
        } else {
            setStatus({ type: 'error', message: res.error || 'Error al aprobar la derivación' });
        }
        
        setProcesando(prev => ({ ...prev, [idDocumento]: null }));
    };

    const handleRechazarClick = (idDocumento) => {
        setModalRechazo({ visible: true, idDocumento, razon: '' });
    };

    const handleRechazarConfirm = async () => {
        if (!modalRechazo.idDocumento) return;
        
        setProcesando(prev => ({ ...prev, [modalRechazo.idDocumento]: 'rechazando' }));
        const res = await rechazarDerivacion(modalRechazo.idDocumento, modalRechazo.razon);
        
        if (res.success) {
            setStatus({ type: 'success', message: 'Derivación rechazada.' });
            setDerivaciones(prev => prev.filter(d => d.id_documento !== modalRechazo.idDocumento));
        } else {
            setStatus({ type: 'error', message: res.error || 'Error al rechazar la derivación' });
        }
        
        setProcesando(prev => ({ ...prev, [modalRechazo.idDocumento]: null }));
        setModalRechazo({ visible: false, idDocumento: null, razon: '' });
    };

    const handleRechazarCancel = () => {
        setModalRechazo({ visible: false, idDocumento: null, razon: '' });
    };

    if (loading) {
        return (
            <div className="derivaciones-container">
                <div className="loading">Cargando derivaciones pendientes...</div>
            </div>
        );
    }

    return (
        <div className="derivaciones-container">
            <div className="derivaciones-header">
                <h2>Derivaciones Pendientes de Aprobación</h2>
                <p>Revisa y aprueba o rechaza los documentos derivados desde mesa de partes.</p>
            </div>

            {status.message && (
                <div className={`status-message ${status.type}`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{status.message}</span>
                </div>
            )}

            {derivaciones.length === 0 ? (
                <div className="sin-derivaciones">
                    <Clock size={48} />
                    <h3>No hay derivaciones pendientes</h3>
                    <p>Todos los documentos han sido procesados.</p>
                </div>
            ) : (
                <div className="derivaciones-list">
                    {derivaciones.map(derivacion => (
                        <div key={derivacion.id_documento} className="derivacion-card">
                            <div className="derivacion-header-card">
                                <div className="derivacion-info-principal">
                                    <h3>{derivacion.nombre}</h3>
                                    <p className="documento-id">Documento #{derivacion.id_documento}</p>
                                </div>
                                <div className="derivacion-fecha">
                                    {new Date(derivacion.fecha_creacion).toLocaleDateString('es-PE', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>

                            <div className="derivacion-detalles">
                                <div className="detalle">
                                    <label>Tipo de Documento:</label>
                                    <span>{derivacion.tipo_documento}</span>
                                </div>
                                <div className="detalle">
                                    <label>Solicitante:</label>
                                    <span>{derivacion.creador_nombre} {derivacion.creador_apellido}</span>
                                </div>
                                <div className="detalle">
                                    <label>Email:</label>
                                    <span>{derivacion.creador_email}</span>
                                </div>
                                <div className="detalle">
                                    <label>Derivado a:</label>
                                    <span className="unidad-destino">{derivacion.unidad_destino_nombre}</span>
                                </div>
                                {derivacion.descripcion_origen_externo && (
                                    <div className="detalle descripcion-full">
                                        <label>Descripción:</label>
                                        <span>{derivacion.descripcion_origen_externo}</span>
                                    </div>
                                )}
                            </div>

                            <div className="derivacion-acciones">
                                <button
                                    className="btn-aprobar"
                                    onClick={() => handleAprobar(derivacion.id_documento)}
                                    disabled={procesando[derivacion.id_documento]}
                                >
                                    {procesando[derivacion.id_documento] === 'aprobando' ? (
                                        <>
                                            <Clock size={18} />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Aceptar
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn-rechazar"
                                    onClick={() => handleRechazarClick(derivacion.id_documento)}
                                    disabled={procesando[derivacion.id_documento]}
                                >
                                    {procesando[derivacion.id_documento] === 'rechazando' ? (
                                        <>
                                            <Clock size={18} />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={18} />
                                            Rechazar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalRechazo.visible && (
                <div className="modal-overlay" onClick={handleRechazarCancel}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Rechazar Derivación</h3>
                        <p>¿Está seguro de que desea rechazar esta derivación?</p>
                        
                        <div className="form-group">
                            <label htmlFor="razon">Razón del rechazo (opcional)</label>
                            <textarea
                                id="razon"
                                value={modalRechazo.razon}
                                onChange={e => setModalRechazo({ ...modalRechazo, razon: e.target.value })}
                                placeholder="Ingrese la razón del rechazo..."
                                rows="3"
                            />
                        </div>

                        <div className="modal-acciones">
                            <button className="btn-cancelar" onClick={handleRechazarCancel}>
                                Cancelar
                            </button>
                            <button className="btn-confirmar-rechazo" onClick={handleRechazarConfirm}>
                                Confirmar Rechazo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
