import { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, FilePlus, Bell, LogOut, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MesaPartes.css';
import DashboardMesaPartes from './DashboardMesaPartes';
import GestionDocumentos from './GestionDocumentos';

export default function MesaPartes() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="mesapartes-content-panel slide-in">
            <DashboardMesaPartes />
          </div>
        );
      case 'documents':
        return (
          <div className="mesapartes-content-panel slide-in">
            <GestionDocumentos />
          </div>
        );
      case 'notifications':
        return (
          <div className="mesapartes-content-panel slide-in">
            <h2>Notificaciones de Derivación</h2>
            <p>Aquí recibirás alertas cuando un documento sea derivado a Mesa de Partes o haya cambios de estado importantes.</p>
            {/* Bandeja de notificaciones irá aquí */}
            <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #ccc', borderRadius: '8px' }}>
              <p><em>(Bandeja de notificaciones)</em></p>
            </div>
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
      <aside className={`mesapartes-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <span className="sidebar-title">SIGEDOC</span>}
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
              <FilePlus size={20} />
              {isSidebarOpen && <span>Gestion de  Documentos</span>}
            </li>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </li>
            <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
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
              <span className="user-name">Encargado</span>
              <span className="user-role">Mesa de Partes</span>
            </div>
            <div className="avatar-circle">
              <Briefcase size={24} />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="mesapartes-content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
