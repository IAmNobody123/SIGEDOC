import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import './Login.css';
import { useState } from 'react';
import { login } from '../../conection/auth';

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    dni: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const dni = user.dni.trim();
    if (!/^[0-9]{8}$/.test(dni)) {
      alert('El DNI debe contener exactamente 8 dígitos.');
      return;
    }
    const res = await login(dni, user.password);
    if (res.success) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      if (res.user.rol === 'Administrador') {
        navigate('/admin');
      } else if (res.user.rol === 'Mesa_Partes') {
        navigate('/mesapartes');
      } else {
        navigate('/user');
      }
    }
    else {
      alert(res.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
      </div>

      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        <span>Volver al inicio</span>
      </button>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-icon-wrapper">
              <Building2 size={32} />
            </div>
            <h2>Bienvenido a SIGEDOC</h2>
            <p>Ingresa tus datos para acceder al sistema municipal.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="dni">Ingresa tu DNI:</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="text"
                  id="dni"
                  placeholder="12345678"
                  inputMode="numeric"
                  maxLength={8}
                  required
                  value={user.dni}
                  onChange={(e) => setUser({ ...user, dni: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Ingresa tu contraseña:</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  required
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                />
              </div>
            </div>

            {/* <div className="form-options">

              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div> */}

            <button type="submit" className="submit-btn">
              <LogIn size={20} />
              <span>Iniciar Sesión</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
