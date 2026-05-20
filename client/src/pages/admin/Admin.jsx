import { useState, useEffect } from 'react';
import { Menu, ArrowBigLeft, LayoutDashboard, Users, FileText, LogOut, Bell,/* CheckCircle2*/ } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Admin.css';
import Dashboard from './Dashboard';
import GestionUsers from './GestionUsers';
import Documents from './Documents';
// import DerivacionesPendientes from './DerivacionesPendientes';
import { fetchNotifications } from '../../conection/documents';

export default function Admin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL_GENERAL || 'http://localhost:5000';
    const socket = io(backendUrl);

    const handleSocketNotification = (data) => {
      const toast = {
        ...data,
        toastId: `${data.id_documento || 'notif'}-${Date.now()}`,
      };
      setToastNotifications((prev) => [toast, ...prev]);

      setTimeout(() => {
        setToastNotifications((prev) => prev.filter((n) => n.toastId !== toast.toastId));
      }, 10000);
    };

    socket.on('documento_creado', handleSocketNotification);
    socket.on('documento_designado', handleSocketNotification);

    const loadNotifications = async () => {
      const res = await fetchNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    };
    loadNotifications();

    return () => {
      socket.off('documento_creado', handleSocketNotification);
      socket.off('documento_designado', handleSocketNotification);
      socket.disconnect();
    };
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
          <div className="admin-content-panel slide-in">
            <Dashboard notifications={notifications} />
          </div>
        );
      case 'users':
        return (
          <div className="admin-content-panel slide-in">
            <GestionUsers />
          </div>
        );
      case 'documents':
        return (
          <div className="admin-content-panel slide-in">
            <Documents />
          </div>
        );
      // case 'derivaciones':
      //   return (
      //     <div className="admin-content-panel slide-in">
      //       <DerivacionesPendientes />
      //     </div>
      //   );
      // case 'settings':
      //   return (
      //     <div className="admin-content-panel slide-in">
      //       <h2>Configuración</h2>
      //       <p>Ajustes generales del sistema, dependencias y parámetros globales.</p>
      //     </div>
      //   );
      default:
        return (
          <div className="admin-content-panel slide-in">
            <h2>Panel Principal</h2>
          </div>
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <span className="sidebar-title">SIGEDOC Admin</span>}
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <ArrowBigLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </li>
            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
              <Users size={20} />
              {isSidebarOpen && <span>Usuarios</span>}
            </li>
            <li className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
              <FileText size={20} />
              {isSidebarOpen && <span>Documentos</span>}
            </li>
            {/* <li className={activeTab === 'derivaciones' ? 'active' : ''} onClick={() => setActiveTab('derivaciones')}>
              <CheckCircle2 size={20} />
              {isSidebarOpen && <span>Derivaciones Pendientes</span>}
            </li> */}
            {/* <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <Settings size={20} />
              {isSidebarOpen && <span>Configuración</span>}
            </li> */}
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
      <main className="admin-main">
        {/* Topbar with Floating User Avatar */}
        <header className="admin-topbar">
          <div className="topbar-spacer"></div>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user ? `${user.nombre} ${user.apellido}` : 'Super Admin'}</span>
              <span className="user-role">Super Admin</span>
            </div>
            <div className="avatar-circle">
              {
                user && user.imagen ? (
                  <img src={user.imagen} alt="Avatar" />
                ) : (
                  <span className="avatar-initials">SA</span>
                )
              }
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="admin-content-wrapper">
          {renderContent()}
        </div>
      </main>

      {/* Real-time Notifications */}
      <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toastNotifications.map((notif) => (
          <div key={notif.toastId} className="slide-in" style={{
              background: '#3b82f6', 
              color: 'white', 
              padding: '16px', 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              minWidth: '250px',
              position: 'relative'
          }}>
            <button
              onClick={() => setToastNotifications((prev) => prev.filter((item) => item.toastId !== notif.toastId))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                border: 'none',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                padding: 0,
              }}
            >
              ×
            </button>
            <Bell size={24} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>
                {notif.mensaje || 'Nueva notificación'}
              </strong>
              <div style={{ fontSize: '0.9rem' }}>
                {notif.nombre && <span style={{ display: 'block' }}><strong>Asunto:</strong> {notif.nombre}</span>}
                {notif.descripcion_origen_externo && <span style={{ display: 'block' }}><strong>Origen:</strong> {notif.descripcion_origen_externo}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
