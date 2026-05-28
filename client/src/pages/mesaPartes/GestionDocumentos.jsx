import { useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
import { FileText, Building, Send } from "lucide-react";
import {
  fetchTiposDocumento,
  createExternalDocument,
} from "../../conection/documents";
import { fetchUnidades } from "../../conection/user";
import "./GestionDocumentos.css";
import Toast from "../components/Toast";

export default function GestionDocumentos() {
  // const navigate = useNavigate();
  const [tipos, setTipos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [unidadFilter, setUnidadFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    prefijo_documento: "",
    descripcion_origen_externo: "",
    id_tipo: "",
    unidad_destino: "",
    nro_expediente: "",
    interesado: "",
    dniruc: "",
    fecha_ingreso: "",
    observaciones: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [resTipos, resUnidades] = await Promise.all([
        fetchTiposDocumento(),
        fetchUnidades(),
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

    const expedienteFinal = formData.prefijo_documento
      ? formData.nro_expediente
        ? `${formData.prefijo_documento} ${formData.nro_expediente}`
        : ""
      : formData.nro_expediente;

    if (
      !formData.nombre ||
      !formData.id_tipo ||
      !formData.unidad_destino ||
      !formData.interesado ||
      !formData.dniruc
    ) {
      Toast.error(
        "Por favor completa el nombre del documento, interesado, DNI/RUC, tipo y unidad destino.",
      );
      setIsSubmitting(false);
      return;
    }

    if (formData.prefijo_documento && !formData.nro_expediente) {
      Toast.error(
        "Selecciona el número de documento cuando eliges un prefijo.",
      );
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      nombre: formData.nombre,
      nro_expediente: expedienteFinal || null,
    };

    const res = await createExternalDocument(payload);

    if (res.success) {
      Toast.success(
        "Documento registrado",
        "Documento registrado y derivado con éxito.",
      );
      setFormData({
        nombre: "",
        prefijo_documento: "",
        descripcion_origen_externo: "",
        id_tipo: "",
        unidad_destino: "",
        nro_expediente: "",
        interesado: "",
        dniruc: "",
        fecha_ingreso: "",
        observaciones: "",
      });
    } else {
      Toast.error(
        "Error al registrar",
        res.error || "Ocurrió un error al registrar el documento.",
      );
    }
    setIsSubmitting(false);
  };

  return (
    <div className="gestion-documentos-container">
      <div className="gestion-header">
        <h2>Ingreso de Documentos Externos</h2>
        <p>
          Registra un nuevo documento proveniente de una entidad
          externa y derívalo a la oficina correspondiente.
        </p>
      </div>

      <form className="document-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Documento *</label>
            <div className="input-with-icon">
              <FileText size={18} className="icon" />
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ej: Informe de revisión interna"
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
              {tipos.map((tipo) => (
                <option key={tipo.id_tipo} value={tipo.id_tipo}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="interesado">
              Nombre del Interesado *
            </label>
            <div className="input-with-icon">
              <FileText size={18} className="icon" />
              <input
                type="text"
                id="interesado"
                name="interesado"
                placeholder="Ej: Juan Pérez"
                value={formData.interesado}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group ">
            <label htmlFor="dniruc">DNI/RUC del Interesado *</label>
            <div className="input-with-icon">
              <FileText size={18} className="icon" />
              <input
                type="text"
                id="dniruc"
                name="dniruc"
                placeholder="Ej: 12345678"
                value={formData.dniruc}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          

          <div className="form-group">
            <label htmlFor="descripcion_origen_externo">
              Entidad / Oficina Externa de Origen *
            </label>
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
          <div className="form-group">
            <label htmlFor="fecha_ingreso">Fecha de Ingreso</label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="unidad_destino">
              Oficina a Derivar (Destino) *
            </label>
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
                .filter(
                  (unidad) =>
                    unidad.nombre
                      .toLowerCase()
                      .includes(unidadFilter.toLowerCase()) ||
                    unidad.tipo
                      ?.toLowerCase()
                      .includes(unidadFilter.toLowerCase()),
                )
                .map((unidad) => (
                  <option
                    key={unidad.id_unidad}
                    value={unidad.id_unidad}
                  >
                    {unidad.nombre} ({unidad.tipo})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Prefijo para número de expediente (Opcional)
            </label>
            <select
              name="prefijo_documento"
              value={formData.prefijo_documento}
              onChange={handleChange}
            >
              <option value="">Selecciona un prefijo</option>
              <option value="Informes">Informes</option>
              <option value="Expediente">Expediente</option>
              <option value="memorandum">memorandum</option>
              <option value="carta">carta</option>
              <option value="oficio">oficio</option>
              <option value="esquela">esquela</option>
            </select>
          </div>

          <div className="form-group ">
            <label htmlFor="nro_expediente">
              Número de Documento (Opcional)
            </label>
            <div className="input-with-icon">
              <FileText size={18} className="icon" />
              <input
                type="text"
                id="nro_expediente"
                name="nro_expediente"
                placeholder="Ej: XXXX-2026"
                value={formData.nro_expediente}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="observaciones">
              Observaciones (Opcional)
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              placeholder="Añade detalles adicionales o indicaciones para la derivación..."
              value={formData.observaciones}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            <Send size={18} />
            <span>
              {isSubmitting
                ? "Registrando..."
                : "Registrar y Derivar"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
