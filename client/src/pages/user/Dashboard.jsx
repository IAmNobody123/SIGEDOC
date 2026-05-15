import { useState, useEffect } from "react";
import { fetchUserDocumentStats } from "../../conection/documents";
import { CheckCircle, FileText, Users } from "lucide-react";
import "./Dashboard.css";

function Dashboard({ idUsuario }) {
  const [stats, setStats] = useState({
    total_documentos: 0,
    documentos_finalizados: 0,
    documentos_pendientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      if (!idUsuario) return;
      setLoading(true);
      setError("");
      const res = await fetchUserDocumentStats(idUsuario);
      if (res.success) {
        setStats(res.data);
      } else {
        setError(
          res.error || "No se pudieron cargar las estadísticas",
        );
      }
      setLoading(false);
    };
    loadStats();
  }, [idUsuario]);

  return (
    <div className="user-dashboard">
      <div className="user-dashboard-header">
        <h2>Estadísticas de tus trámites</h2>
        <p>Resumen de documentos con los que has interactuado.</p>
      </div>

      {loading && <p>Cargando estadísticas...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && (
        <div className="user-stats-grid">
          <div className="user-stat-card">
            <div className="stat-icon users-icon">
              <Users size={24} />
            </div>
            <div className="text">
              <h3>Total de documentos</h3>
              <p className="user-stat-number">
                {stats.total_documentos}
              </p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon finished-icon">
              <CheckCircle size={24} />
            </div>
            <div className="data">
              <h3>Finalizados</h3>
              <p className="user-stat-number">
                {stats.documentos_finalizados}
              </p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon docs-icon">
              <FileText size={24} />
            </div>
            <div className="data">
              <h3>Pendientes</h3>
              <p className="user-stat-number">
                {stats.documentos_pendientes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
