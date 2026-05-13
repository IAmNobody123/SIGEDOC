import { Routes, Route } from 'react-router-dom';
import Presentation from './pages/others/Presentation';
import Login from './pages/others/Login';
import Admin from './pages/admin/Admin';
import User from './pages/user/User';
import MesaPartes from './pages/mesaPartes/MesaPartes';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Presentation />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/user" element={<User />} />
      <Route path="/mesapartes" element={<MesaPartes />} />
    </Routes>
  );
}

export default App;
