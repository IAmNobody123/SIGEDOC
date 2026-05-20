import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { FileText, Building, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchTiposDocumento, createExternalDocument } from '../../conection/documents';
import { fetchUnidades } from '../../conection/user';
import './GestionDocumentos.css';

export default function GestionDocumentos() {
    // const navigate = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [unidadFilter, setUnidadFilter] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion_origen_externo: '',
        id_tipo: '',
        unidad_destino: '',
        nro_expediente: '',
        observaciones: ''
    });

    useEffect(() => {
        const loadData = async () => {
            const [resTipos, resUnidades] = await Promise.all([
                fetchTiposDocumento(),
                fetchUnidades()
            ]);
            
            if (resTipos.success) setTipos(resTipos.data);
            if (resUnidades.success) setUnidades(resUnidades.data);
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });
        
        const res = await createExternalDocument(formData);
        
        if (res.success) {
            setStatus({ type: 'success', message: 'Documento registrado y derivado con éxito.' });
            setFormData({
                nombre: '',
                descripcion_origen_externo: '',
                id_tipo: '',
                unidad_destino: '',
                nro_expediente: '',
                observaciones: ''
            });
        } else {
            setStatus({ type: 'error', message: res.error || 'Ocurrió un error al registrar el documento.' });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="gestion-documentos-container">
            <div className="gestion-header">
                <h2>Ingreso de Documentos Externos</h2>
                <p>Registra un nuevo documento proveniente de una entidad externa y derívalo a la oficina correspondiente.</p>
            </div>
            
            {status.message && (
                <div className={`status-message ${status.type}`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{status.message}</span>
                </div>
            )}

            <form className="document-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del Interesado *</label>
                        <div className="input-with-icon">
                            <FileText size={18} className="icon" />
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                placeholder="Ej: Juan Pérez"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="id_tipo">Tipo de Documento *</label>
                        <select 
                            id="id_tipo" 
                            name="id_tipo" 
                            value={formData.id_tipo} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Seleccione un tipo</option>
                            {tipos.map(tipo => (
                                <option key={tipo.id_tipo} value={tipo.id_tipo}>
                                    {tipo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="descripcion_origen_externo">Entidad / Oficina Externa de Origen *</label>
                        <div className="input-with-icon">
                            <Building size={18} className="icon" />
                            <input
                                type="text"
                                id="descripcion_origen_externo"
                                name="descripcion_origen_externo"
                                placeholder="Ej: Ministerio de Educación"
                                value={formData.descripcion_origen_externo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="unidad_destino">Oficina a Derivar (Destino) *</label>
                        <input
                            type="text"
                            id="unidadFilter"
                            placeholder="Buscar oficina por nombre o tipo..."
                            value={unidadFilter}
                            onChange={(e) => setUnidadFilter(e.target.value)}
                            className="unidad-search-input"
                        />
                        <select 
                            id="unidad_destino" 
                            name="unidad_destino" 
                            value={formData.unidad_destino} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Seleccione la oficina destino</option>
                            {unidades
                                .filter((unidad) =>
                                    unidad.nombre.toLowerCase().includes(unidadFilter.toLowerCase()) ||
                                    unidad.tipo?.toLowerCase().includes(unidadFilter.toLowerCase())
                                )
                                .map(unidad => (
                                    <option key={unidad.id_unidad} value={unidad.id_unidad}>
                                        {unidad.nombre} ({unidad.tipo})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="nro_expediente">Número de Expediente (Opcional)</label>
                        <div className="input-with-icon">
                            <FileText size={18} className="icon" />
                            <input
                                type="text"
                                id="nro_expediente"
                                name="nro_expediente"
                                placeholder="Ej: EXP-2026-000123"
                                value={formData.nro_expediente}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="observaciones">Observaciones (Opcional)</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            placeholder="Añade detalles adicionales o indicaciones para la derivación..."
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        <Send size={18} />
                        <span>{isSubmitting ? 'Registrando...' : 'Registrar y Derivar'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}