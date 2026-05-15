import { useState, useEffect } from 'react';
import { Menu, X, LayoutDashboard, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './User.css';
import Tramites from './Tramites';
import Historicos from './Historicos';
import Dashboard from './Dashboard';

export default function User() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const idUsuario = user ? user.id : null;
  const idUnidad = user ? user.id_unidad : null;

  console.log("ID Usuario:", user);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="user-content-panel slide-in">
            <Dashboard  idUsuario={idUsuario}/>
          </div>
        );
      case 'documents':
        return (
          <div className="user-content-panel slide-in">
            <Tramites idUsuario={idUsuario} idUnidad={idUnidad} />
          </div>
        );
      case 'historial':
        return (
          <div className="user-content-panel slide-in">
            <h2>Historico de documentos con los que interactuaste</h2>
            <Historicos idUsuario={idUsuario} />
          </div>
        );
      default:
        return (
          <div className="user-content-panel slide-in">
            <h2>Panel Principal</h2>
          </div>
        );
    }
  };

  return (
    <div className="user-layout">
      {/* Sidebar */}
      <aside className={`user-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <span className="sidebar-title">SIGEDOC</span>}
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </li>
            <li className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
              <FileText size={20} />
              {isSidebarOpen && <span>Mis Trámites</span>}
            </li>
            <li className={activeTab === 'historial' ? 'active' : ''} onClick={() => setActiveTab('historial')}>
              <FileText size={20} />
              {isSidebarOpen && <span>Histórico</span>}
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
      <main className="user-main">
        {/* Topbar with Floating User Avatar */}
        <header className="user-topbar">
          <div className="topbar-spacer"></div>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user ? `${user.nombre} ${user.apellido}` : 'Usuario'}</span>
              <span className="user-role">Usuario Normal</span>
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
        <div className="user-content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
