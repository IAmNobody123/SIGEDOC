import { useState, useEffect } from "react";
import {
  Menu,
  X,
  // LayoutDashboard,
  FilePlus,
  Bell,
  LogOut,
  // Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MesaPartes.css";
// import DashboardMesaPartes from "./DashboardMesaPartes";
import GestionDocumentos from "./GestionDocumentos";
import BandejaTramites from "./BandejaTramites";
import BandejaMovimientos from "./BandejaMovimientos";

export default function MesaPartes() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const idUnidad = user ? user.id_unidad : null;
  const idUsuario = user ? user.id : null;



  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      // case "dashboard":
      //   return (
      //     <div className="mesapartes-content-panel slide-in">
      //       <DashboardMesaPartes />
      //     </div>
      //   );
      case "documents":
        return (
          <div className="mesapartes-content-panel slide-in">
            <GestionDocumentos />
          </div>
        );
      case "notifications":
        return (
          <div className="mesapartes-content-panel slide-in">
            <BandejaMovimientos idUnidad={idUnidad} idUsuario={idUsuario} />
          </div>
        );
      case "bandeja":
        return (
          <div className="mesapartes-content-panel slide-in">
            <BandejaTramites idUnidad={idUnidad} idUsuario={idUsuario} />
          </div>
        );
      default:
        return (
          <div className="mesapartes-content-panel slide-in">
            <h2>Panel Principal</h2>
          </div>
        );
    }
  };

  return (
    <div className="mesapartes-layout">
      {/* Sidebar */}
      <aside
        className={`mesapartes-sidebar ${isSidebarOpen ? "open" : "closed"}`}
      >
        <div className="sidebar-header">
          {isSidebarOpen && (
            <span className="sidebar-title">SIGEDOC</span>
          )}
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeTab === "documents" ? "active" : ""}
              onClick={() => setActiveTab("documents")}
            >
              <FilePlus size={20} />
              {isSidebarOpen && <span>Gestion de Documentos</span>}
            </li>
            {/* <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </li> */}
            <li
              className={activeTab === "bandeja" ? "active" : ""}
              onClick={() => setActiveTab("bandeja")}
            >
              <Bell size={20} />
              {isSidebarOpen && <span>Bandeja de Trámites</span>}
            </li>
            <li
              className={
                activeTab === "notifications" ? "active" : ""
              }
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={20} />
              {isSidebarOpen && <span>Notificaciones</span>}
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="mesapartes-main">
        {/* Topbar with Floating User Avatar */}
        <header className="mesapartes-topbar">
          <div className="topbar-spacer"></div>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user ? `${user.nombre} ${user.apellido}` : 'Usuario'}</span>
              <span className="user-role">Encargado de Mesa de Partes</span>
            </div>
            <div className="avatar-circle">
              {user && user.imagen ? (
                <img src={user.imagen} alt="Avatar" />
              ) : (
                user?.nombre.charAt(0).toUpperCase() || 'U'
              )}

            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="mesapartes-content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div >
  );
}
