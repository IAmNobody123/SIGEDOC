import { useState, useEffect } from 'react';
import { fetchTiposDocumento, createInternalDocument } from '../../conection/documents';
import { fetchUnidades } from '../../conection/user';
import Toast from '../components/Toast';

function CrearDocumentos() {
  const [tipos, setTipos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [filtroUnidad, setFiltroUnidad] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    prefijo_documento: '',
    id_tipo: '',
    unidad_destino: '',
    nro_expediente: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const tiposRes = await fetchTiposDocumento();
      const unidadesRes = await fetchUnidades();
      if (tiposRes.success) setTipos(tiposRes.data);
      if (unidadesRes.success) setUnidades(unidadesRes.data);
    };
    loadData();
  }, []);

  const filteredUnidades = unidades.filter((unidad) =>
    unidad.nombre.toLowerCase().includes(filtroUnidad.toLowerCase()),
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nombreFinal = form.prefijo_documento && form.nro_expediente
      ? `${form.prefijo_documento} ${form.nro_expediente}`
      : form.nombre;

    if (!nombreFinal || !form.id_tipo || !form.unidad_destino) {
      Toast.error('Por favor completa el nombre (o selecciona prefijo + número), tipo y unidad destino.');
      return;
    }

    if (form.prefijo_documento && !form.nro_expediente) {
      Toast.error('Selecciona el número de expediente cuando eliges un prefijo.');
      return;
    }

    setLoading(true);
    const result = await createInternalDocument({
      nombre: nombreFinal,
      id_tipo: form.id_tipo,
      unidad_destino: form.unidad_destino,
      nro_expediente: form.nro_expediente || null,
      observaciones: form.observaciones,
    });

    setLoading(false);
    if (result.success) {
      Toast.success('Documento interno registrado correctamente', 'La unidad destino y el administrador fueron notificados.');
      setForm({ nombre: '', id_tipo: '', unidad_destino: '', nro_expediente: '', observaciones: '' });
    } else {
      Toast.error('Error al registrar el documento', result.error || 'Error al registrar el documento.');
    }
  };

  return (
    <div>
      <h2>Crear documento interno</h2>
      <p>Todos los usuarios pueden enviar documentos internamente a cualquier unidad registrada.</p>
      <form onSubmit={handleSubmit} className="crear-documento-form">
        <div className="form-group">
          <label>Nombre del documento</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Título o asunto del documento"
          />
        </div>
        <div className="form-group">
          <label>Tipo de documento</label>
          <select name="id_tipo" value={form.id_tipo} onChange={handleChange}>
            <option value="">Selecciona un tipo</option>
            {tipos.map((tipo) => (
              <option key={tipo.id_tipo} value={tipo.id_tipo}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Buscar unidad destino</label>
          <input
            type="text"
            value={filtroUnidad}
            onChange={(e) => setFiltroUnidad(e.target.value)}
            placeholder="Filtra por nombre de unidad"
          />
        </div>
        <div className="form-group">
          <label>Unidad destino</label>
          <select name="unidad_destino" value={form.unidad_destino} onChange={handleChange}>
            <option value="">Selecciona una unidad</option>
            {filteredUnidades.map((unidad) => (
              <option key={unidad.id_unidad} value={unidad.id_unidad}>
                {unidad.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Prefijo para número de documento</label>
          <select name="prefijo_documento" value={form.prefijo_documento} onChange={handleChange}>
            <option value="">Selecciona un prefijo</option>
            <option value="Informes">Informes</option>
            <option value="Expediente">Expediente</option>
            <option value="memorandum">memorandum</option>
            <option value="carta">carta</option>
            <option value="oficio">oficio</option>
            <option value="esquela">esquela</option>
          </select>
        </div>
        <div className="form-group">
          <label>Número de documento (opcional)</label>
          <input
            type="text"
            name="nro_expediente"
            value={form.nro_expediente}
            onChange={handleChange}
            placeholder="ejemplo: XXXX-XXXX (opcional)"
          />
        </div>
        <div className="form-group">
          <label>Observaciones</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            placeholder="Observaciones internas"
            rows={4}
          />
        </div>
        <button type="submit" disabled={loading} className="primary-button">
          {loading ? 'Registrando...' : 'Registrar documento interno'}
        </button>
      </form>
    </div>
  );
}

export default CrearDocumentos;
