import { useState, useEffect } from "react";
import { Users, FileText, CheckCircle, /*Bell,*/ Clock } from "lucide-react";
import { fetchUserStats } from "../../conection/user";
import { fetchDocumentStats, fetchMovimientosRecientes } from "../../conection/documents";
import { io } from "socket.io-client";
import "./Dashboard.css";

export default function Dashboard(/*{ notifications = [] }*/) {
  const [stats, setStats] = useState({
    total_usuarios: 0,
    total_documentos: 0,
    documentos_finalizados: 0,
  });
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        const [usersRes, docsRes, movRes] = await Promise.all([
          fetchUserStats(),
          fetchDocumentStats(),
          fetchMovimientosRecientes(),
        ]);

        if (usersRes.success && docsRes.success) {
          setStats({
            total_usuarios: usersRes.success ? usersRes.data.total_usuarios : 0,
            total_documentos: docsRes.success ? docsRes.data.total_documentos : 0,
            documentos_finalizados: docsRes.success ? docsRes.data.documentos_finalizados : 0,
          });
        }

        if (movRes.success) {
          setMovimientos(movRes.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);


  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL_GENERAL || 'http://localhost:5000';
    const socket = io(backendUrl);

    socket.on("nuevo_movimiento", (nuevoMovimiento) => {
      setMovimientos((prevMovimientos) => {
        const movimientosActualizados = [nuevoMovimiento, ...prevMovimientos];
        return movimientosActualizados.slice(0, 5);
      });
    });

    return () => {
      socket.off("nuevo_movimiento");
      socket.disconnect();
    };
  }, []);

  const docsPercentage =
    stats.total_documentos > 0
      ? Math.round(
          (stats.documentos_finalizados / stats.total_documentos) *
            100,
        )
      : 0;

  // const formatearFecha = (fecha) => {
  //   return new Date(fecha).toLocaleTimeString("es-ES", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  // };

  const formatearFechaCompleta = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <h1>Dashboard del Administrador</h1>
        <p className="dashboard-subtitle">
          Bienvenido al sistema de administración de la municipalidad.
          Aquí verás un resumen de las actividades recientes.
        </p>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Usuarios</h3>
              {loading ? (
                <p className="stat-number">Cargando...</p>
              ) : (
                <p className="stat-number">{stats.total_usuarios}</p>
              )}
              <span className="stat-label">Total de usuarios</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon docs-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3>Documentos</h3>
              {loading ? (
                <p className="stat-number">Cargando...</p>
              ) : (
                <p className="stat-number">
                  {stats.total_documentos}
                </p>
              )}
              <span className="stat-label">Total de documentos</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon finished-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Finalizados</h3>
              {loading ? (
                <p className="stat-number">Cargando...</p>
              ) : (
                <p className="stat-number">
                  {stats.documentos_finalizados}
                </p>
              )}
              <span className="stat-label">
                Documentos finalizados
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          <div className="chart-container">
            <h2>Progreso de Documentos</h2>
            <div className="progress-chart">
              <div className="progress-item">
                <div className="progress-label">Finalizados</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill finished"
                    style={{ width: `${docsPercentage}%` }}
                  >
                    {docsPercentage > 10 && (
                      <span>{docsPercentage}%</span>
                    )}
                  </div>
                </div>
                <div className="progress-count">
                  {stats.documentos_finalizados} /{" "}
                  {stats.total_documentos}
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-label">Pendientes</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill pending"
                    style={{ width: `${100 - docsPercentage}%` }}
                  >
                    {100 - docsPercentage > 10 && (
                      <span>{100 - docsPercentage}%</span>
                    )}
                  </div>
                </div>
                <div className="progress-count">
                  {stats.total_documentos -
                    stats.documentos_finalizados}{" "}
                  / {stats.total_documentos}
                </div>
              </div>
            </div>
          </div>

          <div className="chart-container pie-chart-container">
            <h2>Distribución de Documentos</h2>
            <svg className="pie-chart" viewBox="0 0 120 120">
              <circle
                className="pie-segment finished-segment"
                cx="60"
                cy="60"
                r="50"
                strokeDasharray={`${(docsPercentage / 100) * 314} 314`}
              />
              <circle
                className="pie-segment pending-segment"
                cx="60"
                cy="60"
                r="50"
                strokeDasharray={`${((100 - docsPercentage) / 100) * 314} 314`}
                strokeDashoffset={`-${(docsPercentage / 100) * 314}`}
              />
              <text x="60" y="65" className="pie-text">
                {docsPercentage}%
              </text>
            </svg>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color finished"></span>
                <span>
                  Finalizados ({stats.documentos_finalizados})
                </span>
              </div>
              <div className="legend-item">
                <span className="legend-color pending"></span>
                <span>
                  Pendientes (
                  {stats.total_documentos -
                    stats.documentos_finalizados}
                  )
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Sidebar */}
      <div className="notifications-sidebar">
        <div className="notifications-header">
          <Clock size={20} />
          <h3>Últimos Movimientos</h3>
        </div>
        <div className="notifications-list">
          {movimientos.length > 0 ? (
            movimientos.map((mov, idx) => (
              <div key={idx} className="notification-item">
                <div className="notification-dot"></div>
                <div className="notification-content">
                  <p className="notification-title">
                    {mov.documento_nombre || `Doc #${mov.id_documento}`}
                  </p>
                  <div className="movement-details">
                    <p className="detail-text">
                      <span className="label">De:</span> {mov.unidad_origen || "Sistema"}
                    </p>
                    <p className="detail-text">
                      <span className="label">A:</span> {mov.unidad_destino || "Sistema"}
                    </p>
                    <p className="detail-text">
                      <span className="label">Estado:</span>
                      <span className={`estado-badge ${mov.estado?.toLowerCase()}`}>
                        {mov.estado || "Desconocido"}
                      </span>
                    </p>
                    <p className="detail-text">
                      <span className="label">Movimiento:</span> #{mov.id_movimiento || "N/A"}
                    </p>
                  </div>
                  <p className="notification-time">
                    {formatearFechaCompleta(mov.fecha_movimiento)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-notifications">No hay movimientos recientes</p>
          )}
        </div>
      </div>
    </div>
  );
}
